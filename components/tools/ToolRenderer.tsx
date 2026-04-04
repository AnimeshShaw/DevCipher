'use client'
import dynamic from 'next/dynamic'
import HashTool from './HashTool'

// Lazy-load heavier tools
const SymCipherTool = dynamic(() => import('./SymCipherTool'), { ssr: false })
const AsymCryptoTool = dynamic(() => import('./AsymCryptoTool'), { ssr: false })
const EncodingTool = dynamic(() => import('./EncodingTool'), { ssr: false })
const JsonTool = dynamic(() => import('./JsonTool'), { ssr: false })
const XmlTool = dynamic(() => import('./XmlTool'), { ssr: false })
const CaseTool = dynamic(() => import('./CaseTool'), { ssr: false })
const QRCodeTool = dynamic(() => import('./QRCodeTool'), { ssr: false })
const SyntaxTool = dynamic(() => import('./SyntaxTool'), { ssr: false })

const HASH_ALGORITHMS: Record<string, { name: string; desc?: string; isFile?: boolean; hasOutputLen?: boolean; hasCshakeOptions?: boolean; hasKmacKey?: boolean }> = {
  'crc':           { name: 'CRC-32', desc: 'CRC-32 cyclic redundancy check — error detection, not cryptographic' },
  'crc-file':      { name: 'CRC-32 File', isFile: true, desc: 'CRC-32 for file integrity checks' },
  'md2':           { name: 'MD2', desc: 'MD2 message digest — 128-bit output, designed for 8-bit machines' },
  'md2-file':      { name: 'MD2 File', isFile: true },
  'md4':           { name: 'MD4', desc: 'MD4 message digest — 128-bit, predecessor to MD5' },
  'md4-file':      { name: 'MD4 File', isFile: true },
  'md5':           { name: 'MD5', desc: 'MD5 message digest — 128-bit, widely used but not cryptographically secure' },
  'md5-file':      { name: 'MD5 File', isFile: true },
  'sha1':          { name: 'SHA1', desc: 'SHA-1 — 160-bit hash, deprecated for security use' },
  'sha1-file':     { name: 'SHA1 File', isFile: true },
  'sha224':        { name: 'SHA224', desc: 'SHA-224 — truncated variant of SHA-256' },
  'sha224-file':   { name: 'SHA224 File', isFile: true },
  'sha256':        { name: 'SHA256', desc: 'SHA-256 — 256-bit cryptographic hash function, widely recommended' },
  'sha256-file':   { name: 'SHA256 File', isFile: true },
  'sha256-double': { name: 'Double SHA256', desc: 'SHA256(SHA256(x)) — used in Bitcoin' },
  'sha384':        { name: 'SHA384', desc: 'SHA-384 — 384-bit hash, truncated SHA-512' },
  'sha384-file':   { name: 'SHA384 File', isFile: true },
  'sha512':        { name: 'SHA512', desc: 'SHA-512 — 512-bit hash, strong security margin' },
  'sha512-file':   { name: 'SHA512 File', isFile: true },
  'sha512-224':    { name: 'SHA512/224', desc: 'SHA-512 with 224-bit output truncation' },
  'sha512-224-file': { name: 'SHA512/224 File', isFile: true },
  'sha512-256':    { name: 'SHA512/256', desc: 'SHA-512 with 256-bit output truncation' },
  'sha512-256-file': { name: 'SHA512/256 File', isFile: true },
  'sha3-224':      { name: 'SHA3-224', desc: 'SHA-3 (Keccak) with 224-bit output' },
  'sha3-224-file': { name: 'SHA3-224 File', isFile: true },
  'sha3-256':      { name: 'SHA3-256', desc: 'SHA-3 (Keccak) with 256-bit output' },
  'sha3-256-file': { name: 'SHA3-256 File', isFile: true },
  'sha3-384':      { name: 'SHA3-384', desc: 'SHA-3 (Keccak) with 384-bit output' },
  'sha3-384-file': { name: 'SHA3-384 File', isFile: true },
  'sha3-512':      { name: 'SHA3-512', desc: 'SHA-3 (Keccak) with 512-bit output' },
  'sha3-512-file': { name: 'SHA3-512 File', isFile: true },
  'keccak-224':    { name: 'Keccak-224', desc: 'Original Keccak (pre-NIST) with 224-bit output' },
  'keccak-224-file': { name: 'Keccak-224 File', isFile: true },
  'keccak-256':    { name: 'Keccak-256', desc: 'Original Keccak-256 — used in Ethereum' },
  'keccak-256-file': { name: 'Keccak-256 File', isFile: true },
  'keccak-384':    { name: 'Keccak-384', desc: 'Original Keccak-384' },
  'keccak-384-file': { name: 'Keccak-384 File', isFile: true },
  'keccak-512':    { name: 'Keccak-512', desc: 'Original Keccak-512' },
  'keccak-512-file': { name: 'Keccak-512 File', isFile: true },
  'shake128':      { name: 'SHAKE128', desc: 'SHAKE-128 XOF — variable-length output', hasOutputLen: true },
  'shake128-file': { name: 'SHAKE128 File', isFile: true, hasOutputLen: true },
  'shake256':      { name: 'SHAKE256', desc: 'SHAKE-256 XOF — variable-length output', hasOutputLen: true },
  'shake256-file': { name: 'SHAKE256 File', isFile: true, hasOutputLen: true },
  'cshake128':     { name: 'cSHAKE128', desc: 'Customizable SHAKE-128', hasOutputLen: true, hasCshakeOptions: true },
  'cshake128-file': { name: 'cSHAKE128 File', isFile: true, hasOutputLen: true, hasCshakeOptions: true },
  'cshake256':     { name: 'cSHAKE256', desc: 'Customizable SHAKE-256', hasOutputLen: true, hasCshakeOptions: true },
  'cshake256-file': { name: 'cSHAKE256 File', isFile: true, hasOutputLen: true, hasCshakeOptions: true },
  'kmac128':       { name: 'KMAC128', desc: 'Keccak Message Authentication Code 128-bit', hasOutputLen: true, hasKmacKey: true },
  'kmac128-file':  { name: 'KMAC128 File', isFile: true, hasOutputLen: true, hasKmacKey: true },
  'kmac256':       { name: 'KMAC256', desc: 'Keccak Message Authentication Code 256-bit', hasOutputLen: true, hasKmacKey: true },
  'kmac256-file':  { name: 'KMAC256 File', isFile: true, hasOutputLen: true, hasKmacKey: true },
  'ripemd128':     { name: 'RIPEMD-128', desc: 'RIPEMD-128 hash function' },
  'ripemd128-file': { name: 'RIPEMD-128 File', isFile: true },
  'ripemd160':     { name: 'RIPEMD-160', desc: 'RIPEMD-160 — used in Bitcoin addresses' },
  'ripemd160-file': { name: 'RIPEMD-160 File', isFile: true },
  'ripemd256':     { name: 'RIPEMD-256', desc: 'RIPEMD-256 — strengthened RIPEMD-128' },
  'ripemd256-file': { name: 'RIPEMD-256 File', isFile: true },
  'ripemd320':     { name: 'RIPEMD-320', desc: 'RIPEMD-320 — strengthened RIPEMD-160' },
  'ripemd320-file': { name: 'RIPEMD-320 File', isFile: true },
  'blake2b':       { name: 'BLAKE2b', desc: 'BLAKE2b — fast 64-bit hash, up to 512-bit output' },
  'blake2b-file':  { name: 'BLAKE2b File', isFile: true },
  'blake2s':       { name: 'BLAKE2s', desc: 'BLAKE2s — fast 32-bit hash, up to 256-bit output' },
  'blake2s-file':  { name: 'BLAKE2s File', isFile: true },
  'blake3':        { name: 'BLAKE3', desc: 'BLAKE3 — extremely fast modern hash function' },
  'blake3-file':   { name: 'BLAKE3 File', isFile: true },
}

const SYM_CIPHER_IDS = new Set([
  'aes-encrypt', 'aes-decrypt',
  'des-encrypt', 'des-decrypt',
  'triple-des-encrypt', 'triple-des-decrypt',
  'rc4-encrypt', 'rc4-decrypt',
])

const ASYM_IDS = new Set([
  'ecdsa-keygen', 'ecdsa-sign', 'ecdsa-verify',
  'rsa-keygen', 'rsa-sign', 'rsa-verify', 'rsa-encrypt', 'rsa-decrypt',
])

const ENCODING_IDS = new Set([
  'hex-encode', 'hex-decode', 'hex-file', 'hex-file-decode',
  'base32-encode', 'base32-decode', 'base32-file', 'base32-file-decode',
  'base58-encode', 'base58-decode', 'base58-file', 'base58-file-decode',
  'base64-encode', 'base64-decode', 'base64-file', 'base64-file-decode',
  'html-encode', 'html-decode', 'url-encode', 'url-decode',
])

const FORMAT_IDS = new Set(['json-validator', 'json-minifier', 'json-formatter', 'json-viewer'])
const XML_IDS = new Set(['xml-validator', 'xml-minifier', 'xml-formatter'])

export default function ToolRenderer({ toolId }: { toolId: string }) {
  if (HASH_ALGORITHMS[toolId]) {
    const cfg = HASH_ALGORITHMS[toolId]
    return (
      <HashTool
        algorithmId={toolId}
        algorithmName={cfg.name}
        description={cfg.desc}
        isFile={cfg.isFile}
        hasOutputLen={cfg.hasOutputLen}
        hasCshakeOptions={cfg.hasCshakeOptions}
        hasKmacKey={cfg.hasKmacKey}
      />
    )
  }
  if (SYM_CIPHER_IDS.has(toolId)) return <SymCipherTool toolId={toolId} />
  if (ASYM_IDS.has(toolId)) return <AsymCryptoTool toolId={toolId} />
  if (ENCODING_IDS.has(toolId)) return <EncodingTool toolId={toolId} />
  if (FORMAT_IDS.has(toolId)) return <JsonTool variant={toolId.replace('json-', '') as 'validator' | 'minifier' | 'formatter' | 'viewer'} />
  if (XML_IDS.has(toolId)) return <XmlTool variant={toolId.replace('xml-', '') as 'validator' | 'minifier' | 'formatter'} />
  if (toolId === 'case-converter') return <CaseTool />
  if (toolId === 'qrcode') return <QRCodeTool />
  if (toolId === 'syntax-highlight') return <SyntaxTool />
  return <div className="text-zinc-500 text-sm">Tool not found</div>
}
