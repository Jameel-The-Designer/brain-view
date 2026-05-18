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
      setTimeout(() => setFlashIds(new Set()), 600)
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
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-3xl font-bold text-text-primary">
            Log
          </h2>
        </div>
        <p className="text-xs text-text-muted font-mono mb-8">
          Updated from Claude sessions via Supabase MCP
        </p>

        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {sorted.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`bg-bg-surface border border-white/5 rounded-md overflow-hidden transition-colors ${
                  flashIds.has(entry.id) ? 'bg-accent/[0.08]' : ''
                }`}
              >
                <button
                  onClick={() => toggle(entry.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-xs font-mono text-text-muted whitespace-nowrap">
                    {new Date(entry.date).toLocaleDateString('en-ZA', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="font-medium text-text-primary flex-1 truncate">
                    {entry.topic}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">
                    {entry.source}
                  </span>
                  <svg
                    className={`w-4 h-4 text-text-muted transition-transform ${expanded.has(entry.id) ? 'rotate-180' : ''}`}
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
                      <div className="px-5 pb-4 border-t border-white/5 pt-3">
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
                                className="px-2 py-0.5 text-[11px] font-mono rounded bg-accent/8 text-accent/70"
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
