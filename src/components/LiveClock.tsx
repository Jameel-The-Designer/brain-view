import { useState, useEffect } from 'react'

export default function LiveClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatted = time.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Africa/Johannesburg',
  })

  return (
    <div className="glass rounded-xl text-right px-4 py-3">
      <div className="font-mono text-[10px] tracking-[0.25em] text-white/30 uppercase mb-1">
        JHB · UTC+2
      </div>
      <div className="font-mono text-2xl text-accent tabular-nums tracking-tight">
        {formatted}
      </div>
    </div>
  )
}
