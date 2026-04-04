import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CryptoLab Online Tools',
  description: 'Free online cryptography, hashing, encoding, and formatting tools. Built by Animesh Shaw.',
  keywords: ['hash', 'sha256', 'md5', 'aes', 'base64', 'encoding', 'crypto', 'online tools'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  )
}
