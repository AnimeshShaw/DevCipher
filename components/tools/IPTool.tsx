'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { Copy, Check, AlertCircle, Network, Keyboard } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

interface IPv4Info {
  address: string
  binary: string
  decimal: number
  hex: string
  octets: number[]
  class: string
  isPrivate: boolean
  isLoopback: boolean
  isLinkLocal: boolean
  isMulticast: boolean
}

interface CIDRInfo {
  network: string
  broadcast: string
  firstHost: string
  lastHost: string
  totalHosts: number
  usableHosts: number
  subnetMask: string
  wildcardMask: string
  prefixLen: number
}

function parseIPv4(ip: string): IPv4Info | null {
  const parts = ip.trim().split('.')
  if (parts.length !== 4) return null
  const octets = parts.map(Number)
  if (octets.some(o => isNaN(o) || o < 0 || o > 255)) return null

  const decimal = (octets[0] << 24 | octets[1] << 16 | octets[2] << 8 | octets[3]) >>> 0
  const binary = octets.map(o => o.toString(2).padStart(8, '0')).join('.')
  const hex = octets.map(o => o.toString(16).padStart(2, '0').toUpperCase()).join(':')

  const cls =
    octets[0] < 128 ? 'A' :
    octets[0] < 192 ? 'B' :
    octets[0] < 224 ? 'C' :
    octets[0] < 240 ? 'D (Multicast)' : 'E (Reserved)'

  const isPrivate =
    octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)

  return {
    address: ip.trim(), binary, decimal,
    hex: '0x' + octets.map(o => o.toString(16).padStart(2, '0').toUpperCase()).join(''),
    octets, class: cls,
    isPrivate,
    isLoopback: octets[0] === 127,
    isLinkLocal: octets[0] === 169 && octets[1] === 254,
    isMulticast: octets[0] >= 224 && octets[0] <= 239,
  }
}

function parseCIDR(cidr: string): CIDRInfo | null {
  const [ip, prefixStr] = cidr.split('/')
  if (!ip || !prefixStr) return null
  const prefix = parseInt(prefixStr)
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return null

  const info = parseIPv4(ip)
  if (!info) return null

  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
  const networkAddr = (info.decimal & mask) >>> 0
  const broadcastAddr = (networkAddr | (~mask >>> 0)) >>> 0
  const totalHosts = Math.pow(2, 32 - prefix)

  const toIP = (n: number) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
  const maskIP = toIP(mask)
  const wildcard = toIP(~mask >>> 0)

  return {
    network: toIP(networkAddr) + '/' + prefix,
    broadcast: toIP(broadcastAddr),
    firstHost: prefix < 31 ? toIP(networkAddr + 1) : toIP(networkAddr),
    lastHost: prefix < 31 ? toIP(broadcastAddr - 1) : toIP(broadcastAddr),
    totalHosts,
    usableHosts: prefix < 31 ? totalHosts - 2 : totalHosts,
    subnetMask: maskIP,
    wildcardMask: wildcard,
    prefixLen: prefix,
  }
}

function parseIPv6(ip: string): { expanded: string; compressed: string; groups: string[] } | null {
  try {
    let addr = ip.trim()
    if (addr.includes('::')) {
      const sides = addr.split('::')
      const left = sides[0] ? sides[0].split(':') : []
      const right = sides[1] ? sides[1].split(':') : []
      const missing = 8 - left.length - right.length
      const full = [...left, ...Array(missing).fill('0'), ...right]
      addr = full.join(':')
    }
    const groups = addr.split(':')
    if (groups.length !== 8) return null
    const padded = groups.map(g => g.padStart(4, '0').toUpperCase())
    if (padded.some(g => !/^[0-9A-F]{4}$/.test(g))) return null

    // Compress
    const expanded = padded.join(':')
    let best = { start: -1, len: 0 }
    let cur = { start: -1, len: 0 }
    padded.forEach((g, i) => {
      if (g === '0000') {
        if (cur.start === -1) cur = { start: i, len: 1 }
        else cur.len++
        if (cur.len > best.len) best = { ...cur }
      } else {
        cur = { start: -1, len: 0 }
      }
    })
    const stripped = padded.map(g => g.replace(/^0+/, '') || '0')
    let compressed: string
    if (best.len > 1) {
      const left2 = stripped.slice(0, best.start)
      const right2 = stripped.slice(best.start + best.len)
      compressed = (left2.length ? left2.join(':') + ':' : '') + ':' + (right2.length ? ':' + right2.join(':') : '')
      compressed = compressed.replace(/:{3,}/g, '::')
    } else {
      compressed = stripped.join(':')
    }

    return { expanded, compressed, groups: padded }
  } catch { return null }
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-zinc-800/50 last:border-0">
      <span className="text-[11px] text-zinc-500 whitespace-nowrap min-w-[130px]">{label}</span>
      <span className={`text-xs text-zinc-200 text-right break-all flex-1 ${mono ? 'font-mono' : ''}`}>{value}</span>
      <button onClick={async () => { await copyToClipboard(value); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
        className="text-zinc-600 hover:text-zinc-300 p-0.5 rounded transition-colors flex-shrink-0">
        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  )
}

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${color}`}>{label}</span>
}

export default function IPTool() {
  const [input, setInput] = useState('')
  const [tab, setTab] = useState<'ipv4' | 'cidr' | 'ipv6'>('ipv4')
  const [ipv4Info, setIPv4Info] = useState<IPv4Info | null>(null)
  const [cidrInfo, setCIDRInfo] = useState<CIDRInfo | null>(null)
  const [ipv6Info, setIPv6Info] = useState<ReturnType<typeof parseIPv6>>(null)
  const [error, setError] = useState('')

  const analyze = useCallback(() => {
    setError('')
    setIPv4Info(null)
    setCIDRInfo(null)
    setIPv6Info(null)
    if (!input.trim()) return

    if (tab === 'ipv4') {
      const r = parseIPv4(input)
      if (r) setIPv4Info(r)
      else setError('Invalid IPv4 address. Expected format: 192.168.1.1')
    } else if (tab === 'cidr') {
      const r = parseCIDR(input)
      if (r) setCIDRInfo(r)
      else setError('Invalid CIDR. Expected format: 192.168.1.0/24')
    } else {
      const r = parseIPv6(input)
      if (r) setIPv6Info(r)
      else setError('Invalid IPv6 address')
    }
  }, [input, tab])

  useEffect(() => { analyze() }, [analyze])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); analyze() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [analyze])

  const placeholder = tab === 'ipv4' ? '192.168.1.1' : tab === 'cidr' ? '192.168.1.0/24' : '2001:0db8:85a3::8a2e:0370:7334'

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[260px,1fr]">
        {/* Settings */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Mode</h3>

            <div className="space-y-1">
              {([
                { id: 'ipv4', label: 'IPv4 Info', desc: 'Parse and analyze IPv4' },
                { id: 'cidr', label: 'CIDR Calculator', desc: 'Subnet mask, range' },
                { id: 'ipv6', label: 'IPv6 Info', desc: 'Expand / compress IPv6' },
              ] as const).map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setInput(''); setError('') }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-all ${tab === t.id ? 'border-sky-800/60 bg-sky-900/20 text-sky-300' : 'border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}>
                  <div className="font-medium">{t.label}</div>
                  <div className="text-[10px] opacity-70">{t.desc}</div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-600 space-y-1">
              <p>All processing is local — no data leaves your browser.</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-1 text-[11px] text-zinc-600">
            <Keyboard className="h-3 w-3" />
            <span><kbd className="font-mono">Ctrl</kbd>+<kbd className="font-mono">Enter</kbd> to analyze</span>
          </div>
        </div>

        {/* IO */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <Network className="h-3.5 w-3.5 text-sky-400" />
              <span className="text-xs font-medium text-zinc-400">IP Address</span>
            </div>
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent px-3 py-3 text-sm font-mono text-zinc-200 placeholder-zinc-600 outline-none" />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-900/20 px-4 py-2.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* IPv4 results */}
          {ipv4Info && (
            <div className="space-y-3">
              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <Badge label={`Class ${ipv4Info.class}`} color="text-blue-400 bg-blue-900/20 border-blue-800/40" />
                {ipv4Info.isPrivate && <Badge label="Private" color="text-amber-400 bg-amber-900/20 border-amber-800/40" />}
                {!ipv4Info.isPrivate && !ipv4Info.isLoopback && !ipv4Info.isLinkLocal && !ipv4Info.isMulticast && (
                  <Badge label="Public" color="text-emerald-400 bg-emerald-900/20 border-emerald-800/40" />
                )}
                {ipv4Info.isLoopback && <Badge label="Loopback" color="text-zinc-400 bg-zinc-800/40 border-zinc-700/40" />}
                {ipv4Info.isLinkLocal && <Badge label="Link-local" color="text-purple-400 bg-purple-900/20 border-purple-800/40" />}
                {ipv4Info.isMulticast && <Badge label="Multicast" color="text-rose-400 bg-rose-900/20 border-rose-800/40" />}
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <Row label="Dotted-decimal" value={ipv4Info.address} mono />
                <Row label="Binary" value={ipv4Info.binary} mono />
                <Row label="Decimal" value={String(ipv4Info.decimal)} mono />
                <Row label="Hexadecimal" value={ipv4Info.hex} mono />
                <Row label="Octets" value={ipv4Info.octets.join(', ')} mono />
              </div>
            </div>
          )}

          {/* CIDR results */}
          {cidrInfo && (
            <div className="space-y-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <Row label="Network Address" value={cidrInfo.network} mono />
                <Row label="Subnet Mask" value={cidrInfo.subnetMask} mono />
                <Row label="Wildcard Mask" value={cidrInfo.wildcardMask} mono />
                <Row label="Broadcast Address" value={cidrInfo.broadcast} mono />
                <Row label="First Host" value={cidrInfo.firstHost} mono />
                <Row label="Last Host" value={cidrInfo.lastHost} mono />
                <Row label="Total Addresses" value={cidrInfo.totalHosts.toLocaleString()} />
                <Row label="Usable Hosts" value={cidrInfo.usableHosts.toLocaleString()} />
                <Row label="Prefix Length" value={`/${cidrInfo.prefixLen}`} mono />
              </div>
            </div>
          )}

          {/* IPv6 results */}
          {ipv6Info && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <Row label="Expanded" value={ipv6Info.expanded} mono />
              <Row label="Compressed" value={ipv6Info.compressed} mono />
              <div className="pt-2 mt-2 border-t border-zinc-800/50">
                <p className="text-[11px] text-zinc-500 mb-2">Groups</p>
                <div className="flex flex-wrap gap-1.5">
                  {ipv6Info.groups.map((g, i) => (
                    <span key={i} className="text-xs font-mono bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
