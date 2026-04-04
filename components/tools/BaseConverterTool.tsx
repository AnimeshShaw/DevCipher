'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Check, AlertCircle, Hash, RefreshCw } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

interface OutputCard {
  label: string
  base: number
  value: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function groupBinary(bin: string): string {
  // Pad to multiple of 4, then insert spaces every 4 chars
  const padded = bin.padStart(Math.ceil(bin.length / 4) * 4, '0')
  return padded.match(/.{1,4}/g)?.join(' ') ?? padded
}

const BASE_CHARS: Record<number, string> = {
  2:  '01',
  8:  '01234567',
  10: '0123456789',
  16: '0123456789abcdefABCDEF',
  32: '0123456789abcdefghijklmnopqrstuv',
  36: '0123456789abcdefghijklmnopqrstuvwxyz',
}

function validCharsForBase(base: number): RegExp {
  if (base <= 10) return new RegExp(`^-?[0-${base - 1}]+$`, 'i')
  const maxLetter = String.fromCharCode('a'.charCodeAt(0) + base - 11)
  return new RegExp(`^-?[0-9a-${maxLetter}]+$`, 'i')
}

function parseInput(raw: string, base: number): bigint | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  // Accept 0x / 0b / 0o prefixes regardless of selected base
  let str = trimmed
  let effectiveBase = base
  if (/^0x/i.test(str)) { str = str.slice(2); effectiveBase = 16 }
  else if (/^0b/i.test(str)) { str = str.slice(2); effectiveBase = 2 }
  else if (/^0o/i.test(str)) { str = str.slice(2); effectiveBase = 8 }

  const negative = str.startsWith('-')
  if (negative) str = str.slice(1)
  if (!str) return null

  try {
    const result = BigInt(`0x${Buffer.from(str, 'hex') ? '' : ''}`)
    // Use native BigInt parsing via manual digit accumulation
    let value = BigInt(0)
    const B = BigInt(effectiveBase)
    for (const ch of str.toLowerCase()) {
      const digit = ch >= '0' && ch <= '9'
        ? ch.charCodeAt(0) - 48
        : ch.charCodeAt(0) - 87
      if (digit < 0 || digit >= effectiveBase) return null
      value = value * B + BigInt(digit)
    }
    return negative ? -value : value
  } catch {
    return null
  }
}

function convertToBases(value: bigint, customBase?: number): OutputCard[] {
  const neg = value < BigInt(0)
  const abs = neg ? -value : value
  const sign = neg ? '-' : ''

  const fmt = (base: number, label: string): OutputCard => {
    const raw = abs.toString(base)
    let display = raw
    if (base === 2) display = groupBinary(raw)
    else if (base === 16) display = '0x' + raw.toUpperCase()
    return { label, base, value: sign + display }
  }

  const cards: OutputCard[] = [
    fmt(2, 'Binary'),
    fmt(8, 'Octal'),
    { label: 'Decimal', base: 10, value: value.toString(10) },
    fmt(16, 'Hexadecimal'),
    { label: 'Base 32', base: 32, value: sign + abs.toString(32) },
    { label: 'Base 36', base: 36, value: sign + abs.toString(36).toUpperCase() },
  ]

  if (customBase && customBase >= 2 && customBase <= 36 &&
      ![2, 8, 10, 16, 32, 36].includes(customBase)) {
    cards.push({
      label: `Custom (base ${customBase})`,
      base: customBase,
      value: sign + abs.toString(customBase),
    })
  }

  return cards
}

const BASE_OPTIONS = [
  { label: 'Binary (2)',   value: '2'  },
  { label: 'Octal (8)',    value: '8'  },
  { label: 'Decimal (10)', value: '10' },
  { label: 'Hex (16)',     value: '16' },
  { label: 'Base 32',      value: '32' },
  { label: 'Base 36',      value: '36' },
  { label: 'Custom',       value: 'custom' },
]

const QUICK_EXAMPLES = ['255', '1000', '42', '0xFF', '0b1010']

// ── Component ──────────────────────────────────────────────────────────────

export default function BaseConverterTool() {
  const [inputBase, setInputBase] = useState<string>('10')
  const [customBase, setCustomBase] = useState<number>(3)
  const [inputValue, setInputValue] = useState('')
  const [autoConvert, setAutoConvert] = useState(true)
  const [outputs, setOutputs] = useState<OutputCard[]>([])
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedDecimal, setCopiedDecimal] = useState(false)

  const effectiveBase = inputBase === 'custom' ? customBase : parseInt(inputBase, 10)

  const convert = useCallback(() => {
    if (!inputValue.trim()) {
      setOutputs([])
      setError('')
      return
    }

    const parsed = parseInput(inputValue, effectiveBase)
    if (parsed === null) {
      setError(`Invalid characters for base ${effectiveBase}`)
      setOutputs([])
      return
    }
    setError('')
    setOutputs(convertToBases(parsed, inputBase === 'custom' ? customBase : undefined))
  }, [inputValue, effectiveBase, inputBase, customBase])

  useEffect(() => {
    if (autoConvert) convert()
  }, [autoConvert, convert])

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleCopyDecimal = async () => {
    const dec = outputs.find((o) => o.base === 10)
    if (!dec) return
    await navigator.clipboard.writeText(dec.value)
    setCopiedDecimal(true)
    setTimeout(() => setCopiedDecimal(false), 2000)
  }

  const inputBaseName = BASE_OPTIONS.find((o) => o.value === inputBase)?.label ?? `Base ${effectiveBase}`

  // Validate chars for input (live indicator)
  const inputHasError = inputValue.trim()
    ? parseInput(inputValue, effectiveBase) === null
    : false

  return (
    <div className="space-y-4">
      {/* Config LEFT | IO RIGHT */}
      <div className="grid gap-4 lg:grid-cols-[260px,1fr]">

        {/* ── Settings Panel (Left) ── */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Settings</h3>

            {/* Input Base */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Input Base</label>
              <Select value={inputBase} onValueChange={setInputBase}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BASE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom base number input */}
            {inputBase === 'custom' && (
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Custom Base (2–36)</label>
                <Input
                  type="number"
                  value={customBase}
                  onChange={(e) => setCustomBase(Math.max(2, Math.min(36, parseInt(e.target.value) || 2)))}
                  className="h-8 text-xs"
                  min={2}
                  max={36}
                />
              </div>
            )}

            {/* Copy Decimal quick action */}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8"
              onClick={handleCopyDecimal}
              disabled={!outputs.some((o) => o.base === 10)}
            >
              {copiedDecimal
                ? <><Check className="h-3 w-3 text-emerald-400 mr-1" /> Copied!</>
                : <><Copy className="h-3 w-3 mr-1" /> Copy Decimal</>
              }
            </Button>

            {/* Auto Convert */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-300">Auto Convert</p>
                <p className="text-[10px] text-zinc-600">Update as you type</p>
              </div>
              <Switch checked={autoConvert} onCheckedChange={setAutoConvert} />
            </div>

            {!autoConvert && (
              <Button onClick={convert} className="w-full h-8 text-xs">
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Convert
              </Button>
            )}
          </div>
        </div>

        {/* ── Main IO Area (Right) ── */}
        <div className="space-y-3">
          {/* Input field */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                Input
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                {inputBaseName}
              </span>
            </div>

            <div className="relative p-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Enter number in ${inputBaseName}...`}
                className={`font-mono text-sm h-10 bg-transparent border-zinc-700 focus-visible:ring-1 ${
                  inputHasError ? 'border-red-600 focus-visible:ring-red-600' : ''
                }`}
              />
              {inputHasError && (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Invalid characters for base {effectiveBase}</span>
                </div>
              )}
            </div>

            {/* Quick examples */}
            <div className="px-3 pb-3 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-zinc-600">Quick:</span>
              {QUICK_EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setInputBase('10')
                    setInputValue(ex)
                  }}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs px-3 py-2 rounded-lg bg-red-900/20 border border-red-800/50">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Output grid */}
          {outputs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {outputs.map((card, i) => (
                <div
                  key={card.base}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-300">{card.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700">
                        base {card.base}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(card.value, i)}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors"
                    >
                      {copiedIndex === i
                        ? <Check className="h-3 w-3 text-emerald-400" />
                        : <Copy className="h-3 w-3" />
                      }
                    </button>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="font-mono text-xs text-emerald-300 break-all leading-relaxed">
                      {card.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!outputs.length && !error && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
              <Hash className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-600 italic">Enter a number above to see all base conversions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
