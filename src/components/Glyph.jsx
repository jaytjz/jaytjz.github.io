import { useEffect, useRef, useState } from 'react'

// Small abstract figures that sit beside each featured project.
const S = 'var(--color-ink)'
const A = 'var(--color-accent)'

function Sparse() {
  // SpMM: sparse A × dense B. Each nonzero a(i,k) in A pulls in row k of B,
  // and the products accumulate into row i of the output underneath.
  const nz = [
    [0, 1], [0, 4], [1, 2], [2, 0], [2, 5], [3, 3], [4, 1], [4, 4], [5, 2], [5, 5],
  ]
  const n = 6
  const hop = 0.5
  const t = useLoopTime((nz.length + 2) * hop)
  const reduce = usePrefersReducedMotion()
  const k = reduce ? 4 : Math.min(Math.floor(t / hop), nz.length)
  const done = k >= nz.length
  const [ci, ck] = nz[Math.min(k, nz.length - 1)]
  const cell = 13.5
  const size = 11.5
  const ax = 8
  const bx = 112
  const y0 = 46
  const outY = y0 + n * cell + 16
  // How much of the current output row has been accumulated so far.
  const inRow = nz.filter(([i]) => i === ci)
  const progress = done ? 1 : (inRow.findIndex(([, kk]) => kk === ck) + 1) / inRow.length

  const box = (key, x, y, props) => <rect key={key} x={x} y={y} width={size} height={size} rx="1.5" {...props} />
  return (
    <>
      {/* A: sparse */}
      {Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => box(`a${i}${j}`, ax + j * cell, y0 + i * cell, { fill: 'none', stroke: 'var(--color-line)' })),
      )}
      {nz.map(([i, j], q) => {
        const current = q === k && !done
        return box(`nz${i}${j}`, ax + j * cell, y0 + i * cell, {
          fill: current ? A : S,
          fillOpacity: current ? 1 : q < k || done ? 0.8 : 0.3,
        })
      })}
      <text x="99" y={y0 + (n * cell) / 2 + 4} textAnchor="middle" fontSize="13" fill={S} fillOpacity="0.5">
        ×
      </text>
      {/* B: dense, with the row being streamed highlighted */}
      {Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => {
          const active = !done && i === ck
          return box(`b${i}${j}`, bx + j * cell, y0 + i * cell, { fill: active ? A : S, fillOpacity: active ? 0.9 : 0.35 })
        }),
      )}
      {/* Output row being accumulated */}
      {Array.from({ length: n }, (_, j) =>
        box(`c${j}`, bx + j * cell, outY, { fill: A, fillOpacity: 0.15 + 0.75 * progress }),
      )}
      <path
        d={`M${ax + n * cell + 2} ${y0 + ci * cell + size / 2} H${bx - 8} V${outY + size / 2} H${bx - 3}`}
        fill="none"
        stroke={A}
        strokeOpacity={done ? 0 : 0.6}
        strokeWidth="1"
        strokeDasharray="2 2"
      />
    </>
  )
}

// Five-stage pipeline schedule. A load followed by an instruction that uses
// its result stalls for one cycle; everything else is forwarded.
const PIPE_PROGRAM = [
  { op: 'lw', rd: 't0', rs: [] },
  { op: 'add', rd: 't1', rs: ['t0'] },
  { op: 'sub', rd: 't2', rs: ['t1'] },
  { op: 'sw', rd: null, rs: ['t2'] },
  { op: 'addi', rd: 'a0', rs: ['a0'] },
]
const PIPE_STATES = (() => {
  const states = []
  let stages = [null, null, null, null, null]
  let n = 0
  for (let c = 0; c < 24; c++) {
    const [IF, ID, EX, MEM] = stages
    const stall = EX && EX.op === 'lw' && ID && ID.rs.includes(EX.rd)
    stages = stall
      ? [IF, ID, { bubble: true, id: `b${c}` }, EX, MEM]
      : [{ id: n, ...PIPE_PROGRAM[n++ % PIPE_PROGRAM.length] }, IF, ID, EX, MEM]
    states.push({ stages, stall })
  }
  return states
})()

function Pipeline() {
  // Instructions flow through IF → WB one stage per cycle. A load-use hazard
  // stalls the front of the pipe and inserts a bubble; other dependencies are
  // forwarded back into EX.
  const names = ['IF', 'ID', 'EX', 'MEM', 'WB']
  const cycleDur = 1.1
  const first = 12
  const period = 6 // cycles per pass through the program, including the stall
  const t = useLoopTime(period * cycleDur)
  const reduce = usePrefersReducedMotion()
  const phase = reduce ? 3.6 : t / cycleDur
  const cycle = Math.floor(phase)
  const frac = phase - cycle
  const curr = PIPE_STATES[first + cycle]
  const prev = PIPE_STATES[first + cycle - 1]
  const move = 1 - Math.pow(1 - Math.min(1, frac / 0.35), 3)

  const slotX = (i) => 10 + i * 37
  const slotY = 70
  const chipY = 79
  const stageOf = (state, id) => state.stages.findIndex((x) => x && x.id === id)

  // Forwarding: the instruction in EX takes a result from MEM or WB.
  const ex = curr.stages[2]
  const forwards = ex && !ex.bubble
    ? [3, 4].filter((s) => {
        const src = curr.stages[s]
        return src && !src.bubble && src.rd && ex.rs.includes(src.rd)
      })
    : []

  return (
    <g transform="translate(0 16)">
      {/* Stage slots and the pipeline registers between them */}
      {names.map((name, i) => (
        <g key={name}>
          <rect x={slotX(i)} y={slotY} width="30" height="38" rx="2" fill="none" stroke="var(--color-line)" />
          <text x={slotX(i) + 15} y="124" textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill={S} fillOpacity="0.55">
            {name}
          </text>
          {i < 4 && (
            <rect
              x={slotX(i) + 31.5}
              y={slotY - 4}
              width="4"
              height="46"
              rx="1"
              fill={!reduce && frac < 0.2 && !(curr.stall && i < 1) ? A : S}
              fillOpacity={!reduce && frac < 0.2 ? 0.9 : 0.6}
            />
          )}
        </g>
      ))}
      {curr.stall && (
        <text x={slotX(0) + 33} y="58" textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--color-crash)">
          stall
        </text>
      )}
      {/* Forwarding paths back into EX */}
      {forwards.map((s) => {
        const x0 = slotX(s) + 15
        const x1 = slotX(2) + 15
        const lift = 14 + (s - 3) * 10
        return (
          <path
            key={s}
            d={`M${x0} ${chipY - 2} C${x0} ${chipY - lift - 8} ${x1} ${chipY - lift - 8} ${x1 + 3} ${chipY - 4}`}
            fill="none"
            stroke={A}
            strokeWidth="1.4"
            strokeOpacity={move}
            markerEnd="url(#fwd)"
          />
        )
      })}
      <defs>
        <marker id="fwd" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L6 3 L0 6 Z" fill={A} />
        </marker>
      </defs>
      {/* Instructions, including the one retiring out of WB */}
      {prev.stages[4] && !prev.stages[4].bubble && (
        <g opacity={1 - move}>
          <rect x={slotX(4 + move * 0.4) + 2} y={chipY} width="26" height="20" rx="2" fill={S} fillOpacity="0.85" />
        </g>
      )}
      {curr.stages.map((ins, s) => {
        if (!ins) return null
        const from = stageOf(prev, ins.id)
        const at = from < 0 ? s : from + (s - from) * move
        const x = slotX(at) + 2
        const fed = s === 2 && forwards.length > 0
        return ins.bubble ? (
          <g key={ins.id}>
            <rect x={x} y={chipY} width="26" height="20" rx="2" fill="none" stroke={S} strokeOpacity="0.45" strokeDasharray="3 3" />
            <text x={x + 13} y={chipY + 13} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill={S} fillOpacity="0.45">
              nop
            </text>
          </g>
        ) : (
          <g key={ins.id} opacity={from < 0 ? move : 1}>
            <rect x={x} y={chipY} width="26" height="20" rx="2" fill={fed ? A : S} fillOpacity={fed ? 1 : 0.85} />
            <text x={x + 13} y={chipY + 13} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--color-paper)">
              {ins.op}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function Compile() {
  // One statement through the compiler: the lexer scans it into tokens, the
  // parser builds the tree, then a post-order walk emits RISC-V. The `* 4`
  // comes out as a shift.
  const tokens = ['x', '=', 'a', '+', 'b', '*', '4', ';']
  // [label, x, y, parent, token]
  const nodes = [
    ['=', 100, 46, -1, 1],
    ['x', 60, 70, 0, 0],
    ['+', 140, 70, 0, 3],
    ['a', 116, 94, 2, 2],
    ['*', 164, 94, 2, 5],
    ['b', 144, 118, 4, 4],
    ['4', 184, 118, 4, 6],
  ]
  const asm = [
    [[3], 'lw', 't0, a'],
    [[5], 'lw', 't1, b'],
    [[4, 6], 'slli', 't1, t1, 2'],
    [[2], 'add', 't0, t0, t1'],
    [[0, 1], 'sw', 't0, x'],
  ]
  // Timeline: lex, parse, codegen, hold, fade.
  const tokDur = 0.18
  const nodeDur = 0.3
  const lineDur = 0.75
  const lex0 = 0.3
  const parse0 = 2
  const gen0 = 4.4
  const loop = 10
  const t = useLoopTime(loop)
  const reduce = usePrefersReducedMotion()
  const now = reduce ? loop - 1 : t
  const fade = reduce ? 1 : now > loop - 0.6 ? (loop - now) / 0.6 : 1

  const lexed = (now - lex0) / tokDur
  const parsed = (now - parse0) / nodeDur
  const emitted = (now - gen0) / lineDur
  const lexing = Math.floor(lexed)
  const parsing = now >= parse0 && parsed < nodes.length ? Math.floor(parsed) : -1
  const emitting = now >= gen0 && emitted < asm.length ? Math.floor(emitted) : -1
  const visited = new Set(asm.slice(0, Math.max(0, Math.ceil(emitted))).flatMap(([n]) => n))
  const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3)
  const mono = { fontFamily: 'var(--font-mono)', textAnchor: 'middle' }

  return (
    <g opacity={fade}>
      {/* Source, scanned into tokens */}
      {tokens.map((tok, i) => {
        const x = 44 + i * 16
        const done = lexed > i + 1
        const current = (lexing === i && lexed < tokens.length) || (parsing >= 0 && nodes[parsing][4] === i)
        return (
          <g key={i}>
            {(done || current) && (
              <rect x={x - 6} y="12" width="12" height="16" rx="2" fill="none" stroke={current ? A : 'var(--color-line)'} />
            )}
            <text x={x} y="24" fontSize="10" {...mono} fill={current ? A : S} fillOpacity={done || current ? 1 : 0.35}>
              {tok}
            </text>
          </g>
        )
      })}
      {/* Parse tree */}
      {nodes.map(([, x, y, parent], k) => {
        if (parent < 0) return null
        const p = ease(parsed - k)
        const [, px, py] = nodes[parent]
        return <line key={k} x1={px} y1={py} x2={px + (x - px) * p} y2={py + (y - py) * p} stroke="var(--color-line)" strokeWidth="1.5" />
      })}
      {nodes.map(([label, x, y], k) => {
        const p = ease(parsed - k)
        if (p <= 0) return null
        const current = emitting >= 0 && asm[emitting][0].includes(k)
        const done = visited.has(k) && !current
        return (
          <g key={k}>
            <circle cx={x} cy={y} r={8 * p} fill={current ? A : done ? S : 'var(--color-paper)'} stroke={current ? A : S} strokeOpacity={current || done ? 1 : 0.6} />
            <text x={x} y={y + 3} fontSize="9" {...mono} fill={current || done ? 'var(--color-paper)' : S} opacity={p}>
              {label}
            </text>
          </g>
        )
      })}
      {/* Emitted assembly */}
      <line x1="24" y1="136" x2="24" y2="192" stroke="var(--color-line)" />
      {asm.map(([, op, args], i) => {
        const shown = Math.floor(ease(emitted - i) * (op.length + 1 + args.length))
        if (shown <= 0) return null
        const current = emitting === i
        return (
          <text key={i} y={144 + i * 11} fontSize="8.5" fontFamily="var(--font-mono)" fill={current ? A : S} fillOpacity={current ? 1 : 0.7}>
            <tspan x="32">{op.slice(0, shown)}</tspan>
            <tspan x="62">{args.slice(0, Math.max(0, shown - op.length - 1))}</tspan>
          </text>
        )
      })}
    </g>
  )
}

function Lattice() {
  // Flow past a cylinder: tracer particles stream through the field and a
  // street of alternating vortices peels off behind the obstacle.
  const t = useLoopTime(1000)
  const reduce = usePrefersReducedMotion()
  const now = reduce ? 3 : t
  const cx = 70
  const cy = 100
  const R = 20
  const speed = 42 // px per second for free-stream flow

  // Velocity at (x, y) in units of the free-stream speed.
  const vel = (x, y, time) => {
    const dx = x - cx
    const dy = y - cy
    const r2 = Math.max(dx * dx + dy * dy, R * R)
    let u = 1 - (R * R * (dx * dx - dy * dy)) / (r2 * r2)
    let v = (-2 * R * R * dx * dy) / (r2 * r2)
    for (let k = 0; k < 4; k++) {
      const travel = (time * 14 + k * 34) % 136
      const xv = cx + R + 6 + travel
      const yv = cy + (k % 2 ? 9 : -9)
      const strength = (k % 2 ? 1 : -1) * 14 * Math.min(1, travel / 20) * (1 - travel / 136)
      const ex = x - xv
      const ey = y - yv
      const d2 = ex * ex + ey * ey + 40
      u += (-strength * ey) / d2
      v += (strength * ex) / d2
    }
    return [u, v]
  }

  // Tracer particles carried by the flow; respawn at the inlet.
  const particles = useRef(null)
  const last = useRef(now)
  if (!particles.current) {
    particles.current = Array.from({ length: 80 }, (_, i) => {
      const r = (n) => {
        const s = Math.sin(i * 91.7 + n * 13.1) * 43758.5
        return s - Math.floor(s)
      }
      return { x: 10 + r(1) * 180, y: 18 + r(2) * 164 }
    })
  }
  let dt = now - last.current
  if (dt < 0 || dt > 0.1) dt = 0.016
  last.current = now
  if (!reduce) {
    particles.current.forEach((p, i) => {
      const [u, v] = vel(p.x, p.y, now)
      p.x += u * speed * dt
      p.y += v * speed * dt
      const inside = (p.x - cx) ** 2 + (p.y - cy) ** 2 < R * R
      if (p.x > 192 || p.y < 10 || p.y > 190 || inside) {
        p.x = 8 + Math.random() * 6
        p.y = 18 + ((i * 37) % 164)
      }
    })
  }

  const arrows = []
  for (let X = 16; X < 192; X += 22) {
    for (let Y = 16; Y < 192; Y += 22) {
      if ((X - cx) ** 2 + (Y - cy) ** 2 < (R + 6) ** 2) continue
      const [u, v] = vel(X, Y, now)
      const m = Math.hypot(u, v) || 1
      const L = 9
      arrows.push(
        <line
          key={`${X}-${Y}`}
          x1={X - (u / m) * (L / 2)}
          y1={Y - (v / m) * (L / 2)}
          x2={X + (u / m) * (L / 2)}
          y2={Y + (v / m) * (L / 2)}
          stroke={S}
          strokeOpacity="0.18"
          strokeWidth="1.2"
          strokeLinecap="round"
        />,
      )
    }
  }

  return (
    <>
      {arrows}
      {particles.current.map((p, i) => {
        const [u, v] = vel(p.x, p.y, now)
        const m = Math.hypot(u, v)
        const tail = 0.2 * speed
        return (
          <line
            key={i}
            x1={p.x - u * tail}
            y1={p.y - v * tail}
            x2={p.x}
            y2={p.y}
            stroke={m > 1.15 ? A : S}
            strokeOpacity={m > 1.15 ? 1 : 0.7}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )
      })}
      <circle cx={cx} cy={cy} r={R} fill={A} />
    </>
  )
}

// Precomputed MLFQ schedule: each step the running thread is demoted one
// level and the highest-priority waiting thread takes the CPU. Every few
// steps a priority boost sends every waiting thread back to the top.
const MLFQ_STEPS = (() => {
  const queues = [['A', 'B'], ['C'], ['D', 'E'], ['F']]
  let cpu = null
  let cpuLevel = 0
  const states = []
  for (let step = 0; step < 20; step++) {
    if (cpu) queues[Math.min(cpuLevel + 1, 3)].push(cpu)
    if (step % 10 === 9) {
      const all = queues.flat()
      queues.forEach((q) => q.splice(0))
      queues[0].push(...all)
    }
    const level = queues.findIndex((q) => q.length)
    cpu = queues[level].shift()
    cpuLevel = level
    states.push({ cpu, queues: queues.map((q) => [...q]) })
  }
  return states
})()

function Queues() {
  // MLFQ scheduler: threads hop between priority queues and the CPU.
  const stepDur = 0.9
  const loop = MLFQ_STEPS.length * stepDur
  const t = useLoopTime(loop)
  const reduce = usePrefersReducedMotion()
  const now = reduce ? 2 * stepDur + 0.8 : t
  const step = Math.floor(now / stepDur)
  const frac = now / stepDur - step
  const ease = (x) => 1 - Math.pow(1 - Math.min(1, x / 0.45), 3)

  const rowY = (r) => 76 + r * 28
  const slotX = (i) => 46 + i * 24
  const cpuX = 90
  const cpuY = 28
  const where = (state, id) => {
    if (state.cpu === id) return [cpuX, cpuY]
    for (let r = 0; r < 4; r++) {
      const i = state.queues[r].indexOf(id)
      if (i >= 0) return [slotX(i), rowY(r)]
    }
    return [cpuX, cpuY]
  }
  const curr = MLFQ_STEPS[step]
  const prev = MLFQ_STEPS[(step + MLFQ_STEPS.length - 1) % MLFQ_STEPS.length]
  const p = step === 0 ? 1 : ease(frac)
  const fade = reduce ? 1 : now > loop - 0.4 ? (loop - now) / 0.4 : now < 0.3 ? now / 0.3 : 1

  return (
    <>
      {/* CPU slot */}
      <rect x={cpuX - 4} y={cpuY - 4} width="28" height="26" rx="3" fill="none" stroke={A} strokeWidth="1.25" />
      <text x={cpuX - 10} y={cpuY + 12} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill={S} fillOpacity="0.55">
        cpu
      </text>
      {/* Priority queues, highest first */}
      {[0, 1, 2, 3].map((r) => (
        <g key={r}>
          <rect x="22" y={rowY(r)} width="12" height="18" rx="2" fill={S} fillOpacity={0.75 - r * 0.17} />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={slotX(i)} y={rowY(r)} width="20" height="18" rx="2" fill="none" stroke="var(--color-line)" />
          ))}
        </g>
      ))}
      {/* Threads */}
      <g opacity={fade}>
        {['A', 'B', 'C', 'D', 'E', 'F'].map((id) => {
          const [x0, y0] = where(prev, id)
          const [x1, y1] = where(curr, id)
          const x = x0 + (x1 - x0) * p
          const y = y0 + (y1 - y0) * p
          const running = curr.cpu === id
          return (
            <rect key={id} x={x} y={y} width="20" height="18" rx="2" fill={running ? A : S} fillOpacity={running ? 1 : 0.7} />
          )
        })}
      </g>
    </>
  )
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

function TransistorToGate() {
  // A CMOS inverter at transistor level, switching as its input toggles,
  // then abstracted away into the logic gate it implements.
  const t = useLoopTime(8)
  const reduce = usePrefersReducedMotion()
  const now = reduce ? 1.5 : t
  const input = Math.floor(now) % 2 === 1
  const output = !input
  // 0–3.5s transistors, fade to the gate by 4.2s, hold, fade back by 8s.
  const gate = reduce ? 0 : now < 3.5 ? 0 : now < 4.2 ? (now - 3.5) / 0.7 : now < 7.3 ? 1 : 1 - (now - 7.3) / 0.7
  const wire = (on) => ({ stroke: on ? A : S, strokeOpacity: on ? 1 : 0.55 })
  const label = { fontSize: 9, fontFamily: 'var(--font-mono)', fill: S, fillOpacity: 0.55 }

  return (
    <g strokeWidth="1.6" fill="none" strokeLinecap="round">
      {/* Shared input and output wires */}
      <line x1="30" y1="100" x2="72" y2="100" {...wire(input)} />
      <line x1="128" y1="100" x2="170" y2="100" {...wire(output)} />
      <text x="30" y="92" {...label} stroke="none">in</text>
      <text x="170" y="92" textAnchor="end" {...label} stroke="none">out</text>

      {/* Transistor level */}
      <g opacity={1 - gate}>
        {/* VDD and GND rails */}
        <line x1="96" y1="28" x2="124" y2="28" stroke={S} />
        <line x1="110" y1="28" x2="110" y2="56" {...wire(!input)} />
        <g stroke={S}>
          <line x1="96" y1="172" x2="124" y2="172" />
          <line x1="101" y1="177" x2="119" y2="177" />
          <line x1="106" y1="182" x2="114" y2="182" />
        </g>
        <line x1="110" y1="144" x2="110" y2="172" {...wire(false)} />
        {/* Gate wiring */}
        <line x1="72" y1="100" x2="86" y2="100" {...wire(input)} />
        <line x1="86" y1="70" x2="86" y2="130" {...wire(input)} />
        <line x1="86" y1="70" x2="92" y2="70" {...wire(input)} />
        <line x1="86" y1="130" x2="98" y2="130" {...wire(input)} />
        {/* PMOS: on when input is low */}
        <circle cx="95" cy="70" r="3" stroke={S} />
        <line x1="99" y1="58" x2="99" y2="82" stroke={S} />
        <line x1="104" y1="56" x2="104" y2="84" stroke={!input ? A : S} strokeWidth={!input ? 2.5 : 1.6} />
        <path d="M104 58 H110 V56 M104 82 H110 V86" {...wire(!input)} />
        {/* Output node */}
        <line x1="110" y1="86" x2="110" y2="114" {...wire(output)} />
        <line x1="110" y1="100" x2="128" y2="100" {...wire(output)} />
        {/* NMOS: on when input is high */}
        <line x1="99" y1="118" x2="99" y2="142" stroke={S} />
        <line x1="104" y1="116" x2="104" y2="144" stroke={input ? A : S} strokeWidth={input ? 2.5 : 1.6} />
        <path d="M104 118 H110 V114 M104 142 H110 V144" {...wire(false)} />
        <text x="128" y="68" {...label} stroke="none">pmos</text>
        <text x="128" y="136" {...label} stroke="none">nmos</text>
      </g>

      {/* Logic level */}
      <g opacity={gate}>
        <line x1="72" y1="100" x2="80" y2="100" {...wire(input)} />
        <path d="M80 76 L80 124 L116 100 Z" stroke={S} strokeLinejoin="round" />
        <circle cx="121" cy="100" r="5" stroke={S} />
        <line x1="126" y1="100" x2="128" y2="100" {...wire(output)} />
        <text x="100" y="146" textAnchor="middle" {...label} stroke="none">NOT</text>
      </g>
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

const figures = { sparse: Sparse, pipeline: Pipeline, compiler: Compile, tree: Compile, lattice: Lattice, queues: Queues, waveforms: Waveforms, cmos: TransistorToGate, adc: TransistorToGate, drone: Drone }

export default function Glyph({ kind }) {
  const Fig = figures[kind]
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
      <Fig />
    </svg>
  )
}
