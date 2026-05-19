import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CountUp from './CountUp'
import type { Goal } from '../types'

function ProgressBar({ current, target, animate }: { current: number; target: number; animate: boolean }) {
  const pct = Math.min((current / target) * 100, 100)

  return (
    <div className="relative w-full h-1.5 bg-bg-elevated overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-accent"
        initial={{ width: 0 }}
        animate={{ width: animate ? `${pct}%` : 0 }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      />
      {animate && pct > 0 && (
        <motion.div
          className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ left: '-10%' }}
          animate={{ left: `${pct + 5}%` }}
          transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
        />
      )}
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
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const milestones = goals.filter((g) => g.milestone)
  const regular = goals.filter((g) => !g.milestone)

  return (
    <section id="goals" className="px-8 py-14" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="mb-10">
          <span className="font-mono text-[10px] text-text-muted tracking-[0.2em]">03</span>
          <h2 className="font-display text-4xl font-bold text-text-primary mt-1 tracking-tight">
            Goals
          </h2>
          <div className="mt-4 h-px bg-bg-border" />
        </div>

        {milestones.length > 0 && (
          <div className="grid md:grid-cols-2 gap-3 mb-6">
            {milestones.map((goal) => {
              const pct = goal.target_value > 0 ? Math.min((goal.current_value / goal.target_value) * 100, 100) : 0
              return (
                <div
                  key={goal.id}
                  className="bg-bg-surface border border-accent/20 border-l-2 border-l-accent p-6"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[10px] text-accent tracking-[0.2em] uppercase">Milestone</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-text-primary mb-1">
                    {goal.label}
                  </h3>
                  {goal.description && (
                    <p className="font-mono text-[11px] text-text-muted mb-5 leading-relaxed">{goal.description}</p>
                  )}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-display text-2xl font-bold text-accent tabular-nums">
                      {visible ? (
                        <CountUp end={goal.current_value} prefix={goal.unit === 'ZAR' ? 'R' : '$'} duration={1200} />
                      ) : (
                        <span>{goal.unit === 'ZAR' ? 'R' : '$'}0</span>
                      )}
                    </span>
                    <span className="font-mono text-xs text-text-muted">
                      / {goal.unit === 'ZAR' ? 'R' : '$'}{goal.target_value.toLocaleString()}
                    </span>
                    <span className="font-mono text-xs text-text-muted ml-auto">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <ProgressBar current={goal.current_value} target={goal.target_value} animate={visible} />
                </div>
              )
            })}
          </div>
        )}

        <div className="space-y-2">
          {regular.map((goal) => {
            const pct = goal.target_value > 0 ? Math.min((goal.current_value / goal.target_value) * 100, 100) : 0
            return (
              <div
                key={goal.id}
                className="bg-bg-surface border border-bg-border p-5"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-semibold text-text-primary">
                    {goal.label}
                  </h3>
                  {goal.achieved && (
                    <span className="font-mono text-[10px] text-green-400 tracking-[0.1em] uppercase">✓ Achieved</span>
                  )}
                </div>
                {goal.description && (
                  <p className="font-mono text-[11px] text-text-muted mb-3 leading-relaxed">{goal.description}</p>
                )}
                <div className="flex items-baseline gap-2 mb-2.5">
                  <span className="font-display text-lg font-bold text-accent tabular-nums">
                    {visible ? (
                      <CountUp end={goal.current_value} prefix={goal.unit === 'ZAR' ? 'R' : '$'} duration={1000} />
                    ) : (
                      <span>{goal.unit === 'ZAR' ? 'R' : '$'}0</span>
                    )}
                  </span>
                  <span className="font-mono text-xs text-text-muted">
                    / {goal.unit === 'ZAR' ? 'R' : '$'}{goal.target_value.toLocaleString()}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted ml-auto">{pct.toFixed(0)}%</span>
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
