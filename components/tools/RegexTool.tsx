'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Copy, Check, AlertCircle, RefreshCw, Keyboard } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

interface Match {
  value: string
  index: number
  groups: string[]
  namedGroups: Record<string, string>
}

function buildHighlighted(text: string, matches: Match[]): React.ReactNode[] {
  if (!matches.length) return [<span key="0">{text}</span>]
  const nodes: React.ReactNode[] = []
  let pos = 0
  matches.forEach((m, i) => {
    if (m.index > pos) nodes.push(<span key={`t${i}`}>{text.slice(pos, m.index)}</span>)
    nodes.push(
      <mark key={`m${i}`} className="bg-amber-500/30 text-amber-200 rounded-sm px-0.5">
        {m.value}
      </mark>
    )
    pos = m.index + m.value.length
  })
  if (pos < text.length) nodes.push(<span key="end">{text.slice(pos)}</span>)
  return nodes
}

export default function RegexTool() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false })
  const [testString, setTestString] = useState('')
  const [replaceWith, setReplaceWith] = useState('')
  const [mode, setMode] = useState<'match' | 'replace'>('match')
  const [matches, setMatches] = useState<Match[]>([])
  const [replaceResult, setReplaceResult] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [autoRun, setAutoRun] = useState(true)

  const run = useCallback(() => {
    setError('')
    setMatches([])
    setReplaceResult('')
    if (!pattern || !testString) return
    try {
      const flagStr = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('')
      const re = new RegExp(pattern, flagStr)
      if (mode === 'replace') {
        setReplaceResult(testString.replace(re, replaceWith))
      } else {
        const found: Match[] = []
        if (flags.g) {
          let m: RegExpExecArray | null
          const r2 = new RegExp(pattern, flagStr)
          while ((m = r2.exec(testString)) !== null) {
            found.push({
              value: m[0],
              index: m.index,
              groups: m.slice(1),
              namedGroups: (m.groups ?? {}) as Record<string, string>,
            })
            if (!flagStr.includes('g')) break
          }
        } else {
          const m = re.exec(testString)
          if (m) found.push({ value: m[0], index: m.index, groups: m.slice(1), namedGroups: (m.groups ?? {}) as Record<string, string> })
        }
        setMatches(found)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid regex')
    }
  }, [pattern, flags, testString, replaceWith, mode])

  useEffect(() => { if (autoRun) run() }, [pattern, flags, testString, replaceWith, mode, autoRun, run])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [run])

  const flagLabel = (k: string, desc: string) => (
    <label key={k} className="flex items-center justify-between py-1">
      <div>
        <span className="text-xs font-mono text-zinc-300">{k}</span>
        <span className="text-[10px] text-zinc-600 ml-1">{desc}</span>
      </div>
      <Switch
        checked={flags[k as keyof typeof flags]}
        onCheckedChange={(v) => setFlags(f => ({ ...f, [k]: v }))}
        className="scale-90"
      />
    </label>
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[260px,1fr]">
        {/* Settings */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Settings</h3>

            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">Flags</p>
              <div className="space-y-0.5">
                {flagLabel('g', 'global')}
                {flagLabel('i', 'case-insensitive')}
                {flagLabel('m', 'multiline')}
                {flagLabel('s', 'dotAll')}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-zinc-400">Mode</p>
              <div className="flex gap-1.5">
                {(['match', 'replace'] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 h-7 rounded text-xs font-medium transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-300">Auto Run</p>
                <p className="text-[10px] text-zinc-600">Run as you type</p>
              </div>
              <Switch checked={autoRun} onCheckedChange={setAutoRun} />
            </div>

            {!autoRun && (
              <Button onClick={run} className="w-full h-8 text-xs">
                <RefreshCw className="h-3.5 w-3.5" /> Run
              </Button>
            )}

            {matches.length > 0 && (
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-[11px] text-zinc-500">
                  <span className="text-emerald-400 font-semibold">{matches.length}</span> match{matches.length !== 1 ? 'es' : ''} found
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-1 text-[11px] text-zinc-600">
            <Keyboard className="h-3 w-3" />
            <span><kbd className="font-mono">Ctrl</kbd>+<kbd className="font-mono">Enter</kbd> to run</span>
          </div>
        </div>

        {/* IO */}
        <div className="space-y-3">
          {/* Pattern */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center px-3 py-2 border-b border-zinc-800 bg-zinc-900 gap-2">
              <span className="text-xs font-medium text-zinc-400">Pattern</span>
              <span className="text-xs text-zinc-600 font-mono">/…/{Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('')}</span>
            </div>
            <input
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="Enter regex pattern…"
              className="w-full bg-transparent px-3 py-2.5 text-sm font-mono text-zinc-200 placeholder-zinc-600 outline-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-900/20 px-4 py-2.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Test string */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400">Test String</span>
            </div>
            <Textarea value={testString} onChange={e => setTestString(e.target.value)}
              placeholder="Enter text to test against…"
              className="min-h-[120px] border-0 rounded-none bg-transparent focus-visible:ring-0 font-mono text-xs" />
          </div>

          {/* Replace input */}
          {mode === 'replace' && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                <span className="text-xs font-medium text-zinc-400">Replace With</span>
              </div>
              <input value={replaceWith} onChange={e => setReplaceWith(e.target.value)}
                placeholder="Replacement string (use $1, $2 for groups)…"
                className="w-full bg-transparent px-3 py-2.5 text-sm font-mono text-zinc-200 placeholder-zinc-600 outline-none" />
            </div>
          )}

          {/* Results */}
          {mode === 'match' && testString && (
            <div className="space-y-3">
              {/* Highlighted */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                  <span className="text-xs font-medium text-zinc-400">Highlighted Matches</span>
                </div>
                <div className="p-3 font-mono text-xs text-zinc-300 whitespace-pre-wrap break-all leading-relaxed min-h-[40px]">
                  {pattern && !error ? buildHighlighted(testString, matches) : testString}
                </div>
              </div>

              {/* Match list */}
              {matches.length > 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                    <span className="text-xs font-medium text-zinc-400">Match Details</span>
                  </div>
                  <div className="divide-y divide-zinc-800/50 max-h-64 overflow-y-auto">
                    {matches.map((m, i) => (
                      <div key={i} className="px-3 py-2 flex items-start gap-3">
                        <span className="text-[10px] text-zinc-600 w-5 pt-0.5">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <span className="font-mono text-xs text-amber-300 break-all">{m.value}</span>
                          <span className="text-[10px] text-zinc-600 ml-2">@{m.index}</span>
                          {m.groups.filter(Boolean).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {m.groups.map((g, gi) => g !== undefined && (
                                <span key={gi} className="text-[10px] font-mono bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded">
                                  ${gi + 1}: {g}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'replace' && replaceResult && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                <span className="text-xs font-medium text-zinc-400">Result</span>
                <button onClick={async () => { await copyToClipboard(replaceResult); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                  className="text-xs text-zinc-500 hover:text-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-800 flex items-center gap-1">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-3 font-mono text-xs text-emerald-300 whitespace-pre-wrap break-all">{replaceResult}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
