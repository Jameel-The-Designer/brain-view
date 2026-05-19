import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Client } from '../types'

const STATUS_ACCENT: Record<string, string> = {
  active:   'var(--color-accent)',
  proposal: 'var(--color-accent-2)',
  lead:     '#f59e0b',
  cold:     'oklch(1 0 0 / 0.20)',
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
        <div className="mb-10">
          <span className="font-mono text-[10px] text-white/30 tracking-[0.2em]">/ 02</span>
          <h2 className="font-display text-4xl font-black text-white mt-1 tracking-tight uppercase">Clients</h2>
          <div className="mt-4 h-px" style={{ background: 'oklch(1 0 0 / 0.10)' }} />
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 font-mono text-[11px] tracking-[0.1em] uppercase transition-all whitespace-nowrap rounded-full font-semibold"
              style={
                filter === f
                  ? { background: 'var(--color-accent)', color: '#000' }
                  : { background: 'oklch(1 0 0 / 0.06)', border: '1px solid oklch(1 0 0 / 0.12)', color: 'var(--color-text-muted)' }
              }
            >
              {f}
              <span className="ml-1.5 opacity-60">
                {f === 'All' ? clients.length : clients.filter((c) => c.status === f.toLowerCase()).length}
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
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="glass rounded-2xl overflow-hidden hover:bg-white/[0.08] transition-colors duration-200"
              >
                {/* Status colour bar */}
                <div className="h-0.5 w-full" style={{ background: STATUS_ACCENT[client.status] || STATUS_ACCENT.cold }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display font-bold text-white">{client.name}</h3>
                    <span
                      className="font-mono text-[10px] px-2 py-0.5 rounded-full tracking-[0.08em] uppercase font-semibold ml-2 flex-shrink-0"
                      style={{ background: 'oklch(1 0 0 / 0.08)', color: STATUS_ACCENT[client.status] }}
                    >
                      {client.status}
                    </span>
                  </div>

                  {client.mrr_zar != null && client.mrr_zar > 0 && (
                    <div className="font-display text-2xl font-black text-accent mb-3 tabular-nums">
                      R{client.mrr_zar.toLocaleString()}
                      <span className="font-mono text-xs text-white/30 font-normal">/mo</span>
                    </div>
                  )}

                  {client.deliverables && client.deliverables.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {client.deliverables.map((d) => (
                        <span
                          key={d}
                          className="px-2 py-0.5 font-mono text-[10px] rounded-full"
                          style={{ background: 'oklch(1 0 0 / 0.07)', color: 'var(--color-text-secondary)' }}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  {client.stack && client.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {client.stack.map((s) => (
                        <span key={s} className="font-mono text-[10px] text-accent/60">{s}</span>
                      ))}
                    </div>
                  )}

                  {client.notes && (
                    <p className="text-sm text-text-muted leading-relaxed line-clamp-2">{client.notes}</p>
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
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}
