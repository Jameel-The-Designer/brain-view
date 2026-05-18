import { useState, useEffect, useRef } from 'react'

interface CountUpProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export default function CountUp({ end, duration = 800, prefix = '', suffix = '' }: CountUpProps) {
  const [value, setValue] = useState(0)
  const prevEnd = useRef(end)

  useEffect(() => {
    prevEnd.current = end
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(easeOutExpo(progress) * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [end, duration])

  return (
    <span className="tabular-nums">
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  )
}
