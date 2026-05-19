import { useRef, useCallback } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'
import type { StackItem } from '../types'

function MagneticItem({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width
      const dy = (e.clientY - cy) / rect.height
      x.set(dx * 5)
      y.set(dy * 5)
    },
    [x, y]
  )

  const onMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.span
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x: springX, y: springY }}
      className="inline-flex px-3 py-2 font-mono text-xs bg-bg-surface border border-bg-border text-text-secondary hover:text-accent hover:border-accent/30 transition-colors cursor-default select-none"
    >
      {name}
    </motion.span>
  )
}

interface StackProps {
  items: StackItem[]
}

export default function Stack({ items }: StackProps) {
  const categories = items.reduce<Record<string, StackItem[]>>((acc, item) => {
    const cat = item.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const categoryOrder = ['frontend', 'backend', 'devops', 'ai', 'creative', 'tools']
  const sorted = categoryOrder.filter((c) => categories[c]).concat(
    Object.keys(categories).filter((c) => !categoryOrder.includes(c))
  )

  return (
    <section id="stack" className="px-8 py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="mb-10">
          <span className="font-mono text-[10px] text-text-muted tracking-[0.2em]">05</span>
          <h2 className="font-display text-4xl font-bold text-text-primary mt-1 tracking-tight">
            Stack
          </h2>
          <div className="mt-4 h-px bg-bg-border" />
        </div>

        <div className="space-y-7">
          {sorted.map((category) => (
            <div key={category} className="grid grid-cols-[80px_1fr] gap-4 items-start">
              <span className="font-mono text-[10px] tracking-[0.15em] text-text-muted uppercase pt-2">
                {category}
              </span>
              <div className="flex flex-wrap gap-2">
                {categories[category].map((item) => (
                  <MagneticItem key={item.id} name={item.name} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
