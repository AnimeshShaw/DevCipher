'use client'
import React, { useState } from 'react'
import {
  generateRSAKeyPair, rsaEncrypt, rsaDecrypt, rsaSign, rsaVerify,
  generateECDSAKeyPair, ecdsaSign, ecdsaVerify, type ECDSACurve,
} from '@/lib/crypto'
import { copyToClipboard } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Check, RefreshCw, Key, Lock, Unlock, PenLine, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Props { toolId: string }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await copyToClipboard(text)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} disabled={!text} className="text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30 px-2 py-0.5 rounded hover:bg-zinc-800 flex items-center gap-1 transition-colors">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function FieldBox({ label, value, onChange, placeholder, readOnly, rows = 4 }: {
  label: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; readOnly?: boolean; rows?: number
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
        <span className="text-xs font-medium text-zinc-400">{label}</span>
        {readOnly && <CopyButton text={value} />}
      </div>
      <Textarea
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        placeholder={placeholder}
        rows={rows}
        className="border-0 rounded-none bg-transparent focus-visible:ring-0"
      />
    </div>
  )
}

export default function AsymCryptoTool({ toolId }: Props) {
  const isECDSA = toolId.startsWith('ecdsa')
  const isRSA = toolId.startsWith('rsa')
  const variant = toolId.split('-').slice(isECDSA ? 1 : 1).join('-')

  const [rsaBits, setRsaBits] = useState<1024 | 2048 | 4096>(2048)
  const [rsaHashAlgo, setRsaHashAlgo] = useState('sha256')
  const [rsaEncScheme, setRsaEncScheme] = useState<'oaep' | 'pkcs1'>('oaep')
  const [ecCurve, setEcCurve] = useState<ECDSACurve>('P-256')
  const [privateKey, setPrivateKey] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [output, setOutput] = useState('')
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const process = async () => {
    setError(''); setIsProcessing(true); setVerifyResult(null)
    try {
      if (isECDSA) {
        if (variant === 'keygen') {
          const kp = generateECDSAKeyPair(ecCurve)
          setPrivateKey(kp.privateKey)
          setPublicKey(kp.publicKey)
        } else if (variant === 'sign') {
          if (!privateKey || !message) throw new Error('Private key and message required')
          const sig = await ecdsaSign(message, privateKey, ecCurve)
          setSignature(sig)
        } else if (variant === 'verify') {
          if (!publicKey || !message || !signature) throw new Error('Public key, message, and signature required')
          const result = await ecdsaVerify(message, signature, publicKey, ecCurve)
          setVerifyResult(result)
        }
      } else if (isRSA) {
        if (variant === 'keygen') {
          const kp = await generateRSAKeyPair(rsaBits)
          setPrivateKey(kp.privateKey)
          setPublicKey(kp.publicKey)
        } else if (variant === 'sign') {
          if (!privateKey || !message) throw new Error('Private key and message required')
          const sig = rsaSign(message, privateKey, rsaHashAlgo)
          setSignature(sig)
        } else if (variant === 'verify') {
          if (!publicKey || !message || !signature) throw new Error('Public key, message, and signature required')
          const result = rsaVerify(message, signature, publicKey, rsaHashAlgo)
          setVerifyResult(result)
        } else if (variant === 'encrypt') {
          if (!publicKey || !message) throw new Error('Public key and message required')
          const enc = rsaEncrypt(message, publicKey, rsaEncScheme)
          setOutput(enc)
        } else if (variant === 'decrypt') {
          if (!privateKey || !message) throw new Error('Private key and ciphertext required')
          const dec = rsaDecrypt(message, privateKey, rsaEncScheme)
          setOutput(dec)
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operation failed')
    }
    setIsProcessing(false)
  }

  const actionLabel = {
    'keygen': 'Generate Key Pair',
    'sign': 'Sign Message',
    'verify': 'Verify Signature',
    'encrypt': 'Encrypt',
    'decrypt': 'Decrypt',
  }[variant] ?? 'Execute'

  const ActionIcon = {
    'keygen': Key, 'sign': PenLine, 'verify': ShieldCheck,
    'encrypt': Lock, 'decrypt': Unlock,
  }[variant] ?? Key

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Settings row */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
        {isECDSA && variant !== undefined && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400">Curve</label>
            <Select value={ecCurve} onValueChange={(v) => setEcCurve(v as ECDSACurve)}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['P-256', 'secp256k1'] as ECDSACurve[]).map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {isRSA && variant === 'keygen' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400">Key Size</label>
            <Select value={String(rsaBits)} onValueChange={(v) => setRsaBits(Number(v) as 1024 | 2048 | 4096)}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1024, 2048, 4096].map((b) => (
                  <SelectItem key={b} value={String(b)} className="text-xs">{b} bits</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {isRSA && (variant === 'sign' || variant === 'verify') && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400">Hash</label>
            <Select value={rsaHashAlgo} onValueChange={setRsaHashAlgo}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['sha1', 'sha256', 'sha384', 'sha512'].map((h) => (
                  <SelectItem key={h} value={h} className="text-xs uppercase">{h.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {isRSA && (variant === 'encrypt' || variant === 'decrypt') && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400">Scheme</label>
            <Select value={rsaEncScheme} onValueChange={(v) => setRsaEncScheme(v as 'oaep' | 'pkcs1')}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="oaep" className="text-xs">RSA-OAEP</SelectItem>
                <SelectItem value="pkcs1" className="text-xs">PKCS#1 v1.5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button onClick={process} disabled={isProcessing} className="ml-auto h-8 text-xs">
          {isProcessing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ActionIcon className="h-3.5 w-3.5" />}
          {isProcessing ? 'Processing...' : actionLabel}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-900/20 px-4 py-2.5 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
        </div>
      )}

      {/* Verify result */}
      {verifyResult !== null && (
        <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
          verifyResult
            ? 'border-emerald-800 bg-emerald-900/20 text-emerald-400'
            : 'border-red-800 bg-red-900/20 text-red-400'
        }`}>
          {verifyResult
            ? <><CheckCircle2 className="h-5 w-5" /> Signature is VALID — the message has not been tampered with</>
            : <><AlertCircle className="h-5 w-5" /> Signature is INVALID — verification failed</>
          }
        </div>
      )}

      {/* Key pair fields */}
      {(variant === 'keygen' || variant === 'sign' || variant === 'verify' || variant === 'encrypt' || variant === 'decrypt') && (
        <div className="grid gap-3 sm:grid-cols-2">
          {(variant === 'keygen' || variant === 'sign' || variant === 'decrypt' || variant === 'verify') && (
            <FieldBox
              label="Private Key"
              value={privateKey}
              onChange={variant !== 'keygen' ? setPrivateKey : undefined}
              readOnly={variant === 'keygen'}
              placeholder="Paste private key (PEM or hex)..."
              rows={6}
            />
          )}
          {(variant === 'keygen' || variant === 'verify' || variant === 'encrypt' || variant === 'sign') && (
            <FieldBox
              label="Public Key"
              value={publicKey}
              onChange={variant !== 'keygen' ? setPublicKey : undefined}
              readOnly={variant === 'keygen'}
              placeholder="Paste public key (PEM or hex)..."
              rows={6}
            />
          )}
        </div>
      )}

      {/* Message */}
      {(variant === 'sign' || variant === 'verify' || variant === 'encrypt' || variant === 'decrypt') && (
        <FieldBox
          label={variant === 'decrypt' ? 'Ciphertext (Base64)' : 'Message'}
          value={message}
          onChange={setMessage}
          placeholder={variant === 'decrypt' ? 'Paste ciphertext...' : 'Enter message...'}
          rows={3}
        />
      )}

      {/* Signature */}
      {(variant === 'sign' || variant === 'verify') && (
        <FieldBox
          label="Signature (Hex/Base64)"
          value={signature}
          onChange={variant === 'verify' ? setSignature : undefined}
          readOnly={variant === 'sign'}
          placeholder="Signature will appear here..."
          rows={2}
        />
      )}

      {/* Encrypt/Decrypt output */}
      {(variant === 'encrypt' || variant === 'decrypt') && output && (
        <FieldBox
          label={variant === 'encrypt' ? 'Encrypted (Base64)' : 'Decrypted Message'}
          value={output}
          readOnly
          rows={3}
        />
      )}
    </div>
  )
}
