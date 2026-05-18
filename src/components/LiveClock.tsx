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
    <div className="text-right">
      <div className="text-[10px] font-mono tracking-[0.2em] text-text-muted uppercase">
        JHB
      </div>
      <div className="font-mono text-lg text-accent tabular-nums">
        {formatted}
      </div>
    </div>
  )
}
