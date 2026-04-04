'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { copyToClipboard } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Copy, Check, AlertCircle, CheckCircle2, RefreshCw, ChevronRight, ChevronDown, Minus, Plus } from 'lucide-react'

interface Props { variant: 'validator' | 'minifier' | 'formatter' | 'viewer' }

// Interactive JSON tree viewer
function JsonNode({ data, depth = 0, defaultOpen = true }: { data: unknown; depth?: number; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen && depth < 2)

  if (data === null) return <span className="text-zinc-500">null</span>
  if (typeof data === 'boolean') return <span className="text-purple-400">{String(data)}</span>
  if (typeof data === 'number') return <span className="text-yellow-400">{data}</span>
  if (typeof data === 'string') return <span className="text-green-400">"{data}"</span>

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-zinc-400">[]</span>
    return (
      <span>
        <button onClick={() => setOpen(!open)} className="text-zinc-400 hover:text-white inline-flex items-center gap-0.5">
          {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <span className="text-zinc-500 text-[10px]">[{data.length}]</span>
        </button>
        {open && (
          <div className="ml-4 border-l border-zinc-800 pl-2">
            {data.map((item, i) => (
              <div key={i} className="py-0.5">
                <span className="text-zinc-600 text-[10px] mr-1">{i}:</span>
                <JsonNode data={item} depth={depth + 1} />
                {i < data.length - 1 && <span className="text-zinc-600">,</span>}
              </div>
            ))}
          </div>
        )}
      </span>
    )
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>)
    if (entries.length === 0) return <span className="text-zinc-400">{'{}'}</span>
    return (
      <span>
        <button onClick={() => setOpen(!open)} className="text-zinc-400 hover:text-white inline-flex items-center gap-0.5">
          {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <span className="text-zinc-500 text-[10px]">{'{' + entries.length + '}'}</span>
        </button>
        {open && (
          <div className="ml-4 border-l border-zinc-800 pl-2">
            {entries.map(([k, v], i) => (
              <div key={k} className="py-0.5">
                <span className="text-blue-300">"{k}"</span>
                <span className="text-zinc-400">: </span>
                <JsonNode data={v} depth={depth + 1} />
                {i < entries.length - 1 && <span className="text-zinc-600">,</span>}
              </div>
            ))}
          </div>
        )}
      </span>
    )
  }

  return <span>{String(data)}</span>
}

export default function JsonTool({ variant }: Props) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [parsed, setParsed] = useState<unknown>(null)
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [indent, setIndent] = useState('2')
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [copied, setCopied] = useState(false)
  const [sortKeys, setSortKeys] = useState(false)

  const process = useCallback(() => {
    if (!input.trim()) { setOutput(''); setParsed(null); setIsValid(null); setError(''); return }
    setError('')
    try {
      const data = JSON.parse(input)
      setIsValid(true)
      setParsed(data)

      if (variant === 'validator') {
        setOutput(`✓ Valid JSON\nType: ${Array.isArray(data) ? 'Array' : typeof data}\nSize: ${new Blob([input]).size} bytes`)
      } else if (variant === 'minifier') {
        setOutput(JSON.stringify(data))
      } else if (variant === 'formatter' || variant === 'viewer') {
        const spaces = indent === 'tab' ? '\t' : parseInt(indent)
        if (sortKeys) {
          const sorted = sortJsonKeys(data)
          setOutput(JSON.stringify(sorted, null, spaces))
        } else {
          setOutput(JSON.stringify(data, null, spaces))
        }
      }
    } catch (e) {
      setIsValid(false)
      setParsed(null)
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }, [input, variant, indent, sortKeys])

  useEffect(() => { if (autoUpdate) process() }, [input, indent, sortKeys, autoUpdate, process])

  const handleCopy = async () => {
    await copyToClipboard(output)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const actionLabel = { validator: 'Validate', minifier: 'Minify', formatter: 'Format', viewer: 'Parse & View' }[variant]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr,260px]">
        <div className="space-y-3">
          {/* Input */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400">JSON Input</span>
              {isValid !== null && (
                <span className={`flex items-center gap-1 text-xs ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isValid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  {isValid ? 'Valid JSON' : 'Invalid JSON'}
                </span>
              )}
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"key": "value", "number": 42, "array": [1, 2, 3]}'
              className="min-h-[200px] border-0 rounded-none bg-transparent focus-visible:ring-0"
            />
          </div>

          {!autoUpdate && (
            <Button onClick={process} className="w-full h-8 text-xs">
              <RefreshCw className="h-3.5 w-3.5" /> {actionLabel}
            </Button>
          )}

          {/* Output or Tree Viewer */}
          {variant === 'viewer' && parsed !== null ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                <span className="text-xs font-medium text-zinc-400">JSON Tree</span>
              </div>
              <div className="p-4 font-mono text-xs overflow-auto max-h-96">
                <JsonNode data={parsed} />
              </div>
            </div>
          ) : (
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
                  <div className="flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
                  </div>
                ) : output ? (
                  <pre className="text-xs text-emerald-300 whitespace-pre-wrap break-all font-mono">{output}</pre>
                ) : (
                  <p className="text-xs text-zinc-600 italic">Output will appear here...</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4 h-fit">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Settings</h3>

          {(variant === 'formatter' || variant === 'viewer') && (
            <>
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
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-300">Sort Keys</p>
                <Switch checked={sortKeys} onCheckedChange={setSortKeys} />
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-300">Auto Update</p>
              <p className="text-[10px] text-zinc-600">Update as you type</p>
            </div>
            <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
          </div>

          {!autoUpdate && (
            <Button onClick={process} className="w-full h-8 text-xs">
              <RefreshCw className="h-3.5 w-3.5" /> {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function sortJsonKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortJsonKeys)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.keys(obj as object).sort().map((k) => [k, sortJsonKeys((obj as Record<string, unknown>)[k])])
    )
  }
  return obj
}
