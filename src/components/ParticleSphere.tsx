import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { InnerBall, Phase } from '../types'

// ── Permutation table (built once at module load) ─────────────────────────────
const PERM_SRC = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180]
const PERM = [...PERM_SRC, ...PERM_SRC]

function grad(hash: number, x: number, y: number, z: number): number {
  const h = hash & 15
  const u = h < 8 ? x : y
  const v = h < 4 ? y : (h === 12 || h === 14 ? x : z)
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
}

function noise3D(x: number, y: number, z: number): number {
  const X = Math.floor(x) & 255
  const Y = Math.floor(y) & 255
  const Z = Math.floor(z) & 255
  const xf = x - Math.floor(x), yf = y - Math.floor(y), zf = z - Math.floor(z)
  const u = xf*xf*xf*(xf*(xf*6-15)+10)
  const v = yf*yf*yf*(yf*(yf*6-15)+10)
  const w = zf*zf*zf*(zf*(zf*6-15)+10)
  const A  = PERM[X]+Y,   AA = PERM[A]+Z,   AB = PERM[A+1]+Z
  const B  = PERM[X+1]+Y, BA = PERM[B]+Z,   BB = PERM[B+1]+Z
  const x1 = xf-1, y1 = yf-1, z1 = zf-1
  const lp = (a: number, b: number, t: number) => a + t*(b-a)
  return lp(
    lp(lp(grad(PERM[AA],xf,yf,zf),   grad(PERM[BA],x1,yf,zf),  u),
       lp(grad(PERM[AB],xf,y1,zf),   grad(PERM[BB],x1,y1,zf),  u), v),
    lp(lp(grad(PERM[AA+1],xf,yf,z1), grad(PERM[BA+1],x1,yf,z1),u),
       lp(grad(PERM[AB+1],xf,y1,z1), grad(PERM[BB+1],x1,y1,z1),u), v), w)
}

function fbm(x: number, y: number, z: number, octaves: number): number {
  let val = 0, amp = 0.5, freq = 1.0
  for (let i = 0; i < octaves; i++) {
    val += noise3D(x*freq, y*freq, z*freq) * amp
    amp *= 0.48; freq *= 2.1
  }
  return val
}

function easeOutCubic(t: number) { return 1 - (1-t)**3 }
function easeInCubic(t: number)  { return t*t*t }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
function lerp(a: number, b: number, t: number) { return a + (b-a)*t }

interface SpherePoint {
  theta: number; phi: number; baseR: number; layer: 0|1; sizeNoise: number
}

interface BallPhysics {
  x3d: number; y3d: number; z3d: number; opacity: number
}

interface ProjectedBall {
  ball: InnerBall; screenX: number; screenY: number; screenRadius: number; z: number; opacity: number
}

export interface ParticleSphereProps {
  ballsRef: MutableRefObject<InnerBall[]>
  dataReadyRef: MutableRefObject<boolean>
  phaseRef: MutableRefObject<{ phase: Phase; phaseStartTime: number }>
  onPhaseChangeRef: MutableRefObject<(p: Phase) => void>
  onBallClick: (ball: InnerBall) => void
}

export default function ParticleSphere({
  ballsRef, dataReadyRef, phaseRef, onPhaseChangeRef, onBallClick,
}: ParticleSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>(0)

  // onBallClick needs to be stable-ref so canvas closure always calls latest
  const onBallClickRef = useRef(onBallClick)
  useEffect(() => { onBallClickRef.current = onBallClick }, [onBallClick])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0
    const dpr = Math.min(window.devicePixelRatio, 2)

    const resize = () => {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width  = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    // ── Sphere particles ────────────────────────────────────────────────────
    const SURFACE = 3000, HAZE = 500, TOTAL = SURFACE + HAZE
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    const points: SpherePoint[] = []
    for (let i = 0; i < SURFACE; i++) {
      const y = 1 - (i/(SURFACE-1))*2
      points.push({ theta: goldenAngle*i, phi: Math.acos(Math.max(-1,Math.min(1,y))), baseR: 0.93+Math.random()*0.09, layer: 0, sizeNoise: Math.random() })
    }
    for (let i = 0; i < HAZE; i++) {
      points.push({ theta: Math.random()*Math.PI*2, phi: Math.acos(2*Math.random()-1), baseR: 1.06+Math.random()*0.22, layer: 1, sizeNoise: Math.random() })
    }

    // Projection scratch buffer
    type Projected = { x:number; y:number; z:number; r:number; g:number; b:number; alpha:number; size:number }
    const projected: Projected[] = Array.from({ length: TOTAL }, () => ({ x:0,y:0,z:0,r:0,g:0,b:0,alpha:0,size:0 }))

    // ── Ball physics array — initialized lazily ──────────────────────────────
    let ballsPhysics: BallPhysics[] = []
    let lastBallCount = 0
    const projectedBalls: ProjectedBall[] = []

    // ── Selected ball id — closure var, no prop threading needed ─────────────
    let selectedId: string | null = null

    // ── baseRadius as ref so click handler reads current value ────────────────
    let baseRadius = 300

    // ── Mouse ──────────────────────────────────────────────────────────────────
    const mouseRef = useRef({ x: 0, y: 0 })
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
        y: ((e.clientY - rect.top)  / rect.height - 0.5) * 2,
      }
    }
    const onMouseLeave = () => { mouseRef.current = { x:0, y:0 } }
    canvas.addEventListener('mousemove',  onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)

    // ── Click handler ──────────────────────────────────────────────────────────
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const cx = w/2, cy = h/2

      const { phase } = phaseRef.current

      if (phase === 'sphere') {
        const dist = Math.hypot(mx - cx, my - cy)
        if (dist < baseRadius * 1.15 && dataReadyRef.current) {
          phaseRef.current = { phase: 'exploding', phaseStartTime: performance.now() }
          onPhaseChangeRef.current('exploding')
        }
        return
      }

      if (phase === 'universe') {
        let hit: InnerBall | null = null
        let bestZ = -Infinity
        for (const pb of projectedBalls) {
          const d = Math.hypot(mx - pb.screenX, my - pb.screenY)
          if (d <= pb.screenRadius * 1.1 && pb.z > bestZ) {
            hit = pb.ball; bestZ = pb.z
          }
        }
        if (hit) {
          selectedId = hit.id
          onBallClickRef.current(hit)
        } else {
          selectedId = null
          phaseRef.current = { phase: 'collapsing', phaseStartTime: performance.now() }
          onPhaseChangeRef.current('collapsing')
        }
      }
    }
    canvas.addEventListener('click', onClick)

    // ── Rotation state ─────────────────────────────────────────────────────────
    let rotY = 0, rotX = 0
    let smoothMouseX = 0, smoothMouseY = 0

    // ── Draw loop ──────────────────────────────────────────────────────────────
    const draw = (time: number) => {
      const t = time * 0.001
      ctx.clearRect(0, 0, w, h)

      const cx = w/2, cy = h/2
      baseRadius = Math.min(w, h) * 0.33

      // Phase timing
      const { phase, phaseStartTime } = phaseRef.current
      const rawT = clamp((performance.now() - phaseStartTime) / 600, 0, 1)
      const eOut = easeOutCubic(rawT)
      const eIn  = easeInCubic(rawT)

      // Auto-transition at end of timed phases
      if (phase === 'exploding' && rawT >= 1) {
        phaseRef.current = { phase: 'universe', phaseStartTime: performance.now() }
        onPhaseChangeRef.current('universe')
      }
      if (phase === 'collapsing' && rawT >= 1) {
        phaseRef.current = { phase: 'sphere', phaseStartTime: performance.now() }
        onPhaseChangeRef.current('sphere')
        selectedId = null
      }

      // Rotation
      smoothMouseX += (mouseRef.current.x - smoothMouseX) * 0.035
      smoothMouseY += (mouseRef.current.y - smoothMouseY) * 0.035
      const targetRotY = t * 0.10 + smoothMouseX * 0.40
      const targetRotX = smoothMouseY * 0.26
      rotY += (targetRotY - rotY) * 0.018
      rotX += (targetRotX - rotX) * 0.018
      const cosRY = Math.cos(rotY), sinRY = Math.sin(rotY)
      const cosRX = Math.cos(rotX), sinRX = Math.sin(rotX)

      // Per-phase particle modifiers
      let pRadMult = 1.0, pAlphaMult = 1.0
      if (phase === 'exploding') {
        pRadMult  = 1 + eOut * 2.5
        pAlphaMult = 1 - eOut * 0.82
      } else if (phase === 'universe') {
        pRadMult  = 3.5
        pAlphaMult = 0.18
      } else if (phase === 'collapsing') {
        pRadMult  = 1 + (1 - eIn) * 2.5
        pAlphaMult = 0.18 + eIn * 0.82
      }

      // Hue oscillation
      const hueOsc = Math.sin(t * 0.25)

      // ── Draw sphere particles ──────────────────────────────────────────────
      for (let i = 0; i < TOTAL; i++) {
        const pt = points[i]
        const sp = Math.sin(pt.phi), cp = Math.cos(pt.phi)
        let sx = sp * Math.cos(pt.theta), sy = cp, sz = sp * Math.sin(pt.theta)

        const ns = 0.85, nt = t * 0.16
        const nv = fbm(sx*ns+nt*0.50, sy*ns+nt*0.38, sz*ns+nt*0.28, pt.layer===0?4:2)
        const radius = pt.baseR * (1 + nv * (pt.layer===0?0.17:0.32)) * pRadMult

        sx *= radius; sy *= radius; sz *= radius

        const rx  =  sx*cosRY + sz*sinRY
        const rz1 = -sx*sinRY + sz*cosRY
        const ry  =  sy*cosRX - rz1*sinRX
        const rz  =  sy*sinRX + rz1*cosRX

        const perspective = 3.2
        const scale  = perspective / (perspective + rz / baseRadius)
        const projX  = cx + rx * scale
        const projY  = cy + ry * scale

        const normY = (sy/radius + 1) * 0.5
        let red: number, green: number, blue: number

        if (pt.layer === 1) {
          red = 160 + hueOsc*25; green = 50; blue = 240
        } else {
          const phase2 = normY + Math.sin(t*0.28 + pt.theta*0.1)*0.12
          if (phase2 > 0.65) {
            const b = (phase2-0.65)/0.35
            red=Math.round(255-b*20); green=Math.round(10+b*30); blue=Math.round(160+b*95)
          } else if (phase2 > 0.35) {
            const b = (phase2-0.35)/0.30
            red=Math.round(140+b*90); green=20; blue=Math.round(215+b*30)
          } else {
            const b = phase2/0.35
            red=Math.round(55+b*85); green=Math.round(20+b*10); blue=Math.round(190+b*40)
          }
          const shimmer = noise3D(sx*2.5+t*0.6, sy*2.5, sz*2.5)*18
          red  = Math.max(0,Math.min(255,red+shimmer))
          blue = Math.max(0,Math.min(255,blue+shimmer*0.5))
        }

        const depthFactor = (rz + baseRadius) / (2 * baseRadius)
        const baseAlpha = pt.layer===0 ? 0.12 + depthFactor*0.55 : 0.03 + depthFactor*0.10
        const alpha = baseAlpha * pAlphaMult
        const size  = pt.layer===0
          ? (0.45 + depthFactor*0.90 + pt.sizeNoise*0.25) * scale
          : (0.20 + pt.sizeNoise*0.50) * scale

        const p = projected[i]
        p.x=projX; p.y=projY; p.z=rz; p.r=red; p.g=green; p.b=blue; p.alpha=alpha; p.size=size
      }

      projected.sort((a,b) => a.z - b.z)

      for (let i = 0; i < TOTAL; i++) {
        const p = projected[i]
        if (p.size < 0.05 || p.alpha < 0.005) continue
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2)
        ctx.fillStyle = `rgba(${p.r|0},${p.g|0},${p.b|0},${p.alpha.toFixed(3)})`
        ctx.fill()
      }

      // ── Draw inner balls ───────────────────────────────────────────────────
      if (phase !== 'sphere') {
        const balls = ballsRef.current

        // Re-init physics if ball count changed
        if (balls.length !== lastBallCount) {
          ballsPhysics = balls.map(() => ({ x3d:0, y3d:0, z3d:0, opacity:0 }))
          lastBallCount = balls.length
        }

        projectedBalls.length = 0

        for (let i = 0; i < balls.length; i++) {
          const ball  = balls[i]
          const phys  = ballsPhysics[i]

          // Position lerp based on phase
          let targetX = ball.nx * baseRadius
          let targetY = ball.ny * baseRadius
          let targetZ = ball.nz * baseRadius

          // Add gentle float in universe
          const floatAmp = baseRadius * 0.018
          const ft = t + ball.phaseOffset
          targetX += Math.sin(ft * 0.7) * floatAmp
          targetY += Math.cos(ft * 0.5) * floatAmp
          targetZ += Math.sin(ft * 0.6 + 1.2) * floatAmp

          if (phase === 'exploding') {
            phys.x3d    = lerp(0, targetX, eOut)
            phys.y3d    = lerp(0, targetY, eOut)
            phys.z3d    = lerp(0, targetZ, eOut)
            phys.opacity = eOut
          } else if (phase === 'universe') {
            phys.x3d    = targetX
            phys.y3d    = targetY
            phys.z3d    = targetZ
            phys.opacity = 1.0
          } else if (phase === 'collapsing') {
            phys.x3d    = lerp(targetX, 0, eIn)
            phys.y3d    = lerp(targetY, 0, eIn)
            phys.z3d    = lerp(targetZ, 0, eIn)
            phys.opacity = 1 - eIn
          }

          // Apply rotation
          const rx  =  phys.x3d*cosRY + phys.z3d*sinRY
          const rz1 = -phys.x3d*sinRY + phys.z3d*cosRY
          const ry  =  phys.y3d*cosRX - rz1*sinRX
          const rz  =  phys.y3d*sinRX + rz1*cosRX

          const perspective = 3.2
          const scale       = perspective / (perspective + rz / baseRadius)
          const screenX     = cx + rx * scale
          const screenY     = cy + ry * scale
          const screenR     = ball.radius * scale

          projectedBalls.push({ ball, screenX, screenY, screenRadius: screenR, z: rz, opacity: phys.opacity })
        }

        // Sort back-to-front
        projectedBalls.sort((a, b) => a.z - b.z)

        for (const pb of projectedBalls) {
          if (pb.opacity < 0.01 || pb.screenRadius < 0.5) continue
          const [r, g, b] = pb.ball.color
          const op = pb.opacity

          // Glow halo for achieved goals
          if (pb.ball.glow) {
            const gp = 0.5 + Math.sin(t * 3) * 0.5
            const gr = ctx.createRadialGradient(pb.screenX, pb.screenY, pb.screenRadius*0.8, pb.screenX, pb.screenY, pb.screenRadius*2.4)
            gr.addColorStop(0, `rgba(${r},${g},${b},${(0.45*op*gp).toFixed(3)})`)
            gr.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = gr
            const gr2 = pb.screenRadius * 2.4
            ctx.fillRect(pb.screenX-gr2, pb.screenY-gr2, gr2*2, gr2*2)
          }

          // Ball body — radial gradient for 3D look
          const hl = ctx.createRadialGradient(
            pb.screenX - pb.screenRadius*0.3, pb.screenY - pb.screenRadius*0.3, 0,
            pb.screenX, pb.screenY, pb.screenRadius,
          )
          hl.addColorStop(0, `rgba(${Math.min(255,r+90)},${Math.min(255,g+90)},${Math.min(255,b+90)},${op.toFixed(3)})`)
          hl.addColorStop(0.55, `rgba(${r},${g},${b},${op.toFixed(3)})`)
          hl.addColorStop(1,   `rgba(${Math.max(0,r-65)},${Math.max(0,g-65)},${Math.max(0,b-65)},${op.toFixed(3)})`)
          ctx.beginPath()
          ctx.arc(pb.screenX, pb.screenY, pb.screenRadius, 0, Math.PI*2)
          ctx.fillStyle = hl
          ctx.fill()

          // Selected ring
          if (selectedId === pb.ball.id) {
            const rp = 0.6 + Math.sin(t * 5) * 0.4
            ctx.strokeStyle = `rgba(255,255,255,${(rp * op).toFixed(2)})`
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.arc(pb.screenX, pb.screenY, pb.screenRadius + 5, 0, Math.PI*2)
            ctx.stroke()
          }

          // Labels
          if (pb.screenRadius >= 9 && pb.opacity > 0.35) {
            const fs = Math.max(9, Math.min(13, pb.screenRadius * 0.55))
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            if (pb.screenRadius >= 22) {
              ctx.font = `500 ${fs}px ui-sans-serif, system-ui, sans-serif`
              ctx.fillStyle = `rgba(255,255,255,${(pb.opacity*0.92).toFixed(2)})`
              ctx.fillText(pb.ball.label, pb.screenX, pb.screenY)
              if (pb.ball.sublabel && pb.screenRadius >= 30) {
                ctx.font = `${fs*0.78}px ui-monospace, monospace`
                ctx.fillStyle = `rgba(255,255,255,${(pb.opacity*0.55).toFixed(2)})`
                ctx.fillText(pb.ball.sublabel, pb.screenX, pb.screenY + fs*1.1)
              }
            } else {
              ctx.font = `${fs}px ui-sans-serif, system-ui, sans-serif`
              ctx.fillStyle = `rgba(255,255,255,${(pb.opacity*0.7).toFixed(2)})`
              ctx.fillText(pb.ball.label, pb.screenX, pb.screenY + pb.screenRadius + fs*0.8)
            }
          }
        }
      }

      // ── Glow overlays ──────────────────────────────────────────────────────
      const gp = 0.5 + Math.sin(t * 0.55) * 0.12
      const g1 = ctx.createRadialGradient(cx, cy, baseRadius*0.15, cx, cy, baseRadius*1.7)
      g1.addColorStop(0,   `rgba(255, 20,150,${(0.08*gp).toFixed(3)})`)
      g1.addColorStop(0.3, `rgba(160, 30,230,${(0.06*gp).toFixed(3)})`)
      g1.addColorStop(0.6, `rgba( 60, 20,210,${(0.03*gp).toFixed(3)})`)
      g1.addColorStop(1,   'rgba(0,0,0,0)')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, w, h)

      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius*0.55)
      g2.addColorStop(0, `rgba(255,180,220,${(0.06*gp).toFixed(3)})`)
      g2.addColorStop(0.5, `rgba(200,60,200,${(0.03*gp).toFixed(3)})`)
      g2.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, w, h)

      // Loading indicator — small dot bottom-right while data not ready
      if (!dataReadyRef.current) {
        const pulse = 0.3 + Math.sin(t * 4) * 0.2
        ctx.beginPath()
        ctx.arc(w - 24, h - 24, 3, 0, Math.PI*2)
        ctx.fillStyle = `rgba(255,255,255,${pulse.toFixed(2)})`
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove',  onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
      canvas.removeEventListener('click',      onClick)
      window.removeEventListener('resize',     resize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 cursor-pointer" />
  )
}
