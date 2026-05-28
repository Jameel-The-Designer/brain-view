import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ConversationEntry } from '../types'

interface LogProps {
  entries: ConversationEntry[]
}

export default function ConversationLog({ entries }: LogProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const prevCount = useRef(entries.length)
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (entries.length > prevCount.current) {
      const newIds = new Set(entries.slice(prevCount.current).map((e) => e.id))
      setFlashIds(newIds)
      setTimeout(() => setFlashIds(new Set()), 800)
    }
    prevCount.current = entries.length
  }, [entries])

  const sorted = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section id="log" className="px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-[11px] font-mono tracking-[0.2em] text-white/25 uppercase mb-4">/ 06 Log</div>
        <h2 className="font-display text-4xl font-bold text-white/90 mb-2">
          Conversation Log
        </h2>
        <p className="text-xs text-white/25 font-mono mb-10">
          Claude → Supabase MCP
        </p>

        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {sorted.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden"
                style={flashIds.has(entry.id) ? { animation: 'flash-new 0.8s ease-out forwards' } : {}}
              >
                <button
                  onClick={() => toggle(entry.id)}
                  className="w-full text-left px-5 py-3.5 flex items-center gap-5 hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-xs font-mono text-white/25 whitespace-nowrap">
                    {new Date(entry.date).toLocaleDateString('en-ZA', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="font-medium text-white/80 flex-1 truncate">
                    {entry.topic}
                  </span>
                  <span className="text-[10px] font-mono text-white/20 flex-shrink-0">
                    {entry.source}
                  </span>
                  <svg
                    className={`w-4 h-4 text-white/20 transition-transform flex-shrink-0 ${expanded.has(entry.id) ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {expanded.has(entry.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 border-t border-white/[0.04] pt-3">
                        {entry.decision && (
                          <p className="text-sm text-white/45 leading-relaxed mb-3">
                            {entry.decision}
                          </p>
                        )}
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {entry.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-accent/[0.06] text-accent/60"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}
