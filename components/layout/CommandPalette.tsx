'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_TOOLS, findCategory } from '@/lib/tools-config'
import { Search, X, Command, ArrowRight, CornerDownLeft } from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredTools = ALL_TOOLS.filter((t) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q))) ||
      (t.keywords && t.keywords.toLowerCase().includes(q))
    )
  }).slice(0, 10)

  const handleSelect = useCallback(
    (toolId: string) => {
      onClose()
      setQuery('')
      router.push(`/tools/${toolId}`)
    },
    [onClose, router]
  )

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else setQuery('')
      }
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredTools.length))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % Math.max(1, filteredTools.length))
      } else if (e.key === 'Enter' && filteredTools[selectedIndex]) {
        e.preventDefault()
        handleSelect(filteredTools[selectedIndex].id)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, filteredTools, selectedIndex, handleSelect])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Bar Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
          <Search className="h-4 w-4 text-blue-400 flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools... (e.g. SHA256, JWT, RSA, PQC, Base64)"
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-800/80 px-2 py-1 rounded border border-zinc-700/50"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-zinc-900">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, idx) => {
              const cat = findCategory(tool.category)
              const isSelected = idx === selectedIndex
              return (
                <button
                  key={tool.id}
                  onClick={() => handleSelect(tool.id)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 text-white border border-blue-800/60'
                      : 'text-zinc-300 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span
                      className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded border ${
                        cat?.color ?? 'text-zinc-400'
                      } bg-zinc-900/80 border-zinc-800`}
                    >
                      {cat?.label ?? tool.category}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-zinc-100 truncate">{tool.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{tool.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-500 flex-shrink-0">
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">
                        Open <CornerDownLeft className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </button>
              )
            })
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching tools found for "{query}"
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Command className="h-3 w-3 text-zinc-400" /> + <kbd className="font-mono">K</kbd> to toggle anywhere
          </span>
          <span className="flex items-center gap-2">
            <span>Use ↑ ↓ to navigate</span>
            <span>↵ to select</span>
          </span>
        </div>
      </div>
    </div>
  )
}
