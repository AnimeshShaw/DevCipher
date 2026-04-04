'use client'
import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Copy, Check, AlertCircle, Pipette } from 'lucide-react'

// ── Color math ────────────────────────────────────────────────────────────

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }
interface HSV { h: number; s: number; v: number }
interface OKLCH { l: number; c: number; h: number }

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

// HEX ↔ RGB
function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

function rgbToHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')
}

// RGB ↔ HSL
function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100, ln = l / 100
  if (sn === 0) {
    const v = Math.round(ln * 255)
    return { r: v, g: v, b: v }
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
  const p = 2 * ln - q
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const hn = h / 360
  return {
    r: Math.round(hue2rgb(hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(hn) * 255),
    b: Math.round(hue2rgb(hn - 1 / 3) * 255),
  }
}

// RGB ↔ HSV
function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const v = max, d = max - min
  const s = max === 0 ? 0 : d / max
  let h = 0
  if (max !== min) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
    else if (max === gn) h = ((bn - rn) / d + 2) / 6
    else h = ((rn - gn) / d + 4) / 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) }
}

function hsvToRgb({ h, s, v }: HSV): RGB {
  const sn = s / 100, vn = v / 100
  if (sn === 0) {
    const c = Math.round(vn * 255)
    return { r: c, g: c, b: c }
  }
  const hn = h / 60
  const i = Math.floor(hn)
  const f = hn - i
  const p = vn * (1 - sn)
  const q = vn * (1 - sn * f)
  const t = vn * (1 - sn * (1 - f))
  const cases: Array<[number, number, number]> = [
    [vn, t, p], [q, vn, p], [p, vn, t],
    [p, q, vn], [t, p, vn], [vn, p, q],
  ]
  const [rn, gn, bn] = cases[i % 6]
  return { r: Math.round(rn * 255), g: Math.round(gn * 255), b: Math.round(bn * 255) }
}

// RGB ↔ OKLCH (via linear sRGB → Oklab → OKLCH)
function linearize(v: number): number {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

function rgbToOklch({ r, g, b }: RGB): OKLCH {
  const rn = linearize(r / 255)
  const gn = linearize(g / 255)
  const bn = linearize(b / 255)

  const l = 0.4122214708 * rn + 0.5363325363 * gn + 0.0514459929 * bn
  const m = 0.2119034982 * rn + 0.6806995451 * gn + 0.1073969566 * bn
  const s = 0.0883024619 * rn + 0.2817188376 * gn + 0.6299787005 * bn

  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s)

  const labL = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
  const labA = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
  const labB = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

  const C = Math.sqrt(labA * labA + labB * labB)
  const H = ((Math.atan2(labB, labA) * 180) / Math.PI + 360) % 360

  return {
    l: Math.round(labL * 1000) / 1000,
    c: Math.round(C * 1000) / 1000,
    h: Math.round(H * 10) / 10,
  }
}

function oklchToRgb({ l, c, h }: OKLCH): RGB {
  const labA = c * Math.cos((h * Math.PI) / 180)
  const labB = c * Math.sin((h * Math.PI) / 180)

  const l_ = l + 0.3963377774 * labA + 0.2158037573 * labB
  const m_ = l - 0.1055613458 * labA - 0.0638541728 * labB
  const s_ = l - 0.0894841775 * labA - 1.2914855480 * labB

  const lv = l_ * l_ * l_
  const mv = m_ * m_ * m_
  const sv = s_ * s_ * s_

  const rLin = 4.0767416621 * lv - 3.3077115913 * mv + 0.2309699292 * sv
  const gLin = -1.2684380046 * lv + 2.6097574011 * mv - 0.3413193965 * sv
  const bLin = -0.0041960863 * lv - 0.7034186147 * mv + 1.7076147010 * sv

  const toSrgb = (v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    return Math.round((clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055) * 255)
  }
  return { r: toSrgb(rLin), g: toSrgb(gLin), b: toSrgb(bLin) }
}

// ── Output formatters ─────────────────────────────────────────────────────

function buildOutputs(rgb: RGB) {
  const hex = rgbToHex(rgb)
  const hsl = rgbToHsl(rgb)
  const hsv = rgbToHsv(rgb)
  const oklch = rgbToOklch(rgb)
  return [
    { label: 'HEX',          value: hex.toUpperCase() },
    { label: 'RGB',          value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'RGBA',         value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
    { label: 'HSL',          value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'HSV',          value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
    { label: 'OKLCH',        value: `oklch(${oklch.l} ${oklch.c} ${oklch.h})` },
    { label: 'CSS Variable', value: `--color: ${hex.toUpperCase()}` },
    { label: 'Tailwind',     value: 'N/A' },
  ]
}

// ── Input mode types ──────────────────────────────────────────────────────

type InputMode = 'HEX' | 'RGB' | 'HSL' | 'HSV' | 'OKLCH'
const INPUT_MODES: InputMode[] = ['HEX', 'RGB', 'HSL', 'HSV', 'OKLCH']

const DEFAULT_HEX = '#3b82f6'

// ── Component ─────────────────────────────────────────────────────────────

export default function ColorConverterTool() {
  const [mode, setMode] = useState<InputMode>('HEX')
  const [hexInput, setHexInput] = useState(DEFAULT_HEX)
  const [rgb, setRgb] = useState<RGB>({ r: 59, g: 130, b: 246 })
  const [rgbInput, setRgbInput] = useState<{ r: string; g: string; b: string }>({ r: '59', g: '130', b: '246' })
  const [hslInput, setHslInput] = useState<{ h: string; s: string; l: string }>({ h: '217', s: '91', l: '60' })
  const [hsvInput, setHsvInput] = useState<{ h: string; s: string; v: string }>({ h: '217', s: '76', v: '96' })
  const [oklchInput, setOklchInput] = useState<{ l: string; c: string; h: string }>({ l: '0.598', c: '0.2', h: '240' })
  const [autoConvert, setAutoConvert] = useState(true)
  const [outputs, setOutputs] = useState(() => buildOutputs({ r: 59, g: 130, b: 246 }))
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const colorPickerRef = useRef<HTMLInputElement>(null)

  // Sync all field states from an RGB value
  const syncFromRgb = useCallback((newRgb: RGB) => {
    setRgb(newRgb)
    const hsl = rgbToHsl(newRgb)
    const hsv = rgbToHsv(newRgb)
    const ok = rgbToOklch(newRgb)
    setRgbInput({ r: String(newRgb.r), g: String(newRgb.g), b: String(newRgb.b) })
    setHslInput({ h: String(hsl.h), s: String(hsl.s), l: String(hsl.l) })
    setHsvInput({ h: String(hsv.h), s: String(hsv.s), v: String(hsv.v) })
    setOklchInput({ l: String(ok.l), c: String(ok.c), h: String(ok.h) })
    setHexInput(rgbToHex(newRgb))
    setOutputs(buildOutputs(newRgb))
    setError('')
  }, [])

  const convertFromHex = useCallback((hex: string) => {
    const parsed = hexToRgb(hex)
    if (!parsed) { setError('Invalid hex color'); return }
    syncFromRgb(parsed)
  }, [syncFromRgb])

  const convertFromRgb = useCallback((r: string, g: string, b: string) => {
    const rv = parseInt(r), gv = parseInt(g), bv = parseInt(b)
    if ([rv, gv, bv].some(isNaN)) { setError('Invalid RGB values'); return }
    syncFromRgb({ r: clamp(rv, 0, 255), g: clamp(gv, 0, 255), b: clamp(bv, 0, 255) })
  }, [syncFromRgb])

  const convertFromHsl = useCallback((h: string, s: string, l: string) => {
    const hv = parseInt(h), sv = parseInt(s), lv = parseInt(l)
    if ([hv, sv, lv].some(isNaN)) { setError('Invalid HSL values'); return }
    syncFromRgb(hslToRgb({ h: clamp(hv, 0, 360), s: clamp(sv, 0, 100), l: clamp(lv, 0, 100) }))
  }, [syncFromRgb])

  const convertFromHsv = useCallback((h: string, s: string, v: string) => {
    const hv = parseInt(h), sv = parseInt(s), vv = parseInt(v)
    if ([hv, sv, vv].some(isNaN)) { setError('Invalid HSV values'); return }
    syncFromRgb(hsvToRgb({ h: clamp(hv, 0, 360), s: clamp(sv, 0, 100), v: clamp(vv, 0, 100) }))
  }, [syncFromRgb])

  const convertFromOklch = useCallback((l: string, c: string, h: string) => {
    const lv = parseFloat(l), cv = parseFloat(c), hv = parseFloat(h)
    if ([lv, cv, hv].some(isNaN)) { setError('Invalid OKLCH values'); return }
    syncFromRgb(oklchToRgb({ l: clamp(lv, 0, 1), c: clamp(cv, 0, 0.4), h: clamp(hv, 0, 360) }))
  }, [syncFromRgb])

  // Auto-convert triggers
  useEffect(() => {
    if (!autoConvert) return
    if (mode === 'HEX') convertFromHex(hexInput)
  }, [hexInput, mode, autoConvert, convertFromHex])

  useEffect(() => {
    if (!autoConvert) return
    if (mode === 'RGB') convertFromRgb(rgbInput.r, rgbInput.g, rgbInput.b)
  }, [rgbInput, mode, autoConvert, convertFromRgb])

  useEffect(() => {
    if (!autoConvert) return
    if (mode === 'HSL') convertFromHsl(hslInput.h, hslInput.s, hslInput.l)
  }, [hslInput, mode, autoConvert, convertFromHsl])

  useEffect(() => {
    if (!autoConvert) return
    if (mode === 'HSV') convertFromHsv(hsvInput.h, hsvInput.s, hsvInput.v)
  }, [hsvInput, mode, autoConvert, convertFromHsv])

  useEffect(() => {
    if (!autoConvert) return
    if (mode === 'OKLCH') convertFromOklch(oklchInput.l, oklchInput.c, oklchInput.h)
  }, [oklchInput, mode, autoConvert, convertFromOklch])

  const handleCopy = async (value: string, i: number) => {
    await navigator.clipboard.writeText(value)
    setCopiedIndex(i)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    setHexInput(hex)
    setMode('HEX')
    convertFromHex(hex)
  }

  // Current HEX for the swatch (always valid)
  const swatchHex = rgbToHex(rgb)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[200px,1fr]">

        {/* ── Left Panel: swatch + inputs ── */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">

            {/* Color Swatch */}
            <div
              className="min-h-[120px] rounded-xl border border-zinc-700 transition-colors duration-150"
              style={{ backgroundColor: swatchHex }}
            />

            {/* Native color picker */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => colorPickerRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <Pipette className="h-3 w-3" />
                Pick color
              </button>
              <input
                ref={colorPickerRef}
                type="color"
                value={swatchHex}
                onChange={handleColorPicker}
                className="sr-only"
                aria-label="Color picker"
              />
              <span className="font-mono text-xs text-zinc-400">{swatchHex.toUpperCase()}</span>
            </div>

            {/* Mode tabs */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5">Input Mode</label>
              <div className="grid grid-cols-5 gap-0.5 rounded-lg bg-zinc-800 p-0.5">
                {INPUT_MODES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`text-[10px] py-1 rounded-md font-medium transition-colors ${
                      mode === m
                        ? 'bg-zinc-600 text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Input fields per mode */}
            <div className="space-y-2">
              {mode === 'HEX' && (
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">HEX</label>
                  <Input
                    value={hexInput}
                    onChange={(e) => setHexInput(e.target.value)}
                    placeholder="#000000"
                    className="h-8 text-xs font-mono"
                  />
                </div>
              )}

              {mode === 'RGB' && (
                <>
                  {(['r', 'g', 'b'] as const).map((ch, idx) => (
                    <div key={ch} className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 w-6 text-right">{['R','G','B'][idx]}</span>
                      <Input
                        type="number"
                        value={rgbInput[ch]}
                        onChange={(e) => setRgbInput((p) => ({ ...p, [ch]: e.target.value }))}
                        min={0} max={255}
                        className="h-7 text-xs font-mono"
                      />
                    </div>
                  ))}
                </>
              )}

              {mode === 'HSL' && (
                <>
                  {([
                    ['h', 'H', '0-360'],
                    ['s', 'S', '0-100%'],
                    ['l', 'L', '0-100%'],
                  ] as const).map(([key, lbl, hint]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 w-6 text-right">{lbl}</span>
                      <Input
                        type="number"
                        value={hslInput[key]}
                        onChange={(e) => setHslInput((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder={hint}
                        className="h-7 text-xs font-mono"
                      />
                    </div>
                  ))}
                </>
              )}

              {mode === 'HSV' && (
                <>
                  {([
                    ['h', 'H', '0-360'],
                    ['s', 'S', '0-100%'],
                    ['v', 'V', '0-100%'],
                  ] as const).map(([key, lbl, hint]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 w-6 text-right">{lbl}</span>
                      <Input
                        type="number"
                        value={hsvInput[key]}
                        onChange={(e) => setHsvInput((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder={hint}
                        className="h-7 text-xs font-mono"
                      />
                    </div>
                  ))}
                </>
              )}

              {mode === 'OKLCH' && (
                <>
                  {([
                    ['l', 'L', '0-1'],
                    ['c', 'C', '0-0.4'],
                    ['h', 'H', '0-360'],
                  ] as const).map(([key, lbl, hint]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 w-6 text-right">{lbl}</span>
                      <Input
                        type="number"
                        value={oklchInput[key]}
                        onChange={(e) => setOklchInput((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder={hint}
                        step={key === 'l' || key === 'c' ? '0.001' : '1'}
                        className="h-7 text-xs font-mono"
                      />
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Auto Convert */}
            <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
              <div>
                <p className="text-xs font-medium text-zinc-300">Auto Convert</p>
                <p className="text-[10px] text-zinc-600">Update as you type</p>
              </div>
              <Switch checked={autoConvert} onCheckedChange={setAutoConvert} />
            </div>
          </div>
        </div>

        {/* ── Right Area: output cards ── */}
        <div className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs px-3 py-2 rounded-lg bg-red-900/20 border border-red-800/50">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Color Formats</span>
            </div>
            <div className="divide-y divide-zinc-800">
              {outputs.map((out, i) => (
                <div key={out.label} className="flex items-center px-3 py-2 gap-3 hover:bg-zinc-800/40 transition-colors">
                  <span className="text-xs text-zinc-400 w-28 flex-shrink-0">{out.label}</span>
                  <span className="font-mono text-xs text-emerald-300 flex-1 break-all">{out.value}</span>
                  <button
                    onClick={() => handleCopy(out.value, i)}
                    className="flex-shrink-0 text-zinc-500 hover:text-zinc-200 p-1 rounded hover:bg-zinc-700 transition-colors"
                    aria-label={`Copy ${out.label}`}
                  >
                    {copiedIndex === i
                      ? <Check className="h-3.5 w-3.5 text-emerald-400" />
                      : <Copy className="h-3.5 w-3.5" />
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
