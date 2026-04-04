'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { diffLines, diffWords, diffChars, type Change } from 'diff'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeftRight, Copy, Check, Trash2 } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type DiffMode = 'lines' | 'words' | 'characters'

interface DiffStats {
  additions: number
  deletions: number
}

// ── Diff computation ──────────────────────────────────────────────────────────

function computeDiff(original: string, modified: string, mode: DiffMode): Change[] {
  switch (mode) {
    case 'lines':      return diffLines(original, modified)
    case 'words':      return diffWords(original, modified)
    case 'characters': return diffChars(original, modified)
  }
}

function getStats(changes: Change[]): DiffStats {
  let additions = 0
  let deletions = 0
  for (const c of changes) {
    if (c.added)   additions   += (c.count ?? 0)
    if (c.removed) deletions   += (c.count ?? 0)
  }
  return { additions, deletions }
}

function diffToText(changes: Change[], mode: DiffMode): string {
  if (mode === 'lines') {
    return changes
      .map((c) => {
        const prefix = c.added ? '+' : c.removed ? '-' : ' '
        const lines = c.value.replace(/\n$/, '').split('\n')
        return lines.map((l) => `${prefix} ${l}`).join('\n')
      })
      .join('\n')
  }
  return changes
    .map((c) => (c.added ? `[+${c.value}]` : c.removed ? `[-${c.value}]` : c.value))
    .join('')
}

// ── Inline diff renderer (words / characters) ─────────────────────────────────

function InlineDiff({ changes }: { changes: Change[] }) {
  return (
    <div className="font-mono text-xs p-3 whitespace-pre-wrap break-all leading-relaxed text-zinc-300">
      {changes.map((c, i) => {
        if (c.added) {
          return (
            <span key={i} className="bg-emerald-900/40 text-emerald-300 rounded px-0.5">
              {c.value}
            </span>
          )
        }
        if (c.removed) {
          return (
            <span key={i} className="bg-red-900/40 text-red-300 line-through rounded px-0.5">
              {c.value}
            </span>
          )
        }
        return <span key={i}>{c.value}</span>
      })}
    </div>
  )
}

// ── Line diff renderer ────────────────────────────────────────────────────────

function LineDiff({ changes }: { changes: Change[] }) {
  const rows: Array<{ prefix: string; text: string; cls: string }> = []

  for (const c of changes) {
    const lines = c.value.replace(/\n$/, '').split('\n')
    for (const line of lines) {
      if (c.added) {
        rows.push({ prefix: '+', text: line, cls: 'bg-emerald-900/20 text-emerald-300' })
      } else if (c.removed) {
        rows.push({ prefix: '-', text: line, cls: 'bg-red-900/20 text-red-300' })
      } else {
        rows.push({ prefix: ' ', text: line, cls: 'text-zinc-500' })
      }
    }
  }

  return (
    <div className="font-mono text-xs leading-5 overflow-x-auto">
      {rows.map((row, i) => (
        <div key={i} className={`flex gap-2 px-3 py-[1px] ${row.cls}`}>
          <span className="select-none shrink-0 w-3 text-center opacity-70">{row.prefix}</span>
          <span className="break-all">{row.text || '\u00a0'}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DiffTool() {
  const [original, setOriginal]   = useState('')
  const [modified, setModified]   = useState('')
  const [mode, setMode]           = useState<DiffMode>('lines')
  const [changes, setChanges]     = useState<Change[]>([])
  const [stats, setStats]         = useState<DiffStats>({ additions: 0, deletions: 0 })
  const [copied, setCopied]       = useState(false)
  const [hasRun, setHasRun]       = useState(false)

  const runDiff = useCallback(() => {
    const result = computeDiff(original, modified, mode)
    setChanges(result)
    setStats(getStats(result))
    setHasRun(true)
  }, [original, modified, mode])

  // Auto-diff whenever inputs or mode change
  useEffect(() => {
    if (original || modified) {
      runDiff()
    } else {
      setChanges([])
      setStats({ additions: 0, deletions: 0 })
      setHasRun(false)
    }
  }, [original, modified, mode, runDiff])

  const handleSwap = () => {
    setOriginal(modified)
    setModified(original)
  }

  const handleClear = () => {
    setOriginal('')
    setModified('')
    setChanges([])
    setStats({ additions: 0, deletions: 0 })
    setHasRun(false)
  }

  const handleCopy = async () => {
    await copyToClipboard(diffToText(changes, mode))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const showOutput = hasRun && (original !== '' || modified !== '')

  return (
    <div className="space-y-4">

      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50">
        {/* Diff mode */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 shrink-0">Mode</span>
          <Select value={mode} onValueChange={(v) => setMode(v as DiffMode)}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lines"      className="text-xs">Lines</SelectItem>
              <SelectItem value="words"      className="text-xs">Words</SelectItem>
              <SelectItem value="characters" className="text-xs">Characters</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action buttons */}
        <Button variant="outline" size="sm" onClick={handleSwap} className="gap-1.5">
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Swap
        </Button>
        <Button variant="outline" size="sm" onClick={handleClear} className="gap-1.5">
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </Button>

        {/* Stats */}
        {showOutput && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-900/30 text-emerald-300 border border-emerald-800/50">
              +{stats.additions} addition{stats.additions !== 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-900/30 text-red-300 border border-red-800/50">
              -{stats.deletions} deletion{stats.deletions !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* ── Two-column input ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="px-3 py-2 border-b border-zinc-800 bg-blue-950/30">
            <span className="text-xs font-semibold text-blue-300">Original</span>
          </div>
          <Textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original text here…"
            className="min-h-[200px] border-0 rounded-none bg-transparent focus-visible:ring-0 font-mono text-xs resize-y"
            spellCheck={false}
          />
        </div>

        {/* Modified */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="px-3 py-2 border-b border-zinc-800 bg-amber-950/20">
            <span className="text-xs font-semibold text-amber-300">Modified</span>
          </div>
          <Textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste modified text here…"
            className="min-h-[200px] border-0 rounded-none bg-transparent focus-visible:ring-0 font-mono text-xs resize-y"
            spellCheck={false}
          />
        </div>
      </div>

      {/* ── Diff output ── */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
          <span className="text-xs font-medium text-zinc-400">Diff Output</span>
          <button
            onClick={handleCopy}
            disabled={!showOutput}
            className="text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30 px-2 py-0.5 rounded hover:bg-zinc-800 flex items-center gap-1 transition-colors"
          >
            {copied
              ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!</>
              : <><Copy className="h-3.5 w-3.5" /> Copy</>
            }
          </button>
        </div>

        <div className="min-h-[100px]">
          {!showOutput ? (
            <div className="flex items-center justify-center h-24 text-zinc-600 text-xs italic">
              Enter text in both panels to see the diff
            </div>
          ) : mode === 'lines' ? (
            <LineDiff changes={changes} />
          ) : (
            <InlineDiff changes={changes} />
          )}
        </div>
      </div>

    </div>
  )
}
