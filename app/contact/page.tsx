import type { Metadata } from 'next'
import AppShell from '@/components/layout/AppShell'
import Link from 'next/link'
import { ChevronRight, Mail, ExternalLink, Link2, MessageSquare, Bug, Lightbulb, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Animesh Shaw, the creator of DevCipher — for bug reports, feature requests, or general enquiries.',
}

export default function ContactPage() {
  return (
    <AppShell>
      <nav className="flex items-center gap-1 text-xs text-zinc-500 mb-8">
        <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-200">Contact</span>
      </nav>

      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="h-6 w-6 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Contact</h1>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Have a question, found a bug, or want to suggest a feature? Here's how to reach me.
          </p>
        </div>

        {/* Primary contact */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Email</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            The best way to reach me for privacy questions, legal matters, or anything not suited
            to a public GitHub issue.
          </p>
          <a
            href="mailto:animeshshaw@pm.me"
            className="inline-flex items-center gap-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 transition-colors"
          >
            <Mail className="h-4 w-4" />
            animeshshaw@pm.me
          </a>
        </div>

        {/* GitHub */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">GitHub — Preferred for Technical Issues</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            For bug reports, feature requests, and tool suggestions — GitHub Issues is the
            best place so the whole community can track and contribute.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                icon: Bug,
                label: 'Report a Bug',
                href: 'https://github.com/AnimeshShaw/DevCipher/issues/new?template=bug_report.md',
                color: 'text-red-400',
                bg: 'bg-red-900/20 border-red-800/40 hover:bg-red-900/30',
              },
              {
                icon: Lightbulb,
                label: 'Request a Feature',
                href: 'https://github.com/AnimeshShaw/DevCipher/issues/new?template=feature_request.md',
                color: 'text-yellow-400',
                bg: 'bg-yellow-900/20 border-yellow-800/40 hover:bg-yellow-900/30',
              },
              {
                icon: ExternalLink,
                label: 'View All Issues',
                href: 'https://github.com/AnimeshShaw/DevCipher/issues',
                color: 'text-zinc-300',
                bg: 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800',
              },
            ].map(({ icon: Icon, label, href, color, bg }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${bg} ${color}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* LinkedIn */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">LinkedIn</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            For professional enquiries, security collaboration, or connecting on infosec topics.
          </p>
          <a
            href="https://www.linkedin.com/in/animeshshaw/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Link2 className="h-4 w-4" />
            linkedin.com/in/animeshshaw
          </a>
        </div>

        {/* Support */}
        <div className="rounded-xl border border-amber-800/40 bg-amber-900/10 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider">Support the Project</h2>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            If DevCipher has saved you time, consider supporting its development. It helps cover
            the domain and keeps PQC tooling coming.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://ko-fi.com/animeshshaw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm px-4 py-2 transition-colors"
            >
              Buy me a coffee — Ko-fi
            </a>
            <a
              href="https://github.com/sponsors/AnimeshShaw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm px-4 py-2 border border-zinc-700 transition-colors"
            >
              <Heart className="h-3.5 w-3.5 text-pink-400" />
              GitHub Sponsors
            </a>
          </div>
        </div>

        {/* Response time note */}
        <p className="text-xs text-zinc-600 text-center">
          This is a solo project. I aim to respond to emails within a few days and GitHub issues within a week.
        </p>
      </div>
    </AppShell>
  )
}
