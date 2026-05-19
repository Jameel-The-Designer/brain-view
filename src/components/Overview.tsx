import { motion } from 'framer-motion'
import type { Company, Person } from '../types'

interface OverviewProps {
  company: Company | null
  people: Person[]
}

function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-10">
      <span className="font-mono text-[10px] text-text-muted tracking-[0.2em]">{index}</span>
      <h2 className="font-display text-4xl font-bold text-text-primary mt-1 tracking-tight">
        {title}
      </h2>
      <div className="mt-4 h-px bg-bg-border" />
    </div>
  )
}

export default function Overview({ company, people }: OverviewProps) {
  if (!company) return null

  return (
    <section id="overview" className="px-8 py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <SectionHeader index="01" title={company.name} />

        <p className="text-text-secondary text-lg mb-8 max-w-2xl leading-relaxed">
          {company.positioning}
        </p>

        <div className="border-l-2 border-accent pl-6 mb-10 py-1">
          <blockquote className="text-xl font-display font-semibold text-text-primary">
            "{company.pitch}"
          </blockquote>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-bg-surface border border-bg-border p-6">
            <h3 className="font-mono text-[10px] tracking-[0.18em] text-text-muted uppercase mb-3">
              Mission
            </h3>
            <p className="text-text-secondary leading-relaxed mb-5">{company.tagline}</p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-[0.15em]">Location</span>
                <span className="text-text-secondary">{company.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-[0.15em]">Model</span>
                <span className="text-text-secondary">{company.value_model}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-[0.15em]">Status</span>
                <span className="font-mono text-[11px] px-2 py-0.5 bg-accent/10 text-accent border border-accent/20">
                  {company.status}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {people.map((person) => (
              <motion.div
                key={person.id}
                className="bg-bg-surface border border-bg-border p-5 hover:border-accent/30 transition-colors duration-150 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-bg-elevated border border-bg-border flex items-center justify-center text-accent font-display font-bold text-sm flex-shrink-0">
                    {person.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h4 className="font-display font-semibold text-text-primary">
                        {person.name}
                      </h4>
                      {person.alias && (
                        <span className="font-mono text-[10px] text-text-muted">
                          {person.alias}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] text-accent mt-0.5">{person.role}</p>
                    {person.responsibilities && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {person.responsibilities.map((r) => (
                          <span
                            key={r}
                            className="px-2 py-0.5 font-mono text-[10px] bg-bg-elevated text-text-secondary"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {company.target_verticals && company.target_verticals.length > 0 && (
          <div>
            <h3 className="font-mono text-[10px] tracking-[0.18em] text-text-muted uppercase mb-3">
              Target Verticals
            </h3>
            <div className="flex flex-wrap gap-2">
              {company.target_verticals.map((v) => (
                <span
                  key={v}
                  className="px-3 py-1.5 font-mono text-xs bg-bg-surface border border-bg-border text-text-secondary hover:border-accent-2/40 hover:text-accent-2 transition-colors"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </section>
  )
}
