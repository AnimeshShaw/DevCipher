'use client'
import React, { useState, useCallback } from 'react'
import { copyToClipboard } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Copy, Check, Type } from 'lucide-react'

const CASES = [
  { id: 'lower', label: 'lower case', example: 'hello world' },
  { id: 'upper', label: 'UPPER CASE', example: 'HELLO WORLD' },
  { id: 'title', label: 'Title Case', example: 'Hello World' },
  { id: 'sentence', label: 'Sentence case', example: 'Hello world' },
  { id: 'camel', label: 'camelCase', example: 'helloWorld' },
  { id: 'pascal', label: 'PascalCase', example: 'HelloWorld' },
  { id: 'snake', label: 'snake_case', example: 'hello_world' },
  { id: 'kebab', label: 'kebab-case', example: 'hello-world' },
  { id: 'constant', label: 'CONSTANT_CASE', example: 'HELLO_WORLD' },
  { id: 'dot', label: 'dot.case', example: 'hello.world' },
  { id: 'path', label: 'path/case', example: 'hello/world' },
]

function convertCase(text: string, caseId: string): string {
  if (!text) return ''
  // Split into words (handles camelCase, snake_case, kebab-case, spaces, etc.)
  const words = text
    .replace(/([A-Z])/g, ' $1')           // camelCase → camel Case
    .replace(/[-_./]/g, ' ')               // separators → spaces
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase())

  switch (caseId) {
    case 'lower':    return words.join(' ')
    case 'upper':    return words.join(' ').toUpperCase()
    case 'title':    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    case 'sentence': return words.map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(' ')
    case 'camel':    return words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('')
    case 'pascal':   return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
    case 'snake':    return words.join('_')
    case 'kebab':    return words.join('-')
    case 'constant': return words.join('_').toUpperCase()
    case 'dot':      return words.join('.')
    case 'path':     return words.join('/')
    default:         return text
  }
}

function CaseCard({ caseId, label, example, text }: { caseId: string; label: string; example: string; text: string }) {
  const [copied, setCopied] = useState(false)
  const result = convertCase(text, caseId)

  const handleCopy = async () => {
    if (!result) return
    await copyToClipboard(result)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
        <div>
          <span className="text-xs font-semibold text-zinc-200">{label}</span>
          <span className="ml-2 text-[10px] text-zinc-600 font-mono">{example}</span>
        </div>
        <button
          onClick={handleCopy}
          disabled={!result}
          className="text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30 px-2 py-0.5 rounded hover:bg-zinc-800 flex items-center gap-1 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="px-3 py-2.5 min-h-[40px]">
        {result ? (
          <p className="text-sm text-emerald-300 font-mono break-all">{result}</p>
        ) : (
          <p className="text-xs text-zinc-600 italic">Enter text above...</p>
        )}
      </div>
    </div>
  )
}

export default function CaseTool() {
  const [input, setInput] = useState('')
  const [allCopied, setAllCopied] = useState(false)

  const handleCopyAll = async () => {
    const all = CASES.map((c) => `${c.label}: ${convertCase(input, c.id)}`).join('\n')
    await copyToClipboard(all)
    setAllCopied(true); setTimeout(() => setAllCopied(false), 2000)
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Input */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
          <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
            <Type className="h-3.5 w-3.5" /> Input Text
          </span>
          <Button variant="outline" size="sm" className="h-6 text-xs" onClick={handleCopyAll} disabled={!input}>
            {allCopied ? <><Check className="h-3 w-3 text-emerald-400" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy All</>}
          </Button>
        </div>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to convert... (supports camelCase, snake_case, kebab-case, spaces)"
          className="min-h-[100px] border-0 rounded-none bg-transparent focus-visible:ring-0 text-sm"
        />
      </div>

      {/* Case outputs grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CASES.map((c) => (
          <CaseCard key={c.id} caseId={c.id} label={c.label} example={c.example} text={input} />
        ))}
      </div>
    </div>
  )
}
