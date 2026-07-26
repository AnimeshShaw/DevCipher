'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Check, Terminal, Code2 } from 'lucide-react'

interface ParsedCurl {
  method: string
  url: string
  headers: Record<string, string>
  body: string
}

function parseCurl(curlCmd: string): ParsedCurl {
  const clean = curlCmd.trim().replace(/\\\n/g, ' ')
  let method = 'GET'
  let url = ''
  const headers: Record<string, string> = {}
  let body = ''

  // Match method
  const methodMatch = clean.match(/(?:-X|--request)\s+([A-Z]+)/i)
  if (methodMatch) method = methodMatch[1].toUpperCase()

  // Match headers
  const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/gi
  let hMatch
  while ((hMatch = headerRegex.exec(clean)) !== null) {
    const parts = hMatch[1].split(':')
    if (parts.length >= 2) {
      const k = parts[0].trim()
      const v = parts.slice(1).join(':').trim()
      headers[k] = v
    }
  }

  // Match data/body
  const bodyMatch = clean.match(/(?:-d|--data|--data-raw|--data-binary)\s+["']([\s\S]*?)["']/)
  if (bodyMatch) {
    body = bodyMatch[1]
    if (method === 'GET') method = 'POST'
  }

  // Match URL (first string starting with http:// or https:// or quoted)
  const urlMatch = clean.match(/https?:\/\/[^\s"']+/i)
  if (urlMatch) {
    url = urlMatch[0]
  }

  return { method, url: url || 'https://api.example.com/data', headers, body }
}

function generateJsFetch(parsed: ParsedCurl): string {
  const options: string[] = [`method: '${parsed.method}'`]
  if (Object.keys(parsed.headers).length > 0) {
    options.push(`headers: ${JSON.stringify(parsed.headers, null, 4)}`)
  }
  if (parsed.body) {
    options.push(`body: JSON.stringify(${parsed.body})`)
  }

  return `fetch('${parsed.url}', {
  ${options.join(',\n  ')}
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`
}

function generatePythonRequests(parsed: ParsedCurl): string {
  let code = `import requests\n\nurl = "${parsed.url}"\n`
  if (Object.keys(parsed.headers).length > 0) {
    code += `headers = ${JSON.stringify(parsed.headers, null, 4)}\n`
  }
  if (parsed.body) {
    code += `payload = ${parsed.body}\n`
  }

  const kwargs: string[] = []
  if (Object.keys(parsed.headers).length > 0) kwargs.push('headers=headers')
  if (parsed.body) kwargs.push('json=payload')

  const kwargsStr = kwargs.length > 0 ? `, ${kwargs.join(', ')}` : ''
  code += `\nresponse = requests.${parsed.method.toLowerCase()}(url${kwargsStr})\nprint(response.json())`
  return code
}

function generateGoHttp(parsed: ParsedCurl): string {
  let code = `package main

import (
	"fmt"
	"io"
	"net/http"
	"strings"
)

func main() {
	url := "${parsed.url}"
`
  if (parsed.body) {
    code += `	payload := strings.NewReader(\`${parsed.body}\`)\n`
    code += `	req, _ := http.NewRequest("${parsed.method}", url, payload)\n`
  } else {
    code += `	req, _ := http.NewRequest("${parsed.method}", url, nil)\n`
  }

  for (const [k, v] of Object.entries(parsed.headers)) {
    code += `	req.Header.Add("${k}", "${v}")\n`
  }

  code += `
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}`
  return code
}

function generateNodeAxios(parsed: ParsedCurl): string {
  return `const axios = require('axios');

axios({
  method: '${parsed.method.toLowerCase()}',
  url: '${parsed.url}',
  headers: ${JSON.stringify(parsed.headers, null, 2)},
  ${parsed.body ? `data: ${parsed.body}` : ''}
})
  .then(res => console.log(res.data))
  .catch(err => console.error(err));`
}

export default function CurlTool() {
  const [curlInput, setCurlInput] = useState(`curl -X POST "https://api.example.com/v1/users" \\
  -H "Authorization: Bearer token_xyz123" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Jane Doe", "role": "Developer"}'`)

  const [language, setLanguage] = useState<'js' | 'python' | 'go' | 'axios'>('js')
  const [outputCode, setOutputCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!curlInput.trim()) {
      setOutputCode('')
      return
    }
    const parsed = parseCurl(curlInput)
    if (language === 'js') setOutputCode(generateJsFetch(parsed))
    else if (language === 'python') setOutputCode(generatePythonRequests(parsed))
    else if (language === 'go') setOutputCode(generateGoHttp(parsed))
    else if (language === 'axios') setOutputCode(generateNodeAxios(parsed))
  }, [curlInput, language])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-blue-400" /> cURL Command Input
          </label>
          <button
            onClick={() => setCurlInput('')}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Clear
          </button>
        </div>
        <Textarea
          value={curlInput}
          onChange={(e) => setCurlInput(e.target.value)}
          placeholder="Paste cURL command here..."
          className="font-mono text-xs min-h-[110px] bg-zinc-950 border-zinc-800"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-emerald-400" />
          <span className="text-xs text-zinc-300 font-medium">Target Language:</span>
        </div>
        <Select value={language} onValueChange={(v) => setLanguage(v as any)}>
          <SelectTrigger className="h-8 text-xs min-w-[180px] bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="js" className="text-xs">JavaScript (fetch)</SelectItem>
            <SelectItem value="python" className="text-xs">Python (requests)</SelectItem>
            <SelectItem value="go" className="text-xs">Go (net/http)</SelectItem>
            <SelectItem value="axios" className="text-xs">Node.js (axios)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {outputCode && (
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Converted Code</span>
            <Button size="sm" variant="ghost" onClick={copyToClipboard} className="h-7 text-xs text-emerald-400">
              {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? 'Copied' : 'Copy Code'}
            </Button>
          </div>
          <pre className="font-mono text-xs text-emerald-100 bg-zinc-950 p-3 rounded border border-emerald-800/30 overflow-x-auto whitespace-pre leading-relaxed">
            {outputCode}
          </pre>
        </div>
      )}
    </div>
  )
}
