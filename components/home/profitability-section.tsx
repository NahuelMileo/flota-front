"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Eyebrow } from "@/components/home/live-dot"
import { MaskedReveal } from "@/components/home/cinema/masked-reveal"
import { AnimatedNumber } from "@/components/home/cinema/animated-number"
import { Reveal } from "@/components/home/reveal"
import { FLEET_SUMMARY, TRUCK_PROFITABILITY, STATUS_TONE, DEMO_LABEL } from "@/components/home/demo-data"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

const PERIODS = [
  { id: "current", label: "Este mes" },
  { id: "previous", label: "Mes anterior" },
  { id: "quarter", label: "Últimos 3 meses" },
] as const

type Period = (typeof PERIODS)[number]["id"]

const PERIOD_MULTIPLIER: Record<Period, number> = {
  current: 1,
  previous: 0.91,
  quarter: 2.86,
}

function ProfBars() {
  const ref = useRef<HTMLDivElement>(null)
  const max = Math.max(...TRUCK_PROFITABILITY.map((t) => t.profitPerKm))

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".prof-bar",
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "0% 50%",
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: node, start: "top 85%", once: true },
        }
      )
    }, node)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="relative mt-10 border-t border-[var(--home-border)] pt-6">
      <p className="mb-4 font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.1em] text-[var(--home-text-tertiary)]">
        Comparativa por camión · utilidad por km
      </p>
      <div className="space-y-4">
        {TRUCK_PROFITABILITY.map((truck) => {
          return (
            <div key={truck.plate} className="grid grid-cols-[52px_1fr_auto] items-center gap-4 sm:grid-cols-[52px_1fr_150px_110px]">
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm tabular-nums text-[var(--home-text)]">
                {truck.plate}
              </span>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--home-border)]">
                <div
                  className="prof-bar h-full origin-left rounded-full bg-[var(--home-accent)]"
                  style={{ width: `${(truck.profitPerKm / max) * 100}%` }}
                />
              </div>
              <span className="hidden text-right font-[family-name:var(--font-jetbrains-mono)] text-xs tabular-nums text-[var(--home-text-secondary)] sm:block">
                R$ {truck.profitPerKm.toFixed(2)}/km
              </span>
              <span
                className={cn(
                  "justify-self-end rounded-full px-2.5 py-1 text-[11px] font-medium",
                  STATUS_TONE[truck.status] === "accent" &&
                    "bg-[var(--home-accent)]/12 text-[var(--home-accent)]",
                  STATUS_TONE[truck.status] === "amber" && "bg-[var(--home-amber)]/12 text-[var(--home-amber)]",
                  STATUS_TONE[truck.status] === "neutral" && "bg-[var(--home-border)] text-[var(--home-text-tertiary)]"
                )}
              >
                {truck.status}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ProfitabilitySection() {
  const [period, setPeriod] = useState<Period>("current")
  const multiplier = PERIOD_MULTIPLIER[period]

  const metrics = [
    { label: "Ingreso por km", value: 5.65, prefix: "R$ ", decimals: 2 },
    { label: "Costo por km", value: FLEET_SUMMARY.costPerKm, prefix: "R$ ", decimals: 2 },
    { label: "Utilidad por km", value: FLEET_SUMMARY.profitPerKm, prefix: "R$ ", decimals: 2 },
    { label: "Km recorridos", value: Math.round(FLEET_SUMMARY.totalKm * multiplier), prefix: "" },
    { label: "Consumo", value: 2.7, decimals: 1, suffix: " km/L" },
    { label: "Utilidad mensual", value: Math.round(FLEET_SUMMARY.profit * multiplier), prefix: "R$ " },
  ]

  return (
    <section
      id="rentabilidad"
      className="scene-light relative overflow-hidden py-24 sm:py-32"
      aria-labelledby="profitability-heading"
    >
      <div className="grid-overlay" />
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Eyebrow className="cin-hide-up mb-6">RENTABILIDAD REAL</Eyebrow>
            <MaskedReveal
              as="h2"
              id="profitability-heading"
              className="text-[clamp(32px,4.4vw,54px)] font-medium leading-[1.02] tracking-[-0.035em] text-[var(--home-text)]"
              lines={[
                "Facturar más no",
                "significa",
                <span key="gain" className="text-[var(--home-accent)]">
                  ganar más.
                </span>,
              ]}
            />
          </div>
          <div className="lg:col-span-5">
            <p className="cin-hide-up max-w-md text-[17px] leading-relaxed text-[var(--home-text-secondary)]">
              KilometrIA cruza ingresos, combustible, mantenimientos, costos
              fijos y kilómetros recorridos para mostrar la utilidad de cada
              vehículo. Con los números de un vistazo, la decisión llega sola.
            </p>
          </div>
        </div>

        <Reveal delay={120} className="mt-14">
          <div className="panel-surface rounded-[18px] p-6 sm:p-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div
                className="inline-flex rounded-[10px] border border-[var(--home-border)] bg-[var(--home-surface-elevated)] p-1"
                role="tablist"
                aria-label="Período de rentabilidad"
              >
                {PERIODS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={period === p.id}
                    onClick={() => setPeriod(p.id)}
                    className={cn(
                      "rounded-[8px] px-3 py-1.5 text-[13px] font-medium transition-colors",
                      period === p.id
                        ? "bg-[var(--home-accent)] text-[var(--home-accent-foreground)]"
                        : "text-[var(--home-text-secondary)] hover:text-[var(--home-text)]"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.1em] text-[var(--home-text-disabled)]">
                {DEMO_LABEL}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
              {metrics.map((m) => (
                <div key={m.label}>
                  <p className="mb-1.5 text-xs text-[var(--home-text-tertiary)]">{m.label}</p>
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-lg font-semibold tabular-nums text-[var(--home-text)]">
                    <AnimatedNumber
                      value={m.value}
                      decimals={m.decimals ?? 0}
                      prefix={m.prefix ?? ""}
                      suffix={m.suffix ?? ""}
                    />
                  </p>
                </div>
              ))}
            </div>

            <ProfBars />
          </div>
        </Reveal>

        <div className="cin-hide-up mt-12 grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-[14px] border border-[var(--home-border)] bg-[var(--home-surface)] px-5 py-4">
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.1em] text-[var(--home-text-tertiary)]">
              Antes
            </p>
            <p className="mt-2 text-[15px] font-medium text-[var(--home-text)]">
              Cerrar el mes llevaba 3 días de planillas.
            </p>
          </div>
          <ArrowSpan />
          <div className="rounded-[14px] border border-[var(--home-accent)]/40 bg-[var(--home-accent)]/8 px-5 py-4">
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.1em] text-[var(--home-accent)]">
              Ahora
            </p>
            <p className="mt-2 text-[15px] font-medium text-[var(--home-text)]">
              La rentabilidad se lee en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ArrowSpan() {
  return (
    <span className="hidden h-px w-16 shrink-0 bg-[var(--home-accent)] sm:block" aria-hidden="true" />
  )
}
