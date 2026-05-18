import { motion } from 'framer-motion'
import type { Project } from '../types'

const STATUS_DOT: Record<string, string> = {
  active: 'bg-green-400',
  complete: 'bg-accent',
  paused: 'bg-amber-400',
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
        <h2 className="font-display text-3xl font-bold text-text-primary mb-8">
          Projects
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-bg-surface border border-white/5 rounded-md p-5 hover:-translate-y-1 transition-all duration-200 hover:shadow-[0_0_0_1px_oklch(0.72_0.18_165/0.3),0_8px_32px_oklch(0.72_0.18_165/0.15)]"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display font-semibold text-text-primary text-lg">
                  {project.name}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${STATUS_DOT[project.status] || 'bg-text-muted'}`} />
                  <span className="text-[11px] font-mono text-text-muted">{project.status}</span>
                </div>
              </div>

              {project.description && (
                <p className="text-sm text-text-secondary leading-relaxed mb-3">
                  {project.description}
                </p>
              )}

              {project.notes && (
                <p className="text-xs text-text-muted italic mb-3">
                  {project.notes}
                </p>
              )}

              {project.stack && project.stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.stack.map((s) => (
                    <span key={s} className="px-2 py-0.5 text-[11px] font-mono rounded bg-accent/8 text-accent/80">
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
                  className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {project.url}
                </a>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
