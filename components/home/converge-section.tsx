"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Wordmark } from "@/components/home/wordmark"
import { Eyebrow } from "@/components/home/live-dot"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

const CHIPS: {
  label: string
  rot: number
  top?: string
  left?: string
  right?: string
  bottom?: string
}[] = [
  { label: "viajes.xlsx", top: "14%", left: "8%", rot: -6 },
  { label: "whatsapp · 8 msgs", top: "8%", right: "6%", rot: 4 },
  { label: "gasoil.pdf", top: "42%", left: "2%", rot: 3 },
  { label: "odómetro.jpg", top: "30%", right: "16%", rot: -4 },
  { label: "cálculo.xls", bottom: "16%", left: "16%", rot: 5 },
  { label: "saldo usd", bottom: "8%", right: "8%", rot: -3 },
]

const PHASES = [
  {
    index: "01",
    title: "Cada dato vive en una herramienta distinta.",
    body: "Planillas, WhatsApp, papel y calculadora. Seis lugares para una misma operación.",
  },
  {
    index: "02",
    title: "En KilometrIA todo converge en un solo lugar.",
    body: "Viajes, movimientos, comprobantes y costos se unifican en un mismo sistema.",
  },
  {
    index: "03",
    title: "Una sola fuente de verdad.",
    body: "Dejás de reconstruir el mes y empezás a leerlo mientras ocurre.",
  },
]

export function ConvergeSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("cv-stack")
      return
    }

    const ctx = gsap.context(() => {
      const chips = section.querySelectorAll<HTMLElement>(".cv-chip")
      const panel = section.querySelector<HTMLElement>(".cv-panel")
      const glow = section.querySelector<HTMLElement>(".cv-glow")

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress
            const next = p < 0.3 ? 0 : p < 0.62 ? 1 : 2
            setPhase((prev) => (prev === next ? prev : next))
          },
        },
      })

      // 0 → 1: scattered chips breathe
      gsap.set(chips, { opacity: 1, scale: 1 })
      tl.to(chips, {
        y: "random(-10, 10)",
        x: "random(-8, 8)",
        duration: 0.35,
        ease: "power1.inOut",
        yoyo: true,
        repeat: 1,
      })

      // Chips fly toward the centre and dissolve
      tl.to(
        chips,
        {
          x: 0,
          y: 0,
          scale: 0.55,
          opacity: 0,
          duration: 0.45,
          stagger: 0.04,
          ease: "power3.in",
        },
        0.22
      )

      // The system panel assembles in their place
      tl.fromTo(
        panel,
        { opacity: 0, scale: 0.86, y: 26, rotation: -2.5 },
        { opacity: 1, scale: 1, y: 0, rotation: 0, duration: 0.4, ease: "power4.out" },
        0.42
      )
      tl.fromTo(
        glow,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" },
        0.4
      )

      // Inner content reveals inside the panel
      tl.fromTo(
        section.querySelectorAll(".cv-line"),
        { yPercent: 112 },
        { yPercent: 0, duration: 0.3, stagger: 0.06, ease: "power4.out" },
        0.5
      )
      tl.fromTo(
        section.querySelectorAll(".cv-metric"),
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.25, stagger: 0.05 },
        0.62
      )

      // Phases crossfade
      const phases = section.querySelectorAll<HTMLElement>(".cv-phase")
      gsap.set(phases[0], { opacity: 1, y: 0 })
      tl.to(phases[0], { opacity: 0, y: -14, duration: 0.2 }, 0.3)
        .fromTo(phases[1], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.25 }, 0.38)
        .to(phases[1], { opacity: 0, y: -14, duration: 0.2 }, 0.7)
        .fromTo(phases[2], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.25 }, 0.78)
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative" aria-label="Del caos a un solo sistema">
      <div className="cv-pin h-[340vh]">
        <div className="cv-sticky sticky top-0 flex h-screen items-center overflow-hidden">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.09] blur-[130px]"
            style={{ background: "var(--home-accent)" }}
            aria-hidden="true"
          />
          <div className="relative mx-auto w-full max-w-[1240px] px-5 sm:px-8">
            <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-8">
              {/* Phase text */}
              <div className="relative lg:col-span-5">
                <div className="mb-6 hidden lg:block">
                  <Eyebrow>UN SOLO SISTEMA</Eyebrow>
                </div>
                <div className="relative min-h-[220px] lg:min-h-[280px]">
                  {PHASES.map((p, i) => (
                    <div
                      key={p.index}
                      className="cv-phase absolute inset-0"
                      aria-hidden={phase !== i}
                    >
                      <span className="mb-3 block font-[family-name:var(--font-jetbrains-mono)] text-xs tabular-nums text-[var(--home-accent)]">
                        {p.index}
                      </span>
                      <h3 className="text-[clamp(26px,3.2vw,38px)] font-medium leading-[1.08] tracking-[-0.03em] text-[var(--home-text)]">
                        {p.title}
                      </h3>
                      <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[var(--home-text-secondary)]">
                        {p.body}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 hidden items-center gap-1.5 lg:flex" aria-hidden="true">
                  {PHASES.map((p, i) => (
                    <span
                      key={p.index}
                      className={cn(
                        "h-1 rounded-full transition-all duration-500",
                        i === phase
                          ? "w-8 bg-[var(--home-accent)]"
                          : "w-2 bg-[var(--home-border-strong)]"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Scene: chips → panel */}
              <div className="relative lg:col-span-7">
                <div className="relative mx-auto h-[300px] max-w-[560px] sm:h-[400px]">
                  {CHIPS.map((chip) => (
                    <span
                      key={chip.label}
                      className="cv-chip absolute rounded-full border border-[var(--home-border-strong)] bg-[var(--home-surface)] px-3.5 py-1.5 font-[family-name:var(--font-jetbrains-mono)] text-[11px] tabular-nums text-[var(--home-text-secondary)] shadow-[0_12px_32px_oklch(0_0_0/25%)]"
                      style={{
                        top: chip.top,
                        left: chip.left,
                        right: chip.right,
                        bottom: chip.bottom,
                        rotate: `${chip.rot}deg`,
                      }}
                    >
                      {chip.label}
                    </span>
                  ))}

                  <div className="cv-glow pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--home-accent)] opacity-0 blur-[90px]" />

                  <div className="cv-panel cin-hide panel-surface absolute left-1/2 top-1/2 w-[min(90%,420px)] -translate-x-1/2 -translate-y-1/2 rounded-[16px] p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="overflow-hidden">
                        <span className="cv-line block">
                          <Wordmark className="text-lg" />
                        </span>
                      </span>
                      <span className="overflow-hidden">
                        <span className="cv-line block font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--home-text-tertiary)]">
                          Sistema único
                        </span>
                      </span>
                    </div>

                    <div className="cv-metric mb-5 grid grid-cols-3 gap-4 border-b border-[var(--home-border)] pb-5 opacity-0">
                      {[
                        { label: "Fuentes", value: "6 → 1" },
                        { label: "Monedas", value: "3" },
                        { label: "Verdad", value: "100%" },
                      ].map((m) => (
                        <div key={m.label}>
                          <p className="mb-1 text-[10px] text-[var(--home-text-tertiary)]">{m.label}</p>
                          <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-semibold tabular-nums text-[var(--home-text)]">
                            {m.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-[var(--home-text-tertiary)]">Un solo lugar</p>
                        <p className="mt-0.5 font-[family-name:var(--font-jetbrains-mono)] text-xs text-[var(--home-accent)]">
                          rentabilidad · viajes · costos
                        </p>
                      </div>
                      <svg viewBox="0 0 120 24" className="h-6 w-32" aria-hidden="true">
                        <polyline
                          points="0,20 24,16 48,18 72,10 96,12 120,4"
                          fill="none"
                          stroke="var(--home-accent)"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <p className="cv-stage-count mt-8 text-center font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--home-text-disabled)] lg:mt-14">
                  {PHASES[phase].index} / 03
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
