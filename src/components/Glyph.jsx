// Small abstract figures that sit beside each featured project.
const S = 'var(--color-ink)'
const A = 'var(--color-accent)'

function Sparse() {
  // A sparse matrix: a few nonzeros lit on a faint grid.
  const nz = new Set(['0-1', '1-4', '2-0', '2-5', '3-3', '4-1', '4-6', '5-2', '6-4', '6-6'])
  return Array.from({ length: 7 }, (_, i) =>
    Array.from({ length: 7 }, (_, j) => {
      const on = nz.has(`${i}-${j}`)
      return (
        <rect
          key={`${i}-${j}`}
          x={22 + j * 22}
          y={22 + i * 22}
          width="14"
          height="14"
          rx="2"
          fill={on ? (i === j ? A : S) : 'none'}
          stroke={on ? 'none' : 'var(--color-line)'}
        />
      )
    }),
  )
}

function Pipeline() {
  // Classic pipeline diagram: each instruction enters one cycle after the last.
  return Array.from({ length: 5 }, (_, r) =>
    Array.from({ length: 5 }, (_, s) => (
      <rect
        key={`${r}-${s}`}
        x={12 + (r + s) * 20}
        y={42 + r * 26}
        width="17"
        height="17"
        rx="2"
        fill={s === 2 ? A : S}
        fillOpacity={s === 2 ? 1 : 0.2 + r * 0.15}
      />
    )),
  )
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
  // D2Q9 lattice: each node streams to its eight neighbours.
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]
  const pts = []
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) pts.push([40 + j * 30, 40 + i * 30])
  return (
    <>
      {pts.map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r="2.5" fill={S} fillOpacity="0.35" />
      ))}
      {dirs.map(([dx, dy], k) => (
        <line key={k} x1="100" y1="100" x2={100 + dx * 26} y2={100 + dy * 26} stroke={A} strokeWidth="1.5" strokeLinecap="round" />
      ))}
      <circle cx="100" cy="100" r="5" fill={A} />
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

const figures = { sparse: Sparse, pipeline: Pipeline, tree: Tree, lattice: Lattice, queues: Queues }

export default function Glyph({ kind }) {
  const Fig = figures[kind]
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
      <Fig />
    </svg>
  )
}
