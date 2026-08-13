"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Table2, MessageSquare, Receipt, Calculator, Gauge, Coins } from "lucide-react"
import { MaskedReveal } from "@/components/home/cinema/masked-reveal"
import { Eyebrow } from "@/components/home/live-dot"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

type Tone = "neutral" | "red" | "amber"

const FRAGMENTS: {
  icon: typeof Table2
  label: string
  detail: string
  tone: Tone
  className: string
  rot: number
}[] = [
  {
    icon: Table2,
    label: "Planilla de viajes",
    detail: "42 filas · sin actualizar hace 6 días",
    tone: "neutral",
    className: "left-[2%] top-[2%] w-[46%] sm:w-[42%]",
    rot: -2,
  },
  {
    icon: MessageSquare,
    label: "Gastos por WhatsApp",
    detail: "8 mensajes sin cargar",
    tone: "red",
    className: "right-[1%] top-[10%] w-[46%] sm:w-[40%]",
    rot: 2.5,
  },
  {
    icon: Receipt,
    label: "Comprobante pendiente",
    detail: "Gasoil · sin asignar",
    tone: "amber",
    className: "left-[22%] top-[38%] w-[44%] sm:w-[36%]",
    rot: -1.5,
  },
  {
    icon: Coins,
    label: "Tres monedas en juego",
    detail: "UYU · BRL · USD mezclados",
    tone: "neutral",
    className: "right-[26%] top-[50%] w-[40%] sm:w-[28%]",
    rot: 3,
  },
  {
    icon: Gauge,
    label: "Odómetros",
    detail: "Anotados en papel, en la cabina",
    tone: "neutral",
    className: "left-[4%] bottom-[4%] w-[40%] sm:w-[30%]",
    rot: 1.8,
  },
  {
    icon: Calculator,
    label: "Rentabilidad de mayo",
    detail: "Cálculo manual · sin cerrar",
    tone: "red",
    className: "right-[5%] bottom-[2%] w-[46%] sm:w-[42%]",
    rot: -2.5,
  },
]

const TONE_STYLES: Record<Tone, { dot: string; text: string; bg: string }> = {
  neutral: { dot: "bg-[var(--home-text-tertiary)]", text: "", bg: "bg-[var(--home-surface)]" },
  red: {
    dot: "bg-[var(--home-red)] shadow-[0_0_0_4px_oklch(0.55_0.18_22/12%)]",
    text: "text-[var(--home-red)]",
    bg: "bg-[var(--home-surface)]",
  },
  amber: {
    dot: "bg-[var(--home-amber)] shadow-[0_0_0_4px_oklch(0.62_0.15_65/14%)]",
    text: "text-[var(--home-amber)]",
    bg: "bg-[var(--home-surface)]",
  },
}

function ChaosCard({
  fragment,
  delay,
}: {
  fragment: (typeof FRAGMENTS)[number]
  delay: number
}) {
  const Icon = fragment.icon
  const tone = TONE_STYLES[fragment.tone]
  return (
    <div
      className={cn(
        "chaos-card absolute hidden flex-col rounded-[14px] border border-[var(--home-border)] p-4 shadow-[0_24px_60px_oklch(0.2_0.03_150/10%)] sm:flex motion-safe:animate-[home-fragment-drift_9s_ease-in-out_infinite]",
        fragment.className,
        tone.bg
      )}
      style={{ rotate: `${fragment.rot}deg`, animationDelay: `${delay}s` }}
    >
      <div className="mb-3 flex items-center justify-between">
        <Icon className="h-4 w-4 text-[var(--home-text-tertiary)]" aria-hidden="true" />
        <span className={cn("block h-1.5 w-1.5 rounded-full", tone.dot)} aria-hidden="true" />
      </div>
      <p className="mb-1 text-sm font-medium text-[var(--home-text)]">{fragment.label}</p>
      <p className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] tabular-nums text-[var(--home-text-tertiary)]">
        {fragment.detail}
      </p>
    </div>
  )
}

function ChaosField() {
  return (
    <div className="relative min-h-[440px] sm:h-[480px] lg:h-[520px]" aria-hidden="true">
      {/* Scattered mobile layout — plain grid, no chaos composition on small screens */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {FRAGMENTS.map((f) => {
          const Icon = f.icon
          const tone = TONE_STYLES[f.tone]
          return (
            <div key={f.label} className="rounded-[14px] border border-[var(--home-border)] bg-[var(--home-surface)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <Icon className="h-4 w-4 text-[var(--home-text-tertiary)]" />
                <span className={cn("block h-1.5 w-1.5 rounded-full", tone.dot)} />
              </div>
              <p className="mb-1 text-sm font-medium text-[var(--home-text)]">{f.label}</p>
              <p className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] text-[var(--home-text-tertiary)]">
                {f.detail}
              </p>
            </div>
          )
        })}
      </div>

      {FRAGMENTS.map((f, i) => (
        <ChaosCard key={f.label} fragment={f} delay={i * 1.3} />
      ))}

      {/* Connector arrows tracing the mess between fragments */}
      <svg
        className="pointer-events-none absolute inset-0 hidden h-full w-full text-[var(--home-border-strong)] sm:block"
        fill="none"
        viewBox="0 0 600 520"
        preserveAspectRatio="none"
      >
        <path d="M60 120 C 200 140, 220 300, 380 270" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 7" />
        <path d="M520 220 C 420 260, 380 320, 300 300" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 7" />
      </svg>
    </div>
  )
}

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const ctx = gsap.context(() => {
      // The mess sways uneasily as you scroll past it — communication of
      // instability, not decoration.
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top 70%",
        end: "bottom 30%",
        scrub: true,
      })
      section.querySelectorAll<HTMLElement>(".chaos-card").forEach((el, i) => {
        gsap.fromTo(
          el,
          { x: 0, y: 0 },
          {
            x: (i % 2 === 0 ? 1 : -1) * (10 + i * 2),
            y: (i % 2 === 0 ? -1 : 1) * (8 + i),
            rotation: (i % 2 === 0 ? 1 : -1) * 1.6,
            ease: "none",
            scrollTrigger: st,
          }
        )
      })
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="scene-light relative overflow-hidden py-24 sm:py-32"
      aria-labelledby="problem-heading"
    >
      <div className="grid-overlay" />
      <div
        className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full opacity-[0.05] blur-[100px]"
        style={{ background: "var(--home-amber)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Eyebrow className="cin-hide-up mb-6">EL PROBLEMA</Eyebrow>
            <MaskedReveal
              as="h2"
              id="problem-heading"
              className="text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.02] tracking-[-0.035em] text-[var(--home-text)]"
              lines={[
                "La información",
                "existe. Está",
                <span key="spread" className="text-[var(--home-text-tertiary)]">
                  en todas partes.
                </span>,
              ]}
            />
            <p className="cin-hide-up mt-6 max-w-md text-[17px] leading-relaxed text-[var(--home-text-secondary)]">
              Los viajes quedan en una planilla, los gastos llegan por
              WhatsApp y los comprobantes se cargan cuando hay tiempo. Cada
              dato vive en una herramienta distinta.
            </p>
          </div>

          <div className="lg:col-span-7">
            <ChaosField />
          </div>
        </div>

        <p className="cin-hide-up mt-16 max-w-2xl text-lg leading-relaxed tracking-[-0.01em] text-[var(--home-text)] sm:text-xl">
          Cuando llega fin de mes, calcular la rentabilidad depende de volver
          a ordenar todo.{" "}
          <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[var(--home-text-secondary)]">
            · Y el mes siguiente vuelve a empezar.
          </span>
        </p>
      </div>
    </section>
  )
}
