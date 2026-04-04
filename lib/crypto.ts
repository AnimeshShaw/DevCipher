import CryptoJS from 'crypto-js'
import * as forge from 'node-forge'
import { p256 } from '@noble/curves/nist.js'
import { secp256k1 } from '@noble/curves/secp256k1.js'
import { bytesToHex, hexToBytes, bytesToBase64, base64ToBytes } from './utils'

// ─── Symmetric Ciphers ───────────────────────────────────────────────────────

export type SymCipherMode = 'CBC' | 'CFB' | 'CTR' | 'OFB' | 'ECB'
export type SymCipherPadding = 'PKCS7' | 'ISO97971' | 'AnsiX923' | 'ISO10126' | 'ZeroPadding' | 'NoPadding'
export type SymAlgo = 'AES' | 'DES' | 'TripleDES' | 'RC4'
export type SymKeyType = 'Custom' | 'PBKDF2' | 'EvpKDF'
export type SymKeySize = 128 | 192 | 256

export interface SymCipherOptions {
  algorithm: SymAlgo
  mode: SymCipherMode
  padding: SymCipherPadding
  keySize: SymKeySize
  keyType: SymKeyType
  key: string
  keyEncoding: string
  iv: string
  ivEncoding: string
  salt?: string
  saltType?: 'random' | 'none' | 'custom'
  inputEncoding: string
  outputEncoding: string
  pbkdf2Hash?: string
  pbkdf2Iterations?: number
}

function getWordArray(data: string | Uint8Array, encoding: string): CryptoJS.lib.WordArray {
  if (data instanceof Uint8Array) {
    const words: number[] = []
    for (let i = 0; i < data.length; i += 4) {
      words.push(
        ((data[i] || 0) << 24) | ((data[i + 1] || 0) << 16) |
        ((data[i + 2] || 0) << 8) | (data[i + 3] || 0)
      )
    }
    return CryptoJS.lib.WordArray.create(words, data.length)
  }
  if (encoding === 'Hex') return CryptoJS.enc.Hex.parse(data)
  if (encoding === 'Base64') return CryptoJS.enc.Base64.parse(data)
  return CryptoJS.enc.Utf8.parse(data)
}

function wordArrayToUint8(wa: CryptoJS.lib.WordArray): Uint8Array {
  const hex = wa.toString(CryptoJS.enc.Hex)
  return hexToBytes(hex)
}

export function symmetricEncrypt(data: Uint8Array, opts: SymCipherOptions): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modeMap: Record<string, any> = {
    CBC: CryptoJS.mode.CBC, CFB: CryptoJS.mode.CFB,
    CTR: CryptoJS.mode.CTR, OFB: CryptoJS.mode.OFB, ECB: CryptoJS.mode.ECB,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const padMap: Record<string, any> = {
    PKCS7: CryptoJS.pad.Pkcs7, ISO97971: CryptoJS.pad.Iso97971,
    AnsiX923: CryptoJS.pad.AnsiX923, ISO10126: CryptoJS.pad.Iso10126,
    ZeroPadding: CryptoJS.pad.ZeroPadding, NoPadding: CryptoJS.pad.NoPadding,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const algoMap: Record<string, any> = {
    AES: CryptoJS.AES, DES: CryptoJS.DES, TripleDES: CryptoJS.TripleDES, RC4: CryptoJS.RC4,
  }

  const keyWA = getWordArray(opts.key, opts.keyEncoding)
  const ivWA = opts.mode !== 'ECB' ? getWordArray(opts.iv, opts.ivEncoding) : undefined
  const dataWA = getWordArray(data, 'binary')

  const encOpts: Record<string, unknown> = {
    mode: modeMap[opts.mode] ?? CryptoJS.mode.CBC,
    padding: padMap[opts.padding] ?? CryptoJS.pad.Pkcs7,
  }
  if (ivWA) encOpts.iv = ivWA

  const encrypted = algoMap[opts.algorithm].encrypt(dataWA, keyWA, encOpts)
  const cipherBytes = wordArrayToUint8(encrypted.ciphertext)

  if (opts.outputEncoding === 'Base64') return bytesToBase64(cipherBytes)
  if (opts.outputEncoding === 'Hex (Upper Case)') return bytesToHex(cipherBytes, true)
  return bytesToHex(cipherBytes, false)
}

export function symmetricDecrypt(cipherText: string, opts: SymCipherOptions): Uint8Array {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modeMap: Record<string, any> = {
    CBC: CryptoJS.mode.CBC, CFB: CryptoJS.mode.CFB,
    CTR: CryptoJS.mode.CTR, OFB: CryptoJS.mode.OFB, ECB: CryptoJS.mode.ECB,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const padMap: Record<string, any> = {
    PKCS7: CryptoJS.pad.Pkcs7, ISO97971: CryptoJS.pad.Iso97971,
    AnsiX923: CryptoJS.pad.AnsiX923, ISO10126: CryptoJS.pad.Iso10126,
    ZeroPadding: CryptoJS.pad.ZeroPadding, NoPadding: CryptoJS.pad.NoPadding,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const algoMap: Record<string, any> = {
    AES: CryptoJS.AES, DES: CryptoJS.DES, TripleDES: CryptoJS.TripleDES, RC4: CryptoJS.RC4,
  }

  const keyWA = getWordArray(opts.key, opts.keyEncoding)
  const ivWA = opts.mode !== 'ECB' ? getWordArray(opts.iv, opts.ivEncoding) : undefined

  let cipherWA: CryptoJS.lib.WordArray
  if (opts.inputEncoding === 'Base64') {
    cipherWA = CryptoJS.enc.Base64.parse(cipherText)
  } else {
    cipherWA = CryptoJS.enc.Hex.parse(cipherText.replace(/\s/g, ''))
  }

  const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: cipherWA })
  const decOpts: Record<string, unknown> = {
    mode: modeMap[opts.mode] ?? CryptoJS.mode.CBC,
    padding: padMap[opts.padding] ?? CryptoJS.pad.Pkcs7,
  }
  if (ivWA) decOpts.iv = ivWA

  const decrypted = algoMap[opts.algorithm].decrypt(cipherParams, keyWA, decOpts)
  return wordArrayToUint8(decrypted)
}

// ─── RSA ─────────────────────────────────────────────────────────────────────

export interface RSAKeyPair {
  publicKey: string
  privateKey: string
}

export async function generateRSAKeyPair(bits: 1024 | 2048 | 4096 = 2048): Promise<RSAKeyPair> {
  return new Promise((resolve, reject) => {
    forge.pki.rsa.generateKeyPair({ bits, workers: -1 }, (err, keypair) => {
      if (err) return reject(err)
      resolve({
        publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
        privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
      })
    })
  })
}

export function rsaEncrypt(message: string, publicKeyPem: string, encoding: 'pkcs1' | 'oaep' = 'oaep'): string {
  const pub = forge.pki.publicKeyFromPem(publicKeyPem)
  const enc = encoding === 'oaep'
    ? pub.encrypt(message, 'RSA-OAEP')
    : pub.encrypt(message, 'RSAES-PKCS1-V1_5')
  return forge.util.encode64(enc)
}

export function rsaDecrypt(cipherBase64: string, privateKeyPem: string, encoding: 'pkcs1' | 'oaep' = 'oaep'): string {
  const priv = forge.pki.privateKeyFromPem(privateKeyPem)
  const cipher = forge.util.decode64(cipherBase64)
  return encoding === 'oaep'
    ? priv.decrypt(cipher, 'RSA-OAEP')
    : priv.decrypt(cipher, 'RSAES-PKCS1-V1_5')
}

function getMd(hashAlgo: string): forge.md.MessageDigest {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mdModule = forge.md as any
  const creator = mdModule[hashAlgo]?.create ?? mdModule.sha256.create
  return creator.call(mdModule[hashAlgo] ?? mdModule.sha256)
}

export function rsaSign(message: string, privateKeyPem: string, hashAlgo: string = 'sha256'): string {
  const priv = forge.pki.privateKeyFromPem(privateKeyPem)
  const md = getMd(hashAlgo)
  md.update(message, 'utf8')
  return forge.util.encode64(priv.sign(md))
}

export function rsaVerify(message: string, signatureBase64: string, publicKeyPem: string, hashAlgo: string = 'sha256'): boolean {
  try {
    const pub = forge.pki.publicKeyFromPem(publicKeyPem)
    const md = getMd(hashAlgo)
    md.update(message, 'utf8')
    const sig = forge.util.decode64(signatureBase64)
    return pub.verify(md.digest().bytes(), sig)
  } catch {
    return false
  }
}

// ─── ECDSA ────────────────────────────────────────────────────────────────────

export type ECDSACurve = 'P-256' | 'secp256k1'

export interface ECDSAKeyPair {
  privateKey: string
  publicKey: string
  curve: ECDSACurve
}

export function generateECDSAKeyPair(curve: ECDSACurve = 'P-256'): ECDSAKeyPair {
  const impl = curve === 'secp256k1' ? secp256k1 : p256
  const privKey = impl.utils.randomSecretKey()
  const pubKey = impl.getPublicKey(privKey)
  return {
    privateKey: bytesToHex(privKey),
    publicKey: bytesToHex(pubKey),
    curve,
  }
}

export async function ecdsaSign(
  message: string,
  privateKeyHex: string,
  curve: ECDSACurve = 'P-256'
): Promise<string> {
  const impl = curve === 'secp256k1' ? secp256k1 : p256
  const msgHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message))
  const sig = impl.sign(new Uint8Array(msgHash), hexToBytes(privateKeyHex))
  return bytesToHex(sig)
}

export async function ecdsaVerify(
  message: string,
  signatureHex: string,
  publicKeyHex: string,
  curve: ECDSACurve = 'P-256'
): Promise<boolean> {
  try {
    const impl = curve === 'secp256k1' ? secp256k1 : p256
    const msgHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message))
    const sigBytes = hexToBytes(signatureHex)
    return impl.verify(sigBytes, new Uint8Array(msgHash), hexToBytes(publicKeyHex))
  } catch {
    return false
  }
}
