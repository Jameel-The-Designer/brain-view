import { useState, useRef, useEffect } from 'react'
import { LayoutGroup } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Hero from './components/Hero'
import Overview from './components/Overview'
import Clients from './components/Clients'
import Goals from './components/Goals'
import Projects from './components/Projects'
import Stack from './components/Stack'
import ConversationLog from './components/ConversationLog'
import GrainOverlay from './components/GrainOverlay'
import { useCompany, usePeople, useClients, useGoals, useProjects, useStackItems, useConversationLog } from './hooks/useSupabase'
import type { Section } from './types'

export default function App() {
  const [active, setActive] = useState<Section>('overview')
  const [pastHero, setPastHero] = useState(false)
  const { data: company } = useCompany()
  const { data: people } = usePeople()
  const { data: clients } = useClients()
  const { data: goals } = useGoals()
  const { data: projects } = useProjects()
  const { data: stackItems } = useStackItems()
  const { data: log } = useConversationLog()

  const sectionRefs = useRef<Record<Section, HTMLElement | null>>({
    overview: null,
    clients: null,
    goals: null,
    projects: null,
    stack: null,
    log: null,
  })

  const navigate = (section: Section) => {
    setActive(section)
    const el = document.getElementById(section)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /* Track when user scrolls past the hero */
  useEffect(() => {
    const heroEl = document.getElementById('hero')
    if (!heroEl) return

    const obs = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0.05 }
    )
    obs.observe(heroEl)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const sections: Section[] = ['overview', 'clients', 'goals', 'projects', 'stack', 'log']
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id as Section)
          }
        }
      },
      { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
    )

    for (const id of sections) {
      const el = document.getElementById(id)
      if (el) {
        sectionRefs.current[id] = el
        observer.observe(el)
      }
    }

    return () => observer.disconnect()
  }, [])

  return (
    <LayoutGroup>
      <div className="min-h-screen bg-[#050508]">
        {/* Sidebar fades in only after scrolling past the hero */}
        <div
          className="transition-opacity duration-500"
          style={{ opacity: pastHero ? 1 : 0, pointerEvents: pastHero ? 'auto' : 'none' }}
        >
          <Sidebar active={active} onNavigate={navigate} log={log} />
        </div>

        <main className={`overflow-x-hidden ${pastHero ? 'main-content' : ''}`}>
          <Hero />

          <div className="max-w-6xl mx-auto">
            <Overview company={company} people={people} />
            <div className="mx-12 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
            <Clients clients={clients} />
            <div className="mx-12 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
            <Goals goals={goals} />
            <div className="mx-12 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
            <Projects projects={projects} />
            <div className="mx-12 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
            <Stack items={stackItems} />
            <div className="mx-12 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
            <ConversationLog entries={log} />
          </div>

          <footer className="text-center py-16 text-[11px] text-white/15 font-mono tracking-[0.15em] uppercase">
            Brain View &middot; Built by Thami &middot; Powered by Supabase + Claude
          </footer>
        </main>

        <GrainOverlay />
      </div>
    </LayoutGroup>
  )
}
