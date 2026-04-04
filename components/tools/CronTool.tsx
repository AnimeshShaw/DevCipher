'use client'
import React, { useState, useEffect, useCallback } from 'react'
import cronstrue from 'cronstrue'
import { Switch } from '@/components/ui/switch'
import { AlertCircle, Clock, Keyboard } from 'lucide-react'

const PRESETS = [
  { label: 'Every minute', cron: '* * * * *' },
  { label: 'Every 5 minutes', cron: '*/5 * * * *' },
  { label: 'Every hour', cron: '0 * * * *' },
  { label: 'Every day at midnight', cron: '0 0 * * *' },
  { label: 'Every day at noon', cron: '0 12 * * *' },
  { label: 'Every Monday', cron: '0 0 * * 1' },
  { label: 'Every weekday', cron: '0 0 * * 1-5' },
  { label: 'Every Sunday at midnight', cron: '0 0 * * 0' },
  { label: 'First day of month', cron: '0 0 1 * *' },
  { label: 'Every 15 minutes', cron: '*/15 * * * *' },
  { label: 'Every 30 minutes', cron: '0,30 * * * *' },
  { label: 'At 8am on weekdays', cron: '0 8 * * 1-5' },
]

function getNextRuns(cronExpr: string, count: number): Date[] {
  // Parse cron fields: min hour dom month dow
  const parts = cronExpr.trim().split(/\s+/)
  if (parts.length !== 5) return []

  const [minF, hourF, domF, monF, dowF] = parts

  function matchField(val: number, field: string, min: number, max: number): boolean {
    if (field === '*') return true
    for (const part of field.split(',')) {
      if (part.includes('/')) {
        const [range, step] = part.split('/')
        const s = parseInt(step)
        if (range === '*') {
          if ((val - min) % s === 0) return true
        } else if (range.includes('-')) {
          const [lo, hi] = range.split('-').map(Number)
          if (val >= lo && val <= hi && (val - lo) % s === 0) return true
        } else {
          if (val >= parseInt(range) && (val - parseInt(range)) % s === 0) return true
        }
      } else if (part.includes('-')) {
        const [lo, hi] = part.split('-').map(Number)
        if (val >= lo && val <= hi) return true
      } else {
        if (val === parseInt(part)) return true
      }
    }
    return false
  }

  const results: Date[] = []
  const start = new Date()
  start.setSeconds(0, 0)
  start.setMinutes(start.getMinutes() + 1)

  const limit = new Date(start.getTime() + 366 * 24 * 60 * 60 * 1000)
  const cur = new Date(start)

  while (cur < limit && results.length < count) {
    const min = cur.getMinutes()
    const hour = cur.getHours()
    const dom = cur.getDate()
    const mon = cur.getMonth() + 1
    const dow = cur.getDay()

    if (
      matchField(mon, monF, 1, 12) &&
      matchField(dom, domF, 1, 31) &&
      matchField(dow, dowF, 0, 6) &&
      matchField(hour, hourF, 0, 23) &&
      matchField(min, minF, 0, 59)
    ) {
      results.push(new Date(cur))
    }
    cur.setMinutes(cur.getMinutes() + 1)
  }

  return results
}

const FIELD_LABELS = ['Minute', 'Hour', 'Day (month)', 'Month', 'Day (week)']
const FIELD_RANGES = ['0-59', '0-23', '1-31', '1-12', '0-6 (Sun-Sat)']

export default function CronTool() {
  const [cron, setCron] = useState('0 9 * * 1-5')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [nextRuns, setNextRuns] = useState<Date[]>([])
  const [use24h, setUse24h] = useState(true)
  const [showNextCount, setShowNextCount] = useState(10)

  const analyze = useCallback(() => {
    setError('')
    setDescription('')
    setNextRuns([])
    if (!cron.trim()) return
    try {
      const desc = cronstrue.toString(cron, { throwExceptionOnParseError: true, use24HourTimeFormat: use24h })
      setDescription(desc)
      setNextRuns(getNextRuns(cron, showNextCount))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid cron expression')
    }
  }, [cron, use24h, showNextCount])

  useEffect(() => { analyze() }, [analyze])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); analyze() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [analyze])

  const parts = cron.trim().split(/\s+/)

  const formatDate = (d: Date) => d.toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: !use24h
  })

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[260px,1fr]">
        {/* Settings */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Settings</h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-300">24-hour format</p>
                <p className="text-[10px] text-zinc-600">Time display</p>
              </div>
              <Switch checked={use24h} onCheckedChange={setUse24h} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Next runs to show</label>
              <input type="number" min={1} max={50} value={showNextCount}
                onChange={e => setShowNextCount(Math.max(1, Math.min(50, Number(e.target.value))))}
                className="w-full h-8 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-xs text-zinc-200 outline-none focus:border-zinc-500" />
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <p className="text-xs font-medium text-zinc-400">Presets</p>
              <div className="space-y-0.5">
                {PRESETS.map(p => (
                  <button key={p.cron} onClick={() => setCron(p.cron)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${cron === p.cron ? 'bg-blue-900/40 text-blue-300 border border-blue-800/40' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-1 text-[11px] text-zinc-600">
            <Keyboard className="h-3 w-3" />
            <span><kbd className="font-mono">Ctrl</kbd>+<kbd className="font-mono">Enter</kbd> to parse</span>
          </div>
        </div>

        {/* IO */}
        <div className="space-y-3">
          {/* Input */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400">Cron Expression</span>
            </div>
            <input value={cron} onChange={e => setCron(e.target.value)}
              placeholder="* * * * *"
              className="w-full bg-transparent px-3 py-3 text-base font-mono text-zinc-200 placeholder-zinc-600 outline-none tracking-widest" />
          </div>

          {/* Field labels */}
          {parts.length === 5 && (
            <div className="grid grid-cols-5 gap-1">
              {parts.map((p, i) => (
                <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-2 text-center">
                  <div className="font-mono text-sm font-semibold text-blue-300">{p}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{FIELD_LABELS[i]}</div>
                  <div className="text-[9px] text-zinc-700">{FIELD_RANGES[i]}</div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-900/20 px-4 py-2.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {description && (
            <div className="rounded-xl border border-emerald-800/40 bg-emerald-900/10 px-4 py-3">
              <p className="text-xs text-zinc-500 mb-1">Human-readable</p>
              <p className="text-sm font-semibold text-emerald-300">{description}</p>
            </div>
          )}

          {nextRuns.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-400">Next {nextRuns.length} Runs</span>
              </div>
              <div className="divide-y divide-zinc-800/50">
                {nextRuns.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2">
                    <span className="text-[10px] text-zinc-600 w-4">{i + 1}</span>
                    <span className="font-mono text-xs text-zinc-300">{formatDate(d)}</span>
                    {i === 0 && (
                      <span className="ml-auto text-[10px] bg-emerald-900/30 border border-emerald-800/40 text-emerald-400 px-2 py-0.5 rounded-full">next</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
