import type { Metadata } from 'next'
import AppShell from '@/components/layout/AppShell'
import Link from 'next/link'
import { ChevronRight, Scale } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for DevCipher — free cryptography and developer tools that run entirely in your browser.',
}

export default function TermsPage() {
  return (
    <AppShell>
      <nav className="flex items-center gap-1 text-xs text-zinc-500 mb-8">
        <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-200">Terms of Service</span>
      </nav>

      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Scale className="h-6 w-6 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          </div>
          <p className="text-zinc-500 text-sm">Last updated: April 2026</p>
        </div>

        <p className="text-zinc-400 leading-relaxed">
          By accessing and using DevCipher at{' '}
          <a href="https://devcipher.dev" className="text-indigo-400 hover:text-indigo-300">devcipher.dev</a>,
          you agree to these Terms of Service. If you do not agree, please do not use the site.
        </p>

        {[
          {
            title: '1. Use of the Service',
            body: `DevCipher provides free, browser-based cryptography and developer tools. All processing
            occurs entirely within your browser — no data is transmitted to any server. You may use these
            tools for any lawful purpose, including personal, educational, and professional use.`,
          },
          {
            title: '2. Acceptable Use',
            body: `You agree not to use DevCipher to process data that you are not authorised to access,
            to attempt to interfere with the operation of the site, or for any unlawful purpose. The tools
            are provided as developer utilities and must not be used to facilitate unauthorised access to
            systems, data theft, or any other malicious activity.`,
          },
          {
            title: '3. No Warranty',
            body: `DevCipher is provided "as is" without any warranty of any kind, express or implied,
            including but not limited to warranties of merchantability, fitness for a particular purpose,
            or accuracy. Cryptographic outputs should be verified independently before use in
            security-critical systems. The author accepts no liability for errors, bugs, or incorrect
            outputs.`,
          },
          {
            title: '4. Limitation of Liability',
            body: `To the fullest extent permitted by applicable law, Animesh Shaw (the author of
            DevCipher) shall not be liable for any direct, indirect, incidental, special, or
            consequential damages arising out of or in connection with your use of DevCipher, even if
            advised of the possibility of such damages.`,
          },
          {
            title: '5. Intellectual Property',
            body: `DevCipher's source code is open source and available on GitHub. The name "DevCipher",
            its logo, and site design are the property of Animesh Shaw. Third-party libraries used by
            DevCipher are governed by their respective licences, which are documented in the published
            SBOM.`,
          },
          {
            title: '6. Privacy',
            body: `DevCipher does not collect, store, or transmit any personal data or input you provide
            to the tools. See our Privacy Policy for full details.`,
          },
          {
            title: '7. Changes to These Terms',
            body: `These terms may be updated from time to time. Continued use of DevCipher after
            changes are posted constitutes acceptance of the revised terms. The "Last updated" date
            at the top of this page will reflect any changes.`,
          },
          {
            title: '8. Governing Law',
            body: `These terms are governed by the laws of India. Any disputes shall be subject to the
            exclusive jurisdiction of the courts of India.`,
          },
          {
            title: '9. Contact',
            body: null,
            contact: true,
          },
        ].map(({ title, body, contact }) => (
          <div key={title} className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-200">{title}</h2>
            {contact ? (
              <p className="text-zinc-400 leading-relaxed text-sm">
                If you have any questions about these terms, please contact us at{' '}
                <a href="mailto:animeshshaw@pm.me" className="text-indigo-400 hover:text-indigo-300">
                  animeshshaw@pm.me
                </a>{' '}
                or visit the{' '}
                <Link href="/contact" className="text-indigo-400 hover:text-indigo-300">
                  Contact page
                </Link>.
              </p>
            ) : (
              <p className="text-zinc-400 leading-relaxed text-sm">{body}</p>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  )
}
