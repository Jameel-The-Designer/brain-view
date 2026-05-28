import { useEffect, useRef } from 'react'

function noise3D(x: number, y: number, z: number): number {
  const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180]
  const perm = [...p, ...p]
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
  const lerp = (a: number, b: number, t: number) => a + t * (b - a)
  const grad = (hash: number, gx: number, gy: number, gz: number) => {
    const h = hash & 15
    const u = h < 8 ? gx : gy
    const v = h < 4 ? gy : h === 12 || h === 14 ? gx : gz
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255
  const xf = x - Math.floor(x), yf = y - Math.floor(y), zf = z - Math.floor(z)
  const u = fade(xf), v = fade(yf), w = fade(zf)

  const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z
  const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z

  return lerp(
    lerp(lerp(grad(perm[AA], xf, yf, zf), grad(perm[BA], xf - 1, yf, zf), u),
         lerp(grad(perm[AB], xf, yf - 1, zf), grad(perm[BB], xf - 1, yf - 1, zf), u), v),
    lerp(lerp(grad(perm[AA + 1], xf, yf, zf - 1), grad(perm[BA + 1], xf - 1, yf, zf - 1), u),
         lerp(grad(perm[AB + 1], xf, yf - 1, zf - 1), grad(perm[BB + 1], xf - 1, yf - 1, zf - 1), u), v), w)
}

interface SpherePoint {
  theta: number
  phi: number
  baseR: number
}

export default function ParticleSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const animRef = useRef<number>(0)

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
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const COUNT = 1800
    const points: SpherePoint[] = []
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = goldenAngle * i
      const phi = Math.acos(y)

      points.push({
        theta,
        phi,
        baseR: 0.95 + Math.random() * 0.1,
      })
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      }
    }
    const onMouseLeave = () => {
      mouseRef.current = { x: 0, y: 0 }
    }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('resize', resize)

    let rotY = 0
    let rotX = 0
    let targetRotX = 0
    let targetRotY = 0

    const draw = (time: number) => {
      const t = time * 0.001

      ctx.clearRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2
      const baseRadius = Math.min(w, h) * 0.32

      targetRotY = t * 0.15 + mouseRef.current.x * 0.3
      targetRotX = mouseRef.current.y * 0.2
      rotY += (targetRotY - rotY) * 0.02
      rotX += (targetRotX - rotX) * 0.02

      const cosRY = Math.cos(rotY), sinRY = Math.sin(rotY)
      const cosRX = Math.cos(rotX), sinRX = Math.sin(rotX)

      const projected: { x: number; y: number; z: number; r: number; g: number; b: number; alpha: number; size: number }[] = []

      for (let i = 0; i < COUNT; i++) {
        const pt = points[i]
        const sinPhi = Math.sin(pt.phi)
        const cosPhi = Math.cos(pt.phi)

        let sx = sinPhi * Math.cos(pt.theta)
        let sy = cosPhi
        let sz = sinPhi * Math.sin(pt.theta)

        const noiseScale = 0.8
        const nVal = noise3D(
          sx * noiseScale + t * 0.4,
          sy * noiseScale + t * 0.3,
          sz * noiseScale + t * 0.2
        )
        const deform = 1 + nVal * 0.18
        const r = pt.baseR * deform

        sx *= r
        sy *= r
        sz *= r

        let x1 = sx * cosRY + sz * sinRY
        let z1 = -sx * sinRY + sz * cosRY
        let y1 = sy * cosRX - z1 * sinRX
        let z2 = sy * sinRX + z1 * cosRX

        const perspective = 3.5
        const scale = perspective / (perspective + z2)

        const projX = cx + x1 * baseRadius * scale
        const projY = cy + y1 * baseRadius * scale

        const normY = (y1 * r + 1) / 2

        let red, green, blue
        if (normY > 0.5) {
          const t2 = (normY - 0.5) * 2
          red = Math.round(255 * (1 - t2) + 200 * t2)
          green = Math.round(0 * (1 - t2) + 50 * t2)
          blue = Math.round(120 * (1 - t2) + 220 * t2)
        } else {
          const t2 = normY * 2
          red = Math.round(80 * (1 - t2) + 255 * t2)
          green = Math.round(50 * (1 - t2) + 0 * t2)
          blue = Math.round(230 * (1 - t2) + 120 * t2)
        }

        const depthAlpha = 0.15 + (z2 + 1) * 0.425
        const size = (0.6 + (z2 + 1) * 0.7) * scale

        projected.push({
          x: projX,
          y: projY,
          z: z2,
          r: red,
          g: green,
          b: blue,
          alpha: depthAlpha,
          size,
        })
      }

      projected.sort((a, b) => a.z - b.z)

      for (const p of projected) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.alpha})`
        ctx.fill()
      }

      ctx.save()
      const glowGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.3, cx, cy, baseRadius * 1.4)
      glowGrad.addColorStop(0, 'rgba(255, 0, 120, 0.06)')
      glowGrad.addColorStop(0.4, 'rgba(140, 40, 200, 0.04)')
      glowGrad.addColorStop(0.7, 'rgba(60, 40, 220, 0.02)')
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = glowGrad
      ctx.fillRect(0, 0, w, h)
      ctx.restore()

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0"
    />
  )
}
