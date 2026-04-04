'use client'
import { Menu, ExternalLink, Code2 } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
  title?: string
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-13 items-center gap-3 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm px-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-zinc-400 hover:text-white p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1 min-w-0">
        {title && (
          <h1 className="text-sm font-semibold text-zinc-100 truncate">{title}</h1>
        )}
      </div>
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <Code2 className="h-4 w-4" />
        <span className="hidden sm:inline">GitHub</span>
        <ExternalLink className="h-3 w-3" />
      </a>
    </header>
  )
}
