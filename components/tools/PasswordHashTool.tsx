'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Copy, Check, RefreshCw, Eye, EyeOff, AlertCircle, ShieldCheck, Keyboard } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

type Algorithm = 'bcrypt' | 'scrypt' | 'pbkdf2'

async function hashBcrypt(password: string, rounds: number): Promise<string> {
  const bcrypt = await import('bcryptjs')
  const salt = await bcrypt.genSalt(rounds)
  return bcrypt.hash(password, salt)
}

async function verifyBcrypt(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(password, hash)
}

async function hashScrypt(password: string, N: number, r: number, p: number): Promise<string> {
  const { scrypt } = await import('scrypt-js')
  const enc = new TextEncoder()
  const pw = enc.encode(password)
  const salt = crypto.getRandomValues(new Uint8Array(32))
  const dk = await scrypt(pw, salt, N, r, p, 64)
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  const dkHex = Array.from(dk).map(b => b.toString(16).padStart(2, '0')).join('')
  return `$scrypt$N=${N},r=${r},p=${p}$${saltHex}$${dkHex}`
}

async function verifyScrypt(password: string, hash: string): Promise<boolean> {
  try {
    const { scrypt } = await import('scrypt-js')
    const parts = hash.split('$')
    if (parts.length < 5 || parts[1] !== 'scrypt') return false
    const params = Object.fromEntries(parts[2].split(',').map(s => s.split('=')))
    const salt = Uint8Array.from(parts[3].match(/.{2}/g)!.map(b => parseInt(b, 16)))
    const expected = parts[4]
    const N = parseInt(params.N), r = parseInt(params.r), p = parseInt(params.p)
    const enc = new TextEncoder()
    const dk = await scrypt(enc.encode(password), salt, N, r, p, 64)
    const dkHex = Array.from(dk).map(b => b.toString(16).padStart(2, '0')).join('')
    return dkHex === expected
  } catch { return false }
}

async function hashPBKDF2(password: string, iterations: number, keyLen: number, hashAlgo: string): Promise<string> {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(32))
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: hashAlgo },
    key, keyLen * 8
  )
  const dk = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  return `$pbkdf2-${hashAlgo.toLowerCase().replace('-', '')}$i=${iterations}$${saltHex}$${dk}`
}

async function verifyPBKDF2(password: string, hash: string): Promise<boolean> {
  try {
    const parts = hash.split('$')
    if (parts.length < 5) return false
    const algoRaw = parts[1].replace('pbkdf2-', '')
    const algo = algoRaw === 'sha256' ? 'SHA-256' : algoRaw === 'sha512' ? 'SHA-512' : algoRaw === 'sha1' ? 'SHA-1' : 'SHA-256'
    const params = Object.fromEntries(parts[2].split(',').map(s => s.split('=')))
    const salt = Uint8Array.from(parts[3].match(/.{2}/g)!.map(b => parseInt(b, 16)))
    const expected = parts[4]
    const keyLen = expected.length / 2
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: parseInt(params.i), hash: algo },
      key, keyLen * 8
    )
    const dk = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
    return dk === expected
  } catch { return false }
}

export default function PasswordHashTool() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('bcrypt')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [hash, setHash] = useState('')
  const [verifyPassword, setVerifyPassword] = useState('')
  const [verifyHash, setVerifyHash] = useState('')
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [mode, setMode] = useState<'hash' | 'verify'>('hash')
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)

  // Bcrypt options
  const [bcryptRounds, setBcryptRounds] = useState(12)
  // Scrypt options
  const [scryptN, setScryptN] = useState(16384)
  const [scryptR, setScryptR] = useState(8)
  const [scryptP, setScryptP] = useState(1)
  // PBKDF2 options
  const [pbkdf2Iterations, setPbkdf2Iterations] = useState(600000)
  const [pbkdf2Hash, setPbkdf2Hash] = useState('SHA-256')
  const [pbkdf2KeyLen, setPbkdf2KeyLen] = useState(32)

  const process = async () => {
    setError(''); setIsProcessing(true); setVerifyResult(null)
    try {
      if (mode === 'hash') {
        if (!password) throw new Error('Password is required')
        let result = ''
        if (algorithm === 'bcrypt') result = await hashBcrypt(password, bcryptRounds)
        else if (algorithm === 'scrypt') result = await hashScrypt(password, scryptN, scryptR, scryptP)
        else result = await hashPBKDF2(password, pbkdf2Iterations, pbkdf2KeyLen, pbkdf2Hash)
        setHash(result)
      } else {
        if (!verifyPassword || !verifyHash) throw new Error('Password and hash are required')
        let result = false
        if (algorithm === 'bcrypt') result = await verifyBcrypt(verifyPassword, verifyHash)
        else if (algorithm === 'scrypt') result = await verifyScrypt(verifyPassword, verifyHash)
        else result = await verifyPBKDF2(verifyPassword, verifyHash)
        setVerifyResult(result)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operation failed')
    }
    setIsProcessing(false)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); process() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, hash, verifyPassword, verifyHash, algorithm, mode, bcryptRounds, scryptN, scryptR, scryptP, pbkdf2Iterations, pbkdf2Hash, pbkdf2KeyLen])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
        {/* Settings */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Configuration</h3>

            {/* Algorithm */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Algorithm</label>
              <Select value={algorithm} onValueChange={v => setAlgorithm(v as Algorithm)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bcrypt" className="text-xs">bcrypt</SelectItem>
                  <SelectItem value="scrypt" className="text-xs">scrypt</SelectItem>
                  <SelectItem value="pbkdf2" className="text-xs">PBKDF2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mode */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-300">Mode</p>
              </div>
              <div className="flex gap-1">
                {(['hash', 'verify'] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`px-3 h-7 rounded text-xs font-medium transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Algorithm-specific options */}
            {algorithm === 'bcrypt' && (
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Cost factor (rounds): {bcryptRounds}</label>
                <input type="range" min={4} max={14} value={bcryptRounds}
                  onChange={e => setBcryptRounds(Number(e.target.value))}
                  className="w-full accent-blue-500" />
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>4 (fast)</span><span>14 (very slow)</span>
                </div>
                <p className="text-[10px] text-zinc-600">2^{bcryptRounds} = {Math.pow(2, bcryptRounds).toLocaleString()} iterations</p>
              </div>
            )}

            {algorithm === 'scrypt' && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">N (CPU/memory cost)</label>
                  <Select value={String(scryptN)} onValueChange={v => setScryptN(Number(v))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1024,2048,4096,8192,16384,32768,65536].map(n => (
                        <SelectItem key={n} value={String(n)} className="text-xs">{n.toLocaleString()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">r (block size)</label>
                    <input type="number" min={1} max={64} value={scryptR} onChange={e => setScryptR(Number(e.target.value))}
                      className="w-full h-8 rounded-md border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-200 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">p (parallelism)</label>
                    <input type="number" min={1} max={16} value={scryptP} onChange={e => setScryptP(Number(e.target.value))}
                      className="w-full h-8 rounded-md border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-200 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {algorithm === 'pbkdf2' && (
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Hash</label>
                  <Select value={pbkdf2Hash} onValueChange={setPbkdf2Hash}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['SHA-1','SHA-256','SHA-384','SHA-512'].map(h => (
                        <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Iterations</label>
                    <input type="number" min={1000} max={2000000} value={pbkdf2Iterations}
                      onChange={e => setPbkdf2Iterations(Number(e.target.value))}
                      className="w-full h-8 rounded-md border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-200 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Key length (bytes)</label>
                    <input type="number" min={16} max={64} value={pbkdf2KeyLen}
                      onChange={e => setPbkdf2KeyLen(Number(e.target.value))}
                      className="w-full h-8 rounded-md border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-200 outline-none" />
                  </div>
                </div>
              </div>
            )}

            <Button onClick={process} disabled={isProcessing} className="w-full h-9 text-xs">
              {isProcessing
                ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Processing...</>
                : <><ShieldCheck className="h-3.5 w-3.5" /> {mode === 'hash' ? 'Hash Password' : 'Verify Hash'}</>
              }
            </Button>

            <div className="pt-1 border-t border-zinc-800 text-[11px] text-zinc-600">
              <p>All hashing is done locally in your browser.</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-1 text-[11px] text-zinc-600">
            <Keyboard className="h-3 w-3" />
            <span><kbd className="font-mono">Ctrl</kbd>+<kbd className="font-mono">Enter</kbd> to run</span>
          </div>
        </div>

        {/* IO */}
        <div className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-900/20 px-4 py-2.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {mode === 'hash' ? (
            <>
              {/* Password input */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                  <span className="text-xs font-medium text-zinc-400">Password</span>
                  <button onClick={() => setShowPassword(s => !s)} className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded">
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password to hash..."
                  className="w-full bg-transparent px-3 py-3 text-sm font-mono text-zinc-200 placeholder-zinc-600 outline-none"
                />
              </div>

              {/* Hash output */}
              {hash && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                    <span className="text-xs font-medium text-zinc-400">Hash</span>
                    <button onClick={async () => { await copyToClipboard(hash); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                      className="text-xs text-zinc-500 hover:text-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-800 flex items-center gap-1">
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="font-mono text-xs text-emerald-300 break-all">{hash}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Verify password */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                  <span className="text-xs font-medium text-zinc-400">Password to verify</span>
                  <button onClick={() => setShowPassword(s => !s)} className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded">
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={verifyPassword}
                  onChange={e => setVerifyPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full bg-transparent px-3 py-3 text-sm font-mono text-zinc-200 placeholder-zinc-600 outline-none"
                />
              </div>

              {/* Hash to verify against */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                  <span className="text-xs font-medium text-zinc-400">Hash to verify against</span>
                </div>
                <input
                  type="text"
                  value={verifyHash}
                  onChange={e => setVerifyHash(e.target.value)}
                  placeholder="Paste hash here..."
                  className="w-full bg-transparent px-3 py-3 text-sm font-mono text-zinc-200 placeholder-zinc-600 outline-none"
                />
              </div>

              {/* Verify result */}
              {verifyResult !== null && (
                <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
                  verifyResult
                    ? 'border-emerald-800 bg-emerald-900/20 text-emerald-400'
                    : 'border-red-800 bg-red-900/20 text-red-400'
                }`}>
                  {verifyResult
                    ? <><ShieldCheck className="h-5 w-5" /> Password matches the hash</>
                    : <><AlertCircle className="h-5 w-5" /> Password does NOT match the hash</>
                  }
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
