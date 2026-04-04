'use client'
import React, { useState, useCallback, useEffect, useRef } from 'react'
import { computeHash } from '@/lib/hash'
import { encodeInput, copyToClipboard, readFileAsBytes, formatFileSize } from '@/lib/utils'
import { INPUT_ENCODINGS, OUTPUT_FORMATS } from '@/lib/tools-config'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Copy, Check, Upload, Trash2, RefreshCw, Share2, Hash,
  ChevronDown, ChevronUp, AlertCircle, FileText
} from 'lucide-react'

interface HashToolProps {
  algorithmId: string
  algorithmName: string
  description?: string
  isFile?: boolean
  hasOutputLen?: boolean  // SHAKE, cSHAKE, KMAC
  hasCshakeOptions?: boolean
  hasKmacKey?: boolean
}

export default function HashTool({
  algorithmId,
  algorithmName,
  description,
  isFile = false,
  hasOutputLen = false,
  hasCshakeOptions = false,
  hasKmacKey = false,
}: HashToolProps) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [inputEncoding, setInputEncoding] = useState('UTF-8')
  const [outputFormat, setOutputFormat] = useState('Hex (Lower Case)')
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [rememberInput, setRememberInput] = useState(false)
  const [hmacEnabled, setHmacEnabled] = useState(false)
  const [hmacKey, setHmacKey] = useState('')
  const [hmacKeyEncoding, setHmacKeyEncoding] = useState('UTF-8')
  const [outputLen, setOutputLen] = useState(32)
  const [cshakeN, setCshakeN] = useState('')
  const [cshakeS, setCshakeS] = useState('')
  const [kmacKey, setKmacKey] = useState('')
  const [kmacKeyEncoding, setKmacKeyEncoding] = useState('UTF-8')
  const [copied, setCopied] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null)
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load remembered input
  useEffect(() => {
    const savedInput = localStorage.getItem(`hash_input_${algorithmId}`)
    const savedRemember = localStorage.getItem(`hash_remember_${algorithmId}`)
    if (savedRemember === 'true') {
      setRememberInput(true)
      if (savedInput) setInput(savedInput)
    }
  }, [algorithmId])

  const compute = useCallback(async (inputData?: string, fileData?: Uint8Array | null) => {
    const data = fileData !== undefined ? fileData : fileBytes
    const text = inputData !== undefined ? inputData : input

    try {
      setIsProcessing(true)
      setError('')
      let bytes: Uint8Array

      if (isFile && data) {
        bytes = data
      } else if (!isFile) {
        if (!text.trim() && !text) { setOutput(''); return }
        bytes = encodeInput(text, inputEncoding)
      } else {
        setOutput('')
        return
      }

      const hmacKeyBytes = hmacEnabled && hmacKey
        ? encodeInput(hmacKey, hmacKeyEncoding)
        : undefined
      const kmacKeyBytes = hasKmacKey && kmacKey
        ? encodeInput(kmacKey, kmacKeyEncoding)
        : undefined

      const result = await computeHash(algorithmId, bytes, {
        outputFormat,
        outputLen: hasOutputLen ? outputLen : undefined,
        hmacEnabled,
        hmacKey: hmacKeyBytes,
        hmacKeyEncoding,
        cshakeN: hasCshakeOptions ? cshakeN : undefined,
        cshakeS: hasCshakeOptions ? cshakeS : undefined,
        kmacKey: kmacKeyBytes,
      })
      setOutput(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Computation failed')
      setOutput('')
    } finally {
      setIsProcessing(false)
    }
  }, [input, inputEncoding, outputFormat, algorithmId, isFile, fileBytes,
    hmacEnabled, hmacKey, hmacKeyEncoding, outputLen, cshakeN, cshakeS,
    hasOutputLen, hasCshakeOptions, hasKmacKey, kmacKey, kmacKeyEncoding])

  // Auto-update
  useEffect(() => {
    if (autoUpdate) compute()
  }, [input, inputEncoding, outputFormat, outputLen, hmacEnabled, hmacKey,
    hmacKeyEncoding, cshakeN, cshakeS, kmacKey, kmacKeyEncoding, autoUpdate, compute])

  const handleFileSelect = async (file: File) => {
    setFileInfo({ name: file.name, size: file.size })
    const bytes = await readFileAsBytes(file)
    setFileBytes(bytes)
    compute(undefined, bytes)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleInputChange = (val: string) => {
    setInput(val)
    if (rememberInput) localStorage.setItem(`hash_input_${algorithmId}`, val)
  }

  const handleCopy = async () => {
    await copyToClipboard(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyShare = async () => {
    const url = new URL(window.location.href)
    url.searchParams.set('input', btoa(input))
    url.searchParams.set('enc', inputEncoding)
    await copyToClipboard(url.toString())
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2000)
  }

  const handleRememberChange = (checked: boolean) => {
    setRememberInput(checked)
    localStorage.setItem(`hash_remember_${algorithmId}`, String(checked))
    if (!checked) localStorage.removeItem(`hash_input_${algorithmId}`)
  }

  const clearInput = () => {
    setInput(''); setOutput(''); setError('')
    setFileInfo(null); setFileBytes(null)
  }

  return (
    <div className="space-y-4">
      {/* Description */}
      {description && (
        <p className="text-sm text-zinc-400 bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5">{description}</p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr,280px]">
        {/* Main area */}
        <div className="space-y-3">
          {/* Input */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                {isFile ? 'File Input' : 'Input'}
              </span>
              <div className="flex items-center gap-1.5">
                {!isFile && (
                  <Select value={inputEncoding} onValueChange={setInputEncoding}>
                    <SelectTrigger className="h-6 w-36 text-[11px] border-zinc-700 bg-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INPUT_ENCODINGS.map((enc) => (
                        <SelectItem key={enc} value={enc} className="text-xs">{enc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <button onClick={clearInput} className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-800">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {isFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center min-h-32 p-6 cursor-pointer transition-colors ${
                  isDragging ? 'bg-blue-900/20 border-blue-600' : 'hover:bg-zinc-800/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                {fileInfo ? (
                  <div className="text-center">
                    <div className="h-10 w-10 rounded-lg bg-blue-900/30 border border-blue-800 flex items-center justify-center mx-auto mb-2">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-zinc-200">{fileInfo.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{formatFileSize(fileInfo.size)}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400">Drop file here or click to browse</p>
                    <p className="text-xs text-zinc-600 mt-1">Any file type supported</p>
                  </div>
                )}
              </div>
            ) : (
              <Textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={`Enter text to ${algorithmName}...`}
                className="min-h-[140px] border-0 rounded-none bg-transparent focus-visible:ring-0 resize-none"
              />
            )}
          </div>

          {/* HMAC Key */}
          {hmacEnabled && (
            <div className="rounded-xl border border-amber-800/40 bg-amber-900/10 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-amber-800/30">
                <span className="text-xs font-medium text-amber-400">HMAC Key</span>
                <Select value={hmacKeyEncoding} onValueChange={setHmacKeyEncoding}>
                  <SelectTrigger className="h-6 w-28 text-[11px] border-zinc-700 bg-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['UTF-8', 'Hex', 'Base64', 'Latin-1'].map((enc) => (
                      <SelectItem key={enc} value={enc} className="text-xs">{enc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={hmacKey}
                onChange={(e) => setHmacKey(e.target.value)}
                placeholder="Enter HMAC key..."
                className="border-0 rounded-none bg-transparent focus-visible:ring-0"
              />
            </div>
          )}

          {/* KMAC Key */}
          {hasKmacKey && (
            <div className="rounded-xl border border-purple-800/40 bg-purple-900/10 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-purple-800/30">
                <span className="text-xs font-medium text-purple-400">KMAC Key</span>
                <Select value={kmacKeyEncoding} onValueChange={setKmacKeyEncoding}>
                  <SelectTrigger className="h-6 w-28 text-[11px] border-zinc-700 bg-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['UTF-8', 'Hex', 'Base64'].map((enc) => (
                      <SelectItem key={enc} value={enc} className="text-xs">{enc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={kmacKey}
                onChange={(e) => setKmacKey(e.target.value)}
                placeholder="Enter KMAC key..."
                className="border-0 rounded-none bg-transparent focus-visible:ring-0"
              />
            </div>
          )}

          {/* Output */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                Output
              </span>
              <div className="flex items-center gap-1.5">
                {isProcessing && <RefreshCw className="h-3.5 w-3.5 text-blue-400 animate-spin" />}
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30 px-2 py-0.5 rounded hover:bg-zinc-800 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="relative min-h-[60px] p-3">
              {error ? (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ) : output ? (
                <p className="font-mono text-xs text-emerald-300 break-all leading-relaxed">{output}</p>
              ) : (
                <p className="text-xs text-zinc-600 italic">Output will appear here...</p>
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Settings</h3>

            {/* Output Format */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Output Format</label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OUTPUT_FORMATS.map((fmt) => (
                    <SelectItem key={fmt} value={fmt} className="text-xs">{fmt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Output Length for XOF */}
            {hasOutputLen && (
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Output Length (bytes)</label>
                <Input
                  type="number"
                  value={outputLen}
                  onChange={(e) => setOutputLen(Math.max(1, Math.min(512, parseInt(e.target.value) || 32)))}
                  className="h-8 text-xs"
                  min={1}
                  max={512}
                />
              </div>
            )}

            {/* cSHAKE options */}
            {hasCshakeOptions && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Function Name (N)</label>
                  <Input
                    value={cshakeN}
                    onChange={(e) => setCshakeN(e.target.value)}
                    placeholder="Optional function name"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Customization (S)</label>
                  <Input
                    value={cshakeS}
                    onChange={(e) => setCshakeS(e.target.value)}
                    placeholder="Optional customization"
                    className="h-8 text-xs"
                  />
                </div>
              </>
            )}

            {/* HMAC Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-300">Enable HMAC</p>
                <p className="text-[10px] text-zinc-600">Hash-based message auth</p>
              </div>
              <Switch checked={hmacEnabled} onCheckedChange={setHmacEnabled} />
            </div>

            {/* Auto Update */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-300">Auto Update</p>
                <p className="text-[10px] text-zinc-600">Update as you type</p>
              </div>
              <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
            </div>

            {/* Remember Input */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-300">Remember Input</p>
                <p className="text-[10px] text-zinc-600">Save across sessions</p>
              </div>
              <Switch checked={rememberInput} onCheckedChange={handleRememberChange} />
            </div>

            {/* Manual compute button when auto-update is off */}
            {!autoUpdate && (
              <Button onClick={() => compute()} className="w-full h-8 text-xs" disabled={isProcessing}>
                {isProcessing ? (
                  <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Computing...</>
                ) : (
                  <><Hash className="h-3.5 w-3.5" /> Compute Hash</>
                )}
              </Button>
            )}

            {/* Share Link */}
            <div className="pt-2 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-7"
                onClick={handleCopyShare}
              >
                {copiedShare
                  ? <><Check className="h-3 w-3 text-emerald-400" /> Copied!</>
                  : <><Share2 className="h-3 w-3" /> Copy Share Link</>
                }
              </Button>
            </div>
          </div>

          {/* Algorithm Info */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-xs text-zinc-400 hover:text-zinc-200"
            >
              <span className="font-medium">About {algorithmName}</span>
              {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {showAdvanced && (
              <div className="mt-3 space-y-1.5 text-[11px] text-zinc-500">
                {description && <p>{description}</p>}
                <p className="text-zinc-600">All computations are performed locally in your browser. No data is sent to any server.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
