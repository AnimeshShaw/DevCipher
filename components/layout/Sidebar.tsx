'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/tools-config'
import {
  Hash, Lock, Code2, FileJson, ArrowLeftRight, Sparkles,
  ChevronDown, ChevronRight, Search, X, Zap
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  hash: Hash, lock: Lock, 'code-2': Code2,
  'file-json': FileJson, 'arrow-left-right': ArrowLeftRight, sparkles: Sparkles,
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Auto-expand active category
  useEffect(() => {
    const toolId = pathname.split('/').pop() ?? ''
    for (const cat of CATEGORIES) {
      if (cat.tools.some((t) => t.id === toolId)) {
        setExpanded((prev) => ({ ...prev, [cat.id]: true }))
        break
      }
    }
  }, [pathname])

  const searchLower = search.toLowerCase()
  const filtered = CATEGORIES.map((cat) => ({
    ...cat,
    tools: cat.tools.filter(
      (t) =>
        !searchLower ||
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
    ),
  })).filter((cat) => !searchLower || cat.tools.length > 0)

  const toggleCat = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-30 h-full w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800/80">
          <Link href="/" className="flex items-center gap-2.5 group" onClick={() => window.innerWidth < 1024 && onClose()}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">
                Dev<span className="text-indigo-400">Cipher</span>
              </p>
              <p className="text-[10px] text-zinc-500 leading-none mt-0.5">devcipher.dev</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-zinc-500 hover:text-white p-1 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-3 border-b border-zinc-800/80">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="w-full rounded-md bg-zinc-900 border border-zinc-800 pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {filtered.map((cat) => {
            const Icon = iconMap[cat.icon] ?? Hash
            const isExpanded = expanded[cat.id] ?? !!searchLower
            return (
              <div key={cat.id} className="mb-1">
                <button
                  onClick={() => toggleCat(cat.id)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800/60 hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-3.5 w-3.5', cat.color)} />
                    <span className="uppercase tracking-wider">{cat.label}</span>
                    <span className="text-[10px] text-zinc-600 font-normal">({cat.tools.length})</span>
                  </div>
                  {isExpanded
                    ? <ChevronDown className="h-3 w-3 text-zinc-600" />
                    : <ChevronRight className="h-3 w-3 text-zinc-600" />}
                </button>

                {isExpanded && (
                  <div className="ml-2 mt-0.5 space-y-0.5 border-l border-zinc-800 pl-2">
                    {cat.tools.map((tool) => {
                      const active = pathname === `/tools/${tool.id}`
                      return (
                        <Link
                          key={tool.id}
                          href={`/tools/${tool.id}`}
                          onClick={() => window.innerWidth < 1024 && onClose()}
                          className={cn(
                            'flex items-center rounded-md px-2.5 py-1.5 text-xs transition-colors',
                            active
                              ? 'bg-blue-600/20 text-blue-300 border border-blue-800/50'
                              : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'
                          )}
                        >
                          {tool.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-zinc-800/80 px-4 py-3">
          <p className="text-[10px] text-zinc-600 text-center">
            Built by <span className="text-zinc-400 font-medium">Animesh Shaw</span>
          </p>
        </div>
      </aside>
    </>
  )
}
