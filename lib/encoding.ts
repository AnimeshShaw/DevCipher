import bs58 from 'bs58'
import { encode as base32Encode, decode as base32Decode } from 'hi-base32'
import { bytesToHex, hexToBytes, bytesToBase64, base64ToBytes } from './utils'

// ─── Hex ─────────────────────────────────────────────────────────────────────

export function hexEncode(text: string, inputEncoding = 'UTF-8'): string {
  const enc = new TextEncoder()
  if (inputEncoding === 'UTF-8') return bytesToHex(enc.encode(text))
  return bytesToHex(enc.encode(text))
}

export function hexDecode(hex: string): string {
  const bytes = hexToBytes(hex.replace(/\s/g, ''))
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

export function fileToBytesHex(bytes: Uint8Array): string {
  return bytesToHex(bytes)
}

export function hexToFile(hex: string): Uint8Array {
  return hexToBytes(hex.replace(/\s/g, ''))
}

// ─── Base32 ──────────────────────────────────────────────────────────────────

export function base32EncodeText(text: string): string {
  const enc = new TextEncoder()
  return base32Encode(enc.encode(text))
}

export function base32DecodeText(b32: string): string {
  const bytes = base32Decode.asBytes(b32.toUpperCase().replace(/=+$/, ''))
  return new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes))
}

export function fileToBase32(bytes: Uint8Array): string {
  return base32Encode(bytes)
}

export function base32ToFile(b32: string): Uint8Array {
  return new Uint8Array(base32Decode.asBytes(b32.toUpperCase()))
}

// ─── Base58 ──────────────────────────────────────────────────────────────────

export function base58EncodeText(text: string): string {
  const enc = new TextEncoder()
  return bs58.encode(enc.encode(text))
}

export function base58DecodeText(b58: string): string {
  const bytes = bs58.decode(b58)
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

export function fileToBase58(bytes: Uint8Array): string {
  return bs58.encode(bytes)
}

export function base58ToFile(b58: string): Uint8Array {
  return bs58.decode(b58)
}

// ─── Base64 ──────────────────────────────────────────────────────────────────

export type Base64Format = 'RFC4648' | 'RFC4648_URL' | 'RFC2045' | 'RFC2152' | 'RFC3501'

export function base64EncodeText(text: string, format: Base64Format = 'RFC4648'): string {
  const enc = new TextEncoder()
  const bytes = enc.encode(text)
  return fileToBase64(bytes, format)
}

export function base64DecodeText(b64: string): string {
  const bytes = base64ToFile(b64)
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

export function fileToBase64(bytes: Uint8Array, format: Base64Format = 'RFC4648'): string {
  let b64 = bytesToBase64(bytes)
  if (format === 'RFC4648_URL') {
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } else if (format === 'RFC2045') {
    // MIME: add line breaks every 76 chars
    b64 = b64.match(/.{1,76}/g)?.join('\r\n') ?? b64
  } else if (format === 'RFC2152') {
    // UTF-7: use + instead of =
    b64 = b64.replace(/=+$/, '')
  } else if (format === 'RFC3501') {
    // IMAP: modified base64 uses , instead of /
    b64 = b64.replace(/\//g, ',').replace(/=+$/, '')
  }
  return b64
}

export function base64ToFile(b64: string): Uint8Array {
  // Normalize various formats back to standard base64
  let normalized = b64.trim()
    .replace(/-/g, '+').replace(/_/g, '/')  // URL-safe
    .replace(/,/g, '/')                       // IMAP
    .replace(/[\r\n\s]/g, '')                 // MIME line breaks
  // Add padding
  while (normalized.length % 4 !== 0) normalized += '='
  return base64ToBytes(normalized)
}

// ─── HTML ─────────────────────────────────────────────────────────────────────

export function htmlEncode(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
}

export function htmlDecode(html: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
    '&apos;': "'", '&#39;': "'", '&#96;': '`', '&nbsp;': '\u00a0',
    '&copy;': '©', '&reg;': '®', '&trade;': '™', '&euro;': '€',
    '&pound;': '£', '&yen;': '¥', '&cent;': '¢',
  }
  return html
    .replace(/&[a-zA-Z]+;/g, (m) => entities[m] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
}

// ─── URL ─────────────────────────────────────────────────────────────────────

export function urlEncode(text: string): string {
  return encodeURIComponent(text)
}

export function urlDecode(text: string): string {
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}
