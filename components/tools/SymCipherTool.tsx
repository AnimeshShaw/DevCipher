'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { symmetricEncrypt, symmetricDecrypt, type SymAlgo, type SymCipherMode, type SymCipherPadding, type SymKeySize } from '@/lib/crypto'
import { encodeInput, copyToClipboard, readFileAsBytes, downloadFile, formatFileSize } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Check, Upload, Download, AlertCircle, Lock, Unlock, RefreshCw, FileText, ArrowLeftRight, Keyboard } from 'lucide-react'

interface Props { toolId: string }

const ALGO_MAP: Record<string, SymAlgo> = {
  'aes-encrypt': 'AES', 'aes-decrypt': 'AES',
  'des-encrypt': 'DES', 'des-decrypt': 'DES',
  'triple-des-encrypt': 'TripleDES', 'triple-des-decrypt': 'TripleDES',
  'rc4-encrypt': 'RC4', 'rc4-decrypt': 'RC4',
}

const MODES: SymCipherMode[] = ['CBC', 'CFB', 'CTR', 'OFB', 'ECB']
const PADDINGS: SymCipherPadding[] = ['PKCS7', 'ISO97971', 'AnsiX923', 'ISO10126', 'ZeroPadding', 'NoPadding']
const KEY_TYPES = ['Custom', 'PBKDF2', 'EvpKDF']
const ENCODINGS = ['UTF-8', 'Hex', 'Base64', 'Latin-1']
const OUTPUT_FORMATS = ['Hex (Lower Case)', 'Hex (Upper Case)', 'Base64']

export default function SymCipherTool({ toolId }: Props) {
  const isEncrypt = toolId.endsWith('-encrypt')
  const algo = ALGO_MAP[toolId] ?? 'AES'
  const isRC4 = algo === 'RC4'

  // counterpart tool for swap navigation
  const counterpartId = isEncrypt
    ? toolId.replace('-encrypt', '-decrypt')
    : toolId.replace('-decrypt', '-encrypt')

  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [key, setKey] = useState('')
  const [keyEncoding, setKeyEncoding] = useState('UTF-8')
  const [iv, setIV] = useState('')
  const [ivEncoding, setIVEncoding] = useState('Hex')
  const [mode, setMode] = useState<SymCipherMode>('CBC')
  const [padding, setPadding] = useState<SymCipherPadding>('PKCS7')
  const [keySize, setKeySize] = useState<SymKeySize>(256)
  const [keyType, setKeyType] = useState('Custom')
  const [inputEncoding, setInputEncoding] = useState('UTF-8')
  const [outputEncoding, setOutputEncoding] = useState('Base64')
  const [copied, setCopied] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null)
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const process = async () => {
    if (!key.trim()) { setError('Key is required'); return }
    setIsProcessing(true); setError('')
    try {
      const opts = {
        algorithm: algo, mode, padding, keySize, keyType: keyType as 'Custom' | 'PBKDF2' | 'EvpKDF',
        key, keyEncoding, iv, ivEncoding, inputEncoding, outputEncoding,
      }
      if (isEncrypt) {
        const inputBytes = fileBytes ?? encodeInput(input, inputEncoding)
        setOutput(symmetricEncrypt(inputBytes, opts))
      } else {
        const inputData = fileBytes ? new TextDecoder().decode(fileBytes) : input
        const result = symmetricDecrypt(inputData.trim(), opts)
        setOutput(new TextDecoder('utf-8', { fatal: false }).decode(result))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operation failed')
    }
    setIsProcessing(false)
  }

  // Ctrl+Enter shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); process() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, input, iv, mode, padding, keySize, keyType, inputEncoding, outputEncoding, fileBytes])

  const handleCopy = async () => {
    await copyToClipboard(output)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) { setFileInfo({ name: file.name, size: file.size }); setFileBytes(await readFileAsBytes(file)) }
  }

  const handleDownload = () => {
    if (output) downloadFile(output, `${toolId}-output.txt`, 'text/plain')
  }

  const useOutputAsInput = () => {
    setInput(output)
    setOutput('')
    setError('')
    setFileBytes(null)
    setFileInfo(null)
  }

  return (
    <div className="space-y-4">
      {/* Config LEFT | IO RIGHT */}
      <div className="grid gap-4 lg:grid-cols-[300px,1fr]">

        {/* ── Settings Panel (Left) ── */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Configuration</h3>

            {algo === 'AES' && (
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Key Size</label>
                <Select value={String(keySize)} onValueChange={(v) => setKeySize(Number(v) as SymKeySize)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[128, 192, 256].map((s) => <SelectItem key={s} value={String(s)} className="text-xs">{s} bits</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Key Type</label>
              <Select value={keyType} onValueChange={setKeyType}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KEY_TYPES.map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {!isRC4 && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Mode</label>
                  <Select value={mode} onValueChange={(v) => setMode(v as SymCipherMode)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MODES.map((m) => <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Padding</label>
                  <Select value={padding} onValueChange={(v) => setPadding(v as SymCipherPadding)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PADDINGS.map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Input Encoding</label>
              <Select value={inputEncoding} onValueChange={setInputEncoding}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENCODINGS.map((e) => <SelectItem key={e} value={e} className="text-xs">{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Output Encoding</label>
              <Select value={outputEncoding} onValueChange={setOutputEncoding}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OUTPUT_FORMATS.map((f) => <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <p className="text-[11px] text-zinc-500">Switch operation:</p>
              <Link
                href={`/tools/${counterpartId}`}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                Go to {isEncrypt ? 'Decrypt' : 'Encrypt'}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-1 text-[11px] text-zinc-600">
            <Keyboard className="h-3 w-3" />
            <span><kbd className="font-mono">Ctrl</kbd>+<kbd className="font-mono">Enter</kbd> to {isEncrypt ? 'encrypt' : 'decrypt'}</span>
          </div>
        </div>

        {/* ── IO Area (Right) ── */}
        <div className="space-y-3">
          {/* Input */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400">{isEncrypt ? 'Plaintext' : 'Ciphertext'} Input</span>
            </div>
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              className={isDragging ? 'bg-blue-900/20' : ''}
            >
              {fileInfo ? (
                <div className="p-4 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200 truncate">{fileInfo.name}</p>
                    <p className="text-xs text-zinc-500">{formatFileSize(fileInfo.size)}</p>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => { setFileInfo(null); setFileBytes(null) }}>✕</Button>
                </div>
              ) : (
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Enter ${isEncrypt ? 'plaintext' : 'ciphertext'}... (or drag & drop a file)`}
                  className="min-h-[120px] border-0 rounded-none bg-transparent focus-visible:ring-0"
                />
              )}
            </div>
          </div>

          {/* Key */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400">Key</span>
              <Select value={keyEncoding} onValueChange={setKeyEncoding}>
                <SelectTrigger className="h-6 w-28 text-[11px] border-zinc-700 bg-zinc-800"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENCODINGS.map((e) => <SelectItem key={e} value={e} className="text-xs">{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter encryption key..."
              type="password" className="border-0 rounded-none bg-transparent focus-visible:ring-0 h-10" />
          </div>

          {/* IV */}
          {!isRC4 && mode !== 'ECB' && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                <span className="text-xs font-medium text-zinc-400">IV (Initialization Vector)</span>
                <Select value={ivEncoding} onValueChange={setIVEncoding}>
                  <SelectTrigger className="h-6 w-28 text-[11px] border-zinc-700 bg-zinc-800"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ENCODINGS.map((e) => <SelectItem key={e} value={e} className="text-xs">{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Input value={iv} onChange={(e) => setIV(e.target.value)} placeholder="Leave empty for zero IV"
                className="border-0 rounded-none bg-transparent focus-visible:ring-0 h-10" />
            </div>
          )}

          {/* Action button */}
          <Button onClick={process} className="w-full" disabled={isProcessing}>
            {isProcessing ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Processing...</>
            ) : isEncrypt ? (
              <><Lock className="h-4 w-4" /> Encrypt</>
            ) : (
              <><Unlock className="h-4 w-4" /> Decrypt</>
            )}
          </Button>

          {/* Output */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400">{isEncrypt ? 'Ciphertext' : 'Plaintext'} Output</span>
              <div className="flex items-center gap-1">
                <button onClick={handleDownload} disabled={!output} className="text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30 px-2 py-0.5 rounded hover:bg-zinc-800 flex items-center gap-1">
                  <Download className="h-3.5 w-3.5" />
                </button>
                <button onClick={handleCopy} disabled={!output} className="text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30 px-2 py-0.5 rounded hover:bg-zinc-800 flex items-center gap-1">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="min-h-[80px] p-3">
              {error ? (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="h-4 w-4" />{error}
                </div>
              ) : output ? (
                <p className="font-mono text-xs text-emerald-300 break-all">{output}</p>
              ) : (
                <p className="text-xs text-zinc-600 italic">Output will appear here...</p>
              )}
            </div>
          </div>

          {/* Swap: use output as input */}
          {output && !error && (
            <button
              onClick={useOutputAsInput}
              className="w-full flex items-center justify-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 py-2 rounded-lg border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50 transition-all"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Use output as input
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
