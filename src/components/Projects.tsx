import { motion } from 'framer-motion'
import type { Project } from '../types'

const STATUS_DOT: Record<string, string> = {
  active: 'bg-accent',
  complete: 'bg-accent-2',
  paused: 'bg-amber-400',
}

interface ProjectsProps {
  projects: Project[]
}

export default function Projects({ projects }: ProjectsProps) {
  return (
    <section id="projects" className="px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-[11px] font-mono tracking-[0.2em] text-white/25 uppercase mb-4">/ 04 Projects</div>
        <h2 className="font-display text-4xl font-bold text-white/90 mb-10">
          Current Projects
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,0,120,0.08)] hover:border-accent/15"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display font-semibold text-white/85 text-lg">
                  {project.name}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${STATUS_DOT[project.status] || 'bg-white/20'}`} />
                  <span className="text-[11px] font-mono text-white/30">{project.status}</span>
                </div>
              </div>

              {project.description && (
                <p className="text-sm text-white/45 leading-relaxed mb-3">
                  {project.description}
                </p>
              )}

              {project.notes && (
                <p className="text-xs text-white/25 italic mb-3">
                  {project.notes}
                </p>
              )}

              {project.stack && project.stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.stack.map((s) => (
                    <span key={s} className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-accent/[0.06] text-accent/60">
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
                  className="inline-flex items-center gap-1 text-xs text-accent/70 hover:text-accent transition-colors"
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
