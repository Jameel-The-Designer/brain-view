import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Client } from '../types'

const STATUS_STYLES: Record<string, { pill: string; bar: string }> = {
  active:   { pill: 'bg-accent/10 text-accent border-accent/25',       bar: 'bg-accent' },
  proposal: { pill: 'bg-accent-2/10 text-accent-2 border-accent-2/25', bar: 'bg-accent-2' },
  lead:     { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/25', bar: 'bg-amber-400' },
  cold:     { pill: 'bg-bg-elevated text-text-muted border-bg-border',  bar: 'bg-bg-border' },
}

const FILTERS = ['All', 'Active', 'Proposal', 'Lead', 'Cold'] as const

interface ClientsProps {
  clients: Client[]
}

export default function Clients({ clients }: ClientsProps) {
  const [filter, setFilter] = useState<string>('All')

  const filtered = filter === 'All'
    ? clients
    : clients.filter((c) => c.status === filter.toLowerCase())

  return (
    <section id="clients" className="px-8 py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="mb-10">
          <span className="font-mono text-[10px] text-text-muted tracking-[0.2em]">02</span>
          <h2 className="font-display text-4xl font-bold text-text-primary mt-1 tracking-tight">
            Clients
          </h2>
          <div className="mt-4 h-px bg-bg-border" />
        </div>

        <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors whitespace-nowrap ${
                filter === f
                  ? 'bg-accent text-bg-primary'
                  : 'bg-bg-surface border border-bg-border text-text-muted hover:text-text-secondary hover:border-text-muted'
              }`}
            >
              {f}
              <span className="ml-1.5 opacity-60">
                {f === 'All'
                  ? clients.length
                  : clients.filter((c) => c.status === f.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((client) => {
              const styles = STATUS_STYLES[client.status] || STATUS_STYLES.cold
              return (
                <motion.div
                  key={client.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="bg-bg-surface border border-bg-border hover:border-text-muted transition-colors duration-150 group overflow-hidden"
                >
                  <div className={`h-0.5 ${styles.bar} w-full`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display font-semibold text-text-primary">
                        {client.name}
                      </h3>
                      <span className={`font-mono text-[10px] px-2 py-0.5 border tracking-[0.08em] uppercase ${styles.pill}`}>
                        {client.status}
                      </span>
                    </div>

                    {client.mrr_zar != null && client.mrr_zar > 0 && (
                      <div className="font-display text-xl font-bold text-accent mb-3 tabular-nums">
                        R{client.mrr_zar.toLocaleString()}
                        <span className="font-mono text-xs text-text-muted font-normal">/mo</span>
                      </div>
                    )}

                    {client.deliverables && client.deliverables.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {client.deliverables.map((d) => (
                          <span key={d} className="px-2 py-0.5 font-mono text-[10px] bg-bg-elevated text-text-secondary">
                            {d}
                          </span>
                        ))}
                      </div>
                    )}

                    {client.stack && client.stack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {client.stack.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 font-mono text-[10px] text-accent/60">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {client.notes && (
                      <p className="text-sm text-text-muted leading-relaxed line-clamp-2">
                        {client.notes}
                      </p>
                    )}

                    {client.url && (
                      <a
                        href={`https://${client.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-3 font-mono text-[10px] text-accent hover:text-accent-hover transition-colors"
                      >
                        ↗ {client.url}
                      </a>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}
