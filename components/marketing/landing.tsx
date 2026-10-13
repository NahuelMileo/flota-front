"use client"

import "./landing.css"
import type Lenis from "lenis"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type MouseEvent,
} from "react"
import { SITE_CONFIG, whatsappHref } from "@/lib/site-config"
import { CONTENT, type Content, type Locale } from "./content"
import { FLEET_SIZES, fmt, type FleetSize } from "./demo-data"
import { ArrowIcon, CheckIcon, CloseIcon, MenuIcon, WhatsAppIcon } from "./icons"
import { Closing } from "./sections-closing"
import { Bento, Features } from "./sections-features"
import { Hero, ProblemScene } from "./sections-hero"
import { CobroScene, JourneyScene } from "./sections-scenes"
import { MONO, WRAP } from "./styles"
import { useLandingMotion } from "./use-landing-motion"

type LandingContext = {
  /** Textos y datos de demostración del país. */
  c: Content
  /** Monto con el símbolo de la moneda del país: "R$ 5.500" / "$ 40.200". */
  money: (n: number) => string
  /** Menos de 768 px: los mockups esconden columnas. */
  m: boolean
  reduced: boolean
  waHref: string
  fleet: FleetSize
  setFleet: (f: FleetSize) => void
  openDemo: () => void
  go: (e: MouseEvent<HTMLAnchorElement>) => void
}

const Ctx = createContext<LandingContext | null>(null)

export function useLanding() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useLanding fuera de <Landing>")
  return ctx
}

const subscribeResize = (cb: () => void) => {
  window.addEventListener("resize", cb)
  return () => window.removeEventListener("resize", cb)
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)"
const subscribeReduced = (cb: () => void) => {
  const mq = matchMedia(REDUCED_QUERY)
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}

export function Landing({ locale }: { locale: Locale }) {
  const c = CONTENT[locale]
  const rootRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const w = useSyncExternalStore(subscribeResize, () => window.innerWidth, () => 1280)
  const reduced = useSyncExternalStore(subscribeReduced, () => matchMedia(REDUCED_QUERY).matches, () => false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [fleet, setFleet] = useState<FleetSize>("4–10")
  const [pastHero, setPastHero] = useState(false)

  useLandingMotion(rootRef, lenisRef, setScrolled)

  // La barra del celular aparece cuando los botones del hero ya quedaron atrás.
  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.85)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    const prevLang = html.lang
    html.lang = c.lang
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setDialogOpen(false)
      setMenuOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      html.lang = prevLang
      window.removeEventListener("keydown", onKey)
    }
  }, [c.lang])

  const go = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      const href = e.currentTarget.getAttribute("href")
      if (!href || href[0] !== "#") return
      e.preventDefault()
      setMenuOpen(false)
      const top = href === "#top"
      const el = top ? document.body : document.querySelector<HTMLElement>(href)
      if (!el) return
      if (lenisRef.current) lenisRef.current.scrollTo(top ? 0 : el, { offset: -72 })
      else
        window.scrollTo({
          top: top ? 0 : el.getBoundingClientRect().top + scrollY - 72,
          behavior: reduced ? "auto" : "smooth",
        })
    },
    [reduced],
  )

  const openDemo = useCallback(() => {
    setMenuOpen(false)
    setDialogOpen(true)
  }, [])

  const ctx: LandingContext = {
    c,
    money: (n) => `${c.currency} ${fmt(n)}`,
    m: w < 768,
    reduced,
    waHref: whatsappHref(c.whatsappText),
    fleet,
    setFleet,
    openDemo,
    go,
  }

  return (
    <Ctx.Provider value={ctx}>
      <div ref={rootRef} data-kmbr="" id="top">
        <div
          data-progress=""
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "#13865A",
            transformOrigin: "0 50%",
            transform: "scaleX(0)",
            zIndex: 70,
          }}
        />
        <Header scrolled={scrolled} menuOpen={menuOpen} wide={w >= 1080} onToggleMenu={() => setMenuOpen((v) => !v)} />
        {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
        <main>
          <Hero />
          <ProblemScene />
          <JourneyScene />
          <CobroScene />
          <Features />
          <Bento />
          <Closing />
        </main>
        <Footer />
        {/* En el celular, la acción principal queda siempre a mano después del hero. */}
        <div className="kmbr-mcta" data-show={pastHero && !menuOpen && !dialogOpen ? "1" : "0"}>
          <button className="kmbr-btn-dark" onClick={openDemo}>
            {c.nav.demo}
          </button>
          <a href={ctx.waHref} target="_blank" rel="noopener" aria-label={c.nav.whatsapp}>
            <WhatsAppIcon />
          </a>
        </div>
        {dialogOpen && <DemoDialog onClose={() => setDialogOpen(false)} />}
      </div>
    </Ctx.Provider>
  )
}

function Header({
  scrolled,
  menuOpen,
  wide,
  onToggleMenu,
}: {
  scrolled: boolean
  menuOpen: boolean
  wide: boolean
  onToggleMenu: () => void
}) {
  const { c, go, openDemo, waHref } = useLanding()
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        background: scrolled || menuOpen ? "rgba(250,250,248,0.7)" : "rgba(250,250,248,0)",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: `1px solid ${scrolled ? "rgba(11,12,14,0.07)" : "rgba(11,12,14,0)"}`,
        transition: "background-color .2s, border-color .2s",
      }}
    >
      <nav
        aria-label="Principal"
        style={{
          ...WRAP,
          height: 68,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 24,
        }}
      >
        <a
          href="#top"
          onClick={go}
          aria-label={c.nav.home}
          style={{ justifySelf: "start", fontSize: 19, fontWeight: 600, letterSpacing: "-0.035em", color: "#0B0C0E" }}
        >
          Kilometría
        </a>
        {wide ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 14, fontWeight: 450 }}>
              {c.nav.links.map(([href, label]) => (
                <a key={href} href={href} onClick={go} className="kmbr-navlink">
                  {label}
                </a>
              ))}
            </div>
            <div style={{ justifySelf: "end", display: "flex", alignItems: "center", gap: 8 }}>
              <a
                href={waHref}
                target="_blank"
                rel="noopener"
                className="kmbr-navlink"
                style={{ height: 40, fontSize: 14, fontWeight: 450 }}
              >
                WhatsApp
              </a>
              <button
                data-btn=""
                onClick={openDemo}
                className="kmbr-btn-dark"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 40,
                  padding: "0 14px 0 16px",
                  borderRadius: 8,
                  border: 0,
                  whiteSpace: "nowrap",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 1px 2px rgba(11,12,14,0.2)",
                }}
              >
                {c.nav.demo}
                <ArrowIcon size={15} />
              </button>
            </div>
          </>
        ) : (
          <>
            <span />
            <button
              onClick={onToggleMenu}
              aria-label={c.nav.openMenu}
              aria-expanded={menuOpen}
              style={{
                justifySelf: "end",
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                border: "1px solid rgba(11,12,14,0.12)",
                background: "transparent",
                color: "#0B0C0E",
                cursor: "pointer",
              }}
            >
              <MenuIcon />
            </button>
          </>
        )}
      </nav>
    </header>
  )
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const { c, go, openDemo, waHref } = useLanding()
  const square = {
    width: 48,
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    border: "1px solid rgba(11,12,14,0.12)",
    background: "transparent",
    color: "#0B0C0E",
    cursor: "pointer",
  } as const
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "#FAFAF8",
        display: "flex",
        flexDirection: "column",
        padding: "0 20px 32px",
        animation: "kmIn .4s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <div style={{ height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.03em" }}>Kilometría</span>
        <button onClick={onClose} aria-label={c.nav.closeMenu} style={square}>
          <CloseIcon />
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 24, borderTop: "1px solid rgba(11,12,14,0.07)" }}>
        {c.nav.links.map(([href, label]) => (
          <a
            key={href}
            href={href}
            onClick={go}
            style={{
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              padding: "20px 0",
              borderBottom: "1px solid rgba(11,12,14,0.07)",
            }}
          >
            {label}
          </a>
        ))}
      </div>
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={openDemo}
          className="kmbr-btn-dark"
          style={{ height: 56, borderRadius: 10, border: 0, fontSize: 17, fontWeight: 500, cursor: "pointer" }}
        >
          {c.nav.demo}
        </button>
        <a
          href={waHref}
          target="_blank"
          rel="noopener"
          className="kmbr-btn-outline"
          style={{
            height: 56,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontSize: 17,
          }}
        >
          {c.nav.whatsapp}
        </a>
      </div>
    </div>
  )
}

function Footer() {
  const { c, go } = useLanding()
  return (
    <footer style={{ borderTop: "1px solid rgba(11,12,14,0.07)" }}>
      <div
        style={{
          maxWidth: 1264,
          margin: "0 auto",
          padding: "40px clamp(20px,4vw,32px) 48px",
          display: "flex",
          flexWrap: "wrap",
          gap: "24px 40px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a href="#top" onClick={go} style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.03em", color: "#0B0C0E" }}>
          Kilometría
        </a>
        <nav aria-label={c.nav.footer} style={{ display: "flex", flexWrap: "wrap", gap: "8px 28px", fontSize: 15 }}>
          {c.nav.links.map(([href, label]) => (
            <a key={href} href={href} onClick={go} style={{ color: "#4A4F57" }}>
              {label}
            </a>
          ))}
        </nav>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", fontSize: 14, color: "#5F656E" }}>
          <span>© 2026 Kilometría</span>
        </div>
      </div>
    </footer>
  )
}

const FIELD_LABEL = { display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "#4A4F57" } as const

// Se monta al abrirse, así cada apertura arranca con el formulario vacío.
function DemoDialog({ onClose }: { onClose: () => void }) {
  const { c, fleet } = useLanding()
  const d = c.dialog
  const [sent, setSent] = useState(false)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const [nameL, companyL, trucksL, phoneL] = d.bodyLabels
    const body = `${nameL}: ${form.get("nombre")}\n${companyL}: ${form.get("empresa")}\n${trucksL}: ${form.get("camiones")}\n${phoneL}: ${form.get("telefono")}`
    const subject = `${d.subject} — ${form.get("empresa")}`
    window.location.href = `mailto:${SITE_CONFIG.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "rgba(20,22,26,0.35)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "kmIn .3s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-title"
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "calc(100svh - 40px)",
          overflow: "auto",
          borderRadius: 16,
          background: "#FFFFFF",
          border: "1px solid rgba(11,12,14,0.12)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 40px 120px -20px rgba(11,12,14,0.22)",
          padding: "clamp(24px,4vw,32px)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          aria-label={d.close}
          className="kmbr-ghost"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 44,
            height: 44,
            borderRadius: 10,
            border: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <CloseIcon size={18} />
        </button>
        {sent ? (
          <div style={{ padding: "24px 0 8px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span
              style={{
                width: 64,
                height: 64,
                borderRadius: 99,
                background: "rgba(19,134,90,0.12)",
                border: "1px solid rgba(19,134,90,0.35)",
                color: "#13865A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "kmPop .6s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <CheckIcon size={28} width={2} />
            </span>
            <h2
              id="demo-title"
              style={{
                margin: "20px 0 0",
                fontSize: 26,
                fontWeight: 500,
                letterSpacing: "-0.03em",
                animation: "kmIn .6s .1s cubic-bezier(0.22,1,0.36,1) both",
              }}
            >
              {d.sentTitle}
            </h2>
            <p
              style={{
                margin: "8px 0 0",
                maxWidth: 340,
                fontSize: 16,
                lineHeight: 1.55,
                color: "#4A4F57",
                animation: "kmIn .6s .18s cubic-bezier(0.22,1,0.36,1) both",
              }}
            >
              {d.sentText}
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: 24,
                height: 48,
                padding: "0 20px",
                borderRadius: 10,
                border: "1px solid rgba(11,12,14,0.12)",
                background: "transparent",
                color: "#0B0C0E",
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              {d.close}
            </button>
          </div>
        ) : (
          <>
            <h2 id="demo-title" style={{ margin: 0, paddingRight: 40, fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em" }}>
              {d.title}
            </h2>
            <p style={{ margin: "8px 0 0", fontSize: 16, lineHeight: 1.55, color: "#4A4F57" }}>{d.text}</p>
            <form onSubmit={submit} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <label style={FIELD_LABEL}>
                {d.name}
                <input name="nombre" required autoComplete="name" className="kmbr-input" />
              </label>
              <label style={FIELD_LABEL}>
                {d.company}
                <input name="empresa" required autoComplete="organization" className="kmbr-input" />
              </label>
              <label style={FIELD_LABEL}>
                {d.trucks}
                <select name="camiones" defaultValue={fleet} className="kmbr-input">
                  {FLEET_SIZES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
              <label style={FIELD_LABEL}>
                {d.phone}
                <input
                  name="telefono"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder={d.phonePlaceholder}
                  className="kmbr-input"
                  style={{ fontFamily: MONO }}
                />
              </label>
              <button
                type="submit"
                className="kmbr-btn-dark"
                style={{ marginTop: 8, height: 52, borderRadius: 10, border: 0, fontSize: 16, fontWeight: 500, cursor: "pointer" }}
              >
                {d.submit}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
