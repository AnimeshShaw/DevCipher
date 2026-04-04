import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import { CATEGORIES } from '@/lib/tools-config'
import { Hash, Lock, Code2, FileJson, ArrowLeftRight, Sparkles, Zap, Shield, Terminal, RefreshCw } from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  hash: Hash, lock: Lock, 'code-2': Code2,
  'file-json': FileJson, 'arrow-left-right': ArrowLeftRight, sparkles: Sparkles,
  terminal: Terminal, 'refresh-cw': RefreshCw,
}

const stats = [
  { icon: Hash, label: 'Hash Algorithms', value: '30+' },
  { icon: Lock, label: 'Crypto Tools', value: '16' },
  { icon: Code2, label: 'Encoding Formats', value: '20+' },
  { icon: Terminal, label: 'Developer Tools', value: '14+' },
]

export default function HomePage() {
  const totalTools = CATEGORIES.reduce((acc, c) => acc + c.tools.length, 0)
  return (
    <AppShell>
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-900/30 border border-blue-800/50 px-4 py-1.5 text-xs text-blue-400 mb-6">
          <Zap className="h-3 w-3" />
          <span>{totalTools}+ tools — all free, all client-side</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Dev
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Cipher
          </span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Professional cryptography, hashing, encoding, and developer tools.
          Everything runs in your browser — no data ever leaves your device.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Shield className="h-4 w-4 text-emerald-400" />
          <span className="text-sm text-emerald-400">100% client-side · No server uploads · Privacy first</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-center">
            <Icon className="h-5 w-5 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {CATEGORIES.map((cat) => {
          const Icon = iconMap[cat.icon] ?? Hash
          return (
            <section key={cat.id}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-4.5 w-4.5 ${cat.color}`} />
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">{cat.label}</h2>
                <span className="text-xs text-zinc-600">({cat.tools.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {cat.tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    className="group flex flex-col rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80 p-3 transition-all duration-150"
                  >
                    <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
                      {tool.name}
                    </span>
                    <span className="text-[11px] text-zinc-500 mt-0.5 leading-tight line-clamp-2">
                      {tool.description}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-zinc-800 text-center">
        <p className="text-sm text-zinc-500">
          Built by{' '}
          <span className="text-zinc-300 font-semibold">Animesh Shaw</span>
          {' · '}
          <Link href="/about" className="text-zinc-400 hover:text-zinc-200 transition-colors">About & Support</Link>
        </p>
        <p className="text-xs text-zinc-600 mt-1">All computations are performed locally in your browser.</p>
      </footer>
    </AppShell>
  )
}
