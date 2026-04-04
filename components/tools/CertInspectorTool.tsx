'use client'
import React, { useState, useEffect } from 'react'
import * as forge from 'node-forge'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Copy, Check, AlertCircle, ShieldCheck, Calendar, Key, Globe, Hash, Keyboard } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

function CopyValue({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={async () => { await copyToClipboard(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      disabled={!text} className="ml-auto text-zinc-500 hover:text-zinc-300 disabled:opacity-0 p-0.5 rounded transition-colors">
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

interface CertInfo {
  subject: Record<string, string>
  issuer: Record<string, string>
  validFrom: string
  validUntil: string
  daysRemaining: number
  serialNumber: string
  sigAlg: string
  keyType: string
  keySize: number
  sans: string[]
  sha256Fingerprint: string
  sha1Fingerprint: string
  isCA: boolean
  version: number
  selfSigned: boolean
}

function getAttr(attrs: forge.pki.CertificateField[], short: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = attrs.find((x: any) => x.shortName === short || x.name === short)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (a as any)?.value ?? ''
}

function formatFingerprint(hex: string): string {
  return hex.toUpperCase().match(/.{2}/g)?.join(':') ?? hex
}

function parseCert(pem: string): CertInfo {
  const cert = forge.pki.certificateFromPem(pem)

  // Fingerprints
  const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert))
  const sha256md = forge.md.sha256.create(); sha256md.update(der.data)
  const sha1md = forge.md.sha1.create(); sha1md.update(der.data)

  // Key info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pub = cert.publicKey as any
  let keyType = 'Unknown', keySize = 0
  if (pub.n) { keyType = 'RSA'; keySize = pub.n.bitLength() }
  else if (pub.curve) { keyType = 'EC'; keySize = 256 }

  // SANs
  const sans: string[] = []
  const sanExt = cert.getExtension('subjectAltName') as { altNames?: { type: number; value: string; ip?: string }[] } | null
  if (sanExt?.altNames) {
    for (const an of sanExt.altNames) {
      if (an.type === 2) sans.push(`DNS: ${an.value}`)
      else if (an.type === 7) sans.push(`IP: ${an.ip ?? an.value}`)
      else if (an.type === 1) sans.push(`Email: ${an.value}`)
    }
  }

  // CA check
  const bcExt = cert.getExtension('basicConstraints') as { cA?: boolean } | null
  const isCA = bcExt?.cA ?? false

  const validUntil = cert.validity.notAfter
  const daysRemaining = Math.floor((validUntil.getTime() - Date.now()) / 86400000)

  return {
    subject: {
      CN: getAttr(cert.subject.attributes, 'CN'),
      O: getAttr(cert.subject.attributes, 'O'),
      OU: getAttr(cert.subject.attributes, 'OU'),
      C: getAttr(cert.subject.attributes, 'C'),
      ST: getAttr(cert.subject.attributes, 'ST'),
      L: getAttr(cert.subject.attributes, 'L'),
    },
    issuer: {
      CN: getAttr(cert.issuer.attributes, 'CN'),
      O: getAttr(cert.issuer.attributes, 'O'),
      C: getAttr(cert.issuer.attributes, 'C'),
    },
    validFrom: cert.validity.notBefore.toUTCString(),
    validUntil: validUntil.toUTCString(),
    daysRemaining,
    serialNumber: cert.serialNumber,
    sigAlg: cert.siginfo?.algorithmOid ?? 'Unknown',
    keyType, keySize,
    sans,
    sha256Fingerprint: formatFingerprint(sha256md.digest().toHex()),
    sha1Fingerprint: formatFingerprint(sha1md.digest().toHex()),
    isCA, version: cert.version + 1,
    selfSigned: getAttr(cert.subject.attributes, 'CN') === getAttr(cert.issuer.attributes, 'CN'),
  }
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-zinc-800/50 last:border-0">
      <span className="text-[11px] text-zinc-500 whitespace-nowrap min-w-[120px]">{label}</span>
      <span className={`text-xs text-zinc-200 text-right break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
      <CopyValue text={value} />
    </div>
  )
}

export default function CertInspectorTool() {
  const [pem, setPem] = useState('')
  const [cert, setCert] = useState<CertInfo | null>(null)
  const [error, setError] = useState('')
  const [autoInspect, setAutoInspect] = useState(true)

  const inspect = () => {
    if (!pem.trim()) { setCert(null); setError(''); return }
    try {
      setCert(parseCert(pem.trim()))
      setError('')
    } catch (e) {
      setCert(null)
      setError(e instanceof Error ? e.message : 'Invalid certificate')
    }
  }

  useEffect(() => { if (autoInspect) inspect() }, [pem, autoInspect])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); inspect() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pem])

  const expiryColor = cert
    ? cert.daysRemaining < 0 ? 'text-red-400' : cert.daysRemaining < 10 ? 'text-red-400' : cert.daysRemaining < 30 ? 'text-amber-400' : 'text-emerald-400'
    : ''

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[260px,1fr]">
        {/* Config left */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Settings</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-300">Auto Inspect</p>
                <p className="text-[10px] text-zinc-600">Parse on paste</p>
              </div>
              <Switch checked={autoInspect} onCheckedChange={setAutoInspect} />
            </div>
            {!autoInspect && (
              <Button onClick={inspect} className="w-full h-8 text-xs">
                <ShieldCheck className="h-3.5 w-3.5" /> Inspect Certificate
              </Button>
            )}
            <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-600 space-y-1">
              <p>Paste an X.509 PEM certificate starting with <span className="font-mono">-----BEGIN CERTIFICATE-----</span></p>
              <p className="mt-1">All parsing is local — no data leaves your browser.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-1 text-[11px] text-zinc-600">
            <Keyboard className="h-3 w-3" />
            <span><kbd className="font-mono">Ctrl</kbd>+<kbd className="font-mono">Enter</kbd> to inspect</span>
          </div>
        </div>

        {/* IO right */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-400 mr-1.5" />
              <span className="text-xs font-medium text-zinc-400">PEM Certificate</span>
            </div>
            <Textarea value={pem} onChange={(e) => setPem(e.target.value)}
              placeholder="-----BEGIN CERTIFICATE-----&#10;Paste your X.509 PEM certificate here...&#10;-----END CERTIFICATE-----"
              className="min-h-[160px] border-0 rounded-none bg-transparent focus-visible:ring-0 font-mono text-xs" />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-900/20 px-4 py-2.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {cert && (
            <div className="space-y-3">
              {/* Validity banner */}
              <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                cert.daysRemaining < 0 ? 'border-red-800 bg-red-900/20' :
                cert.daysRemaining < 30 ? 'border-amber-800 bg-amber-900/20' :
                'border-emerald-800 bg-emerald-900/20'
              }`}>
                <Calendar className={`h-5 w-5 ${expiryColor}`} />
                <div>
                  <p className={`text-sm font-semibold ${expiryColor}`}>
                    {cert.daysRemaining < 0 ? `Expired ${Math.abs(cert.daysRemaining)} days ago` :
                     cert.daysRemaining === 0 ? 'Expires today' :
                     `Valid for ${cert.daysRemaining} more days`}
                  </p>
                  <p className="text-xs text-zinc-500">{cert.validFrom} → {cert.validUntil}</p>
                </div>
                {cert.selfSigned && <span className="ml-auto text-xs bg-amber-900/30 border border-amber-800/40 text-amber-400 px-2 py-0.5 rounded-full">Self-Signed</span>}
                {cert.isCA && <span className="ml-auto text-xs bg-purple-900/30 border border-purple-800/40 text-violet-400 px-2 py-0.5 rounded-full">CA Cert</span>}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Subject */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Globe className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs font-semibold text-zinc-300">Subject</span>
                  </div>
                  <Row label="Common Name" value={cert.subject.CN} />
                  <Row label="Organization" value={cert.subject.O} />
                  <Row label="Org Unit" value={cert.subject.OU} />
                  <Row label="Country" value={cert.subject.C} />
                  <Row label="State" value={cert.subject.ST} />
                  <Row label="Locality" value={cert.subject.L} />
                </div>

                {/* Issuer */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-xs font-semibold text-zinc-300">Issuer</span>
                  </div>
                  <Row label="Common Name" value={cert.issuer.CN} />
                  <Row label="Organization" value={cert.issuer.O} />
                  <Row label="Country" value={cert.issuer.C} />
                  <Row label="Version" value={`v${cert.version}`} />
                  <Row label="Serial Number" value={cert.serialNumber} mono />
                  <Row label="Sig Algorithm" value={cert.sigAlg} mono />
                </div>
              </div>

              {/* Key + Fingerprints */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Key className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-zinc-300">Key & Fingerprints</span>
                </div>
                <Row label="Key Type" value={`${cert.keyType} ${cert.keySize}-bit`} />
                <Row label="SHA-256 Fingerprint" value={cert.sha256Fingerprint} mono />
                <Row label="SHA-1 Fingerprint" value={cert.sha1Fingerprint} mono />
              </div>

              {/* SANs */}
              {cert.sans.length > 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Hash className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-zinc-300">Subject Alternative Names ({cert.sans.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cert.sans.map((san, i) => (
                      <span key={i} className="text-xs font-mono bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded">{san}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
