import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl font-bold text-zinc-700 mb-4">404</div>
        <h1 className="text-xl font-semibold text-zinc-300 mb-2">Tool not found</h1>
        <p className="text-zinc-500 mb-6">This tool doesn&apos;t exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          <Search className="h-4 w-4" />
          Browse all tools
        </Link>
      </div>
    </div>
  )
}
