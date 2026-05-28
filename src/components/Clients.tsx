import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Client } from '../types'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-accent/10 text-accent border-accent/20',
  proposal: 'bg-accent-2/10 text-accent-2 border-accent-2/20',
  lead: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  cold: 'bg-white/[0.04] text-white/30 border-white/[0.06]',
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
    <section id="clients" className="px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-[11px] font-mono tracking-[0.2em] text-white/25 uppercase mb-4">/ 02 Clients</div>
        <h2 className="font-display text-4xl font-bold text-white/90 mb-8">
          Active Clients
        </h2>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'bg-white/[0.02] text-white/35 border border-white/[0.05] hover:border-white/10 hover:text-white/50'
              }`}
            >
              {f}
              <span className="ml-1.5 text-[11px] opacity-50">
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
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,0,120,0.08)] hover:border-accent/15"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display font-semibold text-white/85">
                    {client.name}
                  </h3>
                  <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full border ${STATUS_COLORS[client.status] || STATUS_COLORS.cold}`}>
                    {client.status}
                  </span>
                </div>

                {client.mrr_zar != null && client.mrr_zar > 0 && (
                  <div className="text-lg font-display font-bold text-accent mb-3">
                    R{client.mrr_zar.toLocaleString()}
                    <span className="text-[11px] text-white/20 font-body font-normal ml-0.5">/mo</span>
                  </div>
                )}

                {client.deliverables && client.deliverables.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {client.deliverables.map((d) => (
                      <span key={d} className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-white/[0.04] text-white/40">
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                {client.stack && client.stack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {client.stack.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-accent/[0.05] text-accent/50">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {client.notes && (
                  <p className="text-sm text-white/25 leading-relaxed line-clamp-2">
                    {client.notes}
                  </p>
                )}

                {client.url && (
                  <a
                    href={`https://${client.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-xs text-accent/70 hover:text-accent transition-colors"
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
