'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Check, Eye, EyeOff, KeyRound, Keyboard, ShieldCheck, ShieldX } from 'lucide-react'

// ── helpers ────────────────────────────────────────────────────────────────────

function base64urlDecode(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + (4 - (str.length % 4)) % 4, '=')
  try { return atob(padded) } catch { return '' }
}

function base64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64urlEncodeBytes(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function prettyJSON(str: string): string {
  try { return JSON.stringify(JSON.parse(str), null, 2) } catch { return str }
}

function parseJWT(token: string): { header: string; payload: string; signature: string } | null {
  const parts = token.trim().split('.')
  if (parts.length !== 3) return null
  return {
    header: prettyJSON(base64urlDecode(parts[0])),
    payload: prettyJSON(base64urlDecode(parts[1])),
    signature: parts[2],
  }
}

const ALGO_MAP: Record<string, { name: string; hash: string }> = {
  HS256: { name: 'HMAC', hash: 'SHA-256' },
  HS384: { name: 'HMAC', hash: 'SHA-384' },
  HS512: { name: 'HMAC', hash: 'SHA-512' },
}

async function hmacSign(header: string, payload: string, secret: string, alg: string): Promise<string> {
  const { name, hash } = ALGO_MAP[alg]
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name, hash }, false, ['sign']
  )
  const data = enc.encode(`${base64urlEncode(header)}.${base64urlEncode(payload)}`)
  const sig = await crypto.subtle.sign(name, keyMaterial, data)
  return base64urlEncodeBytes(sig)
}

async function hmacVerify(token: string, secret: string, alg: string): Promise<boolean> {
  const parts = token.trim().split('.')
  if (parts.length !== 3) return false
  const { name, hash } = ALGO_MAP[alg]
  const enc = new TextEncoder()
  try {
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name, hash }, false, ['verify']
    )
    const sigBytes = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
    const data = enc.encode(`${parts[0]}.${parts[1]}`)
    return await crypto.subtle.verify(name, keyMaterial, sigBytes, data)
  } catch {
    return false
  }
}

// ── sub-components ─────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-800 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

// ── main component ─────────────────────────────────────────────────────────────

type Tab = 'decode' | 'encode' | 'verify'

export default function JWTTool() {
  const [tab, setTab] = useState<Tab>('decode')
  const [alg, setAlg] = useState('HS256')
  const [expiry, setExpiry] = useState('None')

  // Decode
  const [decodeInput, setDecodeInput] = useState('')
  const [decoded, setDecoded] = useState<{ header: string; payload: string; signature: string } | null>(null)

  // Encode
  const [encHeader, setEncHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}')
  const [encPayload, setEncPayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}')
  const [encSecret, setEncSecret] = useState('')
  const [showEncSecret, setShowEncSecret] = useState(false)
  const [encodedToken, setEncodedToken] = useState('')
  const [encError, setEncError] = useState('')

  // Verify
  const [verifyInput, setVerifyInput] = useState('')
  const [verifySecret, setVerifySecret] = useState('')
  const [showVerifySecret, setShowVerifySecret] = useState(false)
  const [verifyResult, setVerifyResult] = useState<'valid' | 'invalid' | null>(null)
  const [verifyPayload, setVerifyPayload] = useState('')

  // Auto-decode on input change
  useEffect(() => {
    if (decodeInput.trim()) {
      const result = parseJWT(decodeInput)
      setDecoded(result)
    } else {
      setDecoded(null)
    }
  }, [decodeInput])

  const handleGenerate = useCallback(async () => {
    setEncError('')
    setEncodedToken('')
    try {
      let headerObj: Record<string, unknown>
      let payloadObj: Record<string, unknown>
      try { headerObj = JSON.parse(encHeader) } catch { setEncError('Header is not valid JSON'); return }
      try { payloadObj = JSON.parse(encPayload) } catch { setEncError('Payload is not valid JSON'); return }

      // Apply expiry
      if (expiry !== 'None') {
        const expiryMap: Record<string, number> = { '1h': 3600, '24h': 86400, '7d': 604800, '30d': 2592000 }
        payloadObj = { ...payloadObj, exp: Math.floor(Date.now() / 1000) + expiryMap[expiry] }
      }

      headerObj = { ...headerObj, alg }
      const headerStr = JSON.stringify(headerObj)
      const payloadStr = JSON.stringify(payloadObj)
      const sig = await hmacSign(headerStr, payloadStr, encSecret, alg)
      setEncodedToken(`${base64urlEncode(headerStr)}.${base64urlEncode(payloadStr)}.${sig}`)
    } catch (e) {
      setEncError(e instanceof Error ? e.message : 'Encoding failed')
    }
  }, [encHeader, encPayload, encSecret, alg, expiry])

  const handleVerify = useCallback(async () => {
    setVerifyResult(null)
    setVerifyPayload('')
    if (!verifyInput.trim()) return
    const valid = await hmacVerify(verifyInput, verifySecret, alg)
    setVerifyResult(valid ? 'valid' : 'invalid')
    if (valid) {
      const parsed = parseJWT(verifyInput)
      if (parsed) setVerifyPayload(parsed.payload)
    }
  }, [verifyInput, verifySecret, alg])

  // Ctrl+Enter shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (tab === 'encode') handleGenerate()
        else if (tab === 'verify') handleVerify()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [tab, handleGenerate, handleVerify])

  const tabClass = (t: Tab) =>
    `flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
      tab === t
        ? 'bg-zinc-700 text-zinc-100'
        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
    }`

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[260px,1fr]">

        {/* ── Config Panel (Left) ── */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Settings</h3>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-zinc-800/50 rounded-xl p-1">
              <button className={tabClass('decode')} onClick={() => setTab('decode')}>Decode</button>
              <button className={tabClass('encode')} onClick={() => setTab('encode')}>Encode</button>
              <button className={tabClass('verify')} onClick={() => setTab('verify')}>Verify</button>
            </div>

            {/* Algorithm */}
            {(tab === 'encode' || tab === 'verify') && (
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Algorithm</label>
                <Select value={alg} onValueChange={setAlg}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['HS256', 'HS384', 'HS512'].map(a => (
                      <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Expiry (Encode only) */}
            {tab === 'encode' && (
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Expiry</label>
                <Select value={expiry} onValueChange={setExpiry}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['None', '1h', '24h', '7d', '30d'].map(e => (
                      <SelectItem key={e} value={e} className="text-xs">{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Privacy note */}
            <div className="rounded-lg bg-zinc-800/40 border border-zinc-700/40 px-3 py-2.5">
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                All processing is local — your tokens never leave your browser
              </p>
            </div>
          </div>

          {/* Keyboard hint */}
          {tab !== 'decode' && (
            <div className="flex items-center gap-1.5 px-1 text-[11px] text-zinc-600">
              <Keyboard className="h-3 w-3" />
              <span><kbd className="font-mono">Ctrl</kbd>+<kbd className="font-mono">Enter</kbd> to {tab === 'encode' ? 'generate' : 'verify'}</span>
            </div>
          )}
        </div>

        {/* ── IO Area (Right) ── */}
        <div className="space-y-3">

          {/* DECODE TAB */}
          {tab === 'decode' && (
            <>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                  <span className="text-xs font-medium text-zinc-400">JWT Token</span>
                  <button
                    onClick={() => { setDecodeInput(''); setDecoded(null) }}
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <Textarea
                  value={decodeInput}
                  onChange={e => setDecodeInput(e.target.value)}
                  placeholder="Paste JWT token here..."
                  className="min-h-[100px] border-0 rounded-none bg-transparent focus-visible:ring-0 resize-none font-mono text-xs"
                />
              </div>

              {decoded ? (
                <>
                  {/* Header */}
                  <div className="rounded-xl border border-blue-800/40 bg-blue-900/20 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-blue-800/30">
                      <span className="text-xs font-medium text-blue-300">Header</span>
                      <CopyButton text={decoded.header} />
                    </div>
                    <pre className="p-3 text-xs text-blue-200 font-mono whitespace-pre-wrap break-all leading-relaxed">{decoded.header}</pre>
                  </div>

                  {/* Payload */}
                  <div className="rounded-xl border border-emerald-800/40 bg-emerald-900/20 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-800/30">
                      <span className="text-xs font-medium text-emerald-300">Payload</span>
                      <CopyButton text={decoded.payload} />
                    </div>
                    <pre className="p-3 text-xs text-emerald-200 font-mono whitespace-pre-wrap break-all leading-relaxed">{decoded.payload}</pre>
                  </div>

                  {/* Signature */}
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-700/40">
                      <span className="text-xs font-medium text-zinc-400">Signature</span>
                      <CopyButton text={decoded.signature} />
                    </div>
                    <div className="p-3 space-y-1.5">
                      <p className="text-xs text-zinc-300 font-mono break-all">{decoded.signature}</p>
                      <p className="text-[11px] text-zinc-600 italic">Signature verification requires the secret</p>
                    </div>
                  </div>
                </>
              ) : decodeInput.trim() ? (
                <div className="rounded-xl border border-red-800/40 bg-red-900/10 px-4 py-3">
                  <p className="text-xs text-red-400">Invalid JWT format — expected 3 base64url segments separated by dots</p>
                </div>
              ) : null}
            </>
          )}

          {/* ENCODE TAB */}
          {tab === 'encode' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {/* Header JSON */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                    <span className="text-xs font-medium text-zinc-400">Header JSON</span>
                  </div>
                  <Textarea
                    value={encHeader}
                    onChange={e => setEncHeader(e.target.value)}
                    className="min-h-[140px] border-0 rounded-none bg-transparent focus-visible:ring-0 resize-none font-mono text-xs"
                  />
                </div>

                {/* Payload JSON */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                    <span className="text-xs font-medium text-zinc-400">Payload JSON</span>
                  </div>
                  <Textarea
                    value={encPayload}
                    onChange={e => setEncPayload(e.target.value)}
                    className="min-h-[140px] border-0 rounded-none bg-transparent focus-visible:ring-0 resize-none font-mono text-xs"
                  />
                </div>
              </div>

              {/* Secret key */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                  <KeyRound className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-400">Secret Key</span>
                </div>
                <div className="relative">
                  <Input
                    type={showEncSecret ? 'text' : 'password'}
                    value={encSecret}
                    onChange={e => setEncSecret(e.target.value)}
                    placeholder="Enter secret key..."
                    className="border-0 rounded-none bg-transparent focus-visible:ring-0 pr-10 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEncSecret(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showEncSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button onClick={handleGenerate} className="w-full">
                Generate Token
              </Button>

              {encError && (
                <div className="rounded-xl border border-red-800/40 bg-red-900/10 px-4 py-3">
                  <p className="text-xs text-red-400">{encError}</p>
                </div>
              )}

              {encodedToken && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                    <span className="text-xs font-medium text-zinc-400">Generated Token</span>
                    <CopyButton text={encodedToken} />
                  </div>
                  <p className="p-3 font-mono text-xs text-emerald-300 break-all leading-relaxed">{encodedToken}</p>
                </div>
              )}
            </>
          )}

          {/* VERIFY TAB */}
          {tab === 'verify' && (
            <>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                  <span className="text-xs font-medium text-zinc-400">JWT Token</span>
                  <button
                    onClick={() => { setVerifyInput(''); setVerifyResult(null); setVerifyPayload('') }}
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <Textarea
                  value={verifyInput}
                  onChange={e => setVerifyInput(e.target.value)}
                  placeholder="Paste JWT token here..."
                  className="min-h-[100px] border-0 rounded-none bg-transparent focus-visible:ring-0 resize-none font-mono text-xs"
                />
              </div>

              {/* Secret key */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                  <KeyRound className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-400">Secret Key</span>
                </div>
                <div className="relative">
                  <Input
                    type={showVerifySecret ? 'text' : 'password'}
                    value={verifySecret}
                    onChange={e => setVerifySecret(e.target.value)}
                    placeholder="Enter secret key..."
                    className="border-0 rounded-none bg-transparent focus-visible:ring-0 pr-10 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVerifySecret(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showVerifySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button onClick={handleVerify} className="w-full">
                Verify Signature
              </Button>

              {verifyResult === 'valid' && (
                <>
                  <div className="rounded-xl border border-emerald-700/50 bg-emerald-900/20 px-4 py-3 flex items-center gap-2.5">
                    <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-emerald-300">Signature Valid</span>
                  </div>
                  {verifyPayload && (
                    <div className="rounded-xl border border-emerald-800/40 bg-emerald-900/10 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-800/30">
                        <span className="text-xs font-medium text-emerald-300">Decoded Payload</span>
                        <CopyButton text={verifyPayload} />
                      </div>
                      <pre className="p-3 text-xs text-emerald-200 font-mono whitespace-pre-wrap break-all leading-relaxed">{verifyPayload}</pre>
                    </div>
                  )}
                </>
              )}

              {verifyResult === 'invalid' && (
                <div className="rounded-xl border border-red-700/50 bg-red-900/20 px-4 py-3 flex items-center gap-2.5">
                  <ShieldX className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-red-300">Invalid Signature</span>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
