import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import type { Section, ConversationEntry } from '../types'

const NAV_ITEMS: { id: Section; label: string; index: string }[] = [
  { id: 'overview', label: 'Overview', index: '01' },
  { id: 'clients', label: 'Clients', index: '02' },
  { id: 'goals', label: 'Goals', index: '03' },
  { id: 'projects', label: 'Projects', index: '04' },
  { id: 'stack', label: 'Stack', index: '05' },
  { id: 'log', label: 'Log', index: '06' },
]

interface SidebarProps {
  active: Section
  onNavigate: (s: Section) => void
  log: ConversationEntry[]
}

export default function Sidebar({ active, onNavigate, log }: SidebarProps) {
  const [open, setOpen] = useState(false)
  const [relativeTime, setRelativeTime] = useState('')

  useEffect(() => {
    const calc = () => {
      if (log.length === 0) return
      const sorted = [...log].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      const latest = new Date(sorted[0].created_at)
      const diff = Math.floor((Date.now() - latest.getTime()) / 60000)
      if (diff < 1) setRelativeTime('just now')
      else if (diff < 60) setRelativeTime(`${diff}m ago`)
      else if (diff < 1440) setRelativeTime(`${Math.floor(diff / 60)}h ago`)
      else setRelativeTime(`${Math.floor(diff / 1440)}d ago`)
    }
    calc()
    const interval = setInterval(calc, 60000)
    return () => clearInterval(interval)
  }, [log])

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-5 left-5 z-50 lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] bg-bg-surface border border-bg-border"
        aria-label="Toggle navigation"
      >
        <span className={`block w-4 h-px bg-text-primary transition-transform origin-center ${open ? 'rotate-45 translate-y-[5px]' : ''}`} />
        <span className={`block w-4 h-px bg-text-primary transition-opacity ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-4 h-px bg-text-primary transition-transform origin-center ${open ? '-rotate-45 -translate-y-[5px]' : ''}`} />
      </button>

      <aside className={`fixed top-0 left-0 h-full w-[220px] bg-bg-surface border-r border-bg-border z-40 flex flex-col transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>

        <div className="px-6 py-7 border-b border-bg-border">
          <span className="font-display text-xl font-bold tracking-tight text-accent">
            BV
          </span>
          <span className="font-mono text-[10px] text-text-muted ml-2 tracking-[0.15em] uppercase">
            Brain View
          </span>
        </div>

        <nav className="flex-1 py-4 relative">
          <div className="absolute left-6 top-4 bottom-4 w-px bg-bg-border" />

          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id)
                setOpen(false)
              }}
              className="relative w-full text-left pl-6 pr-4 py-3 flex items-center gap-3 transition-colors hover:bg-bg-elevated/50 group"
            >
              {active === item.id && (
                <motion.div
                  layoutId="nav-thread-marker"
                  className="absolute left-0 top-0 h-full w-0.5 bg-accent"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <span className={`font-mono text-[10px] transition-colors ${
                active === item.id ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'
              }`}>
                {item.index}
              </span>
              <span className={`text-sm font-medium transition-colors ${
                active === item.id ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-bg-border">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60" style={{ animation: 'ripple 1.2s ease-out infinite' }} />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.15em] text-green-400 uppercase">Live</span>
          </div>
          {relativeTime && (
            <p className="font-mono text-[10px] text-text-muted">
              sync {relativeTime}
            </p>
          )}
        </div>
      </aside>
    </>
  )
}
