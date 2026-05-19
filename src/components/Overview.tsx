import { motion } from 'framer-motion'
import type { Company, Person } from '../types'

interface OverviewProps {
  company: Company | null
  people: Person[]
}

function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-10">
      <span className="font-mono text-[10px] text-white/30 tracking-[0.2em]">/ {index}</span>
      <h2 className="font-display text-4xl font-black text-white mt-1 tracking-tight uppercase">
        {title}
      </h2>
      <div className="mt-4 h-px" style={{ background: 'oklch(1 0 0 / 0.10)' }} />
    </div>
  )
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
        <SectionHeader index="01" title={company.name} />

        <p className="text-text-secondary text-lg font-medium mb-8 max-w-2xl leading-relaxed">
          {company.positioning}
        </p>

        {/* Quote */}
        <div
          className="rounded-2xl p-6 mb-10 glass"
          style={{ borderLeft: '3px solid var(--color-accent)' }}
        >
          <blockquote className="text-xl font-bold text-white italic">
            "{company.pitch}"
          </blockquote>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-10">
          {/* Mission card */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase mb-3">
              / Mission
            </h3>
            <p className="text-text-secondary leading-relaxed mb-5 text-sm">{company.tagline}</p>

            <div className="space-y-2">
              {[
                { key: 'Location', val: company.location },
                { key: 'Model', val: company.value_model },
              ].map(({ key, val }) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.15em] w-16">{key}</span>
                  <span className="text-text-secondary">{val}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.15em] w-16">Status</span>
                <span
                  className="font-mono text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'var(--color-accent)', color: '#000' }}
                >
                  {company.status}
                </span>
              </div>
            </div>
          </div>

          {/* People */}
          <div className="space-y-3">
            {people.map((person) => (
              <motion.div
                key={person.id}
                className="glass rounded-2xl p-5 hover:bg-white/[0.08] transition-colors duration-200 group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-black font-black text-sm flex-shrink-0"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    {person.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h4 className="font-display font-bold text-white">{person.name}</h4>
                      {person.alias && (
                        <span className="font-mono text-[10px] text-white/30">{person.alias}</span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] text-accent mt-0.5">{person.role}</p>
                    {person.responsibilities && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {person.responsibilities.map((r) => (
                          <span
                            key={r}
                            className="px-2 py-0.5 font-mono text-[10px] rounded-full"
                            style={{ background: 'oklch(1 0 0 / 0.07)', color: 'var(--color-text-secondary)' }}
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
            <h3 className="font-mono text-[10px] tracking-[0.18em] text-white/30 uppercase mb-3">
              / Target Verticals
            </h3>
            <div className="flex flex-wrap gap-2">
              {company.target_verticals.map((v) => (
                <span
                  key={v}
                  className="px-3 py-1.5 font-mono text-xs rounded-full font-medium transition-colors"
                  style={{
                    background: 'oklch(1 0 0 / 0.06)',
                    border: '1px solid oklch(1 0 0 / 0.12)',
                    color: 'var(--color-text-secondary)',
                  }}
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
