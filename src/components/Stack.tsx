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
      x.set(dx * 6)
      y.set(dy * 6)
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
      className="inline-flex px-3 py-2 font-mono text-sm bg-white/[0.02] border border-white/[0.05] rounded-xl text-white/40 hover:text-accent hover:border-accent/20 hover:bg-accent/[0.04] transition-colors cursor-default select-none"
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
    <section id="stack" className="px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-[11px] font-mono tracking-[0.2em] text-white/25 uppercase mb-4">/ Stack</div>
        <h2 className="font-display text-4xl font-bold text-white/90 mb-10">
          Stack
        </h2>

        <div className="space-y-8">
          {sorted.map((category) => (
            <div key={category}>
              <h3 className="text-[10px] font-mono tracking-[0.2em] text-white/25 uppercase mb-3">
                {category}
              </h3>
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
