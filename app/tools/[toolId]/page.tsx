import { notFound } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { findTool, findCategory, ALL_TOOLS } from '@/lib/tools-config'
import ToolRenderer from '@/components/tools/ToolRenderer'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

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

export default async function ToolPage({ params }: Props) {
  const { toolId } = await params
  const tool = findTool(toolId)
  if (!tool) notFound()
  const category = findCategory(tool.category)

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
    </AppShell>
  )
}
