'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Search, X, Hash } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type Confidence = 'high' | 'possible' | 'low'

interface HashMatch {
  algorithm: string
  confidence: Confidence
  bits: number
  description: string
}

// ── Hash identification logic ─────────────────────────────────────────────────

const HEX_RE = /^[0-9a-fA-F]+$/

function identifyHash(input: string): HashMatch[] {
  const trimmed = input.trim()
  if (!trimmed) return []

  // Special prefix patterns — check first
  if (/^\$2[ab]\$\d{2}\$.{53}$/.test(trimmed)) {
    return [{ algorithm: 'bcrypt', confidence: 'high', bits: 184, description: 'Adaptive password hashing function, includes salt and cost factor' }]
  }
  if (trimmed.startsWith('$argon2')) {
    return [{ algorithm: 'Argon2', confidence: 'high', bits: 0, description: 'Memory-hard password hashing function (Argon2i / Argon2d / Argon2id)' }]
  }
  if (trimmed.startsWith('$scrypt$')) {
    return [{ algorithm: 'scrypt', confidence: 'high', bits: 0, description: 'Memory-hard key derivation function designed to be expensive to brute-force' }]
  }

  if (!HEX_RE.test(trimmed)) {
    // Might be Base64
    const b64Re = /^[A-Za-z0-9+/]+=*$/
    if (b64Re.test(trimmed)) {
      const byteLen = Math.floor((trimmed.replace(/=+$/, '').length * 3) / 4)
      const results: HashMatch[] = []
      if (byteLen === 16) results.push({ algorithm: 'MD5 (Base64)', confidence: 'possible', bits: 128, description: 'MD5 hash encoded in Base64' })
      if (byteLen === 20) results.push({ algorithm: 'SHA-1 (Base64)', confidence: 'possible', bits: 160, description: 'SHA-1 hash encoded in Base64' })
      if (byteLen === 28) results.push({ algorithm: 'SHA-224 (Base64)', confidence: 'possible', bits: 224, description: 'SHA-224 hash encoded in Base64' })
      if (byteLen === 32) results.push({ algorithm: 'SHA-256 (Base64)', confidence: 'possible', bits: 256, description: 'SHA-256 hash encoded in Base64' })
      if (byteLen === 48) results.push({ algorithm: 'SHA-384 (Base64)', confidence: 'possible', bits: 384, description: 'SHA-384 hash encoded in Base64' })
      if (byteLen === 64) results.push({ algorithm: 'SHA-512 (Base64)', confidence: 'possible', bits: 512, description: 'SHA-512 hash encoded in Base64' })
      return results.length > 0 ? results : []
    }
    return []
  }

  const len = trimmed.length

  const TABLE: Record<number, HashMatch[]> = {
    8: [
      { algorithm: 'CRC-32', confidence: 'high', bits: 32, description: 'Cyclic redundancy check, used for error detection — not cryptographic' },
    ],
    32: [
      { algorithm: 'MD5', confidence: 'possible', bits: 128, description: 'Message Digest 5 — widely used but cryptographically broken' },
      { algorithm: 'MD4', confidence: 'possible', bits: 128, description: 'Predecessor to MD5, considered insecure' },
      { algorithm: 'MD2', confidence: 'low', bits: 128, description: 'Early message digest algorithm, obsolete' },
      { algorithm: 'RIPEMD-128', confidence: 'low', bits: 128, description: '128-bit variant of RIPEMD, rarely used today' },
    ],
    40: [
      { algorithm: 'SHA-1', confidence: 'high', bits: 160, description: 'Secure Hash Algorithm 1 — deprecated for security use, still common in legacy systems' },
      { algorithm: 'RIPEMD-160', confidence: 'possible', bits: 160, description: 'Used in Bitcoin address generation; 160-bit RIPEMD variant' },
    ],
    48: [
      { algorithm: 'Tiger-192', confidence: 'high', bits: 192, description: 'Designed for 64-bit platforms; used in some P2P networks' },
    ],
    56: [
      { algorithm: 'SHA-224', confidence: 'possible', bits: 224, description: 'Truncated variant of SHA-256, part of the SHA-2 family' },
      { algorithm: 'SHA3-224', confidence: 'possible', bits: 224, description: 'SHA-3 family, 224-bit output — based on Keccak sponge construction' },
    ],
    64: [
      { algorithm: 'SHA-256', confidence: 'possible', bits: 256, description: 'Most widely deployed member of SHA-2; used in TLS, Bitcoin, etc.' },
      { algorithm: 'SHA3-256', confidence: 'possible', bits: 256, description: 'SHA-3 family, 256-bit output — NIST standardized in 2015' },
      { algorithm: 'BLAKE2s', confidence: 'possible', bits: 256, description: 'High-speed cryptographic hash optimized for 32-bit platforms' },
      { algorithm: 'RIPEMD-256', confidence: 'low', bits: 256, description: '256-bit RIPEMD variant; provides similar security to RIPEMD-128' },
    ],
    80: [
      { algorithm: 'RIPEMD-320', confidence: 'high', bits: 320, description: 'Extended 320-bit version of RIPEMD-160; rarely encountered' },
    ],
    96: [
      { algorithm: 'SHA-384', confidence: 'possible', bits: 384, description: 'Truncated SHA-512; used in TLS certificates and some PKI systems' },
      { algorithm: 'SHA3-384', confidence: 'possible', bits: 384, description: 'SHA-3 family, 384-bit output' },
    ],
    128: [
      { algorithm: 'SHA-512', confidence: 'possible', bits: 512, description: 'Full 512-bit SHA-2 hash; strong security margin, widely supported' },
      { algorithm: 'SHA3-512', confidence: 'possible', bits: 512, description: 'SHA-3 family, 512-bit output — Keccak based' },
      { algorithm: 'BLAKE2b', confidence: 'possible', bits: 512, description: 'High-speed 512-bit hash optimized for 64-bit platforms' },
      { algorithm: 'RIPEMD-512', confidence: 'low', bits: 512, description: '512-bit RIPEMD variant; uncommon in practice' },
    ],
  }

  const matches = TABLE[len]
  if (!matches) return []

  // Promote SHA-1 to high when it is the sole logical match at 40 chars
  if (len === 40) {
    return matches.map((m) =>
      m.algorithm === 'SHA-1' ? { ...m, confidence: 'high' as Confidence } : m
    )
  }
  // CRC-32 and Tiger-192 and RIPEMD-320 are unique lengths → already high in table
  return matches
}

// ── Sub-components ────────────────────────────────────────────────────────────

const CONFIDENCE_STYLES: Record<Confidence, { badge: string; label: string }> = {
  high: { badge: 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50', label: 'High' },
  possible: { badge: 'bg-amber-900/40 text-amber-300 border border-amber-700/50', label: 'Possible' },
  low: { badge: 'bg-zinc-800 text-zinc-400 border border-zinc-700', label: 'Low' },
}

function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const s = CONFIDENCE_STYLES[confidence]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${s.badge}`}>
      {s.label}
    </span>
  )
}

function ResultCard({ match }: { match: HashMatch }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm text-zinc-100">{match.algorithm}</span>
        <div className="flex items-center gap-2 shrink-0">
          {match.bits > 0 && (
            <span className="text-[10px] text-zinc-500 font-mono">{match.bits} bits</span>
          )}
          <ConfidenceBadge confidence={match.confidence} />
        </div>
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed">{match.description}</p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HashIdentifierTool() {
  const [hashInput, setHashInput] = useState('')
  const [results, setResults] = useState<HashMatch[]>([])
  const [autoAnalyze, setAutoAnalyze] = useState(true)
  const [analyzed, setAnalyzed] = useState(false)

  const analyze = useCallback(() => {
    setResults(identifyHash(hashInput))
    setAnalyzed(true)
  }, [hashInput])

  useEffect(() => {
    if (autoAnalyze) {
      setResults(identifyHash(hashInput))
      setAnalyzed(hashInput.trim().length > 0)
    }
  }, [hashInput, autoAnalyze, analyze])

  const handleClear = () => {
    setHashInput('')
    setResults([])
    setAnalyzed(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[260px,1fr]">

        {/* ── Config Panel (Left) ── */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Configuration</h3>

            <Button
              onClick={analyze}
              className="w-full"
              disabled={!hashInput.trim()}
            >
              <Search className="h-4 w-4" />
              Analyze Hash
            </Button>

            {/* Auto-analyze toggle */}
            <div className="flex items-center justify-between">
              <label htmlFor="auto-analyze" className="text-xs text-zinc-400 cursor-pointer">
                Auto-analyze
              </label>
              <Switch
                id="auto-analyze"
                checked={autoAnalyze}
                onCheckedChange={setAutoAnalyze}
              />
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Confidence Legend</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-[11px] text-zinc-400">High — strong match</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-[11px] text-zinc-400">Possible — length matches</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 shrink-0" />
                  <span className="text-[11px] text-zinc-400">Low — uncommon algorithm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── IO Area (Right) ── */}
        <div className="space-y-3">
          {/* Hash input */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-xs font-medium text-zinc-400">Hash Input</span>
              </div>
              <div className="flex items-center gap-3">
                {hashInput.length > 0 && (
                  <span className="text-[11px] text-zinc-600 font-mono tabular-nums">
                    {hashInput.trim().length} chars
                  </span>
                )}
                {hashInput && (
                  <button
                    onClick={handleClear}
                    className="text-xs text-zinc-500 hover:text-zinc-200 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="p-3">
              <Input
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Paste hash string here (hex, Base64, bcrypt, Argon2…)"
                className="font-mono text-sm border-zinc-700 bg-zinc-800/60 focus-visible:ring-blue-500"
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
              />
            </div>
          </div>

          {/* Results */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400">Identification Results</span>
              {analyzed && results.length > 0 && (
                <span className="text-[11px] text-zinc-500">
                  {results.length} match{results.length !== 1 ? 'es' : ''}
                </span>
              )}
            </div>
            <div className="p-3 space-y-2 min-h-[120px]">
              {!analyzed || !hashInput.trim() ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-zinc-600">
                  <Hash className="h-6 w-6 opacity-40" />
                  <p className="text-xs">Paste a hash above to identify it</p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-1.5 text-zinc-500">
                  <p className="text-sm font-medium">Unknown hash format</p>
                  <p className="text-xs text-zinc-600">
                    The input does not match any known hash pattern (check for truncation or encoding)
                  </p>
                </div>
              ) : (
                results.map((match) => (
                  <ResultCard key={match.algorithm} match={match} />
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
