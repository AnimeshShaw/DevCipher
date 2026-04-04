'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Check, Clock, RefreshCw, Calendar } from 'lucide-react'

type Mode = 'unix-to-date' | 'date-to-unix'
type OutputFormat = 'iso8601' | 'rfc2822' | 'human' | 'relative'

const TIMEZONES = [
  'UTC',
  'Local',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Denver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
]

function getRelativeTime(timestamp: number): string {
  const diff = (timestamp - Date.now()) / 1000
  const abs = Math.abs(diff)
  const future = diff > 0

  let value: number
  let unit: string

  if (abs < 60) {
    value = Math.round(abs)
    unit = 'second'
  } else if (abs < 3600) {
    value = Math.round(abs / 60)
    unit = 'minute'
  } else if (abs < 86400) {
    value = Math.round(abs / 3600)
    unit = 'hour'
  } else if (abs < 2592000) {
    value = Math.round(abs / 86400)
    unit = 'day'
  } else if (abs < 31536000) {
    value = Math.round(abs / 2592000)
    unit = 'month'
  } else {
    value = Math.round(abs / 31536000)
    unit = 'year'
  }

  const plural = value !== 1 ? 's' : ''
  return future ? `in ${value} ${unit}${plural}` : `${value} ${unit}${plural} ago`
}

function formatInTimezone(date: Date, tz: string): string {
  if (tz === 'Local') {
    return date.toLocaleString('en-US', { timeZoneName: 'short' })
  }
  try {
    return date.toLocaleString('en-US', { timeZone: tz, timeZoneName: 'short' })
  } catch {
    return date.toUTCString()
  }
}

function toISO8601(date: Date): string {
  return date.toISOString()
}

function toRFC2822(date: Date): string {
  return date.toUTCString().replace('GMT', '+0000')
}

function toHumanReadable(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  })
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface ResultRowProps {
  label: string
  value: string
  mono?: boolean
}

function ResultRow({ label, value, mono = false }: ResultRowProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-zinc-800 last:border-0">
      <span className="text-xs text-zinc-500 shrink-0 w-32">{label}</span>
      <span className={`text-xs text-zinc-200 break-all flex-1 ${mono ? 'font-mono' : ''}`}>{value}</span>
      <button
        onClick={handleCopy}
        className="text-zinc-600 hover:text-zinc-300 p-0.5 rounded shrink-0"
        title="Copy"
      >
        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  )
}

export default function TimestampTool() {
  const [mode, setMode] = useState<Mode>('unix-to-date')
  const [timezone, setTimezone] = useState('UTC')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('iso8601')
  const [autoConvert, setAutoConvert] = useState(true)

  // Unix → Date
  const [unixInput, setUnixInput] = useState('')
  const [unixResult, setUnixResult] = useState<{
    utc: string
    local: string
    tz: string
    iso: string
    rfc: string
    human: string
    relative: string
    dayOfWeek: string
    dayOfYear: number
    weekNumber: number
  } | null>(null)
  const [unixError, setUnixError] = useState('')

  // Date → Unix
  const [dateInput, setDateInput] = useState('')
  const [dateResult, setDateResult] = useState<{
    seconds: string
    milliseconds: string
    iso: string
    rfc: string
  } | null>(null)
  const [dateError, setDateError] = useState('')

  const convertUnixToDate = useCallback((val: string) => {
    setUnixError('')
    setUnixResult(null)
    if (!val.trim()) return

    const num = Number(val.trim())
    if (isNaN(num)) {
      setUnixError('Invalid timestamp')
      return
    }

    // Auto-detect ms vs seconds
    const ts = num > 1e10 ? num : num * 1000
    const date = new Date(ts)

    if (isNaN(date.getTime())) {
      setUnixError('Invalid timestamp value')
      return
    }

    let tzStr = ''
    try {
      tzStr = formatInTimezone(date, timezone)
    } catch {
      tzStr = 'Invalid timezone'
    }

    setUnixResult({
      utc: date.toUTCString(),
      local: date.toLocaleString('en-US', { timeZoneName: 'short' }),
      tz: tzStr,
      iso: toISO8601(date),
      rfc: toRFC2822(date),
      human: toHumanReadable(date),
      relative: getRelativeTime(ts),
      dayOfWeek: DAY_NAMES[date.getUTCDay()],
      dayOfYear: getDayOfYear(date),
      weekNumber: getWeekNumber(date),
    })
  }, [timezone])

  const convertDateToUnix = useCallback((val: string) => {
    setDateError('')
    setDateResult(null)
    if (!val.trim()) return

    const date = new Date(val)
    if (isNaN(date.getTime())) {
      setDateError('Invalid date/time')
      return
    }

    const ms = date.getTime()
    const sec = Math.floor(ms / 1000)

    setDateResult({
      seconds: String(sec),
      milliseconds: String(ms),
      iso: toISO8601(date),
      rfc: toRFC2822(date),
    })
  }, [])

  useEffect(() => {
    if (autoConvert && mode === 'unix-to-date') {
      convertUnixToDate(unixInput)
    }
  }, [unixInput, timezone, autoConvert, mode, convertUnixToDate])

  useEffect(() => {
    if (autoConvert && mode === 'date-to-unix') {
      convertDateToUnix(dateInput)
    }
  }, [dateInput, autoConvert, mode, convertDateToUnix])

  const handleNow = () => {
    if (mode === 'unix-to-date') {
      setUnixInput(String(Math.floor(Date.now() / 1000)))
    } else {
      const now = new Date()
      // Format for datetime-local: YYYY-MM-DDTHH:mm
      const pad = (n: number) => String(n).padStart(2, '0')
      const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
      setDateInput(local)
    }
  }

  const getFormattedOutput = () => {
    if (!unixResult) return null
    switch (outputFormat) {
      case 'iso8601': return unixResult.iso
      case 'rfc2822': return unixResult.rfc
      case 'human': return unixResult.human
      case 'relative': return unixResult.relative
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
      {/* Config Panel (Left) */}
      <div className="space-y-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Settings</h3>

          {/* Mode Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400">Mode</label>
            <div className="flex rounded-lg overflow-hidden border border-zinc-700">
              <button
                onClick={() => setMode('unix-to-date')}
                className={`flex-1 text-xs py-1.5 px-2 transition-colors ${
                  mode === 'unix-to-date'
                    ? 'bg-zinc-700 text-zinc-100'
                    : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Unix → Date
              </button>
              <button
                onClick={() => setMode('date-to-unix')}
                className={`flex-1 text-xs py-1.5 px-2 transition-colors ${
                  mode === 'date-to-unix'
                    ? 'bg-zinc-700 text-zinc-100'
                    : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Date → Unix
              </button>
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400">Timezone</label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz} className="text-xs">{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Output Format */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400">Output Format</label>
            <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="iso8601" className="text-xs">ISO 8601</SelectItem>
                <SelectItem value="rfc2822" className="text-xs">RFC 2822</SelectItem>
                <SelectItem value="human" className="text-xs">Human Readable</SelectItem>
                <SelectItem value="relative" className="text-xs">Relative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Now Button */}
          <Button onClick={handleNow} variant="outline" className="w-full h-8 text-xs">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Use Current Time
          </Button>

          {/* Auto Convert */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-300">Auto Convert</p>
              <p className="text-[10px] text-zinc-600">Convert as you type</p>
            </div>
            <Switch checked={autoConvert} onCheckedChange={setAutoConvert} />
          </div>

          {!autoConvert && (
            <Button
              onClick={() => mode === 'unix-to-date' ? convertUnixToDate(unixInput) : convertDateToUnix(dateInput)}
              className="w-full h-8 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Convert
            </Button>
          )}
        </div>
      </div>

      {/* IO Area (Right) */}
      <div className="space-y-3">
        {mode === 'unix-to-date' ? (
          <>
            {/* Unix Input */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Unix Timestamp
                </span>
                <span className="text-[10px] text-zinc-600">Seconds or milliseconds</span>
              </div>
              <div className="p-3">
                <Input
                  type="number"
                  value={unixInput}
                  onChange={(e) => setUnixInput(e.target.value)}
                  placeholder="e.g. 1700000000"
                  className="font-mono text-sm h-10 bg-zinc-800/50 border-zinc-700"
                />
                {unixError && (
                  <p className="text-xs text-red-400 mt-2">{unixError}</p>
                )}
              </div>
            </div>

            {/* Results */}
            {unixResult && (
              <>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                    <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Date / Time
                    </span>
                  </div>
                  <div className="p-3">
                    <ResultRow label="UTC" value={unixResult.utc} />
                    <ResultRow label="Local" value={unixResult.local} />
                    {timezone !== 'UTC' && timezone !== 'Local' && (
                      <ResultRow label={timezone} value={unixResult.tz} />
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                    <span className="text-xs font-medium text-zinc-400">Formats</span>
                  </div>
                  <div className="p-3">
                    <ResultRow label="ISO 8601" value={unixResult.iso} mono />
                    <ResultRow label="RFC 2822" value={unixResult.rfc} mono />
                    <ResultRow label="Human Readable" value={unixResult.human} />
                    <ResultRow label="Relative" value={unixResult.relative} />
                  </div>
                </div>

                {getFormattedOutput() && (
                  <div className="rounded-xl border border-emerald-800/40 bg-emerald-900/10 p-3">
                    <p className="text-[10px] text-emerald-600 mb-1 uppercase tracking-wider">
                      Selected Format Output
                    </p>
                    <p className="font-mono text-sm text-emerald-300 break-all">{getFormattedOutput()}</p>
                  </div>
                )}

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                    <span className="text-xs font-medium text-zinc-400">Calendar Info</span>
                  </div>
                  <div className="p-3">
                    <ResultRow label="Day of Week" value={unixResult.dayOfWeek} />
                    <ResultRow label="Day of Year" value={String(unixResult.dayOfYear)} />
                    <ResultRow label="Week Number" value={String(unixResult.weekNumber)} />
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {/* Date Input */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Date / Time Input
                </span>
              </div>
              <div className="p-3">
                <Input
                  type="datetime-local"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="font-mono text-sm h-10 bg-zinc-800/50 border-zinc-700"
                />
                {dateError && (
                  <p className="text-xs text-red-400 mt-2">{dateError}</p>
                )}
              </div>
            </div>

            {/* Results */}
            {dateResult && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                  <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Unix Timestamps
                  </span>
                </div>
                <div className="p-3">
                  <ResultRow label="Seconds" value={dateResult.seconds} mono />
                  <ResultRow label="Milliseconds" value={dateResult.milliseconds} mono />
                  <ResultRow label="ISO 8601" value={dateResult.iso} mono />
                  <ResultRow label="RFC 2822" value={dateResult.rfc} mono />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
