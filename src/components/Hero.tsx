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
    { label: 'Active Clients', value: activeClients },
    { label: 'MRR', value: totalMrr, prefix: 'R' },
    { label: 'Projects', value: activeProjects },
    { label: 'Goals', value: goalCount },
  ]

  return (
    <section className="relative min-h-[60vh] flex flex-col justify-center px-8 py-16 overflow-hidden">
      <ParticleField />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-12">
          <div>
            <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-text-primary">
              Brain View
            </h1>
            <p className="mt-3 text-lg text-text-secondary max-w-xl">
              Thami's living knowledge base. Real-time. Updated from Claude sessions via Supabase MCP.
            </p>
          </div>
          <div className="hidden md:block">
            <LiveClock />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-bg-surface/60 backdrop-blur-sm border border-white/5 rounded-md px-5 py-4"
            >
              <div className="text-[11px] font-mono tracking-[0.15em] text-text-muted uppercase mb-1">
                {stat.label}
              </div>
              <div className="text-2xl font-display font-bold text-accent">
                <CountUp end={stat.value} prefix={stat.prefix} duration={1000} />
                {stat.label === 'MRR' && <span className="text-sm text-text-muted font-body font-normal">/mo</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
