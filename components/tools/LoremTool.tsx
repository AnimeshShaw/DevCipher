'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Copy, Check, RefreshCw, Keyboard } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

const LOREM_WORDS = [
  'lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do',
  'eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim',
  'ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi',
  'aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit',
  'voluptate','velit','esse','cillum','eu','fugiat','nulla','pariatur','excepteur','sint',
  'occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt',
  'mollit','anim','id','est','laborum','curabitur','pretium','tincidunt','lacus','nunc',
  'volutpat','metus','vitae','nisl','blandit','viverra','nam','congue','tortor','interdum',
  'posuere','lorem','ante','diam','porttitor','lacus','faucibus','ornare','suspendisse',
]

const FIRST_NAMES = ['Alice','Bob','Charlie','Diana','Edward','Fiona','George','Hannah','Ivan','Julia','Kevin','Laura','Michael','Nina','Oscar','Paula','Quinn','Rachel','Samuel','Tara']
const LAST_NAMES = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Young','Lewis']
const DOMAINS = ['gmail.com','yahoo.com','hotmail.com','outlook.com','example.com','proton.me','icloud.com']
const COMPANIES = ['Acme Corp','TechVentures','GlobalSoft','InnovateCo','DataPlex','CloudNine','NetBridge','SwiftSystems','MegaTech','CyberLogic']
const TLDS = ['.com','.net','.org','.io','.dev','.app']

function rand(max: number) { return Math.floor(Math.random() * max) }
function pick<T>(arr: T[]): T { return arr[rand(arr.length)] }
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

function loremWords(n: number): string {
  return Array.from({ length: n }, () => pick(LOREM_WORDS)).join(' ')
}

function loremSentence(): string {
  const len = 8 + rand(12)
  return capitalize(loremWords(len)) + '.'
}

function loremParagraph(): string {
  const count = 3 + rand(4)
  return Array.from({ length: count }, () => loremSentence()).join(' ')
}

function genWords(n: number) { return loremWords(n) }
function genSentences(n: number) { return Array.from({ length: n }, loremSentence).join(' ') }
function genParagraphs(n: number) { return Array.from({ length: n }, loremParagraph).join('\n\n') }

function genNames(n: number) {
  return Array.from({ length: n }, () => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`).join('\n')
}

function genEmails(n: number) {
  return Array.from({ length: n }, () => {
    const fn = pick(FIRST_NAMES).toLowerCase()
    const ln = pick(LAST_NAMES).toLowerCase()
    const sep = pick(['.','_',''])
    return `${fn}${sep}${ln}@${pick(DOMAINS)}`
  }).join('\n')
}

function genNumbers(n: number, min: number, max: number) {
  return Array.from({ length: n }, () => String(min + rand(max - min + 1))).join('\n')
}

function genUrls(n: number) {
  return Array.from({ length: n }, () => {
    const path = loremWords(1 + rand(2)).replace(/\s/g, '-')
    return `https://www.${pick(COMPANIES).toLowerCase().replace(/\s/g, '')}${pick(TLDS)}/${path}`
  }).join('\n')
}

function genUUIDs(n: number) {
  return Array.from({ length: n }, () => {
    const s = () => Math.random().toString(16).slice(2).padEnd(8, '0').slice(0, 8)
    const b = () => Math.random().toString(16).slice(2).padEnd(4, '0').slice(0, 4)
    const variant = (8 + rand(4)).toString(16)
    return `${s()}-${b()}-4${b().slice(1)}-${variant}${b().slice(1)}-${s()}${b()}`
  }).join('\n')
}

function generate(type: string, count: number, startWithLorem: boolean, minNum: number, maxNum: number): string {
  switch (type) {
    case 'words': return (startWithLorem ? 'Lorem ipsum dolor sit amet, ' : '') + genWords(Math.max(0, count - (startWithLorem ? 5 : 0)))
    case 'sentences': return (startWithLorem ? 'Lorem ipsum dolor sit amet. ' : '') + genSentences(Math.max(1, count - (startWithLorem ? 1 : 0)))
    case 'paragraphs': {
      const para = genParagraphs(count)
      return startWithLorem ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n' + para : para
    }
    case 'names': return genNames(count)
    case 'emails': return genEmails(count)
    case 'numbers': return genNumbers(count, minNum, maxNum)
    case 'urls': return genUrls(count)
    case 'uuids': return genUUIDs(count)
    default: return ''
  }
}

const TYPE_OPTIONS = [
  { value: 'words', label: 'Words' },
  { value: 'sentences', label: 'Sentences' },
  { value: 'paragraphs', label: 'Paragraphs' },
  { value: 'names', label: 'Names' },
  { value: 'emails', label: 'Email Addresses' },
  { value: 'numbers', label: 'Numbers' },
  { value: 'urls', label: 'URLs' },
  { value: 'uuids', label: 'UUIDs' },
]

export default function LoremTool() {
  const [type, setType] = useState('paragraphs')
  const [count, setCount] = useState(3)
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [minNum, setMinNum] = useState(1)
  const [maxNum, setMaxNum] = useState(1000)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const run = () => {
    setOutput(generate(type, count, startWithLorem, minNum, maxNum))
  }

  const handleCopy = async () => {
    await copyToClipboard(output)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const isLorem = type === 'words' || type === 'sentences' || type === 'paragraphs'
  const isNumbers = type === 'numbers'

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[260px,1fr]">
        {/* Settings */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Settings</h3>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">
                Count <span className="text-zinc-600">({count})</span>
              </label>
              <input type="number" min={1} max={200} value={count}
                onChange={e => setCount(Math.max(1, Math.min(200, Number(e.target.value))))}
                className="w-full h-8 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-xs text-zinc-200 outline-none focus:border-zinc-500" />
            </div>

            {isNumbers && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Min</label>
                  <input type="number" value={minNum} onChange={e => setMinNum(Number(e.target.value))}
                    className="w-full h-8 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-xs text-zinc-200 outline-none focus:border-zinc-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Max</label>
                  <input type="number" value={maxNum} onChange={e => setMaxNum(Number(e.target.value))}
                    className="w-full h-8 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-xs text-zinc-200 outline-none focus:border-zinc-500" />
                </div>
              </div>
            )}

            {isLorem && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-300">Start with "Lorem ipsum"</p>
                  <p className="text-[10px] text-zinc-600">Classic opener</p>
                </div>
                <Switch checked={startWithLorem} onCheckedChange={setStartWithLorem} />
              </div>
            )}

            <Button onClick={run} className="w-full h-8 text-xs">
              <RefreshCw className="h-3.5 w-3.5" /> Generate
            </Button>
          </div>

          <div className="flex items-center gap-1.5 px-1 text-[11px] text-zinc-600">
            <Keyboard className="h-3 w-3" />
            <span><kbd className="font-mono">Ctrl</kbd>+<kbd className="font-mono">Enter</kbd> to generate</span>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
              <span className="text-xs font-medium text-zinc-400">Output</span>
              {output && (
                <button onClick={handleCopy} className="text-xs text-zinc-500 hover:text-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-800 flex items-center gap-1">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            <div className="min-h-[300px] p-4">
              {output ? (
                <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{output}</p>
              ) : (
                <p className="text-xs text-zinc-600 italic">Click Generate to create content...</p>
              )}
            </div>
          </div>

          {output && (
            <div className="flex items-center gap-4 px-1 text-[11px] text-zinc-600">
              <span>{output.split(/\s+/).filter(Boolean).length} words</span>
              <span>{output.length} chars</span>
              {(type === 'names' || type === 'emails' || type === 'numbers' || type === 'urls' || type === 'uuids') && (
                <span>{output.split('\n').filter(Boolean).length} items</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
