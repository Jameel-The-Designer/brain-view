import { useEffect, useRef } from 'react'

// Permutation table — hoisted so it's built once, not per noise call
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
  const xf = x - Math.floor(x)
  const yf = y - Math.floor(y)
  const zf = z - Math.floor(z)
  const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10)
  const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10)
  const w = zf * zf * zf * (zf * (zf * 6 - 15) + 10)

  const A  = PERM[X]     + Y, AA = PERM[A]     + Z, AB = PERM[A + 1] + Z
  const B  = PERM[X + 1] + Y, BA = PERM[B]     + Z, BB = PERM[B + 1] + Z

  const x1 = xf - 1, y1 = yf - 1, z1 = zf - 1

  const lerp = (a: number, b: number, t: number) => a + t * (b - a)
  return lerp(
    lerp(
      lerp(grad(PERM[AA],   xf, yf, zf), grad(PERM[BA],   x1, yf, zf), u),
      lerp(grad(PERM[AB],   xf, y1, zf), grad(PERM[BB],   x1, y1, zf), u), v),
    lerp(
      lerp(grad(PERM[AA+1], xf, yf, z1), grad(PERM[BA+1], x1, yf, z1), u),
      lerp(grad(PERM[AB+1], xf, y1, z1), grad(PERM[BB+1], x1, y1, z1), u), v), w)
}

// Fractional Brownian Motion — stacked noise octaves for organic surface detail
function fbm(x: number, y: number, z: number, octaves: number): number {
  let val = 0
  let amp = 0.5
  let freq = 1.0
  for (let i = 0; i < octaves; i++) {
    val += noise3D(x * freq, y * freq, z * freq) * amp
    amp  *= 0.48
    freq *= 2.1
  }
  return val
}

interface SpherePoint {
  theta: number
  phi: number
  baseR: number
  layer: 0 | 1  // 0 = surface, 1 = atmospheric haze
  sizeNoise: number  // pre-baked per-particle size variance
}

export default function ParticleSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef  = useRef({ x: 0, y: 0 })
  const animRef   = useRef<number>(0)

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

    // ── Particle setup ────────────────────────────────────────────────────────
    const SURFACE_COUNT = 3000
    const HAZE_COUNT    = 500
    const TOTAL         = SURFACE_COUNT + HAZE_COUNT
    const goldenAngle   = Math.PI * (3 - Math.sqrt(5))
    const points: SpherePoint[] = []

    for (let i = 0; i < SURFACE_COUNT; i++) {
      const y  = 1 - (i / (SURFACE_COUNT - 1)) * 2
      points.push({
        theta:     goldenAngle * i,
        phi:       Math.acos(Math.max(-1, Math.min(1, y))),
        baseR:     0.93 + Math.random() * 0.09,
        layer:     0,
        sizeNoise: Math.random(),
      })
    }

    // Atmospheric haze — random distribution, slightly beyond surface
    for (let i = 0; i < HAZE_COUNT; i++) {
      points.push({
        theta:     Math.random() * Math.PI * 2,
        phi:       Math.acos(2 * Math.random() - 1),
        baseR:     1.06 + Math.random() * 0.22,
        layer:     1,
        sizeNoise: Math.random(),
      })
    }

    // ── Mouse tracking ────────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
        y: ((e.clientY - rect.top)  / rect.height - 0.5) * 2,
      }
    }
    const onMouseLeave = () => { mouseRef.current = { x: 0, y: 0 } }

    canvas.addEventListener('mousemove',  onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('resize',     resize)

    // ── Rotation state — two-stage smoothing for inertia feel ─────────────────
    let rotY = 0, rotX = 0
    let smoothMouseX = 0, smoothMouseY = 0

    // ── Projection scratch buffer — reuse across frames ───────────────────────
    type Projected = {
      x: number; y: number; z: number
      r: number; g: number; b: number
      alpha: number; size: number
    }
    const projected: Projected[] = Array.from({ length: TOTAL }, () => ({
      x: 0, y: 0, z: 0, r: 0, g: 0, b: 0, alpha: 0, size: 0,
    }))

    const draw = (time: number) => {
      const t = time * 0.001

      ctx.clearRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2
      const baseRadius = Math.min(w, h) * 0.33

      // Smooth mouse position independently — decouples mouse snappiness from
      // rotation lag, giving a two-layer easing effect
      smoothMouseX += (mouseRef.current.x - smoothMouseX) * 0.035
      smoothMouseY += (mouseRef.current.y - smoothMouseY) * 0.035

      // Auto-rotation accumulates; mouse adds tilt/yaw bias on top
      const targetRotY = t * 0.10 + smoothMouseX * 0.40
      const targetRotX = smoothMouseY * 0.26
      rotY += (targetRotY - rotY) * 0.018
      rotX += (targetRotX - rotX) * 0.018

      const cosRY = Math.cos(rotY), sinRY = Math.sin(rotY)
      const cosRX = Math.cos(rotX), sinRX = Math.sin(rotX)

      // Slow hue oscillation — shifts the colour character over ~25s cycles
      const hueOsc = Math.sin(t * 0.25) // -1 → 1

      for (let i = 0; i < TOTAL; i++) {
        const pt  = points[i]
        const sp  = Math.sin(pt.phi)
        const cp  = Math.cos(pt.phi)

        // Unit sphere coords
        let sx = sp * Math.cos(pt.theta)
        let sy = cp
        let sz = sp * Math.sin(pt.theta)

        // FBM surface deformation — 4 octaves on surface, 2 on haze
        const ns  = 0.85
        const nt  = t * 0.16
        const nv  = fbm(
          sx * ns + nt * 0.50,
          sy * ns + nt * 0.38,
          sz * ns + nt * 0.28,
          pt.layer === 0 ? 4 : 2,
        )
        const deformAmp = pt.layer === 0 ? 0.17 : 0.32
        const radius = pt.baseR * (1 + nv * deformAmp)

        sx *= radius
        sy *= radius
        sz *= radius

        // Rotate: Y axis, then X axis
        const rx  =  sx * cosRY + sz * sinRY
        const rz1 = -sx * sinRY + sz * cosRY
        const ry  =  sy * cosRX - rz1 * sinRX
        const rz  =  sy * sinRX + rz1 * cosRX

        // Perspective projection
        const perspective = 3.2
        const scale  = perspective / (perspective + rz)
        const projX  = cx + rx * baseRadius * scale
        const projY  = cy + ry * baseRadius * scale

        // Vertical gradient position (in camera space)
        const normY = (ry / radius + 1) * 0.5

        // ── Colour ────────────────────────────────────────────────────────────
        let red: number, green: number, blue: number

        if (pt.layer === 1) {
          // Atmospheric haze: soft violet wash
          red   = 160 + hueOsc * 25
          green = 50
          blue  = 240
        } else {
          // Surface: pink→violet→indigo gradient that slowly breathes
          const phase = normY + Math.sin(t * 0.28 + pt.theta * 0.1) * 0.12

          if (phase > 0.65) {
            // Crown: hot pink / magenta
            const b = (phase - 0.65) / 0.35
            red   = Math.round(255 - b * 20)
            green = Math.round(10  + b * 30)
            blue  = Math.round(160 + b * 95)
          } else if (phase > 0.35) {
            // Mid band: deep violet
            const b = (phase - 0.35) / 0.30
            red   = Math.round(140 + b * 90)
            green = Math.round(15  + b * 10)
            blue  = Math.round(215 + b * 30)
          } else {
            // Base: indigo / dark blue-purple
            const b = phase / 0.35
            red   = Math.round(55  + b * 85)
            green = Math.round(20  + b * 10)
            blue  = Math.round(190 + b * 40)
          }

          // Subtle time-varying shimmer on each particle
          const shimmer = noise3D(sx * 2.5 + t * 0.6, sy * 2.5, sz * 2.5) * 18
          red   = Math.max(0, Math.min(255, red   + shimmer))
          blue  = Math.max(0, Math.min(255, blue  + shimmer * 0.5))
        }

        // Depth-based opacity + size — back particles are smaller and dimmer
        const depthFactor = (rz + 1) * 0.5  // 0 = far back, 1 = front
        const alpha = pt.layer === 0
          ? 0.12 + depthFactor * 0.55
          : 0.03 + depthFactor * 0.10
        const size = pt.layer === 0
          ? (0.45 + depthFactor * 0.90 + pt.sizeNoise * 0.25) * scale
          : (0.20 + pt.sizeNoise * 0.50) * scale

        const p = projected[i]
        p.x = projX; p.y = projY; p.z = rz
        p.r = red;   p.g = green; p.b = blue
        p.alpha = alpha; p.size = size
      }

      // Painter's sort: back-to-front
      projected.sort((a, b) => a.z - b.z)

      for (let i = 0; i < TOTAL; i++) {
        const p = projected[i]
        if (p.size < 0.05) continue
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.r|0},${p.g|0},${p.b|0},${p.alpha.toFixed(3)})`
        ctx.fill()
      }

      // Breathing outer glow — amplitude pulses on a slow sine
      const glowPulse = 0.5 + Math.sin(t * 0.55) * 0.12
      const g1 = ctx.createRadialGradient(cx, cy, baseRadius * 0.15, cx, cy, baseRadius * 1.7)
      g1.addColorStop(0,   `rgba(255,  20, 150, ${(0.08 * glowPulse).toFixed(3)})`)
      g1.addColorStop(0.3, `rgba(160,  30, 230, ${(0.06 * glowPulse).toFixed(3)})`)
      g1.addColorStop(0.6, `rgba( 60,  20, 210, ${(0.03 * glowPulse).toFixed(3)})`)
      g1.addColorStop(1,   'rgba(0, 0, 0, 0)')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, w, h)

      // Inner core light bloom
      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.55)
      g2.addColorStop(0,   `rgba(255, 180, 220, ${(0.06 * glowPulse).toFixed(3)})`)
      g2.addColorStop(0.5, `rgba(200,  60, 200, ${(0.03 * glowPulse).toFixed(3)})`)
      g2.addColorStop(1,   'rgba(0, 0, 0, 0)')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, w, h)

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove',  onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize',     resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0"
    />
  )
}
