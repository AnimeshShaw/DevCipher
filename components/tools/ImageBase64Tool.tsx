'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Check, Upload, Image as ImageIcon, Download, Sparkles } from 'lucide-react'

export default function ImageBase64Tool() {
  const [dataUri, setDataUri] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState<number | null>(null)
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setFileSize(file.size)

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setDataUri(result)

      const img = new Image()
      img.onload = () => {
        setDimensions({ w: img.width, h: img.height })
      }
      img.src = result
    }
    reader.readAsDataURL(file)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isImageDataUri = (str: string) => /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/i.test(str.trim()) || /^data:image\//i.test(str.trim())

  const downloadImage = () => {
    if (!dataUri || !isImageDataUri(dataUri)) return
    const a = document.createElement('a')
    a.href = dataUri
    a.download = fileName || 'image_from_base64.png'
    a.click()
  }

  return (
    <div className="space-y-5">
      {/* File Upload Box */}
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-6 text-center space-y-3 hover:border-blue-500/60 transition-colors">
        <ImageIcon className="h-8 w-8 text-blue-400 mx-auto" />
        <div>
          <p className="text-sm font-medium text-zinc-200">Select or Drag & Drop an Image</p>
          <p className="text-xs text-zinc-500 mt-1">Converts PNG, JPG, WebP, SVG to Base64 Data URI (100% Client-Side)</p>
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-colors">
          <Upload className="h-4 w-4" /> Browse Image File
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Manual Data URI Input / Output */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Base64 Data URI String
          </label>
          {dataUri && (
            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(dataUri)} className="h-7 text-xs text-blue-400">
              {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? 'Copied Data URI' : 'Copy String'}
            </Button>
          )}
        </div>
        <Textarea
          value={dataUri}
          onChange={(e) => setDataUri(e.target.value)}
          placeholder="Paste data:image/png;base64,... string here or upload image above"
          className="font-mono text-xs min-h-[100px] bg-zinc-950 border-zinc-800 break-all"
        />
      </div>

      {/* Preview & Stats */}
      {dataUri && isImageDataUri(dataUri) && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-4 text-zinc-400">
              {fileName && <span>File: <strong className="text-zinc-200">{fileName}</strong></span>}
              {fileSize && <span>Size: <strong className="text-zinc-200">{(fileSize / 1024).toFixed(1)} KB</strong></span>}
              {dimensions && <span>Dimensions: <strong className="text-zinc-200">{dimensions.w} × {dimensions.h} px</strong></span>}
            </div>

            <Button size="sm" onClick={downloadImage} className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
              <Download className="h-3.5 w-3.5 mr-1" /> Download Image
            </Button>
          </div>

          <div className="flex items-center justify-center p-4 bg-zinc-950 rounded-lg border border-zinc-800 max-h-[300px] overflow-hidden">
            <img src={dataUri} alt="Base64 Preview" className="max-h-[260px] object-contain rounded" />
          </div>
        </div>
      )}
    </div>
  )
}
