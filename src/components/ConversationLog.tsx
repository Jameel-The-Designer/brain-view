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
    <section id="log" className="px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-10">
          <span className="font-mono text-[10px] text-white/30 tracking-[0.2em]">/ 06</span>
          <div className="flex items-baseline gap-4 mt-1">
            <h2 className="font-display text-4xl font-black text-white tracking-tight uppercase">Log</h2>
            <span className="font-mono text-[10px] text-white/30">Claude → Supabase MCP</span>
          </div>
          <div className="mt-4 h-px" style={{ background: 'oklch(1 0 0 / 0.10)' }} />
        </div>

        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {sorted.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-2xl overflow-hidden"
                style={flashIds.has(entry.id) ? { animation: 'flash-new 0.8s ease-out forwards' } : {}}
              >
                <button
                  onClick={() => toggle(entry.id)}
                  className="w-full text-left px-5 py-3.5 flex items-center gap-5 hover:bg-white/[0.04] transition-colors"
                >
                  <span className="font-mono text-[10px] text-white/30 whitespace-nowrap w-16 flex-shrink-0">
                    {new Date(entry.date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}
                  </span>
                  <span className="font-semibold text-sm text-white flex-1 truncate">{entry.topic}</span>
                  <span className="font-mono text-[10px] text-white/30 flex-shrink-0">{entry.source}</span>
                  <svg
                    className={`w-3.5 h-3.5 text-white/30 transition-transform flex-shrink-0 ${expanded.has(entry.id) ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
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
                      <div
                        className="px-5 pb-4 pt-3 ml-20"
                        style={{ borderTop: '1px solid oklch(1 0 0 / 0.08)' }}
                      >
                        {entry.decision && (
                          <p className="text-sm text-text-secondary leading-relaxed mb-3">{entry.decision}</p>
                        )}
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {entry.tags.map((tag) => (
                              <span key={tag} className="font-mono text-[10px] text-accent/60">#{tag}</span>
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
