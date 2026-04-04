'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Eye, EyeOff, Info, ShieldAlert } from 'lucide-react'

// ── common passwords (50 most common) ─────────────────────────────────────────

const COMMON_PASSWORDS = new Set([
  '123456', 'password', '123456789', '12345678', '12345', '1234567', 'qwerty',
  'abc123', '111111', '123123', 'admin', 'letmein', 'welcome', 'monkey',
  'dragon', 'master', 'sunshine', 'princess', 'iloveyou', 'shadow',
  'superman', 'michael', 'football', 'baseball', 'charlie', 'donald',
  'password1', '1234', 'qwerty123', 'qwertyuiop', '1q2w3e4r', 'pass',
  'password123', 'login', 'test', 'hello', 'default', '654321', 'aaaaaa',
  '000000', 'zxcvbn', 'trustno1', 'hunter2', 'whatever', 'batman',
  'access', 'jessica', 'thomas', 'joshua', 'tigger',
])

// ── keyboard patterns ──────────────────────────────────────────────────────────

const KEYBOARD_PATTERNS = [
  'qwerty', 'qwertyuiop', 'asdfgh', 'asdfghjkl', 'zxcvbn',
  '123456', '1234567', '12345678', '123456789', '1234567890',
  'abcdef', 'abcdefg', 'abcdefgh',
]

// ── analysis helpers ───────────────────────────────────────────────────────────

function getCharsetSize(pwd: string): number {
  let size = 0
  if (/[a-z]/.test(pwd)) size += 26
  if (/[A-Z]/.test(pwd)) size += 26
  if (/[0-9]/.test(pwd)) size += 10
  if (/[^a-zA-Z0-9]/.test(pwd)) size += 32
  return size || 1
}

function getCharsetLabel(pwd: string): string {
  const parts: string[] = []
  if (/[a-z]/.test(pwd)) parts.push('lowercase')
  if (/[A-Z]/.test(pwd)) parts.push('uppercase')
  if (/[0-9]/.test(pwd)) parts.push('digits')
  if (/[^a-zA-Z0-9]/.test(pwd)) parts.push('special')
  return parts.join(' + ') || 'none'
}

function calcEntropy(pwd: string): number {
  if (!pwd) return 0
  const cs = getCharsetSize(pwd)
  return pwd.length * Math.log2(cs)
}

function formatCrackTime(seconds: number): string {
  if (seconds < 1) return '< 1 second'
  if (seconds < 60) return `${Math.round(seconds)} second${Math.round(seconds) !== 1 ? 's' : ''}`
  if (seconds < 3600) return `${Math.round(seconds / 60)} minute${Math.round(seconds / 60) !== 1 ? 's' : ''}`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hour${Math.round(seconds / 3600) !== 1 ? 's' : ''}`
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} day${Math.round(seconds / 86400) !== 1 ? 's' : ''}`
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} month${Math.round(seconds / 2592000) !== 1 ? 's' : ''}`
  if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} year${Math.round(seconds / 31536000) !== 1 ? 's' : ''}`
  return 'centuries'
}

function crackTime(entropy: number): string {
  const guessesPerSec = 1e10
  const guesses = Math.pow(2, entropy)
  const seconds = guesses / guessesPerSec
  return formatCrackTime(seconds)
}

interface AnalysisResult {
  entropy: number
  score: 0 | 1 | 2 | 3 | 4
  crackTime: string
  charsetLabel: string
  warnings: string[]
}

function analyze(pwd: string, checkCommon: boolean): AnalysisResult {
  const entropy = calcEntropy(pwd)
  const warnings: string[] = []

  const isCommon = checkCommon && COMMON_PASSWORDS.has(pwd.toLowerCase())
  if (isCommon) warnings.push('Common password')

  const lc = pwd.toLowerCase()
  const hasKeyboard = KEYBOARD_PATTERNS.some(p => lc.includes(p))
  if (hasKeyboard) warnings.push('Keyboard pattern detected')

  const hasRepeated = /(.)\1{2,}/.test(pwd)
  if (hasRepeated) warnings.push('Repeated characters')

  const hasDate = /\b(19\d{2}|20[0-2]\d)\b/.test(pwd)
  if (hasDate) warnings.push('Date pattern detected')

  if (pwd.length > 0 && pwd.length < 8) warnings.push('Too short (< 8 chars)')

  if (pwd.length > 0 && !/[^a-zA-Z0-9]/.test(pwd)) warnings.push('No special characters')

  let score: 0 | 1 | 2 | 3 | 4
  if (isCommon || entropy < 25) score = 0
  else if (entropy < 50) score = 1
  else if (entropy < 60) score = 2
  else if (entropy < 80) score = 3
  else score = 4

  return {
    entropy,
    score,
    crackTime: pwd ? crackTime(entropy) : '—',
    charsetLabel: getCharsetLabel(pwd),
    warnings,
  }
}

// ── score config ───────────────────────────────────────────────────────────────

const SCORE_LABELS = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
const SCORE_COLORS = [
  'bg-red-500',
  'bg-red-400',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-emerald-400',
]
const SCORE_TEXT = [
  'text-red-400',
  'text-red-300',
  'text-orange-400',
  'text-yellow-400',
  'text-emerald-400',
]

// ── main component ─────────────────────────────────────────────────────────────

export default function PasswordStrengthTool() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [checkCommon, setCheckCommon] = useState(true)
  const [autoAnalyze, setAutoAnalyze] = useState(true)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const run = useCallback(() => {
    if (!password) { setResult(null); return }
    setResult(analyze(password, checkCommon))
  }, [password, checkCommon])

  useEffect(() => {
    if (autoAnalyze) run()
  }, [password, checkCommon, autoAnalyze, run])

  const displayResult = result ?? (password ? analyze(password, checkCommon) : null)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[260px,1fr]">

        {/* ── Config Panel (Left) ── */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Settings</h3>

            {/* Show password */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-300">Show Password</p>
                <p className="text-[10px] text-zinc-600">Reveal characters</p>
              </div>
              <Switch checked={showPassword} onCheckedChange={setShowPassword} />
            </div>

            {/* Check common */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-300">Check Common</p>
                <p className="text-[10px] text-zinc-600">Match known weak passwords</p>
              </div>
              <Switch checked={checkCommon} onCheckedChange={setCheckCommon} />
            </div>

            {/* Auto-analyze */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-300">Auto-analyze</p>
                <p className="text-[10px] text-zinc-600">Update as you type</p>
              </div>
              <Switch checked={autoAnalyze} onCheckedChange={setAutoAnalyze} />
            </div>

            {!autoAnalyze && (
              <Button onClick={run} className="w-full h-8 text-xs">
                Analyze Password
              </Button>
            )}

            {/* Entropy info */}
            <div className="rounded-lg bg-zinc-800/40 border border-zinc-700/40 px-3 py-2.5 flex gap-2">
              <Info className="h-3.5 w-3.5 text-zinc-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-zinc-500 leading-relaxed font-mono">
                Entropy = log2(charset_size ^ length)
              </p>
            </div>
          </div>
        </div>

        {/* ── IO Area (Right) ── */}
        <div className="space-y-4">

          {/* Password input */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password to analyze..."
                className="w-full bg-transparent px-4 py-4 text-lg font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none pr-12"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Strength meter */}
          {password && displayResult && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${SCORE_TEXT[displayResult.score]}`}>
                    {SCORE_LABELS[displayResult.score]}
                  </span>
                  <span className="text-xs text-zinc-500">
                    Score: {displayResult.score}/4
                  </span>
                </div>
                {/* 5-segment bar */}
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                        i <= displayResult.score
                          ? SCORE_COLORS[displayResult.score]
                          : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                  <p className="text-[11px] text-zinc-500 mb-1">Entropy</p>
                  <p className="text-sm font-semibold text-zinc-200 font-mono">
                    {displayResult.entropy.toFixed(1)} bits
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                  <p className="text-[11px] text-zinc-500 mb-1">Est. Crack Time</p>
                  <p className="text-sm font-semibold text-zinc-200">{displayResult.crackTime}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                  <p className="text-[11px] text-zinc-500 mb-1">Length</p>
                  <p className="text-sm font-semibold text-zinc-200 font-mono">
                    {password.length} char{password.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                  <p className="text-[11px] text-zinc-500 mb-1">Charset</p>
                  <p className="text-sm font-semibold text-zinc-200 capitalize">{displayResult.charsetLabel}</p>
                </div>
              </div>

              {/* Warning badges */}
              {displayResult.warnings.length > 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 space-y-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-medium text-amber-400">Detected Issues</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayResult.warnings.map(w => (
                      <span
                        key={w}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-900/30 border border-amber-700/40 text-amber-300"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Crack time footnote */}
              <p className="text-[11px] text-zinc-600 px-1">
                Crack time assumes 10 billion guesses/second (fast GPU). Actual time varies by attacker resources.
              </p>
            </>
          )}

          {!password && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-center min-h-[200px]">
              <p className="text-sm text-zinc-600 italic">Enter a password above to see analysis</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
