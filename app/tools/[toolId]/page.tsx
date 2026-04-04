import { notFound } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { findTool, findCategory, ALL_TOOLS, type ToolConfig } from '@/lib/tools-config'
import ToolRenderer from '@/components/tools/ToolRenderer'
import Link from 'next/link'
import { ChevronRight, ArrowRight } from 'lucide-react'

interface Props {
  params: Promise<{ toolId: string }>
}

export async function generateStaticParams() {
  return ALL_TOOLS.map((t) => ({ toolId: t.id }))
}

export async function generateMetadata({ params }: Props) {
  const { toolId } = await params
  const tool = findTool(toolId)
  if (!tool) return {}
  return {
    title: `${tool.name} — CryptoLab Online Tools`,
    description: `${tool.description} — Free online tool by Animesh Shaw`,
  }
}

function getRelatedTools(current: ToolConfig): ToolConfig[] {
  // Same category, excluding self — up to 8
  return ALL_TOOLS
    .filter((t) => t.category === current.category && t.id !== current.id)
    .slice(0, 8)
}

const CATEGORY_COLORS: Record<string, string> = {
  hash: 'text-purple-400 bg-purple-900/20 border-purple-800/40',
  cipher: 'text-blue-400 bg-blue-900/20 border-blue-800/40',
  asymmetric: 'text-amber-400 bg-amber-900/20 border-amber-800/40',
  encoding: 'text-emerald-400 bg-emerald-900/20 border-emerald-800/40',
  utilities: 'text-sky-400 bg-sky-900/20 border-sky-800/40',
}

export default async function ToolPage({ params }: Props) {
  const { toolId } = await params
  const tool = findTool(toolId)
  if (!tool) notFound()
  const category = findCategory(tool.category)
  const related = getRelatedTools(tool)

  return (
    <AppShell title={tool.name}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-zinc-500 mb-5">
        <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        {category && (
          <>
            <span className="text-zinc-400">{category.label}</span>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-zinc-200">{tool.name}</span>
      </nav>

      {/* Tool Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{tool.name}</h1>
        <p className="text-sm text-zinc-400 mt-1">{tool.description}</p>
      </div>

      {/* Tool Content */}
      <ToolRenderer toolId={toolId} />

      {/* Related Tools */}
      {related.length > 0 && (
        <div className="mt-10 pt-8 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300">
              More {category?.label} Tools
            </h2>
            <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {related.map((t) => (
              <Link
                key={t.id}
                href={`/tools/${t.id}`}
                className={`group flex flex-col gap-0.5 px-3 py-2.5 rounded-lg border text-xs transition-all hover:scale-[1.02] ${
                  CATEGORY_COLORS[t.category] ?? 'text-zinc-400 bg-zinc-900/20 border-zinc-800/40'
                } hover:brightness-125`}
              >
                <span className="font-medium truncate">{t.name}</span>
                <span className="text-[11px] opacity-60 truncate leading-tight">{t.description}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  )
}
