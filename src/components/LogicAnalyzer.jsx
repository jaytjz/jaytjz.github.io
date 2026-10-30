import { useEffect, useRef } from 'react'

// Hero visual: a logic analyzer capture scrolling past. The data bus carries
// random hex words. Every loop the design crashes
// (the bus goes X), rst pulses, and the bus spells out the answer to life,
// the universe and everything.
const ROWS = ['clk', 'rst', 'data']
const CYCLE = 32 // px per clock cycle
const SEG = CYCLE * 2 // px per bus word
const SPEED = 64 // px per second
const LABEL_W = 44

// One loop of the capture, in bus slots. Scripted words start at a slot and
// can span several so long words fit; every other slot is a random word.
const LOOP = 28
const SCRIPT = [
  [8, 'XXXX', 1],
  [9, 'XXXX', 1],
  [10, '0000', 1],
  [11, 'THE', 1],
  [12, 'ANSWER', 1],
  [13, 'TO', 1],
  [14, 'LIFE', 1],
  [15, 'THE', 1],
  [16, 'UNIVERSE', 2],
  [18, 'AND', 1],
  [19, 'EVERYTHING', 2],
  [21, '=', 1],
  [22, '42', 1],
]
const SLOTS = Array(LOOP).fill(null)
SCRIPT.forEach(([start, word, span]) => {
  for (let k = 0; k < span; k++) SLOTS[start + k] = { start, word, span }
})
const CRASH_START = 8 * SEG
const RST_START = 9.5 * SEG
const RST_END = 10.5 * SEG

// Deterministic pseudo-random in [0, 1) so the trace is stable as it scrolls.
const hash = (n) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}
const mod = (a, n) => ((a % n) + n) % n
const loopPos = (u) => mod(u, LOOP * SEG)

// Ordinary hex traffic.
const randomWord = (s) => {
  return Math.floor(hash(s + 97) * 0x10000).toString(16).toUpperCase().padStart(4, '0')
}

// The bus word covering slot s: { word, start, span, scripted }.
const busAt = (s) => {
  const slot = SLOTS[mod(s, LOOP)]
  if (slot) return { ...slot, start: s - mod(s, LOOP) + slot.start, scripted: true }
  return { word: randomWord(s), start: s, span: 1, scripted: false }
}
const isX = (word) => word === 'XXXX'

// Signal levels at scroll position u: true = high, false = low, null = X.
const level = {
  clk: (u) => {
    const p = loopPos(u)
    if (p >= CRASH_START && p < RST_END) return false // clock dies until reset releases
    return Math.floor(u / (CYCLE / 2)) % 2 === 0
  },
  rst: (u) => {
    const p = loopPos(u)
    return p >= RST_START && p < RST_END
  },
}

export default function LogicAnalyzer({ className = 'aspect-[16/11]' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const css = getComputedStyle(document.documentElement)
    const color = (name) => css.getPropertyValue(name).trim()
    const ink = color('--color-ink')
    const muted = color('--color-ink-3')
    const line = color('--color-line')
    const accent = color('--color-accent')
    const crash = color('--color-crash')
    const mono = `11px ${color('--font-mono') || 'monospace'}`
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const hatch = (x, y, width, height) => {
      ctx.save()
      ctx.beginPath()
      ctx.rect(x, y, width, height)
      ctx.clip()
      ctx.fillStyle = crash
      ctx.globalAlpha = 0.08
      ctx.fillRect(x, y, width, height)
      ctx.globalAlpha = 0.45
      ctx.strokeStyle = crash
      ctx.lineWidth = 1
      for (let k = -height; k < width; k += 6) {
        ctx.beginPath()
        ctx.moveTo(x + k, y + height)
        ctx.lineTo(x + k + height, y)
        ctx.stroke()
      }
      ctx.restore()
    }

    const drawBus = (off, hi, lo, mid) => {
      const x0 = LABEL_W
      ctx.lineWidth = 1.25
      for (let s = Math.floor(off / SEG); s * SEG - off < w - x0; ) {
        const { word, start, span, scripted } = busAt(s)
        s = start + span
        const a = Math.max(x0, x0 + start * SEG - off)
        const b = x0 + (start + span) * SEG - off
        const clipped = a === x0
        const slant = 5
        const outline = () => {
          ctx.beginPath()
          ctx.moveTo(a + (clipped ? 0 : slant), hi)
          ctx.lineTo(b - slant, hi)
          ctx.lineTo(b, mid)
          ctx.lineTo(b - slant, lo)
          ctx.lineTo(a + (clipped ? 0 : slant), lo)
          if (!clipped) ctx.lineTo(a, mid)
          ctx.closePath()
        }
        if (isX(word)) hatch(a, hi, b - a, lo - hi)
        outline()
        ctx.strokeStyle = isX(word) ? crash : ink
        ctx.globalAlpha = isX(word) ? 1 : 0.7
        ctx.stroke()
        ctx.globalAlpha = 1
        if (b - a > ctx.measureText(word).width + 12) {
          ctx.fillStyle = isX(word) ? crash : scripted ? accent : ink
          ctx.textAlign = 'center'
          ctx.fillText(word, (a + b) / 2, mid + 0.5)
          ctx.textAlign = 'left'
        }
      }
    }

    const drawBit = (name, off, hi, lo, mid) => {
      const x0 = LABEL_W
      // Group the trace into runs of the same level, then draw each run.
      const runs = []
      for (let x = x0; x <= w; x++) {
        const v = level[name](off + x - x0)
        const last = runs[runs.length - 1]
        if (last && last.v === v) last.b = x
        else runs.push({ v, a: x, b: x })
      }
      runs.forEach((run, k) => {
        // rst is only red while it's asserted.
        const active = name === 'rst' && run.v ? crash : ink
        if (run.v === null) {
          hatch(run.a, hi, run.b - run.a + 1, lo - hi)
          ctx.strokeStyle = crash
          ctx.lineWidth = 1.25
          ctx.beginPath()
          ctx.moveTo(run.a, hi)
          ctx.lineTo(run.b + 1, hi)
          ctx.moveTo(run.a, lo)
          ctx.lineTo(run.b + 1, lo)
          ctx.stroke()
          return
        }
        const y = run.v ? hi : lo
        ctx.strokeStyle = active
        const quiet = name === 'clk' || (name === 'rst' && !run.v)
        ctx.globalAlpha = quiet ? 0.7 : 1
        ctx.lineWidth = quiet ? 1.25 : 2
        ctx.beginPath()
        const prev = runs[k - 1]
        if (prev && prev.v !== null) ctx.moveTo(run.a, prev.v ? hi : lo)
        else ctx.moveTo(run.a, y)
        ctx.lineTo(run.a, y)
        ctx.lineTo(run.b + 1, y)
        ctx.stroke()
        ctx.globalAlpha = 1
      })
    }

    const draw = (off) => {
      ctx.clearRect(0, 0, w, h)
      const rowH = h / ROWS.length

      // Clock-edge grid
      ctx.strokeStyle = line
      ctx.lineWidth = 1
      for (let u = Math.ceil(off / CYCLE) * CYCLE; u - off < w - LABEL_W; u += CYCLE) {
        const x = Math.round(LABEL_W + u - off) + 0.5
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }

      ctx.font = mono
      ctx.textBaseline = 'middle'
      ROWS.forEach((name, r) => {
        const hi = r * rowH + rowH * 0.28
        const lo = r * rowH + rowH * 0.72
        const mid = (hi + lo) / 2
        ctx.fillStyle = muted
        ctx.fillText(name, 0, mid)
        if (name === 'data') drawBus(off, hi, lo, mid)
        else drawBit(name, off, hi, lo, mid)
      })
    }

    let frame
    let stopped = false
    const start = performance.now()
    const tick = (now) => {
      draw(((now - start) / 1000) * SPEED)
      frame = requestAnimationFrame(tick)
    }
    // Canvas keeps whatever font was available when ctx.font was first set,
    // so wait for the mono font before drawing any text.
    document.fonts.load(mono).finally(() => {
      if (stopped) return
      // With reduced motion, show a still frame of the punchline.
      if (reduce) draw(18 * SEG)
      else frame = requestAnimationFrame(tick)
    })

    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full ${className}`}
      role="img"
      aria-label="Animated logic analyzer trace: the data bus carries hex words, crashes, gets reset, then spells out THE ANSWER TO LIFE THE UNIVERSE AND EVERYTHING = 42"
    />
  )
}
