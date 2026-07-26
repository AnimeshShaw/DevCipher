'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Check, ShieldAlert, Cpu, Key, Lock, Sparkles } from 'lucide-react'

// Simulated NIST PQC parameter definitions & keygen structures for educational & testing inspectability
const PQC_ALGORITHMS: Record<string, {
  name: string
  standard: string
  type: 'KEM' | 'Signature'
  securityLevel: string
  claim: string
  pubKeyBytes: number
  privKeyBytes: number
  ctBytes?: number
  sigBytes?: number
}> = {
  'ml-kem-512': {
    name: 'ML-KEM-512 (Kyber-512)',
    standard: 'FIPS 203',
    type: 'KEM',
    securityLevel: 'AES-128 Equivalent (NIST Level 1)',
    claim: 'Lattice-based Module Learning-With-Errors (M-LWE)',
    pubKeyBytes: 800,
    privKeyBytes: 1632,
    ctBytes: 768,
  },
  'ml-kem-768': {
    name: 'ML-KEM-768 (Kyber-768)',
    standard: 'FIPS 203',
    type: 'KEM',
    securityLevel: 'AES-192 Equivalent (NIST Level 3)',
    claim: 'Recommended general security standard by NIST',
    pubKeyBytes: 1184,
    privKeyBytes: 2400,
    ctBytes: 1088,
  },
  'ml-kem-1024': {
    name: 'ML-KEM-1024 (Kyber-1024)',
    standard: 'FIPS 203',
    type: 'KEM',
    securityLevel: 'AES-256 Equivalent (NIST Level 5)',
    claim: 'High-security Module Learning-With-Errors',
    pubKeyBytes: 1568,
    privKeyBytes: 3168,
    ctBytes: 1568,
  },
  'ml-dsa-44': {
    name: 'ML-DSA-44 (Dilithium2)',
    standard: 'FIPS 204',
    type: 'Signature',
    securityLevel: 'NIST Level 2',
    claim: 'Module Lattice Digital Signature Algorithm',
    pubKeyBytes: 1312,
    privKeyBytes: 2560,
    sigBytes: 2420,
  },
  'ml-dsa-65': {
    name: 'ML-DSA-65 (Dilithium3)',
    standard: 'FIPS 204',
    type: 'Signature',
    securityLevel: 'NIST Level 3',
    claim: 'Module Lattice Digital Signature Algorithm',
    pubKeyBytes: 1952,
    privKeyBytes: 4032,
    sigBytes: 3309,
  },
  'ml-dsa-87': {
    name: 'ML-DSA-87 (Dilithium5)',
    standard: 'FIPS 204',
    type: 'Signature',
    securityLevel: 'NIST Level 5',
    claim: 'High-assurance Lattice Digital Signature',
    pubKeyBytes: 2592,
    privKeyBytes: 4896,
    sigBytes: 4627,
  },
  'slh-dsa-128f': {
    name: 'SLH-DSA-128f (SPHINCS+)',
    standard: 'FIPS 205',
    type: 'Signature',
    securityLevel: 'NIST Level 1 (Stateless Hash-based)',
    claim: 'Stateless Hash-based Digital Signature Algorithm',
    pubKeyBytes: 32,
    privKeyBytes: 64,
    sigBytes: 17088,
  },
}

function generateRandomHex(byteCount: number): string {
  const bytes = new Uint8Array(byteCount)
  crypto.getRandomValues(bytes)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

export default function PQCTool() {
  const [selectedAlgo, setSelectedAlgo] = useState('ml-kem-768')
  const [keyPair, setKeyPair] = useState<{
    publicKeyHex: string
    privateKeyHex: string
    ciphertextHex?: string
    signatureHex?: string
    timestamp: string
  } | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const spec = PQC_ALGORITHMS[selectedAlgo]

  const handleGenerateKeyPair = () => {
    const pub = generateRandomHex(spec.pubKeyBytes)
    const priv = generateRandomHex(spec.privKeyBytes)
    const ct = spec.ctBytes ? generateRandomHex(spec.ctBytes) : undefined
    const sig = spec.sigBytes ? generateRandomHex(Math.min(spec.sigBytes, 128)) + '...[truncated]' : undefined

    setKeyPair({
      publicKeyHex: pub,
      privateKeyHex: priv,
      ciphertextHex: ct,
      signatureHex: sig,
      timestamp: new Date().toISOString(),
    })
  }

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(label)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-indigo-900/50 bg-indigo-950/20 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Cpu className="h-4 w-4" />
            <span>NIST Post-Quantum Cryptography (PQC) Inspector</span>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Inspect quantum-resistant lattice & hash-based cryptography parameter metrics (FIPS 203, FIPS 204, FIPS 205).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedAlgo} onValueChange={(val) => { setSelectedAlgo(val); setKeyPair(null) }}>
            <SelectTrigger className="h-9 text-xs min-w-[200px] bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PQC_ALGORITHMS).map(([id, item]) => (
                <SelectItem key={id} value={id} className="text-xs">
                  {item.name} ({item.standard})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Spec Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Standard</span>
          <p className="text-sm font-bold text-indigo-400 mt-0.5">{spec.standard}</p>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Category</span>
          <p className="text-sm font-bold text-white mt-0.5">{spec.type}</p>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Security Strength</span>
          <p className="text-xs font-semibold text-emerald-400 mt-0.5 truncate">{spec.securityLevel}</p>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Public Key Size</span>
          <p className="text-sm font-bold text-amber-400 mt-0.5">{spec.pubKeyBytes} bytes</p>
        </div>
      </div>

      {/* Algorithm Characteristics */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-zinc-300 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Algorithm Construction</span>
        </div>
        <p className="text-zinc-400 leading-relaxed">{spec.claim}</p>
        <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
          <span>Private Key: <strong className="text-zinc-300">{spec.privKeyBytes} B</strong></span>
          {spec.ctBytes && <span>Ciphertext: <strong className="text-zinc-300">{spec.ctBytes} B</strong></span>}
          {spec.sigBytes && <span>Signature: <strong className="text-zinc-300">{spec.sigBytes} B</strong></span>}
        </div>
      </div>

      {/* Key Generation Trigger */}
      <div>
        <Button onClick={handleGenerateKeyPair} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
          <Key className="h-4 w-4 mr-2" /> Generate Test {spec.name} Key Pair
        </Button>
      </div>

      {/* Key Pair Output */}
      {keyPair && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Public Key ({spec.pubKeyBytes} Bytes)
              </span>
              <Button size="sm" variant="ghost" onClick={() => copyText(keyPair.publicKeyHex, 'pub')} className="h-7 text-xs text-amber-400">
                {copiedKey === 'pub' ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                {copiedKey === 'pub' ? 'Copied' : 'Copy Public Key'}
              </Button>
            </div>
            <pre className="font-mono text-xs text-zinc-300 bg-zinc-950 p-3 rounded border border-zinc-800 whitespace-pre-wrap break-all max-h-36 overflow-y-auto">
              {keyPair.publicKeyHex}
            </pre>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" /> Private / Secret Key ({spec.privKeyBytes} Bytes)
              </span>
              <Button size="sm" variant="ghost" onClick={() => copyText(keyPair.privateKeyHex, 'priv')} className="h-7 text-xs text-red-400">
                {copiedKey === 'priv' ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                {copiedKey === 'priv' ? 'Copied' : 'Copy Secret Key'}
              </Button>
            </div>
            <pre className="font-mono text-xs text-zinc-400 bg-zinc-950 p-3 rounded border border-zinc-800 whitespace-pre-wrap break-all max-h-36 overflow-y-auto">
              {keyPair.privateKeyHex}
            </pre>
          </div>

          {keyPair.ciphertextHex && (
            <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4 space-y-2">
              <span className="text-xs font-semibold text-blue-400 uppercase">Encapsulated Ciphertext ({spec.ctBytes} Bytes)</span>
              <pre className="font-mono text-xs text-blue-200 bg-blue-950/40 p-2.5 rounded border border-blue-800/30 whitespace-pre-wrap break-all">
                {keyPair.ciphertextHex}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Info footer */}
      <div className="rounded-xl bg-zinc-900/30 border border-zinc-800/60 p-3 flex items-center gap-2 text-[11px] text-zinc-500">
        <ShieldAlert className="h-4 w-4 text-amber-500 flex-shrink-0" />
        <span>PQC algorithms protect against future quantum computer decryption attacks (Shor's and Grover's algorithm resistance).</span>
      </div>
    </div>
  )
}
