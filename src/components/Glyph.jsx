import { useEffect, useState } from 'react'

// Small abstract figures that sit beside each featured project.
const S = 'var(--color-ink)'
const A = 'var(--color-accent)'

function Sparse() {
  // CSR walk: the cursor visits only the nonzeros, row by row, filling in
  // the output column as each row finishes.
  const nz = [
    [0, 1], [1, 4], [2, 0], [2, 5], [3, 3], [4, 1], [4, 6], [5, 2], [6, 4], [6, 6],
  ]
  const hop = 0.4
  const t = useLoopTime((nz.length + 5) * hop)
  const reduce = usePrefersReducedMotion()
  const k = reduce ? 6 : Math.floor(t / hop)
  const done = k >= nz.length
  const cur = nz[Math.min(k, nz.length - 1)]
  const cell = 20
  const ox = 14
  const oy = 30
  const visited = (q) => q < k || done
  return (
    <>
      {Array.from({ length: 7 }, (_, i) =>
        Array.from({ length: 7 }, (_, j) => (
          <rect key={`${i}-${j}`} x={ox + j * cell + 3} y={oy + i * cell + 3} width="14" height="14" rx="2" fill="none" stroke="var(--color-line)" />
        )),
      )}
      {nz.map(([i, j], q) => (
        <rect
          key={`nz-${i}-${j}`}
          x={ox + j * cell + 3}
          y={oy + i * cell + 3}
          width="14"
          height="14"
          rx="2"
          fill={q === k && !done ? A : S}
          fillOpacity={q === k && !done ? 1 : visited(q) ? 0.85 : 0.25}
        />
      ))}
      {/* Output column y */}
      {Array.from({ length: 7 }, (_, i) => {
        const active = !done && i === cur[0]
        const filled = done || i < cur[0]
        return (
          <rect
            key={`y-${i}`}
            x={ox + 7 * cell + 18}
            y={oy + i * cell + 3}
            width="14"
            height="14"
            rx="2"
            fill={active ? A : S}
            fillOpacity={active ? 1 : filled ? 0.85 : 0.12}
          />
        )
      })}
    </>
  )
}

function Pipeline() {
  // Instructions flow through IF → WB one cycle apart. Every so often one
  // stalls and a bubble opens up behind it. Execute is highlighted.
  const rate = 1.5 // cycles per second
  const t = useLoopTime(42 / rate)
  const reduce = usePrefersReducedMotion()
  const beat = reduce ? 3 : t * rate
  const cycle = Math.floor(beat)
  const phase = beat - cycle
  const cw = 19
  const rh = 26
  const x0 = 14
  const y0 = 36
  const cells = []
  for (let r = 0; r < 5; r++) {
    const id = cycle + r
    const stall = id % 7 === 3
    for (let s = 0; s < 5; s++) {
      const c = r + s + (stall && s >= 2 ? 1 : 0)
      const x = x0 + (c - phase) * cw
      if (x < x0 - 2 || x > 186 - cw) continue
      cells.push(
        <rect
          key={`${id}-${s}`}
          x={x + 2}
          y={y0 + r * rh + 3}
          width={cw - 4}
          height={rh - 6}
          rx="2"
          fill={s === 2 ? A : S}
          fillOpacity={s === 2 ? 1 : 0.18 + 0.12 * s}
        />,
      )
      if (stall && s === 2) {
        cells.push(
          <rect
            key={`${id}-bubble`}
            x={x + 2 - cw}
            y={y0 + r * rh + 3}
            width={cw - 4}
            height={rh - 6}
            rx="2"
            fill="none"
            stroke={S}
            strokeOpacity="0.45"
            strokeDasharray="3 3"
          />,
        )
      }
    }
  }
  return <>{cells}</>
}

function Tree() {
  // A parse tree.
  const nodes = [
    [100, 40], [60, 90], [140, 90], [36, 140], [84, 140], [124, 140], [164, 140], [72, 182], [96, 182],
  ]
  const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [4, 7], [4, 8]]
  return (
    <>
      {edges.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="var(--color-line)" strokeWidth="1.5" />
      ))}
      {nodes.map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r={k === 0 ? 8 : 6} fill={k === 0 ? A : S} />
      ))}
    </>
  )
}

function Lattice() {
  // Flow vectors bending round a cylinder, with a wobble in its wake.
  const t = useLoopTime(Math.PI)
  const reduce = usePrefersReducedMotion()
  const now = reduce ? 0.6 : t
  const cx = 82
  const cy = 100
  const R = 22
  const g = 17
  const arrows = []
  for (let X = 14; X < 192; X += g) {
    for (let Y = 14; Y < 192; Y += g) {
      const dx = X - cx
      const dy = Y - cy
      const r2 = dx * dx + dy * dy
      if (r2 < (R + 4) * (R + 4)) continue
      // Potential flow past a cylinder, plus a travelling wake.
      let u = 1 - (R * R * (dx * dx - dy * dy)) / (r2 * r2)
      let v = (-2 * R * R * dx * dy) / (r2 * r2)
      if (X > cx) v += 0.35 * Math.sin(now * 2 - X * 0.05) * Math.exp(-Math.abs(dy) / R)
      const m = Math.hypot(u, v)
      const L = 7 + 4 * Math.min(m, 1.6)
      const fast = m > 1.2
      arrows.push(
        <line
          key={`${X}-${Y}`}
          x1={X - (u / m) * (L / 2)}
          y1={Y - (v / m) * (L / 2)}
          x2={X + (u / m) * (L / 2)}
          y2={Y + (v / m) * (L / 2)}
          stroke={fast ? A : S}
          strokeOpacity={Math.min(1, 0.4 + 0.4 * m)}
          strokeWidth={fast ? 2 : 1.5}
          strokeLinecap="round"
        />,
      )
    }
  }
  return (
    <>
      {arrows}
      <circle cx={cx} cy={cy} r={R} fill={A} />
    </>
  )
}

function Queues() {
  // Multi-level feedback queue: priority levels, one thread running.
  const levels = [5, 3, 4, 2]
  return levels.map((n, r) => (
    <g key={r}>
      <rect x="24" y={46 + r * 30} width="14" height="18" rx="2" fill={S} fillOpacity={0.75 - r * 0.15} />
      {Array.from({ length: n }, (_, k) => (
        <rect
          key={k}
          x={50 + k * 26}
          y={46 + r * 30}
          width="20"
          height="18"
          rx="2"
          fill={r === 0 && k === 0 ? A : 'none'}
          stroke={r === 0 && k === 0 ? 'none' : S}
          strokeOpacity="0.4"
        />
      ))}
    </g>
  ))
}

function Waveforms() {
  // Bug hunt: a search window sweeps the capture, lands on a glitch in the
  // middle trace, and flags it.
  const t = useLoopTime(6)
  const reduce = usePrefersReducedMotion()
  const traces = [
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1],
  ]
  const step = 9.5
  const path = (bits, y) =>
    bits
      .map((bit, k) => {
        const x = 24 + k * step
        const yy = bit ? y - 10 : y + 10
        return `${k ? 'L' : 'M'}${x} ${yy} L${x + step} ${yy}`
      })
      .join(' ')

  // Timeline: sweep (0–3.2s), found (3.2–5.4s), fade out (5.4–6s).
  const glitchX = 141
  const winW = 26
  const startX = 18
  const endX = glitchX - winW / 2
  const sweep = Math.min(t / 3.2, 1)
  const eased = 1 - Math.pow(1 - sweep, 3)
  const found = reduce || (t >= 3.2 && t < 5.4)
  const fade = reduce ? 1 : t >= 5.4 ? 1 - (t - 5.4) / 0.6 : 1
  const winX = reduce ? endX : startX + (endX - startX) * eased
  const pulse = found && !reduce ? (t - 3.2) / 2.2 : 0
  const C = 'var(--color-crash)'
  const midY = 64 + 38

  return (
    <g opacity={fade}>
      <rect x={winX} y="36" width={winW} height="128" fill={found ? C : A} fillOpacity="0.12" />
      <line x1={winX} y1="36" x2={winX} y2="164" stroke={found ? C : A} strokeWidth="1.5" />
      <line x1={winX + winW} y1="36" x2={winX + winW} y2="164" stroke={found ? C : A} strokeWidth="1.5" />
      {traces.map((bits, r) => (
        <path key={r} d={path(bits, 64 + r * 38)} fill="none" stroke={S} strokeOpacity="0.7" strokeWidth="1.5" />
      ))}
      {/* The glitch: a pulse too narrow to be real */}
      <path
        d={`M${glitchX - 2} ${midY + 10} V${midY - 10} H${glitchX + 2} V${midY + 10}`}
        fill="none"
        stroke={found ? C : S}
        strokeOpacity={found ? 1 : 0.7}
        strokeWidth={found ? 2 : 1.5}
      />
      {found && (
        <>
          <circle cx={glitchX} cy={midY} r={10 + pulse * 10} fill="none" stroke={C} strokeOpacity={1 - pulse} />
          <Bug x={glitchX} y={22} />
        </>
      )}
    </g>
  )
}

function Bug({ x, y }) {
  const C = 'var(--color-crash)'
  return (
    <g transform={`translate(${x} ${y})`} stroke={C} strokeWidth="1.3" strokeLinecap="round">
      {[-4, 0, 4].map((dy) => (
        <g key={dy}>
          <line x1="-4" y1={dy} x2="-9" y2={dy - 2} />
          <line x1="4" y1={dy} x2="9" y2={dy - 2} />
        </g>
      ))}
      <line x1="-2" y1="-7" x2="-4" y2="-10" />
      <line x1="2" y1="-7" x2="4" y2="-10" />
      <ellipse cx="0" cy="0" rx="4.5" ry="7" fill={C} stroke="none" />
    </g>
  )
}

// Seconds into a repeating loop of the given length, updated every frame.
function useLoopTime(period) {
  const [t, setT] = useState(0)
  useEffect(() => {
    let frame
    const start = performance.now()
    const tick = (now) => {
      setT((((now - start) / 1000) % period + period) % period)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [period])
  return t
}

function usePrefersReducedMotion() {
  const [reduce] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  return reduce
}

function AnalogToDigital() {
  // A smooth sine loses resolution, in time and in amplitude, until it is a
  // square wave: analog circuits captured as digital models.
  const t = useLoopTime(7)
  const reduce = usePrefersReducedMotion()
  // Resolution steps (levels, samples across the box), then a smooth finish.
  const steps = [
    [2, 8],
    [3, 12],
    [5, 20],
    [9, 36],
    [17, 72],
  ]
  // Smooth until 1.2s, snap onto the finest grid, then coarsen every 0.7s
  // down to a square wave by about 5s, hold, fade.
  const k = reduce ? 0 : Math.min(steps.length - 1, Math.max(0, steps.length - 1 - Math.floor((t - 2.3) / 0.7)))
  const smooth = reduce ? 0 : 1 - Math.min(1, Math.max(0, (t - 1.2) / 0.6))
  const fade = reduce ? 1 : t > 6.4 ? 1 - (t - 6.4) / 0.6 : 1
  const [levels, samples] = steps[k]
  const phase = reduce ? 0 : t * 0.6
  const x0 = 20
  const x1 = 180
  const mid = 100
  const amp = 52
  const wave = (x) => Math.sin(((x - x0) / (x1 - x0)) * Math.PI * 4 + phase)
  const quant = (v) => (Math.round(((v + 1) / 2) * (levels - 1)) / (levels - 1)) * 2 - 1
  const dx = (x1 - x0) / samples
  let d = ''
  for (let x = x0; x <= x1; x += 1) {
    const held = x0 + Math.floor((x - x0) / dx) * dx
    const v = quant(wave(held)) * (1 - smooth) + wave(x) * smooth
    d += `${x === x0 ? 'M' : 'L'}${x} ${(mid - v * amp).toFixed(1)} `
  }
  const digital = k === 0 && smooth === 0
  return (
    <g opacity={fade}>
      <line x1={x0} y1={mid} x2={x1} y2={mid} stroke={S} strokeOpacity="0.2" />
      <path d={d} fill="none" stroke={digital ? A : S} strokeOpacity={digital ? 1 : 0.75} strokeWidth="1.75" strokeLinejoin="round" />
    </g>
  )
}

function Drone() {
  // A quadcopter in simulation: the setpoint jumps around and the controller
  // chases it with a little overshoot, leaving a trail.
  const period = 2.2
  const targets = [
    [60, 120],
    [140, 70],
    [150, 135],
    [75, 75],
  ]
  const loop = period * targets.length
  const t = useLoopTime(loop)
  const reduce = usePrefersReducedMotion()
  const now = reduce ? period * 1.6 : t

  // Underdamped second-order step response from the previous setpoint.
  const zeta = 0.35
  const wn = 4.2
  const wd = wn * Math.sqrt(1 - zeta * zeta)
  const pos = (time) => {
    const tt = ((time % loop) + loop) % loop
    const k = Math.floor(tt / period)
    const tau = tt - k * period
    const [x0, y0] = targets[(k + targets.length - 1) % targets.length]
    const [x1, y1] = targets[k]
    const decay = Math.exp(-zeta * wn * tau) * (Math.cos(wd * tau) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * tau))
    return [x1 + (x0 - x1) * decay, y1 + (y0 - y1) * decay]
  }

  const [x, y] = pos(now)
  const dt = 0.03
  const ax = (pos(now + dt)[0] - 2 * x + pos(now - dt)[0]) / (dt * dt)
  const tilt = Math.max(-28, Math.min(28, ax * 0.012))
  const [tx, ty] = targets[Math.floor((((now % loop) + loop) % loop) / period)]
  const spin = Math.abs(Math.sin(now * 40))

  const trail = Array.from({ length: 24 }, (_, i) => pos(now - i * 0.04))
  const ground = 176

  return (
    <>
      {/* Simulator floor */}
      <line x1="16" y1={ground} x2="184" y2={ground} stroke={S} strokeOpacity="0.35" />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={24 + i * 22} y1={ground} x2={20 + i * 22} y2={ground + 8} stroke={S} strokeOpacity="0.2" />
      ))}
      {/* Setpoint */}
      <g stroke={A} strokeWidth="1.25" fill="none">
        <circle cx={tx} cy={ty} r="7" strokeDasharray="3 3" />
        <line x1={tx - 11} y1={ty} x2={tx - 4} y2={ty} />
        <line x1={tx + 4} y1={ty} x2={tx + 11} y2={ty} />
        <line x1={tx} y1={ty - 11} x2={tx} y2={ty - 4} />
        <line x1={tx} y1={ty + 4} x2={tx} y2={ty + 11} />
      </g>
      {/* Trail */}
      {trail.slice(1).map(([px, py], i) => (
        <line
          key={i}
          x1={trail[i][0]}
          y1={trail[i][1]}
          x2={px}
          y2={py}
          stroke={A}
          strokeWidth="1.5"
          strokeOpacity={0.5 * (1 - i / trail.length)}
        />
      ))}
      {/* Shadow */}
      <ellipse cx={x} cy={ground - 1} rx={10 + (ground - y) * 0.04} ry="2" fill={S} fillOpacity={0.08 + (y / ground) * 0.12} />
      {/* Quadcopter, side view */}
      <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(1.5)`}>
        <line x1="-15" y1="0" x2="15" y2="0" stroke={S} strokeWidth="2" />
        <line x1="-15" y1="0" x2="-15" y2="-4" stroke={S} strokeWidth="1.5" />
        <line x1="15" y1="0" x2="15" y2="-4" stroke={S} strokeWidth="1.5" />
        <ellipse cx="-15" cy="-5" rx={3 + spin * 6} ry="1.2" fill={S} fillOpacity="0.5" />
        <ellipse cx="15" cy="-5" rx={3 + (1 - spin) * 6} ry="1.2" fill={S} fillOpacity="0.5" />
        <rect x="-6" y="-3" width="12" height="7" rx="2" fill={S} />
        <line x1="-4" y1="4" x2="-6" y2="8" stroke={S} strokeWidth="1.25" />
        <line x1="4" y1="4" x2="6" y2="8" stroke={S} strokeWidth="1.25" />
      </g>
    </>
  )
}

const figures = { sparse: Sparse, pipeline: Pipeline, tree: Tree, lattice: Lattice, queues: Queues, waveforms: Waveforms, adc: AnalogToDigital, drone: Drone }

export default function Glyph({ kind }) {
  const Fig = figures[kind]
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
      <Fig />
    </svg>
  )
}
