"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Eyebrow, LiveDot } from "@/components/home/live-dot"
import { MaskedReveal } from "@/components/home/cinema/masked-reveal"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

const STAGES = [
  {
    index: "01",
    key: "viaje",
    title: "El viaje se registra.",
    body: "Origen, destino, kilómetros, camión y chofer. Cada recorrido entra al sistema en el momento.",
    visual: "route",
  },
  {
    index: "02",
    key: "ingresos",
    title: "El flete se asigna.",
    body: "El ingreso queda vinculado al viaje y al camión que lo generó. Nada queda flotando.",
    visual: "income",
  },
  {
    index: "03",
    key: "egresos",
    title: "Los gastos se cargan al mismo viaje.",
    body: "Gasoil, peajes y mantenimientos con categoría, km y litros. Todo apunta al mismo lugar.",
    visual: "expense",
  },
  {
    index: "04",
    key: "costos",
    title: "Los costos fijos se distribuyen.",
    body: "Seguros, cuotas y salarios se prorratean por camión y por período, automáticamente.",
    visual: "costs",
  },
  {
    index: "05",
    key: "rentabilidad",
    title: "KilometrIA devuelve el margen.",
    body: "Costo por km, ingreso por km y utilidad de cada viaje y de cada camión. El mes se cierra solo.",
    visual: "profit",
  },
] as const

function RouteVisual() {
  return (
    <div className="relative h-24 rounded-[12px] border border-[var(--home-border)] bg-[var(--home-surface-elevated)] px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--home-text)]">Montevideo</p>
        <p className="text-xs font-medium text-[var(--home-text)]">São Paulo</p>
      </div>
      <div className="relative mt-5 h-px bg-[var(--home-border-strong)]">
        <div className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--home-text-tertiary)]" />
        <span className="op-route-dot absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--home-accent)] shadow-[0_0_10px_oklch(0.88_0.19_142/60%)]" />
        <div className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--home-text-tertiary)]" />
      </div>
      <div className="mt-5 flex items-center justify-between font-[family-name:var(--font-jetbrains-mono)] text-[10px] tabular-nums text-[var(--home-text-tertiary)]">
        <span>0 km</span>
        <span className="text-[var(--home-accent)]">en ruta · 64%</span>
        <span>890 km</span>
      </div>
    </div>
  )
}

function IncomeVisual() {
  return (
    <div className="space-y-2.5">
      {[
        { label: "Flete · Montevideo → São Paulo", meta: "IKG", amount: "+ R$ 6.400" },
        { label: "Flete · Chuy → Porto Alegre", meta: "JRT", amount: "+ USD 1.980" },
      ].map((row) => (
        <div key={row.label} className="flex items-center justify-between rounded-[12px] border border-[var(--home-border)] bg-[var(--home-surface-elevated)] px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--home-accent)]" />
            <p className="truncate text-xs text-[var(--home-text)]">{row.label}</p>
            <span className="shrink-0 rounded border border-[var(--home-border-strong)] px-1.5 py-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[var(--home-text-secondary)]">
              {row.meta}
            </span>
          </div>
          <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs tabular-nums text-[var(--home-accent)]">
            {row.amount}
          </span>
        </div>
      ))}
    </div>
  )
}

function ExpenseVisual() {
  return (
    <div className="space-y-2.5">
      {[
        { label: "Gasoil", meta: "480 L · 3.640 km", amount: "− R$ 1.120", highlight: false },
        { label: "Peaje", meta: "viaje IWV", amount: "− USD 40", highlight: false },
        { label: "Mantenimiento", meta: "HXR · preventivo", amount: "− R$ 2.150", highlight: true },
      ].map((row) => (
        <div key={row.label} className={cn("flex items-center justify-between rounded-[12px] border px-4 py-3", row.highlight ? "border-[var(--home-amber)]/40 bg-[var(--home-amber)]/8" : "border-[var(--home-border)] bg-[var(--home-surface-elevated)]")}>
          <div className="flex min-w-0 items-center gap-3">
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", row.highlight ? "bg-[var(--home-amber)]" : "bg-[var(--home-text-tertiary)]/60")} />
            <p className="truncate text-xs text-[var(--home-text)]">{row.label}</p>
            <span className="shrink-0 font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[var(--home-text-tertiary)]">
              {row.meta}
            </span>
          </div>
          <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs tabular-nums text-[var(--home-text-secondary)]">
            {row.amount}
          </span>
        </div>
      ))}
    </div>
  )
}

function CostsVisual() {
  const segments = [
    { label: "Seguro", pct: 38 },
    { label: "Cuotas", pct: 34 },
    { label: "Salarios", pct: 28 },
  ]
  return (
    <div className="rounded-[12px] border border-[var(--home-border)] bg-[var(--home-surface-elevated)] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.1em] text-[var(--home-text-tertiary)]">
          Costos fijos · por camión
        </p>
        <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] tabular-nums text-[var(--home-text-secondary)]">
          100%
        </span>
      </div>
      <div className="mb-3 flex h-2.5 overflow-hidden rounded-full">
        {segments.map((s, i) => (
          <div
            key={s.label}
            className="h-full"
            style={{
              width: `${s.pct}%`,
              background:
                i === 0 ? "var(--home-accent)" : i === 1 ? "var(--home-text-secondary)" : "var(--home-text-tertiary)",
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s) => (
          <span key={s.label} className="text-[11px] text-[var(--home-text-tertiary)]">
            {s.label} <span className="font-[family-name:var(--font-jetbrains-mono)] tabular-nums">{s.pct}%</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function ProfitVisual() {
  return (
    <div className="rounded-[12px] border border-[var(--home-border)] bg-[var(--home-surface-elevated)] p-4">
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: "Costo / km", value: "R$ 4,21" },
          { label: "Ingreso / km", value: "R$ 5,65" },
          { label: "Utilidad", value: "R$ 1,44" },
        ].map((m) => (
          <div key={m.label}>
            <p className="mb-1 text-[10px] text-[var(--home-text-tertiary)]">{m.label}</p>
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-semibold tabular-nums text-[var(--home-text)]">
              {m.value}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-1.5">
        {[42, 55, 48, 64, 58, 78].map((h, i) => (
          <div key={i} className="op-minibar flex-1 rounded-t-[3px] bg-[var(--home-accent)]" style={{ height: `${h * 0.5}px` }} />
        ))}
      </div>
    </div>
  )
}

const VISUALS = [RouteVisual, IncomeVisual, ExpenseVisual, CostsVisual, ProfitVisual]

export function OperationSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      section.classList.add("op-stack")
      return
    }

    const ctx = gsap.context(() => {
      const track = trackRef.current
      if (!track) return

      const getMaxX = () => track.scrollWidth - track.parentElement!.clientWidth

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const next = Math.min(STAGES.length - 1, Math.floor(self.progress * STAGES.length))
          setStage((prev) => (prev === next ? prev : next))
          const bar = section.querySelector<HTMLElement>(".op-progress")
          if (bar) bar.style.transform = `scaleX(${self.progress})`
        },
      })

      gsap.to(track, {
        x: () => -getMaxX(),
        ease: "none",
        scrollTrigger: st,
      })

      const cards = section.querySelectorAll<HTMLElement>(".op-stage")
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0.35, y: 40 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: i / STAGES.length,
              end: (i + 1) / STAGES.length,
              scrub: true,
            },
          }
        )
      })

      const routeDot = section.querySelector<HTMLElement>(".op-route-dot")
      if (routeDot) {
        gsap.fromTo(
          routeDot,
          { left: "6%" },
          {
            left: "94%",
            ease: "none",
            scrollTrigger: { trigger: section, start: 0, end: 1 / STAGES.length, scrub: true },
          }
        )
      }

      const minibars = section.querySelectorAll<HTMLElement>(".op-minibar")
      gsap.fromTo(
        minibars,
        { scaleY: 0.1 },
        {
          scaleY: 1,
          transformOrigin: "50% 100%",
          ease: "none",
          stagger: 0.04,
          scrollTrigger: { trigger: section, start: 4 / STAGES.length, end: 1, scrub: true },
        }
      )
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative" aria-labelledby="operation-heading">
      <div className="op-pin h-[420vh]">
        <div className="op-sticky sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div
            className="pointer-events-none absolute -left-40 top-1/2 h-[480px] w-[480px] -translate-y-1/2 rounded-full opacity-[0.07] blur-[130px]"
            style={{ background: "var(--home-accent)" }}
            aria-hidden="true"
          />
          <div className="relative mx-auto mb-10 w-full max-w-[1240px] px-5 sm:px-8">
            <Eyebrow className="mb-5">EL FLUJO COMPLETO</Eyebrow>
            <MaskedReveal
              as="h2"
              id="operation-heading"
              className="text-[clamp(30px,3.8vw,44px)] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--home-text)]"
              lines={["Un mes de operación,", "de punta a punta."]}
            />
          </div>

          <div className="relative mx-auto w-full max-w-[1240px] px-5 sm:px-8">
            <div className="op-ui mb-6 flex items-center justify-between" aria-hidden="true">
              <span className="flex items-center gap-2 font-[family-name:var(--font-jetbrains-mono)] text-[11px] uppercase tracking-[0.12em] text-[var(--home-text-tertiary)]">
                <LiveDot />
                Flujo operativo
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] tabular-nums text-[var(--home-text-tertiary)]">
                {STAGES[stage].index} / 05
              </span>
            </div>
            <div className="op-ui mb-8 h-px w-full overflow-hidden bg-[var(--home-border)]" aria-hidden="true">
              <div className="op-progress h-full w-full origin-left scale-x-0 bg-[var(--home-accent)]" />
            </div>
          </div>

          <div className="overflow-hidden">
            <div ref={trackRef} className="op-track pl-5 sm:pl-[max(1.25rem,calc((100vw-1240px)/2+2rem))]">
              {STAGES.map((s, i) => {
                const Visual = VISUALS[i]
                return (
                  <div key={s.key} className="op-stage pr-8 sm:pr-12">
                    <div className="op-card">
                      <div className="mb-4 flex items-center gap-4">
                        <span className="font-[family-name:var(--font-jetbrains-mono)] text-[clamp(40px,4vw,56px)] font-medium leading-none tracking-[-0.04em] text-[var(--home-text-disabled)]">
                          {s.index}
                        </span>
                        <span className="hidden h-px w-12 bg-[var(--home-border-strong)] sm:block" aria-hidden="true" />
                      </div>
                      <h3 className="mb-3 text-[clamp(20px,1.9vw,26px)] font-medium leading-tight tracking-[-0.02em] text-[var(--home-text)]">
                        {s.title}
                      </h3>
                      <p className="mb-6 max-w-md text-[15px] leading-relaxed text-[var(--home-text-secondary)]">
                        {s.body}
                      </p>
                      <Visual />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
