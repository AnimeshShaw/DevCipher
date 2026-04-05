import type { Metadata } from 'next'
import AppShell from '@/components/layout/AppShell'
import Link from 'next/link'
import { Shield, Lock, Code2, Heart, Coffee, ChevronRight, Link2, FlaskConical, Swords, GitBranch } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About DevCipher',
  description: 'About DevCipher — built by Animesh Shaw, Senior AVP at EXL with 10+ years in information security, DevSecOps, and Post-Quantum Cryptography research.',
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
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Built by</h2>

          {/* Name + title */}
          <div>
            <p className="text-xl font-bold text-white">Animesh Shaw</p>
            <p className="text-sm text-indigo-400 mt-0.5">Senior Assistant Vice President — EXL</p>
          </div>

          {/* Bio */}
          <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
            <p>
              With more than 10 years in information security, I focus on{' '}
              <span className="text-zinc-200">DevSecOps, Offensive Security, Vulnerability Management,
              Governance, and AI security leadership</span>. My work spans application security architecture,
              vulnerability assessments, and implementing OWASP-aligned security controls to strengthen
              organisational resilience against cyber threats.
            </p>
            <p>
              I am committed to fostering a security-first culture and enabling teams to proactively address
              vulnerabilities while ensuring compliance. Through cross-functional team leadership I contribute
              to developing robust solutions that safeguard complex systems, enhance risk management, and align
              with strategic business goals.
            </p>
            <p>
              At heart I am a <span className="text-zinc-200">developer who loves securing every aspect of
              the development lifecycle</span> — from design and code review through to deployment and
              runtime monitoring. That conviction is what led to DevCipher: a toolset built with the same
              rigour I apply professionally, made freely available so every developer can work securely
              without reaching for untrusted online services.
            </p>
          </div>

          {/* Expertise tags */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              'DevSecOps', 'Offensive Security', 'Vulnerability Management',
              'OWASP', 'AI Security', 'AppSec Architecture', 'Governance & Compliance',
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-[11px] font-medium text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-4 pt-1">
            <a
              href="https://www.linkedin.com/in/animeshshaw/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Link2 className="h-4 w-4" />
              linkedin.com/in/animeshshaw
            </a>
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

        {/* Post-Quantum research callout */}
        <div className="rounded-xl border border-violet-800/40 bg-violet-900/10 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-violet-400" />
            <h2 className="text-sm font-semibold text-violet-300 uppercase tracking-wider">Research Interest — Post-Quantum Cryptography</h2>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            I am actively studying and researching <span className="text-zinc-200">Post-Quantum Cryptography (PQC)</span> —
            the field of cryptographic algorithms designed to resist attacks from quantum computers.
            With NIST's recent standardisation of CRYSTALS-Kyber, CRYSTALS-Dilithium, and SPHINCS+, the
            transition to quantum-safe cryptography is no longer a distant concern; it is an engineering
            challenge happening now.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Future versions of DevCipher will include PQC tooling so practitioners can experiment with
            lattice-based and hash-based schemes alongside the classical algorithms they already use today.
          </p>
        </div>

        {/* Security philosophy */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Why DevCipher Exists</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: Swords,
                color: 'text-red-400',
                label: 'Offensive mindset',
                desc: 'Built by someone who thinks like an attacker — tools that help you understand what you\'re defending.',
              },
              {
                icon: GitBranch,
                color: 'text-emerald-400',
                label: 'Shift-left security',
                desc: 'Security belongs at every stage of the SDLC, not bolted on at the end. DevCipher puts it in your hands early.',
              },
              {
                icon: Shield,
                color: 'text-blue-400',
                label: 'Zero trust by design',
                desc: 'No data leaves your browser. You don\'t have to trust us — that\'s the whole point.',
              },
            ].map(({ icon: Icon, color, label, desc }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className={`text-sm font-semibold ${color}`}>{label}</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
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
            and keeps me motivated to add more tools and PQC research tooling.
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
