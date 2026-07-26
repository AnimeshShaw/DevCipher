'use client'
import { Menu, ExternalLink, Code2, Search, Command } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
  onSearchClick?: () => void
  title?: string
}

export default function Header({ onMenuClick, onSearchClick, title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-13 items-center gap-3 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm px-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-zinc-400 hover:text-white p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1 min-w-0 flex items-center gap-4">
        {title && (
          <h1 className="text-sm font-semibold text-zinc-100 truncate">{title}</h1>
        )}
      </div>

      {/* Cmd + K Button */}
      {onSearchClick && (
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-all shadow-sm"
        >
          <Search className="h-3.5 w-3.5 text-blue-400" />
          <span className="hidden sm:inline">Search tools...</span>
          <span className="flex items-center gap-0.5 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500 font-mono border border-zinc-700/50">
            <Command className="h-2.5 w-2.5" />K
          </span>
        </button>
      )}

      <a
        href="https://github.com/AnimeshShaw/DevCipher"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors ml-1"
      >
        <Code2 className="h-4 w-4" />
        <span className="hidden sm:inline">GitHub</span>
        <ExternalLink className="h-3 w-3" />
      </a>
    </header>
  )
}
