import { motion } from 'framer-motion'
import type { Company, Person } from '../types'

interface OverviewProps {
  company: Company | null
  people: Person[]
}

export default function Overview({ company, people }: OverviewProps) {
  if (!company) return null

  return (
    <section id="overview" className="px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-display text-3xl font-bold text-text-primary mb-2">
          {company.name}
        </h2>
        <p className="text-text-secondary text-lg mb-8">{company.positioning}</p>

        <div className="bg-bg-surface/40 border border-white/5 rounded-md p-6 mb-8">
          <blockquote className="text-xl font-display font-semibold text-accent italic">
            "{company.pitch}"
          </blockquote>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-bg-surface border border-white/5 rounded-md p-6">
            <h3 className="text-xs font-mono tracking-[0.15em] text-text-muted uppercase mb-3">
              Mission
            </h3>
            <p className="text-text-secondary leading-relaxed">{company.tagline}</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {company.location}
            </div>
            <div className="mt-2 text-sm">
              <span className="text-text-muted">Value model:</span>{' '}
              <span className="text-text-secondary">{company.value_model}</span>
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                {company.status}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {people.map((person) => (
              <motion.div
                key={person.id}
                className="bg-bg-surface border border-white/5 rounded-md p-5 hover:border-accent/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_0_1px_oklch(0.72_0.18_165/0.3),0_8px_32px_oklch(0.72_0.18_165/0.15)]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-display font-bold text-sm">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-text-primary">
                      {person.name}
                      {person.alias && (
                        <span className="text-text-muted font-normal text-sm ml-1">
                          ({person.alias})
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-accent">{person.role}</p>
                  </div>
                </div>
                {person.responsibilities && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {person.responsibilities.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 text-[11px] font-mono rounded bg-bg-elevated text-text-secondary"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-mono tracking-[0.15em] text-text-muted uppercase mb-3">
            Target Verticals
          </h3>
          <div className="flex flex-wrap gap-2">
            {company.target_verticals?.map((v) => (
              <span
                key={v}
                className="px-3 py-1.5 text-sm rounded-full bg-accent-2/10 text-accent-2 border border-accent-2/20"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
