import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, Plus, History, Trash2, X } from 'lucide-react'
import SEO from '@/components/common/SEO'
import ChatMessage from '@/components/chat/ChatMessage'
import SuggestedQuestions from '@/components/chat/SuggestedQuestions'
import { useApp } from '@/contexts/AppContext'
import { streamChatCompletion, buildMessagesForAPI } from '@/lib/openrouter'
import { getFingerprint, generateId, cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { Message, Conversation, Attachment } from '@/types'

export default function ChatPage() {
  const { aiSettings } = useApp()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const fingerprint = useRef(getFingerprint())

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isStreaming, scrollToBottom])

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_fingerprint', fingerprint.current)
      .order('updated_at', { ascending: false })
      .limit(30)
    if (data) setConversations(data as Conversation[])
  }

  const loadConversation = async (id: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })
    if (data) {
      setMessages(data as Message[])
      setConversationId(id)
      setShowHistory(false)
      setSuggestions([])
    }
  }

  const startNewChat = () => {
    setMessages([])
    setConversationId(null)
    setSuggestions([])
    setAttachments([])
    setShowHistory(false)
  }

  const deleteConversation = async (id: string) => {
    await supabase.from('messages').delete().eq('conversation_id', id)
    await supabase.from('conversations').delete().eq('id', id)
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (conversationId === id) startNewChat()
  }

  const ensureConversation = async (firstMessage: string): Promise<string> => {
    if (conversationId) return conversationId
    const title = firstMessage.slice(0, 60) + (firstMessage.length > 60 ? '…' : '')
    const id = generateId()
    const { error } = await supabase.from('conversations').insert({
      id,
      title,
      user_fingerprint: fingerprint.current
    })
    if (!error) {
      setConversationId(id)
      setConversations((prev) => [
        { id, title, user_fingerprint: fingerprint.current, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ...prev
      ])
    }
    return id
  }

  const saveMessage = async (convId: string, msg: Omit<Message, 'id' | 'created_at'>) => {
    const id = generateId()
    await supabase.from('messages').insert({
      id,
      ...msg,
      conversation_id: convId
    })
    return id
  }

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content && attachments.length === 0) return
    if (isStreaming) return

    setInput('')
    setSuggestions([])
    const userMsg: Message = {
      id: generateId(),
      conversation_id: conversationId || '',
      role: 'user',
      content,
      attachments: attachments.length ? attachments : null,
      model_used: null,
      tokens_used: null,
      created_at: new Date().toISOString()
    }
    setMessages((prev) => [...prev, userMsg])
    setAttachments([])
    setIsStreaming(true)

    const convId = await ensureConversation(content)
    await saveMessage(convId, {
      conversation_id: convId,
      role: 'user',
      content,
      attachments: userMsg.attachments,
      model_used: null,
      tokens_used: null
    })

    const apiMessages = buildMessagesForAPI(
      messages,
      content,
      userMsg.attachments || undefined
    )

    const assistantId = generateId()
    let fullContent = ''
    let modelUsed = aiSettings?.default_model || 'openai/gpt-4o-mini'

    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        conversation_id: convId,
        role: 'assistant',
        content: '',
        attachments: null,
        model_used: null,
        tokens_used: null,
        created_at: new Date().toISOString()
      }
    ])

    // Resolve API key: prefer dashboard setting, fallback to env
    const apiKey =
      (aiSettings as { api_key?: string })?.api_key ||
      aiSettings?.api_key_encrypted ||
      import.meta.env.VITE_OPENROUTER_API_KEY ||
      ''

    try {
      for await (const chunk of streamChatCompletion({
        messages: apiMessages,
        settings: {
          temperature: aiSettings?.temperature ?? 0.7,
          max_tokens: aiSettings?.max_tokens ?? 2048,
          system_prompt: aiSettings?.system_prompt || ''
        },
        apiKey,
        model: modelUsed
      })) {
        if (chunk.error) {
          fullContent = `⚠️ ${chunk.error}`
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m))
          )
          break
        }
        if (chunk.content) {
          fullContent += chunk.content
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m))
          )
        }
        if (chunk.model) modelUsed = chunk.model
        if (chunk.done) break
      }
    } catch (e) {
      fullContent = '⚠️ Something went wrong. Please try again.'
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m))
      )
    }

    await saveMessage(convId, {
      conversation_id: convId,
      role: 'assistant',
      content: fullContent,
      attachments: null,
      model_used: modelUsed,
      tokens_used: null
    })

    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', convId)

    setIsStreaming(false)

    // Generate suggestions
    if (aiSettings?.enable_suggestions !== false && fullContent && !fullContent.startsWith('⚠️')) {
      generateSuggestions(fullContent)
    }
  }

  const generateSuggestions = async (lastReply: string) => {
    // Simple local heuristics + optional AI later
    const defaults = [
      'What size generator do I need for my home?',
      'How to calculate solar panel requirements?',
      'Difference between hybrid and off-grid inverters?'
    ]
    // Keep dynamic based on last reply keywords
    const lower = lastReply.toLowerCase()
    const dynamic: string[] = []
    if (lower.includes('generator') || lower.includes('fuel')) {
      dynamic.push('Does it consume much fuel?', 'What maintenance is required?', 'How to size the ATS?')
    } else if (lower.includes('solar') || lower.includes('panel')) {
      dynamic.push('How many batteries do I need?', 'What inverter type is best?', 'Can I add more panels later?')
    } else if (lower.includes('battery') || lower.includes('inverter')) {
      dynamic.push('LiFePO4 vs AGM comparison?', 'How to protect against over-discharge?', 'Recommended cable size?')
    }
    setSuggestions(dynamic.length ? dynamic.slice(0, 3) : defaults)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    // For production: upload to Supabase Storage
    // Here we create object URLs for images (demo-ready for local)
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file)
      const type = file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'video'
      setAttachments((prev) => [
        ...prev,
        { type: type as Attachment['type'], url, name: file.name, size: file.size, mime: file.type }
      ])
    })
    e.target.value = ''
  }

  return (
    <>
      <SEO title="AI Chat" description="Ask Future Power AI anything about generators, solar energy, inverters and power solutions." />
      <div className="flex flex-col h-[calc(100dvh-3.5rem)] max-w-3xl mx-auto w-full relative">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
          <button
            onClick={startNewChat}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
          >
            <Plus className="h-3.5 w-3.5" />
            New chat
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
          >
            <History className="h-3.5 w-3.5" />
            History
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center px-4"
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 flex items-center justify-center mb-6 border border-white/5">
                <span className="text-2xl">⚡</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Future Power AI</h2>
              <p className="text-sm text-muted-foreground max-w-sm mb-8">
                Expert assistance for generators, solar systems, inverters, batteries, ATS & AVR.
              </p>
              <div className="grid gap-2 w-full max-w-md">
                {[
                  'What size generator for a 5kW load?',
                  'How to size a solar system for a home?',
                  'LiFePO4 vs AGM batteries comparison'
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left text-sm px-4 py-3 rounded-xl glass hover:bg-white/5 transition-colors border border-border/50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} isStreaming={isStreaming && msg.role === 'assistant' && msg === messages[messages.length - 1]} />
            ))}
          </AnimatePresence>

          {suggestions.length > 0 && !isStreaming && (
            <SuggestedQuestions suggestions={suggestions} onSelect={handleSend} />
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="px-4 pb-4 safe-bottom">
          {attachments.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {attachments.map((a, i) => (
                <div key={i} className="relative group">
                  {a.type === 'image' ? (
                    <img src={a.url} alt={a.name} className="h-16 w-16 rounded-lg object-cover border border-border" />
                  ) : (
                    <div className="h-16 px-3 rounded-lg glass flex items-center text-xs">{a.name}</div>
                  )}
                  <button
                    onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="glass rounded-2xl border border-border/60 flex items-end gap-1 p-1.5 shadow-soft">
            <button
              onClick={() => fileRef.current?.click()}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors shrink-0"
              aria-label="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*,application/pdf,video/*" multiple className="hidden" onChange={handleFile} />
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about generators, solar, batteries..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm py-2.5 px-1 max-h-32 placeholder:text-muted"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSend()}
              disabled={isStreaming || (!input.trim() && !attachments.length)}
              className={cn(
                'p-2.5 rounded-xl shrink-0 transition-colors',
                input.trim() || attachments.length
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'text-muted-foreground'
              )}
              aria-label="Send"
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* History drawer */}
        <AnimatePresence>
          {showHistory && (
            <>
              <motion.div
                className="fixed inset-0 z-50 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHistory(false)}
              />
              <motion.div
                className="fixed top-0 left-0 z-50 h-full w-[min(320px,85vw)] glass-strong border-r border-border flex flex-col"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              >
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <span className="font-semibold text-sm">Conversations</span>
                  <button onClick={() => setShowHistory(false)} className="p-2 rounded-xl hover:bg-white/5">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {conversations.length === 0 && (
                    <p className="text-xs text-muted text-center py-8">No conversations yet</p>
                  )}
                  {conversations.map((c) => (
                    <div
                      key={c.id}
                      className="group flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer"
                      onClick={() => loadConversation(c.id)}
                    >
                      <span className="flex-1 text-sm truncate">{c.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteConversation(c.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-danger/20 text-muted-foreground hover:text-danger transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
