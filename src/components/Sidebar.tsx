import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import type { Section } from '../types'
import { useConversationLog } from '../hooks/useSupabase'

const NAV_ITEMS: { id: Section; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'clients', label: 'Clients' },
  { id: 'goals', label: 'Goals' },
  { id: 'projects', label: 'Projects' },
  { id: 'stack', label: 'Stack' },
  { id: 'log', label: 'Log' },
]

interface SidebarProps {
  active: Section
  onNavigate: (s: Section) => void
}

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  const [open, setOpen] = useState(false)
  const { data: log } = useConversationLog()
  const [relativeTime, setRelativeTime] = useState('')

  useEffect(() => {
    const calc = () => {
      if (log.length === 0) return
      const latest = new Date(log[log.length - 1].created_at)
      const diff = Math.floor((Date.now() - latest.getTime()) / 60000)
      if (diff < 1) setRelativeTime('Just now')
      else if (diff < 60) setRelativeTime(`${diff} min${diff > 1 ? 's' : ''} ago`)
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
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-bg-surface rounded-md border border-white/5"
      >
        <span className={`block w-5 h-0.5 bg-text-primary transition-transform ${open ? 'rotate-45 translate-y-1' : ''}`} />
        <span className={`block w-5 h-0.5 bg-text-primary transition-opacity ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-5 h-0.5 bg-text-primary transition-transform ${open ? '-rotate-45 -translate-y-1' : ''}`} />
      </button>

      <aside className={`fixed top-0 left-0 h-full w-[220px] bg-bg-surface border-r border-white/5 z-40 flex flex-col transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 pt-8">
          <h1
            className="font-display text-2xl font-bold text-accent"
            style={{ animation: 'breathe 4s ease-in-out infinite' }}
          >
            BV
          </h1>
        </div>

        <nav className="flex-1 px-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id)
                setOpen(false)
              }}
              className="relative w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-white/5"
              style={{ color: active === item.id ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
            >
              {active === item.id && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-md bg-accent/10 border border-accent/20"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" style={{ animation: 'ripple 0.8s ease-out infinite' }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs text-green-400 font-medium">Live</span>
          </div>
          {relativeTime && (
            <p className="text-[11px] text-text-muted">
              Updated {relativeTime}
            </p>
          )}
        </div>
      </aside>
    </>
  )
}
