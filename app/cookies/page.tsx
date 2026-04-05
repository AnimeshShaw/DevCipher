import type { Metadata } from 'next'
import AppShell from '@/components/layout/AppShell'
import Link from 'next/link'
import { ChevronRight, Cookie } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie Policy for DevCipher — we do not use any cookies.',
}

export default function CookiesPage() {
  return (
    <AppShell>
      <nav className="flex items-center gap-1 text-xs text-zinc-500 mb-8">
        <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-200">Cookie Policy</span>
      </nav>

      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Cookie className="h-6 w-6 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">Cookie Policy</h1>
          </div>
          <p className="text-zinc-500 text-sm">Last updated: April 2026</p>
        </div>

        {/* TL;DR */}
        <div className="rounded-xl border border-amber-800/40 bg-amber-900/10 p-5">
          <p className="text-sm font-semibold text-amber-300 mb-2">The short version</p>
          <p className="text-zinc-400 text-sm leading-relaxed">
            DevCipher does not use any cookies — not for analytics, not for preferences, not for
            tracking. None. Zero. Zip.
          </p>
        </div>

        {[
          {
            title: '1. What Are Cookies?',
            body: `Cookies are small text files that a website stores in your browser. They are
            commonly used to remember preferences, track sessions, or analyse usage behaviour.`,
          },
          {
            title: '2. Cookies We Use',
            body: `DevCipher does not set any cookies whatsoever. There are no session cookies,
            no persistent cookies, no functional cookies, no analytics cookies, and no advertising
            or tracking cookies.`,
          },
          {
            title: '3. Why We Don\'t Need Cookies',
            body: `DevCipher has no user accounts, no login system, no personalised content,
            and no server-side processing. All tools run entirely in your browser. There is
            nothing to track and no session to maintain, so there is no purpose for cookies.`,
          },
          {
            title: '4. Local Storage',
            body: `Some tools may use your browser's localStorage to temporarily persist state
            (for example, remembering your last input while you navigate). This data is stored
            only on your device, is never transmitted to any server, and is not used to identify
            or track you. You can clear it at any time from your browser settings.`,
          },
          {
            title: '5. Third-Party Cookies',
            body: `DevCipher does not embed any third-party scripts, widgets, or iframes that
            would set third-party cookies. If you follow an external link (GitHub, LinkedIn,
            Ko-fi, etc.) those sites may set their own cookies, governed by their respective
            cookie policies.`,
          },
          {
            title: '6. GitHub Pages',
            body: `The site is hosted on GitHub Pages. GitHub may set their own infrastructure
            cookies. Please refer to GitHub's Cookie Policy for details.`,
          },
          {
            title: '7. Managing Cookies',
            body: `Since we don't set any cookies, there is nothing to manage or opt out of.
            You can still configure your browser to block all cookies and DevCipher will work
            perfectly — nothing breaks.`,
          },
          {
            title: '8. Contact',
            contact: true,
          },
        ].map(({ title, body, contact }: { title: string; body?: string; contact?: boolean }) => (
          <div key={title} className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-200">{title}</h2>
            {body && <p className="text-zinc-400 leading-relaxed text-sm">{body}</p>}
            {contact && (
              <p className="text-zinc-400 leading-relaxed text-sm">
                Questions about this Cookie Policy? Reach out at{' '}
                <a href="mailto:animeshshaw@pm.me" className="text-indigo-400 hover:text-indigo-300">
                  animeshshaw@pm.me
                </a>{' '}
                or visit the{' '}
                <Link href="/contact" className="text-indigo-400 hover:text-indigo-300">
                  Contact page
                </Link>.
              </p>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  )
}
