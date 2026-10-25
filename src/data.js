// All site content lives here. Edit freely.

export const profile = {
  name: 'Jeremy Tan',
  github: 'https://github.com/jaytjz',
  email: 'jeremy.tan23@imperial.ac.uk',
  linkedin: 'https://www.linkedin.com/in/jeremy-tan-813b38227/',
  cv: '/Jeremy_Tan_CV.pdf',
}

export const featured = [
  {
    title: 'Sparse matrix accelerator',
    year: '2026 – now',
    tag: 'Hardware for ML',
    glyph: 'sparse',
    stack: ['SystemVerilog', 'Python', 'TSMC 65 nm'],
    summary:
      'Designing a sparse matrix multiplication (SpMM) accelerator targeting tapeout on a 1 mm² TSMC 65 nm die.',
  },
  {
    title: 'PintOS',
    year: '2025',
    tag: 'Operating systems',
    repo: 'pintos',
    glyph: 'queues',
    stack: ['C', 'x86', 'QEMU', 'GDB'],
    summary:
      'Extended a teaching OS kernel for x86 with a multi-level feedback queue scheduler and user process support: stack argument passing, 13 system calls for process control and file I/O, and user pointer validation that kills faulting processes without leaking resources.',
  },
  {
    title: 'FPGA fluid simulation',
    year: '2025',
    tag: 'Hardware acceleration',
    award: 'Best Second Year Group Project',
    repo: 'DreamTeam-Math-Accelerator',
    glyph: 'lattice',
    stack: ['SystemVerilog', 'CUDA', 'C++', 'Python'],
    summary:
      'The Lattice Boltzmann method implemented four times, in Python, C++, CUDA and SystemVerilog, and benchmarked across CPU, GPU and FPGA. Neighbour-only updates and fixed-point arithmetic map the method onto a deep hardware pipeline.',
  },
  {
    title: 'C90 → RISC-V compiler',
    year: '2025',
    tag: 'Systems',
    repo: 'C-to-Risc-V-Compiler',
    glyph: 'tree',
    stack: ['C++', 'Flex', 'Bison'],
    summary:
      'A compiler from pre-processed C90 to RISC-V assembly covering lexing, parsing, semantic analysis and code generation. Ranked in the top decile of the cohort, passing every public test and 80% of the unseen ones.',
  },
  {
    title: 'RISC-V CPU',
    year: '2024',
    tag: 'Computer architecture',
    repo: 'RISC-V-Team17',
    glyph: 'pipeline',
    stack: ['SystemVerilog', 'Verilator', 'C++'],
    summary:
      'A full RV32I processor taken from single-cycle to a five-stage pipeline with branch prediction, then integrated with split L1 and L2 set-associative caches. Verified against custom testbenches and signal-processing workloads.',
  },
]

export const experience = [
  {
    role: 'Digital Verification Intern',
    org: 'Qualcomm',
    glyph: 'waveforms',
    place: 'Cambridge, UK',
    dates: 'Apr – Sep 2026',
    points: [
      'Built an MCP server that lets LLM agents query binary waveform databases directly, speeding up hardware debug.',
      'Piloted PyUVM and cocotb, Python test frameworks for hardware, to cut testbench development time.',
      'Verified low-power radio subsystems for wearable chips using UVM.',
    ],
  },
  {
    role: 'Hardware Engineering Intern',
    org: 'Infineon',
    glyph: 'adc',
    place: 'Penang, Malaysia',
    dates: 'Jul – Sep 2025',
    points: [
      'Developed SystemVerilog models of analog IPs (SAR ADC, DC–DC converter, thermal sensor, bandgap reference) to speed up mixed-signal simulation and verification.',
    ],
  },
  {
    role: 'Undergraduate Research Assistant',
    org: 'Imperial College London',
    glyph: 'drone',
    place: 'London, UK',
    dates: 'Jul – Sep 2024',
    points: [
      'Assisted development of LQR, MRAC and neural network quadcopter controllers in MATLAB/Simulink, integrated with ROS and Gazebo for simulation testing.',
    ],
  },
]

// The first things visitors see, next to your photo.
export const education = {
  degree: 'MEng Electronic & Information Engineering',
  school: 'Imperial College London',
  years: '2023 – 2027',
}

export const highlights = [
  { value: 'Top 5%', label: "Dean's List, Years 2 and 3" },
  { value: '81.5%', label: 'Third year average' },
]

export const archive = [
  { title: 'Piano synthesiser', desc: 'Polyphonic synth on networked STM32 boards with FreeRTOS and CAN bus', lang: 'C++', year: '2026' },
  { title: 'Digital System Design', desc: 'Custom floating-point and CORDIC instructions on an FPGA SoC', lang: 'SystemVerilog', year: '2026', repo: 'DSD_CW' },
  { title: 'Totally not Mario Party', desc: 'Multiplayer party game front end', lang: 'React', year: '2025', repo: 'totally-not-mario-party-front-end' },
  { title: 'Twitter clone', desc: 'Full-stack social app: auth, follows, posts and a feed', lang: 'React', year: '2024', repo: 'FakeTwitterClone' },
  { title: 'Pokémemo', desc: 'Memory card game built on the PokéAPI', lang: 'React', year: '2024', repo: 'pokememo' },
  { title: 'Rover control', desc: 'Web dashboard and firmware for a Year 1 autonomous rover', lang: 'C++', year: '2024', repo: 'imperial-rover-y1' },
  { title: 'CHIP-8 emulator', desc: 'Interpreter for the classic 8-bit virtual machine', lang: 'C++', year: '2024', repo: 'Chip8-emulator' },
]
