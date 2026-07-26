'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Check, Database, Sparkles, Filter } from 'lucide-react'

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INSERT', 'INTO', 'UPDATE', 'DELETE', 'VALUES',
  'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING',
  'LIMIT', 'OFFSET', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'INDEX', 'UNION', 'ALL', 'AS', 'CASE', 'WHEN', 'THEN', 'END'
]

function formatSql(sql: string): string {
  let result = sql.trim()
  if (!result) return ''

  // Standardize keyword upper casing
  SQL_KEYWORDS.forEach((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi')
    result = result.replace(regex, kw)
  })

  // Insert newlines before major query clauses
  const clauseKeywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN']
  clauseKeywords.forEach((kw) => {
    const regex = new RegExp(`\\s+(${kw})\\s+`, 'g')
    result = result.replace(regex, `\n$1 `)
  })

  return result
}

function minifySql(sql: string): string {
  return sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function sanitizeSql(sql: string): string {
  // Strips comment blocks and dangerous inline injection tokens
  return sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/;+/g, ';')
    .trim()
}

export default function SqlTool() {
  const [input, setInput] = useState(`SELECT u.id, u.username, count(o.id) as total_orders FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' GROUP BY u.id, u.username HAVING count(o.id) > 5 ORDER BY total_orders DESC LIMIT 10;`)
  const [formatted, setFormatted] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setFormatted(formatSql(input))
  }, [input])

  const handleFormat = () => setFormatted(formatSql(input))
  const handleMinify = () => setFormatted(minifySql(input))
  const handleSanitize = () => setFormatted(sanitizeSql(input))

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formatted)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-blue-400" /> SQL Query Input
          </label>
          <button onClick={() => setInput('')} className="text-xs text-zinc-500 hover:text-zinc-300">
            Clear
          </button>
        </div>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste raw SQL query here..."
          className="font-mono text-xs min-h-[120px] bg-zinc-950 border-zinc-800"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={handleFormat} className="bg-blue-600 hover:bg-blue-500 text-xs">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Format & Beautify
        </Button>
        <Button size="sm" variant="outline" onClick={handleMinify} className="border-zinc-800 text-xs">
          Minify Single-Line
        </Button>
        <Button size="sm" variant="outline" onClick={handleSanitize} className="border-zinc-800 text-xs text-amber-400">
          <Filter className="h-3.5 w-3.5 mr-1.5" /> Strip Comments & Sanitize
        </Button>
      </div>

      {formatted && (
        <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Processed SQL Result</span>
            <Button size="sm" variant="ghost" onClick={copyToClipboard} className="h-7 text-xs text-blue-400">
              {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? 'Copied' : 'Copy SQL'}
            </Button>
          </div>
          <pre className="font-mono text-xs text-blue-100 bg-zinc-950 p-3 rounded border border-blue-800/30 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {formatted}
          </pre>
        </div>
      )}
    </div>
  )
}
