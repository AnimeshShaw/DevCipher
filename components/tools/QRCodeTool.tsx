'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { copyToClipboard, downloadFile } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Download, Copy, Check, RefreshCw, QrCode, Image, Link } from 'lucide-react'

type ErrorLevel = 'L' | 'M' | 'Q' | 'H'
type DotType = 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded'
type CornerSquareType = 'none' | 'dot' | 'square' | 'extra-rounded'
type CornerDotType = 'none' | 'dot' | 'square'

const SOCIAL_EXAMPLES = [
  { label: 'URL', value: 'https://example.com' },
  { label: 'Email', value: 'mailto:hello@example.com' },
  { label: 'Phone', value: 'tel:+1234567890' },
  { label: 'SMS', value: 'sms:+1234567890?body=Hello' },
  { label: 'WiFi', value: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;' },
  { label: 'vCard', value: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nEND:VCARD' },
]

export default function QRCodeTool() {
  const [isLoaded, setIsLoaded] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const QRClassRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qrRef = useRef<any>(null)
  const mountRef = useRef<HTMLDivElement>(null)

  const [text, setText] = useState('https://example.com')
  const [size, setSize] = useState(300)
  const [margin, setMargin] = useState(10)
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('M')
  const [dotType, setDotType] = useState<DotType>('square')
  const [dotColor, setDotColor] = useState('#ffffff')
  const [bgColor, setBgColor] = useState('#000000')
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>('square')
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>('dot')
  const [cornerColor, setCornerColor] = useState('#3b82f6')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoSize, setLogoSize] = useState(0.3)
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [copied, setCopied] = useState(false)
  const [outputType, setOutputType] = useState<'svg' | 'png' | 'jpeg' | 'webp'>('svg')
  const [isGenerating, setIsGenerating] = useState(false)

  // Lazy-load qr-code-styling — store constructor in ref to avoid React calling it as updater
  useEffect(() => {
    import('qr-code-styling').then((mod) => {
      QRClassRef.current = mod.default ?? mod
      setIsLoaded(true)
    })
  }, [])

  const generate = useCallback(async () => {
    if (!isLoaded || !QRClassRef.current || !mountRef.current) return
    setIsGenerating(true)
    try {
      if (qrRef.current) {
        qrRef.current.update({
          data: text || 'https://example.com',
          width: size, height: size,
          margin,
          qrOptions: { errorCorrectionLevel: errorLevel },
          dotsOptions: { type: dotType, color: dotColor },
          backgroundOptions: { color: bgColor },
          cornersSquareOptions: { type: cornerSquareType === 'none' ? undefined : cornerSquareType, color: cornerColor },
          cornersDotOptions: { type: cornerDotType === 'none' ? undefined : cornerDotType, color: cornerColor },
          image: logoUrl || undefined,
          imageOptions: { imageSize: logoSize, margin: 4 },
        })
      } else {
        const QR = QRClassRef.current
        qrRef.current = new QR({
          data: text || 'https://example.com',
          width: size, height: size,
          margin,
          type: 'svg',
          qrOptions: { errorCorrectionLevel: errorLevel },
          dotsOptions: { type: dotType, color: dotColor },
          backgroundOptions: { color: bgColor },
          cornersSquareOptions: { type: cornerSquareType === 'none' ? undefined : cornerSquareType, color: cornerColor },
          cornersDotOptions: { type: cornerDotType === 'none' ? undefined : cornerDotType, color: cornerColor },
          image: logoUrl || undefined,
          imageOptions: { imageSize: logoSize, margin: 4 },
        })
        mountRef.current.innerHTML = ''
        qrRef.current.append(mountRef.current)
      }
    } finally {
      setIsGenerating(false)
    }
  }, [isLoaded, text, size, margin, errorLevel, dotType, dotColor, bgColor,
    cornerSquareType, cornerDotType, cornerColor, logoUrl, logoSize])

  useEffect(() => { if (autoUpdate) generate() }, [autoUpdate, generate])

  const handleDownload = () => {
    if (qrRef.current) qrRef.current.download({ name: 'qrcode', extension: outputType })
  }

  const handleCopyLink = async () => {
    await copyToClipboard(text)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="grid gap-4 lg:grid-cols-[1fr,340px]">
        {/* Left: Input + Preview */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <QrCode className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-400">Content</span>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter URL, text, or data..."
              className="min-h-[100px] border-0 rounded-none bg-transparent focus-visible:ring-0"
            />
            {/* Quick examples */}
            <div className="flex flex-wrap gap-1.5 px-3 pb-3">
              {SOCIAL_EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => setText(ex.value)}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {!autoUpdate && (
            <Button onClick={generate} disabled={isGenerating} className="w-full h-9">
              {isGenerating ? <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</> : <><QrCode className="h-4 w-4" /> Generate QR Code</>}
            </Button>
          )}

          {/* QR Preview */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-center p-6 min-h-[340px]">
            {!isLoaded ? (
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <p className="text-xs">Loading QR generator...</p>
              </div>
            ) : (
              <div ref={mountRef} className="qr-container" />
            )}
          </div>

          {/* Download */}
          <div className="flex gap-2">
            <Select value={outputType} onValueChange={(v) => setOutputType(v as typeof outputType)}>
              <SelectTrigger className="h-9 w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="svg" className="text-xs">SVG</SelectItem>
                <SelectItem value="png" className="text-xs">PNG</SelectItem>
                <SelectItem value="jpeg" className="text-xs">JPEG</SelectItem>
                <SelectItem value="webp" className="text-xs">WEBP</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleDownload} variant="secondary" className="flex-1 h-9 text-xs">
              <Download className="h-4 w-4" /> Download QR Code
            </Button>
            <Button onClick={handleCopyLink} variant="outline" className="h-9 text-xs">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </div>

        {/* Right: Settings */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Appearance</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Size (px)</label>
                <Input type="number" value={size} onChange={(e) => setSize(Math.max(100, Math.min(1000, parseInt(e.target.value) || 300)))} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Margin (px)</label>
                <Input type="number" value={margin} onChange={(e) => setMargin(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))} className="h-8 text-xs" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Error Correction</label>
              <Select value={errorLevel} onValueChange={(v) => setErrorLevel(v as ErrorLevel)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="L" className="text-xs">L — Low (7%)</SelectItem>
                  <SelectItem value="M" className="text-xs">M — Medium (15%)</SelectItem>
                  <SelectItem value="Q" className="text-xs">Q — Quartile (25%)</SelectItem>
                  <SelectItem value="H" className="text-xs">H — High (30%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Dot Style</label>
              <Select value={dotType} onValueChange={(v) => setDotType(v as DotType)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'] as DotType[]).map((t) => (
                    <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Dot Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={dotColor} onChange={(e) => setDotColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0" />
                  <Input value={dotColor} onChange={(e) => setDotColor(e.target.value)} className="h-8 text-xs flex-1" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Background</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0" />
                  <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 text-xs flex-1" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Corners</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Corner Square</label>
                <Select value={cornerSquareType} onValueChange={(v) => setCornerSquareType(v as CornerSquareType)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['none', 'dot', 'square', 'extra-rounded'] as CornerSquareType[]).map((t) => (
                      <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Corner Dot</label>
                <Select value={cornerDotType} onValueChange={(v) => setCornerDotType(v as CornerDotType)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['none', 'dot', 'square'] as CornerDotType[]).map((t) => (
                      <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Corner Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={cornerColor} onChange={(e) => setCornerColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0" />
                <Input value={cornerColor} onChange={(e) => setCornerColor(e.target.value)} className="h-8 text-xs flex-1" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Image className="h-3.5 w-3.5" /> Logo Overlay
            </h3>
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Logo URL or Data URI</label>
              <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 flex justify-between">
                Logo Size <span>{Math.round(logoSize * 100)}%</span>
              </label>
              <input type="range" min="0.1" max="0.5" step="0.05" value={logoSize}
                onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                className="w-full accent-blue-500" />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-300">Auto Generate</p>
                <p className="text-[10px] text-zinc-600">Update as settings change</p>
              </div>
              <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
