export interface ToolConfig {
  id: string
  name: string
  description: string
  category: string
  tags?: string[]
  variant?: string
  seoTitle?: string        // override for <title> tag
  seoDescription?: string  // override for meta description
  keywords?: string        // comma-separated keywords
}

export interface CategoryConfig {
  id: string
  label: string
  icon: string
  color: string
  tools: ToolConfig[]
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'hash',
    label: 'Hash',
    icon: 'hash',
    color: 'text-purple-400',
    tools: [
      // CRC
      { id: 'crc', name: 'CRC', description: 'Cyclic Redundancy Check', category: 'hash' },
      { id: 'crc-file', name: 'CRC File', description: 'CRC hash for files', category: 'hash', variant: 'file' },
      // MD family
      { id: 'md2', name: 'MD2', description: 'MD2 message digest', category: 'hash' },
      { id: 'md2-file', name: 'MD2 File', description: 'MD2 hash for files', category: 'hash', variant: 'file' },
      { id: 'md4', name: 'MD4', description: 'MD4 message digest', category: 'hash' },
      { id: 'md4-file', name: 'MD4 File', description: 'MD4 hash for files', category: 'hash', variant: 'file' },
      { id: 'md5', name: 'MD5', description: 'MD5 message digest', category: 'hash' },
      { id: 'md5-file', name: 'MD5 File', description: 'MD5 hash for files', category: 'hash', variant: 'file' },
      // SHA1
      { id: 'sha1', name: 'SHA1', description: 'SHA-1 hash', category: 'hash' },
      { id: 'sha1-file', name: 'SHA1 File', description: 'SHA1 hash for files', category: 'hash', variant: 'file' },
      // SHA2
      { id: 'sha224', name: 'SHA224', description: 'SHA-224 hash', category: 'hash' },
      { id: 'sha224-file', name: 'SHA224 File', description: 'SHA224 hash for files', category: 'hash', variant: 'file' },
      { id: 'sha256', name: 'SHA256', description: 'SHA-256 hash', category: 'hash' },
      { id: 'sha256-file', name: 'SHA256 File', description: 'SHA256 hash for files', category: 'hash', variant: 'file' },
      { id: 'sha256-double', name: 'Double SHA256', description: 'SHA256 applied twice', category: 'hash' },
      { id: 'sha384', name: 'SHA384', description: 'SHA-384 hash', category: 'hash' },
      { id: 'sha384-file', name: 'SHA384 File', description: 'SHA384 hash for files', category: 'hash', variant: 'file' },
      { id: 'sha512', name: 'SHA512', description: 'SHA-512 hash', category: 'hash' },
      { id: 'sha512-file', name: 'SHA512 File', description: 'SHA512 hash for files', category: 'hash', variant: 'file' },
      { id: 'sha512-224', name: 'SHA512/224', description: 'SHA-512/224 hash', category: 'hash' },
      { id: 'sha512-224-file', name: 'SHA512/224 File', description: 'SHA-512/224 hash for files', category: 'hash', variant: 'file' },
      { id: 'sha512-256', name: 'SHA512/256', description: 'SHA-512/256 hash', category: 'hash' },
      { id: 'sha512-256-file', name: 'SHA512/256 File', description: 'SHA-512/256 hash for files', category: 'hash', variant: 'file' },
      // SHA3
      { id: 'sha3-224', name: 'SHA3-224', description: 'SHA3-224 hash', category: 'hash' },
      { id: 'sha3-224-file', name: 'SHA3-224 File', description: 'SHA3-224 hash for files', category: 'hash', variant: 'file' },
      { id: 'sha3-256', name: 'SHA3-256', description: 'SHA3-256 hash', category: 'hash' },
      { id: 'sha3-256-file', name: 'SHA3-256 File', description: 'SHA3-256 hash for files', category: 'hash', variant: 'file' },
      { id: 'sha3-384', name: 'SHA3-384', description: 'SHA3-384 hash', category: 'hash' },
      { id: 'sha3-384-file', name: 'SHA3-384 File', description: 'SHA3-384 hash for files', category: 'hash', variant: 'file' },
      { id: 'sha3-512', name: 'SHA3-512', description: 'SHA3-512 hash', category: 'hash' },
      { id: 'sha3-512-file', name: 'SHA3-512 File', description: 'SHA3-512 hash for files', category: 'hash', variant: 'file' },
      // Keccak
      { id: 'keccak-224', name: 'Keccak-224', description: 'Keccak-224 hash', category: 'hash' },
      { id: 'keccak-224-file', name: 'Keccak-224 File', description: 'Keccak-224 hash for files', category: 'hash', variant: 'file' },
      { id: 'keccak-256', name: 'Keccak-256', description: 'Keccak-256 hash (Ethereum)', category: 'hash' },
      { id: 'keccak-256-file', name: 'Keccak-256 File', description: 'Keccak-256 hash for files', category: 'hash', variant: 'file' },
      { id: 'keccak-384', name: 'Keccak-384', description: 'Keccak-384 hash', category: 'hash' },
      { id: 'keccak-384-file', name: 'Keccak-384 File', description: 'Keccak-384 hash for files', category: 'hash', variant: 'file' },
      { id: 'keccak-512', name: 'Keccak-512', description: 'Keccak-512 hash', category: 'hash' },
      { id: 'keccak-512-file', name: 'Keccak-512 File', description: 'Keccak-512 hash for files', category: 'hash', variant: 'file' },
      // SHAKE
      { id: 'shake128', name: 'SHAKE128', description: 'SHAKE-128 XOF', category: 'hash' },
      { id: 'shake128-file', name: 'SHAKE128 File', description: 'SHAKE-128 hash for files', category: 'hash', variant: 'file' },
      { id: 'shake256', name: 'SHAKE256', description: 'SHAKE-256 XOF', category: 'hash' },
      { id: 'shake256-file', name: 'SHAKE256 File', description: 'SHAKE-256 hash for files', category: 'hash', variant: 'file' },
      // cSHAKE
      { id: 'cshake128', name: 'cSHAKE128', description: 'Customizable SHAKE-128', category: 'hash' },
      { id: 'cshake128-file', name: 'cSHAKE128 File', description: 'cSHAKE128 hash for files', category: 'hash', variant: 'file' },
      { id: 'cshake256', name: 'cSHAKE256', description: 'Customizable SHAKE-256', category: 'hash' },
      { id: 'cshake256-file', name: 'cSHAKE256 File', description: 'cSHAKE256 hash for files', category: 'hash', variant: 'file' },
      // KMAC
      { id: 'kmac128', name: 'KMAC128', description: 'Keccak MAC 128-bit', category: 'hash' },
      { id: 'kmac128-file', name: 'KMAC128 File', description: 'KMAC128 hash for files', category: 'hash', variant: 'file' },
      { id: 'kmac256', name: 'KMAC256', description: 'Keccak MAC 256-bit', category: 'hash' },
      { id: 'kmac256-file', name: 'KMAC256 File', description: 'KMAC256 hash for files', category: 'hash', variant: 'file' },
      // RIPEMD
      { id: 'ripemd128', name: 'RIPEMD-128', description: 'RIPEMD-128 hash', category: 'hash' },
      { id: 'ripemd128-file', name: 'RIPEMD-128 File', description: 'RIPEMD-128 hash for files', category: 'hash', variant: 'file' },
      { id: 'ripemd160', name: 'RIPEMD-160', description: 'RIPEMD-160 hash', category: 'hash' },
      { id: 'ripemd160-file', name: 'RIPEMD-160 File', description: 'RIPEMD-160 hash for files', category: 'hash', variant: 'file' },
      { id: 'ripemd256', name: 'RIPEMD-256', description: 'RIPEMD-256 hash', category: 'hash' },
      { id: 'ripemd256-file', name: 'RIPEMD-256 File', description: 'RIPEMD-256 hash for files', category: 'hash', variant: 'file' },
      { id: 'ripemd320', name: 'RIPEMD-320', description: 'RIPEMD-320 hash', category: 'hash' },
      { id: 'ripemd320-file', name: 'RIPEMD-320 File', description: 'RIPEMD-320 hash for files', category: 'hash', variant: 'file' },
      // BLAKE
      { id: 'blake2b', name: 'BLAKE2b', description: 'BLAKE2b hash', category: 'hash' },
      { id: 'blake2b-file', name: 'BLAKE2b File', description: 'BLAKE2b hash for files', category: 'hash', variant: 'file' },
      { id: 'blake2s', name: 'BLAKE2s', description: 'BLAKE2s hash', category: 'hash' },
      { id: 'blake2s-file', name: 'BLAKE2s File', description: 'BLAKE2s hash for files', category: 'hash', variant: 'file' },
      { id: 'blake3', name: 'BLAKE3', description: 'BLAKE3 hash', category: 'hash' },
      { id: 'blake3-file', name: 'BLAKE3 File', description: 'BLAKE3 hash for files', category: 'hash', variant: 'file' },
    ],
  },
  {
    id: 'crypto',
    label: 'Cryptography',
    icon: 'lock',
    color: 'text-red-400',
    tools: [
      { id: 'aes-encrypt', name: 'AES Encrypt', description: 'AES encryption', category: 'crypto', variant: 'encrypt' },
      { id: 'aes-decrypt', name: 'AES Decrypt', description: 'AES decryption', category: 'crypto', variant: 'decrypt' },
      { id: 'des-encrypt', name: 'DES Encrypt', description: 'DES encryption', category: 'crypto', variant: 'encrypt' },
      { id: 'des-decrypt', name: 'DES Decrypt', description: 'DES decryption', category: 'crypto', variant: 'decrypt' },
      { id: 'triple-des-encrypt', name: 'Triple DES Encrypt', description: '3DES encryption', category: 'crypto', variant: 'encrypt' },
      { id: 'triple-des-decrypt', name: 'Triple DES Decrypt', description: '3DES decryption', category: 'crypto', variant: 'decrypt' },
      { id: 'rc4-encrypt', name: 'RC4 Encrypt', description: 'RC4 stream cipher encryption', category: 'crypto', variant: 'encrypt' },
      { id: 'rc4-decrypt', name: 'RC4 Decrypt', description: 'RC4 stream cipher decryption', category: 'crypto', variant: 'decrypt' },
      { id: 'ecdsa-keygen', name: 'ECDSA Key Generator', description: 'Generate ECDSA key pairs', category: 'crypto', variant: 'keygen' },
      { id: 'ecdsa-sign', name: 'ECDSA Sign', description: 'Sign messages with ECDSA', category: 'crypto', variant: 'sign' },
      { id: 'ecdsa-verify', name: 'ECDSA Verify', description: 'Verify ECDSA signatures', category: 'crypto', variant: 'verify' },
      { id: 'rsa-keygen', name: 'RSA Key Generator', description: 'Generate RSA key pairs', category: 'crypto', variant: 'keygen' },
      { id: 'rsa-sign', name: 'RSA Sign', description: 'Sign messages with RSA', category: 'crypto', variant: 'sign' },
      { id: 'rsa-verify', name: 'RSA Verify', description: 'Verify RSA signatures', category: 'crypto', variant: 'verify' },
      { id: 'rsa-encrypt', name: 'RSA Encrypt', description: 'RSA encryption', category: 'crypto', variant: 'encrypt' },
      { id: 'rsa-decrypt', name: 'RSA Decrypt', description: 'RSA decryption', category: 'crypto', variant: 'decrypt' },
      { id: 'hmac', name: 'HMAC Generator', description: 'Keyed-hash message authentication code (SHA2, SHA3, BLAKE2)', category: 'crypto', seoTitle: 'HMAC Generator Online — SHA256 SHA512 BLAKE2 Keyed Hashing', keywords: 'hmac generator online, hmac sha256 online, keyed hash generator' },
      { id: 'pqc', name: 'Post-Quantum Cryptography', description: 'NIST PQC standards (ML-KEM, ML-DSA, SLH-DSA) key inspector', category: 'crypto', seoTitle: 'Post-Quantum Cryptography (PQC) Key Inspector — Kyber & Dilithium', keywords: 'post quantum cryptography, ml-kem, ml-dsa, kyber 768, dilithium, fips 203' },
    ],
  },
  {
    id: 'encoding',
    label: 'Encoding',
    icon: 'code-2',
    color: 'text-green-400',
    tools: [
      { id: 'hex-encode', name: 'Hex Encode', description: 'Text to hexadecimal', category: 'encoding', variant: 'encode' },
      { id: 'hex-decode', name: 'Hex Decode', description: 'Hexadecimal to text', category: 'encoding', variant: 'decode' },
      { id: 'hex-file', name: 'File to Hex', description: 'File to hexadecimal', category: 'encoding', variant: 'file' },
      { id: 'hex-file-decode', name: 'Hex to File', description: 'Hexadecimal to file', category: 'encoding', variant: 'file' },
      { id: 'base32-encode', name: 'Base32 Encode', description: 'Text to Base32', category: 'encoding', variant: 'encode' },
      { id: 'base32-decode', name: 'Base32 Decode', description: 'Base32 to text', category: 'encoding', variant: 'decode' },
      { id: 'base32-file', name: 'File to Base32', description: 'File to Base32', category: 'encoding', variant: 'file' },
      { id: 'base32-file-decode', name: 'Base32 to File', description: 'Base32 to file', category: 'encoding', variant: 'file' },
      { id: 'base58-encode', name: 'Base58 Encode', description: 'Text to Base58', category: 'encoding', variant: 'encode' },
      { id: 'base58-decode', name: 'Base58 Decode', description: 'Base58 to text', category: 'encoding', variant: 'decode' },
      { id: 'base58-file', name: 'File to Base58', description: 'File to Base58', category: 'encoding', variant: 'file' },
      { id: 'base58-file-decode', name: 'Base58 to File', description: 'Base58 to file', category: 'encoding', variant: 'file' },
      { id: 'base64-encode', name: 'Base64 Encode', description: 'Text to Base64', category: 'encoding', variant: 'encode' },
      { id: 'base64-decode', name: 'Base64 Decode', description: 'Base64 to text', category: 'encoding', variant: 'decode' },
      { id: 'base64-file', name: 'File to Base64', description: 'File to Base64', category: 'encoding', variant: 'file' },
      { id: 'base64-file-decode', name: 'Base64 to File', description: 'Base64 to file', category: 'encoding', variant: 'file' },
      { id: 'image-base64', name: 'Image to Base64 / Data URI', description: 'Convert image to Base64 data URI & preview', category: 'encoding', seoTitle: 'Image to Base64 Converter — Data URI Generator Online', keywords: 'image to base64, data uri generator, base64 image preview' },
      { id: 'html-encode', name: 'HTML Encode', description: 'HTML entity encoding', category: 'encoding', variant: 'encode' },
      { id: 'html-decode', name: 'HTML Decode', description: 'HTML entity decoding', category: 'encoding', variant: 'decode' },
      { id: 'url-encode', name: 'URL Encode', description: 'URL percent encoding', category: 'encoding', variant: 'encode' },
      { id: 'url-decode', name: 'URL Decode', description: 'URL percent decoding', category: 'encoding', variant: 'decode' },
    ],
  },
  {
    id: 'format',
    label: 'Format',
    icon: 'file-json',
    color: 'text-yellow-400',
    tools: [
      { id: 'json-validator', name: 'JSON Validator', description: 'Validate JSON syntax', category: 'format' },
      { id: 'json-minifier', name: 'JSON Minifier', description: 'Minify JSON', category: 'format' },
      { id: 'json-formatter', name: 'JSON Formatter', description: 'Format and beautify JSON', category: 'format' },
      { id: 'json-viewer', name: 'JSON Viewer', description: 'Interactive JSON tree viewer', category: 'format' },
      { id: 'xml-validator', name: 'XML Validator', description: 'Validate XML syntax', category: 'format' },
      { id: 'xml-minifier', name: 'XML Minifier', description: 'Minify XML', category: 'format' },
      { id: 'xml-formatter', name: 'XML Formatter', description: 'Format and beautify XML', category: 'format' },
      { id: 'sql-tool', name: 'SQL Formatter & Sanitizer', description: 'Beautify, minify, and sanitize SQL queries', category: 'format', seoTitle: 'SQL Formatter Online — Beautify, Minify & Sanitize SQL', keywords: 'sql formatter online, beautify sql query, sanitize sql' },
    ],
  },
  {
    id: 'convert',
    label: 'Convert',
    icon: 'arrow-left-right',
    color: 'text-orange-400',
    tools: [
      { id: 'case-converter', name: 'Case Converter', description: 'Convert text between 11 case styles', category: 'convert' },
      { id: 'base-converter', name: 'Number Base Converter', description: 'Binary, octal, decimal, hex and arbitrary bases', category: 'convert', seoTitle: 'Number Base Converter — Binary, Octal, Decimal, Hex Online', keywords: 'binary to decimal, hex converter, base converter online, number system converter' },
      { id: 'color-converter', name: 'Color Converter', description: 'HEX, RGB, HSL, HSV, OKLCH color conversion', category: 'convert', seoTitle: 'Color Converter — HEX RGB HSL HSV OKLCH Online Free', keywords: 'hex to rgb, rgb to hsl, color code converter, css color converter' },
      { id: 'timestamp', name: 'Timestamp Converter', description: 'Unix timestamp ↔ human-readable date', category: 'convert', seoTitle: 'Unix Timestamp Converter — Epoch to Date Online', keywords: 'unix timestamp converter, epoch time converter, timestamp to date online' },
      { id: 'ip-tools', name: 'IP Address Tools', description: 'CIDR calculator, subnet mask, IPv4↔IPv6', category: 'convert', seoTitle: 'IP Address & Subnet Calculator — CIDR Online Tool', keywords: 'cidr calculator, subnet calculator, ip address converter, ipv4 to ipv6' },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    icon: 'sparkles',
    color: 'text-cyan-400',
    tools: [
      { id: 'qrcode', name: 'QR Code Generator', description: 'Generate styled QR codes — SVG, PNG, JPEG', category: 'other', seoTitle: 'QR Code Generator Free — No Signup, Custom Styles', keywords: 'qr code generator free no signup, qr code creator online, custom qr code' },
      { id: 'syntax-highlight', name: 'Syntax Highlighter', description: 'Syntax highlighting for 36 languages', category: 'other' },
      { id: 'diff', name: 'Text Diff Tool', description: 'Side-by-side text and line diff', category: 'other', seoTitle: 'Text Diff Tool Online — Compare Text Side by Side', keywords: 'text diff online, compare two texts, line diff tool, text comparison' },
      { id: 'regex', name: 'Regex Tester', description: 'Test regex with match highlighting and groups', category: 'other', seoTitle: 'Regex Tester Online — Test Regular Expressions Free', keywords: 'regex tester online, regular expression tester, regex match highlighter' },
      { id: 'lorem', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text and random data', category: 'other', seoTitle: 'Lorem Ipsum Generator — Random Text & Data Online', keywords: 'lorem ipsum generator, random text generator, placeholder text' },
      { id: 'cron', name: 'Cron Expression Parser', description: 'Parse cron expressions — human-readable + next runs', category: 'other', seoTitle: 'Cron Expression Parser — Human Readable Cron Online', keywords: 'cron expression parser, cron to human readable, cron next occurrence' },
    ],
  },
  {
    id: 'developer',
    label: 'Developer Tools',
    icon: 'terminal',
    color: 'text-violet-400',
    tools: [
      { id: 'jwt', name: 'JWT Decoder / Verifier', description: 'Decode, encode and verify JSON Web Tokens', category: 'developer', seoTitle: 'JWT Decoder Online — Decode, Encode & Verify JSON Web Tokens', keywords: 'jwt decoder online, jwt verifier, decode jwt token, json web token parser' },
      { id: 'uuid', name: 'UUID Generator', description: 'Generate UUID v1, v3, v4, v5 — bulk generation', category: 'developer', seoTitle: 'UUID Generator Online — v1 v3 v4 v5 Free', keywords: 'uuid generator online, generate uuid v4, bulk uuid generator, guid generator' },
      { id: 'password-strength', name: 'Password Strength Analyzer', description: 'Entropy, crack time estimate, pattern detection', category: 'developer', seoTitle: 'Password Strength Checker — Entropy & Crack Time Estimator', keywords: 'password strength checker, password entropy calculator, crack time estimator' },
      { id: 'password-hash', name: 'Password Hasher', description: 'Hash passwords with bcrypt, scrypt, PBKDF2', category: 'developer', seoTitle: 'Password Hasher Online — bcrypt, scrypt, PBKDF2', keywords: 'bcrypt online, password hash generator, bcrypt hash, scrypt hash, pbkdf2 online' },
      { id: 'hash-id', name: 'Hash Identifier', description: 'Identify hash algorithm from any hash string', category: 'developer', seoTitle: 'Hash Identifier Online — Identify Any Hash Algorithm', keywords: 'hash identifier, identify hash type, what hash is this, hash algorithm detector' },
      { id: 'cert-inspector', name: 'Certificate Inspector', description: 'Parse X.509 PEM certificates — subject, SANs, expiry', category: 'developer', seoTitle: 'SSL Certificate Inspector — Parse PEM Certificate Online', keywords: 'ssl certificate viewer, x509 certificate parser, pem certificate decoder, cert inspector' },
      { id: 'curl', name: 'cURL to Code Converter', description: 'Convert cURL commands to Fetch, Python, Go, Node', category: 'developer', seoTitle: 'cURL to Code Converter — Convert cURL to Fetch, Python, Go', keywords: 'curl to fetch, curl to python, convert curl command online' },
    ],
  },
]

export const ALL_TOOLS: ToolConfig[] = CATEGORIES.flatMap((c) => c.tools)

export function findTool(id: string): ToolConfig | undefined {
  return ALL_TOOLS.find((t) => t.id === id)
}

export function findCategory(id: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.id === id)
}

export const INPUT_ENCODINGS = [
  'UTF-8', 'UTF-16LE', 'UTF-16BE',
  'Hex', 'Base64',
  'Latin-1', 'ISO-8859-2', 'ISO-8859-3', 'ISO-8859-4', 'ISO-8859-5',
  'ISO-8859-6', 'ISO-8859-7', 'ISO-8859-8', 'ISO-8859-9', 'ISO-8859-10',
  'ISO-8859-11', 'ISO-8859-13', 'ISO-8859-14', 'ISO-8859-15',
  'Windows-1250', 'Windows-1251', 'Windows-1252', 'Windows-1253',
  'Windows-1254', 'Windows-1255', 'Windows-1256', 'Windows-1257',
  'Windows-1258', 'GBK', 'GB18030', 'Big5', 'Shift_JIS', 'EUC-JP',
  'EUC-KR', 'KOI8-R', 'KOI8-U',
]

export const OUTPUT_FORMATS = [
  'Hex (Lower Case)',
  'Hex (Upper Case)',
  'Base64',
]
