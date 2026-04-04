'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { v1, v3, v4, v5, validate, version as uuidVersion } from 'uuid'
import { Copy, Check, RefreshCw, Trash2, Layers } from 'lucide-react'

// ── namespace map ──────────────────────────────────────────────────────────────

const NS_MAP: Record<string, string> = {
  DNS: v5.DNS,
  URL: v5.URL,
  OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
}

// ── UUID row ───────────────────────────────────────────────────────────────────

function UUIDRow({ id, uppercase }: { id: string; uppercase: boolean }) {
  const [copied, setCopied] = useState(false)
  const display = uppercase ? id.toUpperCase() : id

  const handleCopy = async () => {
    await navigator.clipboard.writeText(display)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group flex items-center justify-between px-3 py-1.5 hover:bg-zinc-800/60 rounded transition-colors">
      <span className="font-mono text-xs text-zinc-200 select-all">{display}</span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-200 p-1 rounded hover:bg-zinc-700"
        aria-label="Copy UUID"
      >
        {copied
          ? <Check className="h-3.5 w-3.5 text-emerald-400" />
          : <Copy className="h-3.5 w-3.5" />
        }
      </button>
    </div>
  )
}

// ── main component ─────────────────────────────────────────────────────────────

type UUIDVersion = 'v1' | 'v3' | 'v4' | 'v5'

const VERSION_LABELS: Record<UUIDVersion, string> = {
  v1: 'v1 — Time-based',
  v3: 'v3 — Name MD5',
  v4: 'v4 — Random',
  v5: 'v5 — Name SHA1',
}

const NS_OPTIONS = ['DNS', 'URL', 'OID', 'X500', 'Custom']

export default function UUIDTool() {
  const [ver, setVer] = useState<UUIDVersion>('v4')
  const [count, setCount] = useState(10)
  const [namespace, setNamespace] = useState('DNS')
  const [customNS, setCustomNS] = useState('')
  const [name, setName] = useState('')
  const [uppercase, setUppercase] = useState(false)
  const [uuids, setUuids] = useState<string[]>([])
  const [copyAllDone, setCopyAllDone] = useState(false)

  const generate = useCallback(() => {
    const results: string[] = []
    const resolvedNS = namespace === 'Custom' ? customNS : NS_MAP[namespace]

    for (let i = 0; i < count; i++) {
      try {
        if (ver === 'v1') results.push(v1())
        else if (ver === 'v3') results.push(v3(name || ' ', resolvedNS))
        else if (ver === 'v4') results.push(v4())
        else if (ver === 'v5') results.push(v5(name || ' ', resolvedNS))
      } catch {
        results.push('invalid-namespace-or-name')
      }
    }
    setUuids(results)
  }, [ver, count, namespace, customNS, name])

  // Generate v4 on mount
  useEffect(() => { generate() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyAll = async () => {
    const all = uuids.map(id => uppercase ? id.toUpperCase() : id).join('\n')
    await navigator.clipboard.writeText(all)
    setCopyAllDone(true)
    setTimeout(() => setCopyAllDone(false), 2000)
  }

  const needsNamespace = ver === 'v3' || ver === 'v5'

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[260px,1fr]">

        {/* ── Config Panel (Left) ── */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Settings</h3>

            {/* Version */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Version</label>
              <Select value={ver} onValueChange={v => setVer(v as UUIDVersion)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(VERSION_LABELS) as UUIDVersion[]).map(v => (
                    <SelectItem key={v} value={v} className="text-xs">{VERSION_LABELS[v]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Count */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Count (1–100)</label>
              <Input
                type="number"
                value={count}
                onChange={e => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="h-8 text-xs"
                min={1}
                max={100}
              />
            </div>

            {/* Namespace + Name for v3/v5 */}
            {needsNamespace && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Namespace</label>
                  <Select value={namespace} onValueChange={setNamespace}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NS_OPTIONS.map(ns => (
                        <SelectItem key={ns} value={ns} className="text-xs">{ns}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {namespace === 'Custom' && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Custom Namespace UUID</label>
                    <Input
                      value={customNS}
                      onChange={e => setCustomNS(e.target.value)}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="h-8 text-xs font-mono"
                    />
                    {customNS && !validate(customNS) && (
                      <p className="text-[11px] text-red-400">Invalid UUID format</p>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Name</label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. example.com"
                    className="h-8 text-xs"
                  />
                </div>
              </>
            )}

            {/* Uppercase */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                role="checkbox"
                aria-checked={uppercase}
                tabIndex={0}
                onClick={() => setUppercase(v => !v)}
                onKeyDown={e => e.key === ' ' && setUppercase(v => !v)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                  uppercase
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-zinc-600 bg-transparent hover:border-zinc-400'
                }`}
              >
                {uppercase && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="text-xs text-zinc-400">Uppercase</span>
            </label>

            {/* Generate */}
            <Button onClick={generate} className="w-full h-8 text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Generate
            </Button>

            {/* Clear */}
            <Button
              variant="outline"
              onClick={() => setUuids([])}
              className="w-full h-8 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear
            </Button>
          </div>
        </div>

        {/* ── IO Area (Right) ── */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                {uuids.length} UUID{uuids.length !== 1 ? 's' : ''} &mdash; {VERSION_LABELS[ver]}
              </span>
              <button
                onClick={handleCopyAll}
                disabled={uuids.length === 0}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30 px-2 py-0.5 rounded hover:bg-zinc-800 transition-colors"
              >
                {copyAllDone
                  ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!</>
                  : <><Copy className="h-3.5 w-3.5" /> Copy All</>
                }
              </button>
            </div>

            {/* UUID list */}
            <div className="min-h-[300px] overflow-y-auto p-2">
              {uuids.length === 0 ? (
                <div className="flex items-center justify-center min-h-[300px]">
                  <p className="text-xs text-zinc-600 italic">No UUIDs generated yet</p>
                </div>
              ) : (
                uuids.map((id, i) => (
                  <UUIDRow key={`${id}-${i}`} id={id} uppercase={uppercase} />
                ))
              )}
            </div>
          </div>

          {/* Version info */}
          {ver === 'v4' && (
            <p className="text-[11px] text-zinc-600 px-1">
              v4 UUIDs are randomly generated using <code className="font-mono">crypto.getRandomValues</code> — no two are alike.
            </p>
          )}
          {ver === 'v1' && (
            <p className="text-[11px] text-zinc-600 px-1">
              v1 UUIDs embed a timestamp and MAC address. Successive calls within the same millisecond may share time fields.
            </p>
          )}
          {needsNamespace && (
            <p className="text-[11px] text-zinc-600 px-1">
              {ver === 'v3' ? 'v3' : 'v5'} UUIDs are deterministic — same namespace + name always produces the same UUID.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
