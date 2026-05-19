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
    <section
      className="relative min-h-screen flex flex-col justify-between px-8 py-10 overflow-hidden"
    >
      {/* Extra centre glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 55% 50%, oklch(0.40 0.16 24 / 0.55) 0%, transparent 65%)',
        }}
      />

      {/* Top row */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex gap-8 text-xs font-mono text-white/40">
          <span>/ Cognitive OS</span>
          <span>/ Real-time</span>
          <span>/ Supabase + Claude</span>
        </div>
        <div className="hidden md:block">
          <LiveClock />
        </div>
      </div>

      {/* Big title — centred vertically */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
        <h1
          className="font-display font-black text-white leading-none tracking-tight uppercase"
          style={{ fontSize: 'clamp(4rem, 12vw, 10rem)' }}
        >
          Brain
          <br />
          View
        </h1>
        <p className="mt-6 font-mono text-xs text-white/40 max-w-sm leading-relaxed">
          Thami's living knowledge base — updated from Claude sessions via Supabase MCP.
        </p>
      </div>

      {/* Stats bar — bottom, full width, like the Blockacadeemy metadata row */}
      <div className="relative z-10 border-t" style={{ borderColor: 'oklch(1 0 0 / 0.12)' }}>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="py-5 pr-6"
              style={{
                borderRight: i < stats.length - 1 ? '1px solid oklch(1 0 0 / 0.12)' : 'none',
                paddingLeft: i === 0 ? 0 : '1.5rem',
              }}
            >
              <div className="font-mono text-[10px] text-white/40 tracking-[0.18em] uppercase mb-1">
                / {stat.label}
              </div>
              <div className="font-display text-2xl font-black text-accent tabular-nums">
                <CountUp end={stat.value} prefix={stat.prefix} duration={1000} />
                {stat.suffix && <span className="text-sm text-white/40 font-normal ml-0.5">{stat.suffix}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
