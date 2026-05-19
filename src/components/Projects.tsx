import { motion } from 'framer-motion'
import type { Project } from '../types'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:   { label: 'Active',    color: 'text-green-400' },
  complete: { label: 'Complete',  color: 'text-accent' },
  paused:   { label: 'Paused',    color: 'text-amber-400' },
}

interface ProjectsProps {
  projects: Project[]
}

export default function Projects({ projects }: ProjectsProps) {
  return (
    <section id="projects" className="px-8 py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="mb-10">
          <span className="font-mono text-[10px] text-text-muted tracking-[0.2em]">04</span>
          <h2 className="font-display text-4xl font-bold text-text-primary mt-1 tracking-tight">
            Projects
          </h2>
          <div className="mt-4 h-px bg-bg-border" />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {projects.map((project) => {
            const status = STATUS_CONFIG[project.status] || { label: project.status, color: 'text-text-muted' }
            return (
              <div
                key={project.id}
                className="bg-bg-surface border border-bg-border hover:border-text-muted transition-colors duration-150 p-5 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display font-semibold text-text-primary text-lg leading-tight">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                    <span className={`font-mono text-[10px] uppercase tracking-[0.1em] ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-text-secondary leading-relaxed mb-3">
                    {project.description}
                  </p>
                )}

                {project.notes && (
                  <p className="font-mono text-[11px] text-text-muted mb-3 leading-relaxed">
                    {project.notes}
                  </p>
                )}

                {project.stack && project.stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.stack.map((s) => (
                      <span key={s} className="px-2 py-0.5 font-mono text-[10px] bg-bg-elevated text-text-secondary">
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
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}
