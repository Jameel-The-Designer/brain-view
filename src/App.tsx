import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import type { MutableRefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ParticleSphere from './components/ParticleSphere'
import { useClients, useGoals, useProjects, usePeople, useStackItems, useConversationLog } from './hooks/useSupabase'
import type { Phase, InnerBall } from './types'

// ── Deterministic pseudo-random from a string id ────────────────────────────
function seededRandom(id: string): () => number {
  let seed = 0
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 0xffffffff
  }
}

function fibonacciPosition(index: number, id: string): [number, number, number] {
  const rng = seededRandom(id)
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const y = 1 - (index / 999) * 2
  const theta = goldenAngle * index
  const phi = Math.acos(Math.max(-1, Math.min(1, y)))
  const r = 0.55 + rng() * 0.28
  return [
    Math.sin(phi) * Math.cos(theta) * r,
    Math.cos(phi) * r,
    Math.sin(phi) * Math.sin(theta) * r,
  ]
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

function computeBalls(
  clients: ReturnType<typeof useClients>['data'],
  goals: ReturnType<typeof useGoals>['data'],
  projects: ReturnType<typeof useProjects>['data'],
  people: ReturnType<typeof usePeople>['data'],
  stackItems: ReturnType<typeof useStackItems>['data'],
  log: ReturnType<typeof useConversationLog>['data'],
): InnerBall[] {
  const balls: InnerBall[] = []

  // Clients — sized by mrr_zar
  const maxMRR = Math.max(1, ...clients.map(c => c.mrr_zar ?? 0))
  clients.forEach((c, i) => {
    const norm = clamp((c.mrr_zar ?? 0) / maxMRR, 0, 1)
    const [nx, ny, nz] = fibonacciPosition(balls.length, c.id)
    balls.push({
      id: c.id,
      label: c.name.slice(0, 18),
      sublabel: c.mrr_zar ? `R${c.mrr_zar.toLocaleString()}/mo` : c.status,
      category: 'client',
      radius: lerp(8, 38, norm),
      color: [255, 180, 50],
      glow: false,
      nx, ny, nz,
      phaseOffset: i * 0.7,
    })
  })

  // Goals — sized by progress
  goals.forEach((g, i) => {
    const progress = clamp(g.current_value / Math.max(1, g.target_value), 0, 1)
    const norm = clamp(progress + (g.milestone ? 0.15 : 0), 0, 1)
    const [nx, ny, nz] = fibonacciPosition(balls.length, g.id)
    balls.push({
      id: g.id,
      label: g.label.slice(0, 18),
      sublabel: `${Math.round(progress * 100)}%`,
      category: 'goal',
      radius: lerp(8, 28, norm),
      color: [80, 220, 120],
      glow: g.achieved,
      nx, ny, nz,
      phaseOffset: i * 0.9,
    })
  })

  // Projects — sized by stack complexity
  projects.forEach((p, i) => {
    const norm = clamp((p.stack?.length ?? 0) / 10, 0, 1)
    const bm = p.status === 'active' ? 1 : p.status === 'complete' ? 0.85 : 0.65
    const [nx, ny, nz] = fibonacciPosition(balls.length, p.id)
    balls.push({
      id: p.id,
      label: p.name.slice(0, 18),
      sublabel: p.status,
      category: 'project',
      radius: lerp(8, 26, norm),
      color: [Math.round(80 * bm), Math.round(180 * bm), Math.round(255 * bm)],
      glow: false,
      nx, ny, nz,
      phaseOffset: i * 1.1,
    })
  })

  // People — sized by responsibilities
  people.forEach((p, i) => {
    const norm = clamp((p.responsibilities?.length ?? 0) / 6, 0, 1)
    const [nx, ny, nz] = fibonacciPosition(balls.length, p.id)
    balls.push({
      id: p.id,
      label: (p.alias ?? p.name).slice(0, 18),
      sublabel: p.role.slice(0, 18),
      category: 'person',
      radius: lerp(8, 18, norm),
      color: [255, 100, 180],
      glow: false,
      nx, ny, nz,
      phaseOffset: i * 0.5,
    })
  })

  // Stack items — uniform small
  stackItems.forEach((s, i) => {
    const [nx, ny, nz] = fibonacciPosition(balls.length, s.id)
    balls.push({
      id: s.id,
      label: s.name.slice(0, 18),
      sublabel: s.category,
      category: 'stack',
      radius: 7,
      color: [160, 100, 255],
      glow: false,
      nx, ny, nz,
      phaseOffset: i * 0.3,
    })
  })

  // Log entries — sized by tag count
  log.forEach((e, i) => {
    const norm = clamp((e.tags?.length ?? 1) / 5, 0, 1)
    const [nx, ny, nz] = fibonacciPosition(balls.length, e.id)
    balls.push({
      id: e.id,
      label: e.topic.slice(0, 18),
      sublabel: e.date,
      category: 'log',
      radius: lerp(6, 14, norm),
      color: [100, 220, 220],
      glow: false,
      nx, ny, nz,
      phaseOffset: i * 0.4,
    })
  })

  return balls
}

const CATEGORY_LABELS: Record<InnerBall['category'], string> = {
  client: 'Client', goal: 'Goal', project: 'Project',
  person: 'Person', stack: 'Stack', log: 'Log',
}

const CATEGORY_COLORS: Record<InnerBall['category'], string> = {
  client: '#ffb432', goal: '#50dc78', project: '#50b4ff',
  person: '#ff64b4', stack: '#a064ff', log: '#64dcdc',
}

export default function App() {
  const { data: clients, loading: l1 } = useClients()
  const { data: goals, loading: l2 } = useGoals()
  const { data: projects, loading: l3 } = useProjects()
  const { data: people, loading: l4 } = usePeople()
  const { data: stackItems, loading: l5 } = useStackItems()
  const { data: log, loading: l6 } = useConversationLog()

  const dataReady = !l1 && !l2 && !l3 && !l4 && !l5 && !l6

  const balls = useMemo(
    () => computeBalls(clients, goals, projects, people, stackItems, log),
    [clients, goals, projects, people, stackItems, log],
  )

  const [phase, setPhase] = useState<Phase>('sphere')
  const [selectedBall, setSelectedBall] = useState<InnerBall | null>(null)

  const ballsRef = useRef<InnerBall[]>([])
  const dataReadyRef = useRef(false)
  const phaseRef = useRef<{ phase: Phase; phaseStartTime: number }>({ phase: 'sphere', phaseStartTime: 0 })
  const onPhaseChangeRef = useRef<(p: Phase) => void>(() => {})

  useEffect(() => { ballsRef.current = balls }, [balls])
  useEffect(() => { dataReadyRef.current = dataReady }, [dataReady])
  useEffect(() => { phaseRef.current = { phase, phaseStartTime: performance.now() } }, [phase])

  const handlePhaseChange = useCallback((p: Phase) => setPhase(p), [])
  useEffect(() => { onPhaseChangeRef.current = handlePhaseChange }, [handlePhaseChange])

  const handleBallClick = useCallback((ball: InnerBall) => setSelectedBall(ball), [])

  useEffect(() => { if (phase === 'sphere') setSelectedBall(null) }, [phase])

  return (
    <div className="h-screen w-screen bg-[#050508] overflow-hidden relative">
      <ParticleSphere
        ballsRef={ballsRef as MutableRefObject<InnerBall[]>}
        dataReadyRef={dataReadyRef}
        phaseRef={phaseRef}
        onPhaseChangeRef={onPhaseChangeRef}
        onBallClick={handleBallClick}
      />

      <AnimatePresence>
        {phase === 'sphere' && dataReady && (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs font-mono text-white pointer-events-none tracking-widest"
          >
            tap to explore
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedBall && phase === 'universe' && (
          <motion.div
            key={selectedBall.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-8 left-8 max-w-[240px] rounded-sm border border-white/10 bg-black/65 backdrop-blur-sm p-4 pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm"
                style={{
                  background: CATEGORY_COLORS[selectedBall.category] + '33',
                  color: CATEGORY_COLORS[selectedBall.category],
                }}
              >
                {CATEGORY_LABELS[selectedBall.category]}
              </span>
              {selectedBall.glow && (
                <span className="text-[10px] font-mono text-emerald-400">achieved</span>
              )}
            </div>
            <p className="text-sm text-white font-medium leading-snug">{selectedBall.label}</p>
            {selectedBall.sublabel && (
              <p className="text-xs text-white/50 font-mono mt-1">{selectedBall.sublabel}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
