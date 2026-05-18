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
      <div className="min-h-screen">
        <Sidebar active={active} onNavigate={navigate} log={log} />

        <main className="main-content overflow-x-hidden">
          <Hero clients={clients} projects={projects} goals={goals} />

          <div className="max-w-6xl mx-auto">
            <Overview company={company} people={people} />
            <div className="mx-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <Clients clients={clients} />
            <div className="mx-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <Goals goals={goals} />
            <div className="mx-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <Projects projects={projects} />
            <div className="mx-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <Stack items={stackItems} />
            <div className="mx-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <ConversationLog entries={log} />
          </div>

          <footer className="text-center py-12 text-xs text-text-muted font-mono">
            Brain View &middot; Built by Thami &middot; Powered by Supabase + Claude
          </footer>
        </main>

        <GrainOverlay />
      </div>
    </LayoutGroup>
  )
}
