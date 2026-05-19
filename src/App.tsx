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
        <Sidebar active={active} onNavigate={navigate} />

        <main className="lg:ml-[220px]">
          <Hero clients={clients} projects={projects} goals={goals} />

          <div className="max-w-5xl mx-auto">
            <Overview company={company} people={people} />
            <div className="border-t border-bg-border" />
            <Clients clients={clients} />
            <div className="border-t border-bg-border" />
            <Goals goals={goals} />
            <div className="border-t border-bg-border" />
            <Projects projects={projects} />
            <div className="border-t border-bg-border" />
            <Stack items={stackItems} />
            <div className="border-t border-bg-border" />
            <ConversationLog entries={log} />
          </div>

          <footer className="border-t border-bg-border py-8 px-8 lg:ml-0">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <span className="font-mono text-[10px] text-text-muted tracking-[0.15em] uppercase">
                Brain View
              </span>
              <span className="font-mono text-[10px] text-text-muted">
                Built by Thami · Supabase + Claude
              </span>
            </div>
          </footer>
        </main>

        <GrainOverlay />
      </div>
    </LayoutGroup>
  )
}
