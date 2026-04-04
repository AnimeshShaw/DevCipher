import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function bytesToHex(bytes: Uint8Array, upper = false): string {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return upper ? hex.toUpperCase() : hex
}

export function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.replace(/\s/g, '')
  if (cleaned.length % 2 !== 0) throw new Error('Invalid hex string')
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16)
  }
  return bytes
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function encodeInput(text: string, encoding: string): Uint8Array {
  if (encoding === 'Hex') return hexToBytes(text)
  if (encoding === 'Base64') return base64ToBytes(text)
  const encoder = new TextEncoder()
  // For UTF-8 (default) use TextEncoder
  if (encoding === 'UTF-8' || encoding === '') return encoder.encode(text)
  // For other encodings, fall back to TextEncoder (browser limitation)
  // In a real scenario you'd use iconv-lite on Node.js
  return encoder.encode(text)
}

export function formatOutput(bytes: Uint8Array, format: string): string {
  if (format === 'Hex (Upper Case)') return bytesToHex(bytes, true)
  if (format === 'Base64') return bytesToBase64(bytes)
  return bytesToHex(bytes, false)
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
  return Promise.resolve()
}

export function downloadFile(content: string | Uint8Array, filename: string, mimeType = 'application/octet-stream') {
  const part = content instanceof Uint8Array ? content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength) as ArrayBuffer : content
  const blob = new Blob([part], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function readFileAsBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
  return `${(bytes / 1073741824).toFixed(1)} GB`
}
