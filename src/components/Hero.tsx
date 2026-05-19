import ParticleField from './ParticleField'
import LiveClock from './LiveClock'
import CountUp from './CountUp'
import type { Client, Project, Goal } from '../types'

interface HeroProps {
  clients: Client[]
  projects: Project[]
  goals: Goal[]
}

export default function Hero({ clients, projects, goals }: HeroProps) {
  const activeClients = clients.filter((c) => c.status === 'active').length
  const totalMrr = clients.reduce((sum, c) => sum + (c.mrr_zar || 0), 0)
  const activeProjects = projects.filter((p) => p.status === 'active').length
  const goalCount = goals.length

  const stats = [
    { label: 'Active Clients', value: activeClients, prefix: '' },
    { label: 'MRR', value: totalMrr, prefix: 'R', suffix: '/mo' },
    { label: 'Projects', value: activeProjects, prefix: '' },
    { label: 'Goals Tracked', value: goalCount, prefix: '' },
  ]

  return (
    <section className="relative min-h-[56vh] flex flex-col justify-end px-8 py-12 overflow-hidden border-b border-bg-border">
      <ParticleField />

      <div className="relative z-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] text-text-muted uppercase mb-3">
              Cognitive Operating System
            </div>
            <h1 className="font-display font-bold tracking-tight text-text-primary leading-none"
              style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}>
              Brain View
            </h1>
            <p className="mt-4 font-mono text-xs text-text-muted max-w-md leading-relaxed">
              Thami's living knowledge base — real-time, updated from Claude sessions via Supabase MCP.
            </p>
          </div>
          <div className="hidden md:block">
            <LiveClock />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 border border-bg-border">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`px-5 py-5 ${i < stats.length - 1 ? 'border-r border-bg-border' : ''}`}
            >
              <div className="font-mono text-[10px] tracking-[0.18em] text-text-muted uppercase mb-2">
                {stat.label}
              </div>
              <div className="font-display text-2xl font-bold text-accent tabular-nums">
                <CountUp end={stat.value} prefix={stat.prefix} duration={1000} />
                {stat.suffix && <span className="text-xs text-text-muted font-body font-normal ml-0.5">{stat.suffix}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
