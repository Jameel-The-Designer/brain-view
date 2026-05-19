import { motion } from 'framer-motion'
import type { Project } from '../types'

const STATUS_COLOR: Record<string, string> = {
  active:   '#4ade80',
  complete: 'var(--color-accent)',
  paused:   '#f59e0b',
}

interface ProjectsProps {
  projects: Project[]
}

export default function Projects({ projects }: ProjectsProps) {
  return (
    <section id="projects" className="px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-10">
          <span className="font-mono text-[10px] text-white/30 tracking-[0.2em]">/ 04</span>
          <h2 className="font-display text-4xl font-black text-white mt-1 tracking-tight uppercase">Projects</h2>
          <div className="mt-4 h-px" style={{ background: 'oklch(1 0 0 / 0.10)' }} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="glass rounded-2xl p-5 hover:bg-white/[0.08] transition-colors duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-bold text-white text-lg leading-tight">{project.name}</h3>
                <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: STATUS_COLOR[project.status] || 'oklch(1 0 0 / 0.30)' }}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: STATUS_COLOR[project.status] || 'var(--color-text-muted)' }}>
                    {project.status}
                  </span>
                </div>
              </div>

              {project.description && (
                <p className="text-sm text-text-secondary leading-relaxed mb-3">{project.description}</p>
              )}

              {project.notes && (
                <p className="font-mono text-[11px] text-white/30 mb-3 leading-relaxed">{project.notes}</p>
              )}

              {project.stack && project.stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.stack.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 font-mono text-[10px] rounded-full"
                      style={{ background: 'oklch(1 0 0 / 0.07)', color: 'var(--color-text-secondary)' }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {project.url && (
                <a
                  href={`https://${project.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-accent hover:text-accent-hover transition-colors"
                >
                  ↗ {project.url}
                </a>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
