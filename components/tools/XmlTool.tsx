'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { copyToClipboard } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Check, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'
import { Button } from '../ui/button'

interface Props { variant: 'validator' | 'minifier' | 'formatter' }

function formatXML(xml: string, indentSize: number | 'tab'): string {
  const indent = indentSize === 'tab' ? '\t' : ' '.repeat(indentSize)
  let result = ''
  let level = 0
  const parts = xml.replace(/>\s*</g, '><').split(/(?<=>)(?=<)/)

  for (const part of parts) {
    if (part.startsWith('</')) {
      level--
      result += indent.repeat(level) + part + '\n'
    } else if (part.startsWith('<') && !part.startsWith('<?') && !part.startsWith('<!') && !part.endsWith('/>')) {
      result += indent.repeat(level) + part + '\n'
      level++
    } else {
      result += indent.repeat(level) + part + '\n'
    }
  }

  return result.trim()
}

function validateXML(xml: string): { valid: boolean; error?: string } {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml.trim(), 'text/xml')
    const err = doc.querySelector('parsererror')
    if (err) return { valid: false, error: err.textContent ?? 'Parse error' }
    return { valid: true }
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : 'Invalid XML' }
  }
}

export default function XmlTool({ variant }: Props) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [indent, setIndent] = useState('2')
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [copied, setCopied] = useState(false)

  const process = useCallback(() => {
    if (!input.trim()) { setOutput(''); setIsValid(null); setError(''); return }
    const validation = validateXML(input)
    setIsValid(validation.valid)

    if (!validation.valid) {
      setError(validation.error ?? 'Invalid XML')
      setOutput('')
      return
    }
    setError('')

    if (variant === 'validator') {
      const xmlDoc = new DOMParser().parseFromString(input.trim(), 'text/xml')
      const elements = xmlDoc.getElementsByTagName('*').length
      setOutput(`✓ Valid XML\nRoot element: <${xmlDoc.documentElement.tagName}>\nElement count: ${elements}\nSize: ${new Blob([input]).size} bytes`)
    } else if (variant === 'minifier') {
      setOutput(input.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim())
    } else if (variant === 'formatter') {
      try {
        const spaces = indent === 'tab' ? 'tab' : parseInt(indent)
        setOutput(formatXML(input, spaces))
      } catch {
        setOutput(input)
      }
    }
  }, [input, variant, indent])

  useEffect(() => { if (autoUpdate) process() }, [input, indent, autoUpdate, process])

  const handleCopy = async () => {
    await copyToClipboard(output)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const actionLabel = { validator: 'Validate', minifier: 'Minify', formatter: 'Format' }[variant]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr,260px]">
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400">XML Input</span>
              {isValid !== null && (
                <span className={`flex items-center gap-1 text-xs ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isValid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  {isValid ? 'Valid XML' : 'Invalid XML'}
                </span>
              )}
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='<?xml version="1.0" encoding="UTF-8"?><root><element>value</element></root>'
              className="min-h-[200px] border-0 rounded-none bg-transparent focus-visible:ring-0"
            />
          </div>

          {!autoUpdate && (
            <Button onClick={process} className="w-full h-8 text-xs">
              <RefreshCw className="h-3.5 w-3.5" /> {actionLabel}
            </Button>
          )}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400">Output</span>
              <button onClick={handleCopy} disabled={!output} className="text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30 px-2 py-0.5 rounded hover:bg-zinc-800 flex items-center gap-1">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="min-h-[80px] p-3">
              {error ? (
                <div className="flex items-start gap-2 text-red-400 text-xs">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <pre className="whitespace-pre-wrap font-mono">{error}</pre>
                </div>
              ) : output ? (
                <pre className="text-xs text-emerald-300 whitespace-pre-wrap font-mono">{output}</pre>
              ) : (
                <p className="text-xs text-zinc-600 italic">Output will appear here...</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4 h-fit">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Settings</h3>

          {variant === 'formatter' && (
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Indentation</label>
              <Select value={indent} onValueChange={setIndent}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2" className="text-xs">2 Spaces</SelectItem>
                  <SelectItem value="4" className="text-xs">4 Spaces</SelectItem>
                  <SelectItem value="tab" className="text-xs">Tab</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-300">Auto Update</p>
              <p className="text-[10px] text-zinc-600">Update as you type</p>
            </div>
            <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
          </div>
        </div>
      </div>
    </div>
  )
}
