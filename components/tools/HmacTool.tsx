'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Check, KeyRound, ShieldCheck, ShieldX, Sparkles } from 'lucide-react'
import { hmac } from '@noble/hashes/hmac.js'
import { sha256, sha512, sha224, sha384 } from '@noble/hashes/sha2.js'
import { sha1, ripemd160 } from '@noble/hashes/legacy.js'
import { sha3_256, sha3_512 } from '@noble/hashes/sha3.js'
import { blake2b } from '@noble/hashes/blake2.js'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js'

const ALGOS: Record<string, { name: string; fn: (key: Uint8Array, msg: Uint8Array) => Uint8Array }> = {
  'hmac-sha256': { name: 'HMAC-SHA256', fn: (k, m) => hmac(sha256, k, m) },
  'hmac-sha512': { name: 'HMAC-SHA512', fn: (k, m) => hmac(sha512, k, m) },
  'hmac-sha1':   { name: 'HMAC-SHA1',   fn: (k, m) => hmac(sha1, k, m) },
  'hmac-sha224': { name: 'HMAC-SHA224', fn: (k, m) => hmac(sha224, k, m) },
  'hmac-sha384': { name: 'HMAC-SHA384', fn: (k, m) => hmac(sha384, k, m) },
  'hmac-sha3-256': { name: 'HMAC-SHA3-256', fn: (k, m) => hmac(sha3_256, k, m) },
  'hmac-sha3-512': { name: 'HMAC-SHA3-512', fn: (k, m) => hmac(sha3_512, k, m) },
  'hmac-blake2b':  { name: 'HMAC-BLAKE2b',  fn: (k, m) => hmac(blake2b, k, m) },
  'hmac-ripemd160':{ name: 'HMAC-RIPEMD160',fn: (k, m) => hmac(ripemd160, k, m) },
}

function strToBytes(str: string, format: string): Uint8Array {
  if (format === 'hex') {
    const clean = str.replace(/\s+/g, '')
    if (clean.length % 2 !== 0) throw new Error('Invalid Hex length')
    return hexToBytes(clean)
  }
  if (format === 'base64') {
    const bin = atob(str.trim())
    const arr = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
    return arr
  }
  return new TextEncoder().encode(str)
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = ''
  for (let b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

export default function HmacTool() {
  const [algo, setAlgo] = useState('hmac-sha256')
  const [secret, setSecret] = useState('secret_key_123')
  const [secretEncoding, setSecretEncoding] = useState('utf8')
  const [input, setInput] = useState('Hello, DevCipher!')
  const [inputEncoding, setInputEncoding] = useState('utf8')

  const [hexLower, setHexLower] = useState('')
  const [hexUpper, setHexUpper] = useState('')
  const [base64, setBase64] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Verification mode
  const [expectedHash, setExpectedHash] = useState('')
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'match' | 'mismatch'>('idle')

  useEffect(() => {
    try {
      setError('')
      if (!secret && !input) {
        setHexLower('')
        setHexUpper('')
        setBase64('')
        return
      }
      const keyBytes = strToBytes(secret, secretEncoding)
      const msgBytes = strToBytes(input, inputEncoding)
      const spec = ALGOS[algo]
      if (!spec) return

      const mac = spec.fn(keyBytes, msgBytes)
      const hex = bytesToHex(mac)
      const b64 = bytesToBase64(mac)

      setHexLower(hex)
      setHexUpper(hex.toUpperCase())
      setBase64(b64)

      if (expectedHash.trim()) {
        const expClean = expectedHash.trim().toLowerCase()
        if (expClean === hex || expClean === b64.toLowerCase()) {
          setVerifyStatus('match')
        } else {
          setVerifyStatus('mismatch')
        }
      } else {
        setVerifyStatus('idle')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input encoding')
      setHexLower('')
      setHexUpper('')
      setBase64('')
    }
  }, [algo, secret, secretEncoding, input, inputEncoding, expectedHash])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-zinc-200">HMAC Keyed Hash Generator</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Algorithm:</span>
            <Select value={algo} onValueChange={setAlgo}>
              <SelectTrigger className="h-8 text-xs min-w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ALGOS).map(([key, val]) => (
                  <SelectItem key={key} value={key} className="text-xs">{val.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="text-zinc-300 font-medium flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-amber-400" /> Secret Key
            </label>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-[11px]">Format:</span>
              <div className="flex gap-1 bg-zinc-800/80 p-0.5 rounded text-[11px]">
                {['utf8', 'hex', 'base64'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSecretEncoding(fmt)}
                    className={`px-2 py-0.5 rounded uppercase font-mono ${
                      secretEncoding === fmt ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Input
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter secret key..."
            className="font-mono text-xs bg-zinc-950 border-zinc-800"
          />
        </div>

        {/* Message Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="text-zinc-300 font-medium">Message Data</label>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-[11px]">Input Format:</span>
              <div className="flex gap-1 bg-zinc-800/80 p-0.5 rounded text-[11px]">
                {['utf8', 'hex', 'base64'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setInputEncoding(fmt)}
                    className={`px-2 py-0.5 rounded uppercase font-mono ${
                      inputEncoding === fmt ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter string message to hash with HMAC..."
            className="font-mono text-xs min-h-[100px] bg-zinc-950 border-zinc-800"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-800/40 bg-red-900/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Outputs */}
      {hexLower && (
        <div className="space-y-3">
          <div className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Hexadecimal (Lowercase)</span>
              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(hexLower)} className="h-7 text-xs text-purple-400">
                {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <p className="font-mono text-xs text-purple-100 break-all bg-purple-950/40 p-2.5 rounded border border-purple-800/30">
              {hexLower}
            </p>

            <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Base64</span>
              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(base64)} className="h-7 text-xs text-zinc-400">
                Copy Base64
              </Button>
            </div>
            <p className="font-mono text-xs text-zinc-300 break-all bg-zinc-950/60 p-2.5 rounded border border-zinc-800">
              {base64}
            </p>
          </div>

          {/* Verification section */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
            <label className="text-xs font-medium text-zinc-400">Optional: Compare / Verify Against Expected HMAC Hash</label>
            <div className="flex items-center gap-2">
              <Input
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
                placeholder="Paste expected HMAC hash here..."
                className="font-mono text-xs bg-zinc-950 border-zinc-800"
              />
            </div>

            {verifyStatus === 'match' && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 p-2 rounded">
                <ShieldCheck className="h-4 w-4" /> HMAC Matches expected hash!
              </div>
            )}
            {verifyStatus === 'mismatch' && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-800/40 p-2 rounded">
                <ShieldX className="h-4 w-4" /> HMAC does NOT match expected hash!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
