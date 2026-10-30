import { useEffect, useState } from 'react'
import { profile, education, highlights, featured, experience, archive } from './data'
import LogicAnalyzer from './components/LogicAnalyzer'
import Glyph from './components/Glyph'
import { GitHubIcon, LinkedInIcon, DocumentIcon } from './components/Icons'
import portrait from './assets/portrait.jpg'

const repoUrl = (repo) => `${profile.github}/${repo}`

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        }),
      { rootMargin: '0px 0px -10% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function Arrow({ className = '' }) {
  return (
    <svg viewBox="0 0 16 16" className={`size-3.5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 12 12 4M5.5 4H12v6.5" />
    </svg>
  )
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const links = [
    ['Experience', '#experience'],
    ['Projects', '#work'],
    ['Other Projects', '#index'],
    ['Contact', '#contact'],
  ]
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? 'bg-paper/85 backdrop-blur-md border-b border-line' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="text-base font-semibold tracking-tight">
          {profile.name}
        </a>
        <ul className="hidden items-center gap-8 text-sm text-ink-2 sm:flex">
          {links.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="transition-colors hover:text-ink">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="-mr-2 grid size-10 place-items-center sm:hidden"
        >
          <svg
            viewBox="0 0 16 16"
            className={`size-4 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M8 1v14M1 8h14" />
          </svg>
        </button>
      </nav>
      <div
        id="mobile-menu"
        className={`grid transition-[grid-template-rows] duration-300 sm:hidden ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <ul className="overflow-hidden px-5" inert={open ? undefined : ''}>
          {links.map(([label, href], i) => (
            <li key={href} className={i ? 'border-t border-line' : ''}>
              <a
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between py-4 font-display text-3xl font-light tracking-[-0.03em]"
              >
                {label}
                <span className="font-mono text-[11px] text-ink-3">0{i + 1}</span>
              </a>
            </li>
          ))}
          <li className="h-3" />
        </ul>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="mx-auto max-w-6xl px-5 pt-28 pb-16 sm:px-8 sm:pt-32">
      <h1 className="sr-only">{profile.name}</h1>
      <div className="reveal flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={portrait}
            alt={`Portrait of ${profile.name}`}
            width="150"
            height="150"
            className="size-16 shrink-0 rounded-full object-cover ring-1 ring-line sm:size-20"
          />
          <div>
            <p className="font-medium">{education.degree}</p>
            <p className="text-sm text-ink-2">
              {education.school} · {education.years}
            </p>
          </div>
        </div>
        <dl className="flex gap-10">
          {highlights.map((h) => (
            <div key={h.label}>
              <dt className="font-display font-light text-3xl leading-tight tracking-[-0.035em]">{h.value}</dt>
              <dd className="mt-1 text-sm text-ink-2">{h.label}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="reveal mt-8 flex flex-wrap items-center gap-3">
        {[
          ['GitHub', profile.github, GitHubIcon],
          ['LinkedIn', profile.linkedin, LinkedInIcon],
        ]
          .filter(([, href]) => href)
          .map(([label, href, Icon]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              title={label}
              className="inline-flex size-11 items-center justify-center rounded-full border border-line transition-colors hover:border-ink hover:text-accent"
            >
              <Icon />
            </a>
          ))}
        {profile.cv && (
          <a
            href={profile.cv}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium transition-colors hover:border-ink hover:text-accent"
          >
            <DocumentIcon /> CV
          </a>
        )}
      </div>
      <div className="reveal mt-14">
        <LogicAnalyzer className="h-40 sm:h-48" />
      </div>
    </section>
  )
}

function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-24 sm:px-8 sm:pt-32">
      <div className="reveal">
        <h2 className="font-display font-light text-5xl leading-none tracking-[-0.035em] sm:text-6xl">Experience</h2>
      </div>
      <ol className="mt-14 border-t border-line">
        {experience.map((e) => (
          <li key={e.org} className="reveal grid grid-cols-1 gap-y-5 border-b border-line py-10 md:grid-cols-[1fr_200px] md:grid-rows-[auto_auto_1fr] md:gap-x-12 md:gap-y-4">
            <div className="col-start-1 row-start-2 -mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-ink-3 md:mt-0">
              <span>{e.dates}</span>
              <span>{e.place}</span>
            </div>
            <h3 className="col-start-1 row-start-1 font-display font-light text-3xl leading-tight tracking-[-0.035em] sm:text-4xl">
              {e.role} <span className="text-accent">· {e.org}</span>
            </h3>
            <ul className="col-start-1 row-start-4 max-w-2xl space-y-2 leading-relaxed text-ink-2 md:row-start-3">
              {e.points.map((pt) => (
                <li key={pt} className="relative pl-5 before:absolute before:top-[0.7em] before:left-0 before:h-px before:w-2.5 before:bg-ink-3">
                  {pt}
                </li>
              ))}
            </ul>
            {e.glyph && (
              <div className="col-start-1 row-start-3 aspect-square w-full self-start rounded-sm bg-paper-2/70 p-4 md:col-start-2 md:row-span-3 md:row-start-1">
                <Glyph kind={e.glyph} />
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

function Work() {
  return (
    <section id="work" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
      <div className="reveal flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
        <div>
          <h2 className="font-display font-light text-5xl leading-none tracking-[-0.035em] sm:text-6xl">Selected projects</h2>
        </div>
        <p className="max-w-xs leading-relaxed text-ink-2 md:text-sm">
          These were hard, lots of all-nighters but I learnt a lot.
        </p>
      </div>

      <ol className="mt-14 border-t border-line">
        {featured.map((p) => {
          const Row = p.repo ? 'a' : 'div'
          const link = p.repo ? { href: repoUrl(p.repo), target: '_blank', rel: 'noreferrer' } : {}
          return (
          <li key={p.title} className="reveal border-b border-line">
            <Row
              {...link}
              className={`${p.repo ? 'group' : ''} grid grid-cols-1 gap-y-5 py-10 md:grid-cols-[1fr_200px] md:grid-rows-[auto_auto_1fr] md:gap-x-12 md:gap-y-4 md:py-12`}
            >
              <div className="col-start-1 row-start-2 -mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-ink-3 md:mt-0">
                <span>{p.year}</span>
                <span className="text-accent">{p.tag}</span>
                {p.award && <span className="text-ink">★ {p.award}</span>}
              </div>
              <h3 className="col-start-1 row-start-1 flex items-start gap-3 font-display font-light text-4xl leading-tight tracking-[-0.035em] sm:text-5xl">
                <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                  {p.title}
                </span>
                {p.repo && (
                  <Arrow className="mt-3 shrink-0 text-ink-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                )}
              </h3>
              <div className="col-start-1 row-start-4 md:row-start-3">
                <p className="max-w-2xl leading-relaxed text-ink-2">{p.summary}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <li key={s} className="rounded-full border border-line px-3 py-1 font-mono text-[11px] text-ink-2">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-start-1 row-start-3 aspect-square w-full self-start rounded-sm bg-paper-2/70 p-4 transition-colors duration-500 group-hover:bg-paper-2 md:col-start-2 md:row-span-3 md:row-start-1">
                <Glyph kind={p.glyph} />
              </div>
            </Row>
          </li>
          )
        })}
      </ol>
    </section>
  )
}

function Index() {
  return (
    <section id="index" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-24 sm:px-8 sm:pb-32">
      <div className="reveal">
        <h2 className="font-display font-light text-4xl leading-none tracking-[-0.035em] sm:text-5xl">Other projects</h2>
        <p className="mt-4 max-w-xl leading-relaxed text-ink-2">
          Smaller coursework and personal projects.
        </p>
      </div>
      <ul className="reveal mt-10 border-t border-line text-sm">
        {[...archive].sort((a, b) => b.year.localeCompare(a.year)).map((a) => (
          <li key={a.title} className="border-b border-line">
            <a
              {...(a.repo ? { href: repoUrl(a.repo), target: '_blank', rel: 'noreferrer' } : {})}
              className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-4 transition-colors hover:bg-paper-2/60 sm:grid-cols-[56px_220px_1fr_110px_16px] sm:px-2"
            >
              <span className="hidden font-mono text-xs text-ink-3 sm:block">{a.year}</span>
              <span className="font-medium">{a.title}</span>
              <span className="col-span-2 text-ink-2 sm:col-span-1">{a.desc}</span>
              <span className="hidden font-mono text-xs text-ink-3 sm:block">{a.lang}</span>
              {a.repo ? <Arrow className="hidden text-ink-3 transition-colors group-hover:text-accent sm:block" /> : <span />}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Contact() {
  const links = [
    ['GitHub', profile.github],
    profile.linkedin && ['LinkedIn', profile.linkedin],
    profile.cv && ['CV', profile.cv],
  ].filter(Boolean)
  return (
    <section id="contact" className="scroll-mt-16 bg-night text-paper">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <p className="reveal font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60">Contact</p>
        <h2 className="reveal mt-6 font-display font-light text-[clamp(2.75rem,8vw,6rem)] leading-[0.98] tracking-[-0.045em]">
          Get in touch.
        </h2>
        <p className="reveal mt-6 max-w-xl text-lg leading-relaxed text-paper/70">
          I’m looking for graduate roles starting September 2027.
        </p>
        <a
          href={`mailto:${profile.email}`}
          className="reveal mt-8 inline-block break-all border-b border-paper/30 pb-1 text-lg transition-colors hover:border-accent hover:text-accent sm:text-2xl"
        >
          {profile.email}
        </a>
        <ul className="reveal mt-16 flex flex-wrap gap-x-8 gap-y-3 text-sm text-paper/80">
          {links.map(([label, href]) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-paper">
                {label} <Arrow />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <footer className="border-t border-paper/20">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-5 py-6 font-mono text-[11px] text-paper/60 sm:px-8">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>London</span>
        </div>
      </footer>
    </section>
  )
}

export default function App() {
  useReveal()
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Experience />
        <Work />
        <Index />
      </main>
      <Contact />
    </>
  )
}
