import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CountUp from './CountUp'
import type { Goal } from '../types'

function ProgressBar({ current, target, animate }: { current: number; target: number; animate: boolean }) {
  const pct = Math.min((current / target) * 100, 100)

  return (
    <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover"
        initial={{ width: 0 }}
        animate={{ width: animate ? `${pct}%` : 0 }}
        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        style={{ animation: animate ? 'heartbeat 3s ease-in-out infinite' : 'none' }}
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
    <section id="goals" className="px-8 py-16" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-display text-3xl font-bold text-text-primary mb-8">
          Goals
        </h2>

        {milestones.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {milestones.map((goal) => {
              const pct = goal.target_value > 0 ? Math.min((goal.current_value / goal.target_value) * 100, 100) : 0
              return (
                <div
                  key={goal.id}
                  className="bg-bg-surface border border-accent/20 rounded-md p-6"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-[10px] font-mono tracking-[0.15em] text-accent uppercase">Milestone</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-text-primary mb-1">
                    {goal.label}
                  </h3>
                  {goal.description && (
                    <p className="text-sm text-text-muted mb-4">{goal.description}</p>
                  )}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-display font-bold text-accent">
                      {visible ? (
                        <CountUp end={goal.current_value} prefix={goal.unit === 'ZAR' ? 'R' : '$'} duration={1200} />
                      ) : (
                        <span>{goal.unit === 'ZAR' ? 'R' : '$'}0</span>
                      )}
                    </span>
                    <span className="text-sm text-text-muted">
                      / {goal.unit === 'ZAR' ? 'R' : '$'}{goal.target_value.toLocaleString()}
                    </span>
                  </div>
                  <ProgressBar current={goal.current_value} target={goal.target_value} animate={visible} />
                  <div className="mt-1 text-right text-[11px] font-mono text-text-muted">
                    {pct.toFixed(0)}%
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="space-y-4">
          {regular.map((goal) => {
            const pct = goal.target_value > 0 ? Math.min((goal.current_value / goal.target_value) * 100, 100) : 0
            return (
              <div
                key={goal.id}
                className="bg-bg-surface border border-white/5 rounded-md p-5"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-semibold text-text-primary">
                    {goal.label}
                  </h3>
                  {goal.achieved && (
                    <span className="text-green-400 text-xs font-mono">Achieved</span>
                  )}
                </div>
                {goal.description && (
                  <p className="text-sm text-text-muted mb-3">{goal.description}</p>
                )}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-lg font-display font-bold text-accent">
                    {visible ? (
                      <CountUp end={goal.current_value} prefix={goal.unit === 'ZAR' ? 'R' : '$'} duration={1000} />
                    ) : (
                      <span>{goal.unit === 'ZAR' ? 'R' : '$'}0</span>
                    )}
                  </span>
                  <span className="text-sm text-text-muted">
                    / {goal.unit === 'ZAR' ? 'R' : '$'}{goal.target_value.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-text-muted ml-auto">{pct.toFixed(0)}%</span>
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
