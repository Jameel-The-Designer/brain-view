import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Client } from '../types'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-accent/15 text-accent border-accent/25',
  proposal: 'bg-accent-2/15 text-accent-2 border-accent-2/25',
  lead: 'bg-amber-400/15 text-amber-400 border-amber-400/25',
  cold: 'bg-white/5 text-text-muted border-white/10',
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
    <section id="clients" className="px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-display text-3xl font-bold text-text-primary mb-6">
          Clients
        </h2>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'bg-bg-surface text-text-secondary border border-white/5 hover:border-white/10'
              }`}
            >
              {f}
              <span className="ml-1.5 text-xs text-text-muted">
                {f === 'All'
                  ? clients.length
                  : clients.filter((c) => c.status === f.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((client) => (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-bg-surface border border-white/5 rounded-md p-5 hover:-translate-y-1 transition-all duration-200 hover:shadow-[0_0_0_1px_oklch(0.72_0.18_165/0.3),0_8px_32px_oklch(0.72_0.18_165/0.15)]"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display font-semibold text-text-primary">
                    {client.name}
                  </h3>
                  <span className={`px-2 py-0.5 text-[11px] font-mono rounded-full border ${STATUS_COLORS[client.status] || STATUS_COLORS.cold}`}>
                    {client.status}
                  </span>
                </div>

                {client.mrr_zar != null && client.mrr_zar > 0 && (
                  <div className="text-lg font-display font-bold text-accent mb-3">
                    R{client.mrr_zar.toLocaleString()}
                    <span className="text-xs text-text-muted font-body font-normal">/mo</span>
                  </div>
                )}

                {client.deliverables && client.deliverables.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {client.deliverables.map((d) => (
                      <span key={d} className="px-2 py-0.5 text-[11px] font-mono rounded bg-bg-elevated text-text-secondary">
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                {client.stack && client.stack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {client.stack.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-accent/5 text-accent/70">
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
                    className="inline-flex items-center gap-1 mt-3 text-xs text-accent hover:text-accent-hover transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {client.url}
                  </a>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}
