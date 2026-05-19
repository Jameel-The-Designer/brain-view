import { useRef, useCallback } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'
import type { StackItem } from '../types'

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
    <section id="stack" className="px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-10">
          <span className="font-mono text-[10px] text-white/30 tracking-[0.2em]">/ 05</span>
          <h2 className="font-display text-4xl font-black text-white mt-1 tracking-tight uppercase">Stack</h2>
          <div className="mt-4 h-px" style={{ background: 'oklch(1 0 0 / 0.10)' }} />
        </div>

        <div className="space-y-7">
          {sorted.map((category) => (
            <div key={category} className="grid grid-cols-[80px_1fr] gap-4 items-start">
              <span className="font-mono text-[10px] tracking-[0.15em] text-white/30 uppercase pt-2">
                {category}
              </span>
              <div className="flex flex-wrap gap-2">
                {categories[category].map((item) => (
                  <MagneticItemSimple key={item.id} name={item.name} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function MagneticItemSimple({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    x.set(((e.clientX - (rect.left + rect.width / 2)) / rect.width) * 5)
    y.set(((e.clientY - (rect.top + rect.height / 2)) / rect.height) * 5)
  }, [x, y])

  const onMouseLeave = useCallback(() => { x.set(0); y.set(0) }, [x, y])

  return (
    <motion.span
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        x: springX,
        y: springY,
        display: 'inline-flex',
        padding: '0.375rem 0.75rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        borderRadius: '0.75rem',
        background: 'oklch(1 0 0 / 0.06)',
        border: '1px solid oklch(1 0 0 / 0.10)',
        color: 'var(--color-text-secondary)',
        cursor: 'default',
        userSelect: 'none',
        transition: 'background 0.15s',
      }}
      whileHover={{ backgroundColor: 'oklch(1 0 0 / 0.10)' } as never}
    >
      {name}
    </motion.span>
  )
}
