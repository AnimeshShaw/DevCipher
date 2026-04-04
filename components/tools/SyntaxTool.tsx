'use client'
import React, { useState, useEffect, useRef } from 'react'
import { copyToClipboard } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Copy, Check, Code2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'r',
  'sql', 'html', 'css', 'scss', 'json', 'xml', 'yaml', 'toml',
  'markdown', 'bash', 'shell', 'powershell', 'dockerfile',
  'graphql', 'solidity', 'haskell', 'lua', 'perl', 'elixir',
]

const THEMES = [
  { id: 'github-dark', label: 'GitHub Dark' },
  { id: 'atom-one-dark', label: 'Atom One Dark' },
  { id: 'monokai', label: 'Monokai' },
  { id: 'vs2015', label: 'Visual Studio 2015' },
  { id: 'tokyo-night-dark', label: 'Tokyo Night' },
  { id: 'nord', label: 'Nord' },
  { id: 'obsidian', label: 'Obsidian' },
  { id: 'night-owl', label: 'Night Owl' },
  { id: 'agate', label: 'Agate' },
  { id: 'github', label: 'GitHub Light' },
  { id: 'xcode', label: 'Xcode Light' },
  { id: 'androidstudio', label: 'Android Studio' },
]

export default function SyntaxTool() {
  const [code, setCode] = useState('')
  const [highlighted, setHighlighted] = useState('')
  const [lang, setLang] = useState('javascript')
  const [theme, setTheme] = useState('github-dark')
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [copied, setCopied] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hljs, setHljs] = useState<any>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const themeLinkRef = useRef<HTMLLinkElement | null>(null)

  // Load highlight.js
  useEffect(() => {
    import('highlight.js').then((mod) => setHljs(mod.default ?? mod))
  }, [])

  // Load theme CSS
  useEffect(() => {
    if (themeLinkRef.current) themeLinkRef.current.remove()
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${theme}.min.css`
    document.head.appendChild(link)
    themeLinkRef.current = link
    return () => { link.remove() }
  }, [theme])

  const highlight = () => {
    if (!hljs || !code) { setHighlighted(''); return }
    try {
      const result = hljs.highlight(code, { language: lang, ignoreIllegals: true })
      setHighlighted(result.value)
    } catch {
      // Fallback to auto-detect
      const result = hljs.highlightAuto(code)
      setHighlighted(result.value)
    }
  }

  useEffect(() => { if (autoUpdate) highlight() }, [code, lang, hljs, autoUpdate])

  const handleCopy = async () => {
    await copyToClipboard(code)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyHighlighted = async () => {
    if (outputRef.current) {
      await copyToClipboard(outputRef.current.outerHTML)
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadHtml = () => {
    if (!highlighted) return
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${theme}.min.css"><style>body{margin:0;background:#0d1117}pre{margin:0;padding:1rem}code{font-family:monospace;font-size:14px}</style></head><body><pre><code class="hljs language-${lang}">${highlighted}</code></pre></body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `highlighted.html`; a.click()
    URL.revokeObjectURL(url)
  }

  const lines = code.split('\n').length

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400">Language</label>
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l} value={l} className="text-xs capitalize">{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400">Theme</label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {THEMES.map((t) => (
                <SelectItem key={t.id} value={t.id} className="text-xs">{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-zinc-400">Line Numbers</label>
          <Switch checked={showLineNumbers} onCheckedChange={setShowLineNumbers} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400">Auto</label>
          <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Input */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5" /> Source Code
            </span>
            <button onClick={handleCopy} disabled={!code} className="text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30 px-2 py-0.5 rounded hover:bg-zinc-800 flex items-center gap-1">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`// Paste your ${lang} code here...`}
            className="min-h-[400px] border-0 rounded-none bg-transparent focus-visible:ring-0"
          />
        </div>

        {/* Output */}
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
            <span className="text-xs font-medium text-zinc-400">
              Highlighted — {lines} line{lines !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" onClick={downloadHtml} disabled={!highlighted} title="Download HTML">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="overflow-auto min-h-[400px]" style={{ background: '#0d1117' }}>
            {highlighted ? (
              <div className="flex" ref={outputRef}>
                {showLineNumbers && (
                  <div className="flex flex-col text-right pr-3 pl-3 py-4 text-zinc-600 text-xs select-none border-r border-zinc-800/50 min-w-[40px]" style={{ fontFamily: 'monospace', lineHeight: '1.5' }}>
                    {code.split('\n').map((_, i) => (
                      <span key={i}>{i + 1}</span>
                    ))}
                  </div>
                )}
                <pre className="flex-1 overflow-x-auto py-4 px-4 text-xs leading-relaxed" style={{ margin: 0, background: 'transparent' }}>
                  <code
                    className={`hljs language-${lang}`}
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                  />
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[400px] text-zinc-600 text-sm">
                <div className="text-center">
                  <Code2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Highlighted code will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
