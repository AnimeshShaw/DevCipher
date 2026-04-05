import type { Metadata } from 'next'
import AppShell from '@/components/layout/AppShell'
import Link from 'next/link'
import { Shield, Lock, Code2, Heart, Coffee, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About DevCipher',
  description: 'About DevCipher — free, open-source cryptography and developer tools built by Animesh Shaw. All processing is local, no data leaves your browser.',
}

export default function AboutPage() {
  return (
    <AppShell>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-zinc-500 mb-8">
        <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-200">About</span>
      </nav>

      <div className="max-w-2xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-3">
            About Dev<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Cipher</span>
          </h1>
          <p className="text-zinc-400 leading-relaxed">
            DevCipher is a collection of free, professional-grade cryptography and developer tools
            that run entirely in your browser. No accounts. No uploads. No tracking. Just tools.
          </p>
        </div>

        {/* Core principles */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Core Principles</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                color: 'text-emerald-400',
                bg: 'bg-emerald-900/20 border-emerald-800/40',
                title: 'Privacy First',
                desc: 'Every computation happens in your browser. Nothing is sent to any server. Ever.',
              },
              {
                icon: Lock,
                color: 'text-blue-400',
                bg: 'bg-blue-900/20 border-blue-800/40',
                title: 'Trustworthy',
                desc: 'Open source, signed builds, SBOM published with every release. Verify the code yourself.',
              },
              {
                icon: Code2,
                color: 'text-violet-400',
                bg: 'bg-violet-900/20 border-violet-800/40',
                title: 'Developer-Grade',
                desc: '100+ tools covering hashing, encryption, encoding, JWT, certificates, and more.',
              },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className={`rounded-xl border p-4 ${bg}`}>
                <Icon className={`h-5 w-5 ${color} mb-2`} />
                <p className={`text-sm font-semibold ${color} mb-1`}>{title}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Built by */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Built by</h2>
          <p className="text-zinc-400 leading-relaxed">
            Hi, I'm <span className="text-zinc-200 font-semibold">Animesh Shaw</span> — a developer who got tired
            of copy-pasting into shady online tools that may or may not be logging your keys, tokens, and passwords.
            DevCipher was built to be the tool I always wanted: fast, private, and trustworthy.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Every tool runs entirely client-side using Web Crypto and battle-tested libraries. The source code is
            open for anyone to audit. The build pipeline generates a signed SBOM so you can verify
            exactly what dependencies are in the code you're running.
          </p>
          <div className="pt-2">
            <a
              href="https://github.com/AnimeshShaw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Code2 className="h-4 w-4" />
              github.com/AnimeshShaw
            </a>
          </div>
        </div>

        {/* Support */}
        <div className="rounded-xl border border-amber-800/40 bg-amber-900/10 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider">Support the Project</h2>
          </div>
          <p className="text-zinc-400 leading-relaxed text-sm">
            DevCipher is free and will always be free. If it saves you time or you find it useful,
            consider buying me a coffee — it helps cover the domain, any future infrastructure,
            and keeps me motivated to add more tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://ko-fi.com/animeshshaw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm px-5 py-2.5 transition-colors"
            >
              <Coffee className="h-4 w-4" />
              Buy me a coffee — Ko-fi
            </a>
            <a
              href="https://github.com/sponsors/AnimeshShaw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm px-5 py-2.5 border border-zinc-700 transition-colors"
            >
              <Heart className="h-4 w-4 text-pink-400" />
              GitHub Sponsors
            </a>
          </div>
          <p className="text-[11px] text-zinc-600">No subscription, no pressure. One-time is great too.</p>
        </div>

        {/* Open source */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Open Source & Verifiable</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            The source code is public on GitHub. Every build is automatically scanned for
            vulnerabilities (CodeQL + Semgrep), generates a signed CycloneDX SBOM, and is
            attested with Sigstore so you can verify the exact artifact matches the source code.
          </p>
          <a
            href="https://github.com/AnimeshShaw/DevCipher"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Code2 className="h-4 w-4" />
            View source on GitHub →
          </a>
        </div>

      </div>
    </AppShell>
  )
}
