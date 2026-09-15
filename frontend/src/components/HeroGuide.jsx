import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import api from '../services/api'

const SUGGESTIONS = [
  'How does the draw work?',
  'What happens when I enter a sixth score?',
  'How are prizes calculated?',
  'What does my charity contribution mean?',
  'How does winner verification work?'
]

export default function HeroGuide() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi — I'm Hero Guide. Ask me about draws, scores, charity, subscriptions, or winning."
    }
  ])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async (text) => {
    const msg = (text || input).trim()

    if (!msg || loading) return

    setInput('')
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: msg }
    ])

    setLoading(true)

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))

      const res = await api.post('/ai/chat', {
        message: msg,
        history
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.reply || res.data.message
        }
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I could not reach the server. Please try again in a moment.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1a5c4a] text-white shadow-lg flex items-center justify-center hover:bg-[#14473a] transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open Hero Guide"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[min(100vw-2rem,380px)] h-[min(70vh,520px)] bg-white rounded-2xl shadow-2xl border border-black/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-[#1a1a1a] text-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1a5c4a] flex items-center justify-center">
                <Sparkles size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  Hero Guide
                </p>
                <p className="text-xs text-white/50">
                  Always here to help
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f6f1]">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-[#1a5c4a] text-white rounded-br-md'
                        : 'bg-white border border-black/5 text-[#1a1a1a] rounded-bl-md'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-black/5 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm text-[#8a8a8a]">
                    Thinking…
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && !loading && (
              <div className="px-3 py-2 border-t border-black/5 flex gap-2 overflow-x-auto bg-white">
                {SUGGESTIONS.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-[#1a5c4a]/20 text-[#1a5c4a] hover:bg-[#1a5c4a]/5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
              className="p-3 border-t border-black/5 bg-white flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/30"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-[#1a5c4a] text-white flex items-center justify-center disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}