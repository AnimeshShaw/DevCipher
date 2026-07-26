import type { Metadata } from 'next'
import './globals.css'

const BASE_URL = 'https://devcipher.dev'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'DevCipher — Free Cryptography & Developer Tools',
    template: '%s — DevCipher',
  },
  description: 'Free online cryptography, hashing, encoding, and developer tools. SHA256, AES, JWT, Base64, UUID, bcrypt and 100+ more. All processing is local — no data leaves your browser.',
  keywords: [
    'sha256 online', 'md5 hash', 'aes encryption', 'base64 encoder', 'jwt decoder',
    'uuid generator', 'bcrypt hash', 'regex tester', 'cryptography tools', 'online hash generator',
    'password hasher', 'certificate inspector', 'hex encoder', 'developer tools online',
  ],
  authors: [{ name: 'Animesh Shaw' }],
  creator: 'Animesh Shaw',
  openGraph: {
    type: 'website',
    siteName: 'DevCipher',
    title: 'DevCipher — Free Cryptography & Developer Tools',
    description: 'Free online cryptography, hashing, encoding, and developer tools. 100+ tools, all local — no data leaves your browser.',
    url: BASE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevCipher — Free Cryptography & Developer Tools',
    description: '100+ free cryptography, encoding, and developer tools. All local, no tracking.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
