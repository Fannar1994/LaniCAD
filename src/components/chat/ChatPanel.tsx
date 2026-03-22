import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { getLocalReply } from '@/lib/chat/ai-engine'
import type { ChatMessage, CadAction } from '@/lib/chat/types'
import { sendChatMessage } from '@/lib/db'
import { isApiReady } from '@/lib/api-config'
import { useChatCad } from '@/contexts/ChatCadContext'
import { cn } from '@/lib/utils'

const QUICK_SUGGESTIONS = [
  { label: '🏗️ Teikna girðingu', text: 'Teikna girðingu 20m' },
  { label: '📐 Vinnupallur', text: 'Settu vinnupall 15m x 8m' },
  { label: '🧱 Steypumót', text: 'Upplýsingar um steypumót' },
  { label: '🔒 Öryggisreglur', text: 'Öryggisreglur vinnupalla' },
  { label: '💰 Verð', text: 'Verð á hjólapöllum' },
  { label: '❓ Hjálp', text: 'Hvað getur þú gert?' },
]

/** Simple markdown-to-JSX renderer for chat messages */
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let tableRows: string[][] = []
  let inTable = false

  function flushTable() {
    if (tableRows.length < 2) { inTable = false; tableRows = []; return }
    const headers = tableRows[0]
    const dataRows = tableRows.slice(2) // skip separator row
    elements.push(
      <div key={`tbl-${elements.length}`} className="my-1 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              {headers.map((h, j) => <th key={j} className="px-1.5 py-0.5 text-left font-semibold">{formatInline(h.trim())}</th>)}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, i) => (
              <tr key={i} className="border-b border-gray-200 last:border-0">
                {row.map((cell, j) => <td key={j} className="px-1.5 py-0.5">{formatInline(cell.trim())}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    tableRows = []
    inTable = false
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Table row
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true
      const cells = line.trim().split('|').filter(Boolean)
      tableRows.push(cells)
      continue
    }

    if (inTable) flushTable()

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={`br-${i}`} className="h-1" />)
      continue
    }

    // Heading
    if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={i} className="font-bold text-gray-900 mt-1">{line.slice(2, -2)}</p>)
      continue
    }

    // Bullet
    if (line.match(/^[•\-\*]\s/)) {
      elements.push(<p key={i} className="pl-2">{formatInline(line.slice(2))}</p>)
      continue
    }

    // Regular line
    elements.push(<p key={i}>{formatInline(line)}</p>)
  }

  if (inTable) flushTable()

  return elements
}

/** Format inline bold, italic, emoji */
function formatInline(text: string): React.ReactNode {
  // Split on bold markers (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-gray-600">{part.slice(1, -1)}</em>
    }
    return part
  })
}

/** Timeout-protected fetch with 5s limit */
function fetchWithTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ])
}

interface DisplayMessage {
  role: 'user' | 'assistant'
  content: string
  actions?: CadAction[]
}

export function ChatPanel() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { dispatchCadAction } = useChatCad()

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  // Convert display messages to ChatMessage format for the engine
  const chatMessages = useMemo<ChatMessage[]>(() =>
    messages.map(m => ({ role: m.role, content: m.content })),
    [messages],
  )

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const userMsg: DisplayMessage = { role: 'user', content: msg }
    const updatedDisplay = [...messages, userMsg]
    const updatedChat: ChatMessage[] = [...chatMessages, { role: 'user' as const, content: msg }]
    setMessages(updatedDisplay)
    setInput('')
    setLoading(true)

    try {
      let replyContent: string
      let actions: CadAction[] = []

      if (isApiReady()) {
        // Try server API with 5s timeout, fall back to local engine
        try {
          replyContent = await fetchWithTimeout(sendChatMessage(
            updatedChat.filter(m => m.role !== 'system').map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
          ))
        } catch {
          const result = getLocalReply(updatedChat)
          replyContent = result.content
          actions = result.actions
        }
      } else {
        const result = getLocalReply(updatedChat)
        replyContent = result.content
        actions = result.actions
      }

      setMessages(prev => [...prev, { role: 'assistant', content: replyContent, actions }])
    } catch {
      const result = getLocalReply(updatedChat)
      setMessages(prev => [...prev, { role: 'assistant', content: result.content, actions: result.actions }])
    } finally {
      setLoading(false)
    }
  }

  function handleAction(action: CadAction) {
    if (action.type === 'navigate') {
      const path = action.params.path as string
      if (path) navigate(path)
      return
    }
    if (action.type === 'set_equipment') {
      const equipNav = action.params.navigate as string
      if (equipNav) navigate(equipNav)
      return
    }
    // CAD drawing actions — dispatch to DrawingPage via context
    dispatchCadAction(action)
    navigate('/drawing')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-dark text-brand-accent shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Opna spjall"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[560px] w-[400px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-brand-dark px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-accent font-condensed text-xs font-bold text-brand-dark">
                LC
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">LániCAD AI</h3>
                <p className="text-[10px] text-gray-300">Byggingarverkfræðiaðstoð</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-gray-300 hover:bg-white/10 hover:text-white"
              aria-label="Loka spjalli"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-2 pt-6 text-center text-sm text-gray-400">
                <Bot className="h-10 w-10 text-brand-accent" />
                <p className="font-medium text-gray-600">Hæ! Ég er LániCAD AI.</p>
                <p className="text-xs">Byggingarverkfræðiaðstoðarmaður — teikningar, efnisáætlanir, öryggisreglur og verð.</p>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {QUICK_SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleSend(s.text)}
                      className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-gray-600 transition-colors hover:border-brand-accent hover:bg-brand-accent/5 hover:text-gray-900"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={cn(
                    'flex gap-2',
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                      msg.role === 'user'
                        ? 'bg-brand-dark text-white'
                        : 'bg-brand-accent text-brand-dark'
                    )}
                  >
                    {msg.role === 'user' ? (
                      <User className="h-3.5 w-3.5" />
                    ) : (
                      <Bot className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'max-w-[300px] rounded-lg px-3 py-2 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-brand-dark text-white'
                        : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="chat-md space-y-0.5 text-[13px]">
                        {renderMarkdown(msg.content)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="ml-8 mt-1.5 flex flex-wrap gap-1.5">
                    {msg.actions.map((action, j) => (
                      <button
                        key={j}
                        onClick={() => handleAction(action)}
                        className="rounded-md border border-brand-accent/30 bg-brand-accent/10 px-2.5 py-1 text-[11px] font-medium text-brand-dark transition-colors hover:bg-brand-accent/25 hover:border-brand-accent/50"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-accent text-brand-dark">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Hugsa...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestion chips when there are messages */}
          {messages.length > 0 && !loading && (
            <div className="flex gap-1 overflow-x-auto border-t border-gray-100 px-3 py-1.5">
              {QUICK_SUGGESTIONS.slice(0, 4).map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSend(s.text)}
                  className="shrink-0 rounded-full border border-gray-200 px-2 py-0.5 text-[10px] text-gray-500 hover:border-brand-accent hover:text-gray-700"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Spurðu um búnað, teikningar, öryggisreglur..."
                rows={1}
                className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-dark text-brand-accent transition-colors hover:bg-brand-dark/90 disabled:opacity-40"
                aria-label="Senda"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
