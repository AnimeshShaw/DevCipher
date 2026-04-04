'use client'
import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  hexEncode, hexDecode, fileToBytesHex, hexToFile,
  base32EncodeText, base32DecodeText, fileToBase32, base32ToFile,
  base58EncodeText, base58DecodeText, fileToBase58, base58ToFile,
  base64EncodeText, base64DecodeText, fileToBase64, base64ToFile,
  htmlEncode, htmlDecode, urlEncode, urlDecode,
  type Base64Format,
} from '@/lib/encoding'
import { copyToClipboard, readFileAsBytes, downloadFile, formatFileSize } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Copy, Check, Upload, Download, AlertCircle, ArrowUpDown, FileText, RefreshCw } from 'lucide-react'

interface Props { toolId: string }

const BASE64_FORMATS: Base64Format[] = ['RFC4648', 'RFC4648_URL', 'RFC2045', 'RFC2152', 'RFC3501']
const BASE64_FORMAT_LABELS: Record<Base64Format, string> = {
  RFC4648: 'RFC 4648 (Standard)',
  RFC4648_URL: 'RFC 4648 URL Safe',
  RFC2045: 'RFC 2045 (MIME)',
  RFC2152: 'RFC 2152 (UTF-7)',
  RFC3501: 'RFC 3501 (IMAP)',
}

export default function EncodingTool({ toolId }: Props) {
  const isFile = toolId.includes('-file')
  const isEncode = toolId.endsWith('-encode') || toolId === toolId.replace(/-file-decode$/, '-file')
  const isDecode = toolId.endsWith('-decode') || toolId.endsWith('-file-decode')
  const isFileDecode = toolId.endsWith('-file-decode')
  const isFileEncode = toolId === toolId.replace(/-file$/, '-file') && isFile && !isFileDecode

  // Determine which encoding scheme
  const scheme = toolId.replace(/-encode$/, '').replace(/-decode$/, '').replace(/-file-decode$/, '').replace(/-file$/, '')

  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [copied, setCopied] = useState(false)
  const [base64Format, setBase64Format] = useState<Base64Format>('RFC4648')
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null)
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compute = useCallback((inputText?: string, bytes?: Uint8Array | null) => {
    const text = inputText !== undefined ? inputText : input
    const fb = bytes !== undefined ? bytes : fileBytes
    setError('')
    try {
      let result = ''
      if (isFile) {
        if (!fb && !isFileDecode) { setOutput(''); return }
        if (isFileDecode) {
          // Decode text → file bytes
          const decodedRaw = computeDecode(scheme, text.trim(), base64Format)
          const decoded = decodedRaw instanceof Uint8Array ? decodedRaw : new TextEncoder().encode(String(decodedRaw))
          setOutput(`${decoded.length} bytes decoded`)
          setFileBytes(decoded)
          return
        } else if (fb) {
          result = computeFileEncode(scheme, fb, base64Format)
        }
      } else {
        if (!text && !isDecode) { setOutput(''); return }
        result = isEncode
          ? computeEncode(scheme, text, base64Format)
          : computeDecode(scheme, text, base64Format) instanceof Uint8Array
            ? new TextDecoder('utf-8', { fatal: false }).decode(computeDecode(scheme, text, base64Format) as Uint8Array)
            : String(computeDecode(scheme, text, base64Format))
      }
      setOutput(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operation failed')
      setOutput('')
    }
  }, [input, fileBytes, scheme, base64Format, isFile, isFileDecode, isEncode, isDecode])

  useEffect(() => { if (autoUpdate && !isFile) compute() }, [input, base64Format, autoUpdate, compute, isFile])

  const handleFileSelect = async (file: File) => {
    setFileInfo({ name: file.name, size: file.size })
    const bytes = await readFileAsBytes(file)
    setFileBytes(bytes)
    compute(undefined, bytes)
  }

  const handleDownloadOutput = () => {
    if (!fileBytes) return
    downloadFile(fileBytes, 'decoded-file', 'application/octet-stream')
  }

  const handleCopy = async () => {
    await copyToClipboard(output)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr,260px]">
        <div className="space-y-3">
          {/* Input */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400">
                {isFile ? 'File' : (isEncode ? 'Input' : 'Encoded Input')}
              </span>
              {scheme === 'base64' && !isFile && (
                <Select value={base64Format} onValueChange={(v) => setBase64Format(v as Base64Format)}>
                  <SelectTrigger className="h-6 w-44 text-[11px] border-zinc-700 bg-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BASE64_FORMATS.map((f) => (
                      <SelectItem key={f} value={f} className="text-xs">{BASE64_FORMAT_LABELS[f]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {isFile ? (
              <div
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f) }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => !isFileDecode && fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center min-h-28 p-6 cursor-pointer transition-colors ${isDragging ? 'bg-blue-900/20' : isFileDecode ? '' : 'hover:bg-zinc-800/50'}`}
              >
                <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                {fileInfo ? (
                  <div className="text-center">
                    <FileText className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                    <p className="text-sm text-zinc-200">{fileInfo.name}</p>
                    <p className="text-xs text-zinc-500">{formatFileSize(fileInfo.size)}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-7 w-7 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400">{isFileDecode ? 'Enter encoded text below' : 'Drop file or click to browse'}</p>
                  </div>
                )}
              </div>
            ) : (
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isEncode ? 'Enter text to encode...' : 'Enter encoded text to decode...'}
                className="min-h-[140px] border-0 rounded-none bg-transparent focus-visible:ring-0"
              />
            )}
          </div>

          {/* Decode to file: show text input */}
          {isFileDecode && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <div className="flex items-center px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                <span className="text-xs font-medium text-zinc-400">Encoded Text</span>
              </div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste encoded text..."
                className="min-h-[100px] border-0 rounded-none bg-transparent focus-visible:ring-0"
              />
            </div>
          )}

          {!autoUpdate && !isFile && (
            <Button onClick={() => compute()} className="w-full h-8 text-xs">
              <RefreshCw className="h-3.5 w-3.5" />
              {isEncode ? 'Encode' : 'Decode'}
            </Button>
          )}

          {/* Output */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400">{isFile && isFileDecode ? 'File Output' : 'Output'}</span>
              <div className="flex items-center gap-1">
                {isFileDecode && fileBytes && (
                  <button onClick={handleDownloadOutput} className="text-xs text-zinc-500 hover:text-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-800 flex items-center gap-1">
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                )}
                {!isFileDecode && (
                  <button onClick={handleCopy} disabled={!output} className="text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30 px-2 py-0.5 rounded hover:bg-zinc-800 flex items-center gap-1">
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
            <div className="min-h-[80px] p-3">
              {error ? (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="h-4 w-4" />{error}
                </div>
              ) : output ? (
                <p className="font-mono text-xs text-emerald-300 break-all leading-relaxed whitespace-pre-wrap">{output}</p>
              ) : (
                <p className="text-xs text-zinc-600 italic">Output will appear here...</p>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4 h-fit">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Settings</h3>

          {scheme === 'base64' && (
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Base64 Standard</label>
              <Select value={base64Format} onValueChange={(v) => setBase64Format(v as Base64Format)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BASE64_FORMATS.map((f) => (
                    <SelectItem key={f} value={f} className="text-xs">{BASE64_FORMAT_LABELS[f]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!isFile && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-300">Auto Update</p>
                <p className="text-[10px] text-zinc-600">Update as you type</p>
              </div>
              <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
            </div>
          )}

          {isFile && !isFileDecode && (
            <Button onClick={() => compute()} disabled={!fileBytes} className="w-full h-8 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5" />
              {isEncode ? 'Encode File' : 'Decode File'}
            </Button>
          )}

          {isFileDecode && (
            <Button onClick={() => compute()} disabled={!input.trim()} className="w-full h-8 text-xs">
              <Download className="h-3.5 w-3.5" /> Decode to File
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper functions
function computeEncode(scheme: string, text: string, b64Format: Base64Format): string {
  switch (scheme) {
    case 'hex': return hexEncode(text)
    case 'base32': return base32EncodeText(text)
    case 'base58': return base58EncodeText(text)
    case 'base64': return base64EncodeText(text, b64Format)
    case 'html': return htmlEncode(text)
    case 'url': return urlEncode(text)
    default: throw new Error(`Unknown scheme: ${scheme}`)
  }
}

function computeDecode(scheme: string, text: string, b64Format: Base64Format): string | Uint8Array {
  switch (scheme) {
    case 'hex': return hexDecode(text)
    case 'base32': return base32DecodeText(text)
    case 'base58': return base58DecodeText(text)
    case 'base64': return base64DecodeText(text)
    case 'html': return htmlDecode(text)
    case 'url': return urlDecode(text)
    default: throw new Error(`Unknown scheme: ${scheme}`)
  }
}

function computeFileEncode(scheme: string, bytes: Uint8Array, b64Format: Base64Format): string {
  switch (scheme) {
    case 'hex': return fileToBytesHex(bytes)
    case 'base32': return fileToBase32(bytes)
    case 'base58': return fileToBase58(bytes)
    case 'base64': return fileToBase64(bytes, b64Format)
    default: throw new Error(`Unknown scheme: ${scheme}`)
  }
}
