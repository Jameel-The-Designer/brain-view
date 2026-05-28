import ParticleSphere from './ParticleSphere'
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
    { label: 'Clients', value: activeClients },
    { label: 'MRR', value: totalMrr, prefix: 'R' },
    { label: 'Projects', value: activeProjects },
    { label: 'Goals', value: goalCount },
  ]

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      <ParticleSphere />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050508] z-[1] pointer-events-none" />

      <div className="absolute top-8 right-8 z-10 hidden md:block">
        <LiveClock />
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-[2] pointer-events-none">
        <div className="text-center">
          <div className="text-[11px] font-mono tracking-[0.25em] text-white/30 uppercase mb-4">
            / Cognitive OS
          </div>
          <h1
            className="font-display text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight text-white/90"
            style={{ animation: 'breathe 4s ease-in-out infinite' }}
          >
            Brain<br />View
          </h1>
          <p className="mt-6 text-sm md:text-base text-white/40 max-w-md mx-auto tracking-wide">
            Thami's living knowledge base — updated in real-time via Supabase MCP.
          </p>
        </div>
      </div>

      <div className="relative z-10 px-6 md:px-8 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 text-center"
              style={{ animation: 'pulse-glow 6s ease-in-out infinite' }}
            >
              <div className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase mb-2">
                {stat.label}
              </div>
              <div className="text-2xl font-display font-bold text-accent">
                <CountUp end={stat.value} prefix={stat.prefix} duration={1200} />
                {stat.label === 'MRR' && <span className="text-xs text-white/20 font-body font-normal ml-0.5">/mo</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
