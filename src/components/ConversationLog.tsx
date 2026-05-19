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
      const newEntries = entries.slice(prevCount.current)
      const newIds = new Set(newEntries.map((e) => e.id))
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
    <section id="log" className="px-8 py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="mb-10">
          <span className="font-mono text-[10px] text-text-muted tracking-[0.2em]">06</span>
          <div className="flex items-baseline gap-4 mt-1">
            <h2 className="font-display text-4xl font-bold text-text-primary tracking-tight">
              Log
            </h2>
            <span className="font-mono text-[10px] text-text-muted">
              Claude sessions → Supabase MCP
            </span>
          </div>
          <div className="mt-4 h-px bg-bg-border" />
        </div>

        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {sorted.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className={`bg-bg-surface border border-bg-border overflow-hidden transition-colors duration-500 ${
                  flashIds.has(entry.id) ? 'border-accent/40' : ''
                }`}
                style={flashIds.has(entry.id) ? { animation: 'flash-new 0.8s ease-out forwards' } : {}}
              >
                <button
                  onClick={() => toggle(entry.id)}
                  className="w-full text-left px-5 py-3.5 flex items-center gap-5 hover:bg-bg-elevated/50 transition-colors"
                >
                  <span className="font-mono text-[10px] text-text-muted whitespace-nowrap w-20 flex-shrink-0">
                    {new Date(entry.date).toLocaleDateString('en-ZA', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                  <span className="font-medium text-sm text-text-primary flex-1 truncate">
                    {entry.topic}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted flex-shrink-0">
                    {entry.source}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-text-muted transition-transform flex-shrink-0 ${expanded.has(entry.id) ? 'rotate-180' : ''}`}
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
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 border-t border-bg-border pt-3 ml-20">
                        {entry.decision && (
                          <p className="text-sm text-text-secondary leading-relaxed mb-3">
                            {entry.decision}
                          </p>
                        )}
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {entry.tags.map((tag) => (
                              <span
                                key={tag}
                                className="font-mono text-[10px] text-accent/60"
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
