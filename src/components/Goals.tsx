import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CountUp from './CountUp'
import type { Goal } from '../types'

function ProgressBar({ current, target, animate }: { current: number; target: number; animate: boolean }) {
  const pct = Math.min((current / target) * 100, 100)
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'oklch(1 0 0 / 0.08)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'var(--color-accent)' }}
        initial={{ width: 0 }}
        animate={{ width: animate ? `${pct}%` : 0 }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  )
}

interface GoalsProps {
  goals: Goal[]
}

export default function Goals({ goals }: GoalsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true) }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const milestones = goals.filter((g) => g.milestone)
  const regular = goals.filter((g) => !g.milestone)

  return (
    <section id="goals" className="px-8 py-16" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-10">
          <span className="font-mono text-[10px] text-white/30 tracking-[0.2em]">/ 03</span>
          <h2 className="font-display text-4xl font-black text-white mt-1 tracking-tight uppercase">Goals</h2>
          <div className="mt-4 h-px" style={{ background: 'oklch(1 0 0 / 0.10)' }} />
        </div>

        {milestones.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-5">
            {milestones.map((goal) => {
              const pct = goal.target_value > 0 ? Math.min((goal.current_value / goal.target_value) * 100, 100) : 0
              return (
                <div
                  key={goal.id}
                  className="glass-strong rounded-2xl p-6"
                  style={{ borderLeft: '3px solid var(--color-accent)' }}
                >
                  <div className="font-mono text-[10px] text-accent tracking-[0.2em] uppercase mb-2">/ Milestone</div>
                  <h3 className="font-display font-black text-xl text-white mb-1">{goal.label}</h3>
                  {goal.description && (
                    <p className="font-mono text-[11px] text-white/40 mb-5 leading-relaxed">{goal.description}</p>
                  )}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-display text-2xl font-black text-accent tabular-nums">
                      {visible ? <CountUp end={goal.current_value} prefix={goal.unit === 'ZAR' ? 'R' : '$'} duration={1200} /> : <span>{goal.unit === 'ZAR' ? 'R' : '$'}0</span>}
                    </span>
                    <span className="font-mono text-xs text-white/30">/ {goal.unit === 'ZAR' ? 'R' : '$'}{goal.target_value.toLocaleString()}</span>
                    <span className="font-mono text-xs text-white/30 ml-auto">{pct.toFixed(0)}%</span>
                  </div>
                  <ProgressBar current={goal.current_value} target={goal.target_value} animate={visible} />
                </div>
              )
            })}
          </div>
        )}

        <div className="space-y-3">
          {regular.map((goal) => {
            const pct = goal.target_value > 0 ? Math.min((goal.current_value / goal.target_value) * 100, 100) : 0
            return (
              <div key={goal.id} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-bold text-white">{goal.label}</h3>
                  {goal.achieved && (
                    <span className="font-mono text-[10px] text-green-400 tracking-[0.1em] uppercase">✓ Achieved</span>
                  )}
                </div>
                {goal.description && (
                  <p className="font-mono text-[11px] text-white/40 mb-3 leading-relaxed">{goal.description}</p>
                )}
                <div className="flex items-baseline gap-2 mb-2.5">
                  <span className="font-display text-lg font-black text-accent tabular-nums">
                    {visible ? <CountUp end={goal.current_value} prefix={goal.unit === 'ZAR' ? 'R' : '$'} duration={1000} /> : <span>{goal.unit === 'ZAR' ? 'R' : '$'}0</span>}
                  </span>
                  <span className="font-mono text-xs text-white/30">/ {goal.unit === 'ZAR' ? 'R' : '$'}{goal.target_value.toLocaleString()}</span>
                  <span className="font-mono text-[10px] text-white/30 ml-auto">{pct.toFixed(0)}%</span>
                </div>
                <ProgressBar current={goal.current_value} target={goal.target_value} animate={visible} />
              </div>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}
