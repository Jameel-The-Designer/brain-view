import { motion } from 'framer-motion'
import type { Company, Person } from '../types'

interface OverviewProps {
  company: Company | null
  people: Person[]
}

export default function Overview({ company, people }: OverviewProps) {
  if (!company) return null

  return (
    <section id="overview" className="px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-[11px] font-mono tracking-[0.2em] text-white/25 uppercase mb-4">/ Overview</div>
        <h2 className="font-display text-4xl font-bold text-white/90 mb-2">
          {company.name}
        </h2>
        <p className="text-white/45 text-lg mb-10 max-w-2xl">{company.positioning}</p>

        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 mb-10">
          <blockquote className="text-xl md:text-2xl font-display font-semibold bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent italic leading-relaxed">
            "{company.pitch}"
          </blockquote>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
            <h3 className="text-[10px] font-mono tracking-[0.2em] text-white/25 uppercase mb-4">
              Mission
            </h3>
            <p className="text-white/50 leading-relaxed">{company.tagline}</p>
            <div className="mt-5 flex items-center gap-2 text-sm text-white/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {company.location}
            </div>
            <div className="mt-2 text-sm">
              <span className="text-white/25">Value model:</span>{' '}
              <span className="text-white/50">{company.value_model}</span>
            </div>
            <div className="mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono bg-accent/[0.08] text-accent border border-accent/15">
                {company.status}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {people.map((person) => (
              <motion.div
                key={person.id}
                className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 hover:border-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(255,0,120,0.08)]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent-2/20 border border-accent/15 flex items-center justify-center text-accent font-display font-bold text-sm">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-white/85">
                      {person.name}
                      {person.alias && (
                        <span className="text-white/25 font-normal text-sm ml-1">
                          ({person.alias})
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-accent/80">{person.role}</p>
                  </div>
                </div>
                {person.responsibilities && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {person.responsibilities.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-white/[0.04] text-white/40"
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
          <h3 className="text-[10px] font-mono tracking-[0.2em] text-white/25 uppercase mb-4">
            Target Verticals
          </h3>
          <div className="flex flex-wrap gap-2">
            {company.target_verticals?.map((v) => (
              <span
                key={v}
                className="px-3 py-1.5 text-sm rounded-full bg-accent-2/[0.08] text-accent-2/80 border border-accent-2/15"
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
