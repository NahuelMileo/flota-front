"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { LayoutDashboard, Route, Truck, ArrowDownLeft, ArrowUpRight, Wrench, Wallet, ChartNoAxesCombined } from "lucide-react"
import { Wordmark } from "@/components/home/wordmark"
import { Eyebrow } from "@/components/home/live-dot"
import { ACTIVE_TRIPS, TRUCK_PROFITABILITY, STATUS_TONE, FLEET_SUMMARY } from "@/components/home/demo-data"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Resumen", active: true },
  { icon: Route, label: "Viajes" },
  { icon: Truck, label: "Camiones" },
  { icon: ArrowDownLeft, label: "Ingresos" },
  { icon: ArrowUpRight, label: "Egresos" },
  { icon: Wallet, label: "Costos" },
  { icon: Wrench, label: "Mantenimiento" },
]

const STEPS = [
  {
    index: "01",
    title: "El tablero de KilometrIA.",
    body: "Toda la operación en una pantalla. Sin planillas, sin mensajes sueltos.",
  },
  {
    index: "02",
    title: "Los números que importan, al instante.",
    body: "Ingresos, egresos y balance en tiempo real. La variación se compara sola.",
  },
  {
    index: "03",
    title: "Seis meses de evolución.",
    body: "Ingresos contra egresos mes a mes, sin armar tablas a mano.",
  },
  {
    index: "04",
    title: "Cada viaje, su estado y su saldo.",
    body: "En qué camión está, qué km lleva y cuánto falta cobrar.",
  },
  {
    index: "05",
    title: "Rentabilidad por camión, en una línea.",
    body: "Sabés cuál sostiene el margen y cuál lo está drenando.",
  },
  {
    index: "06",
    title: "Cada movimiento, a su camión.",
    body: "Ingresos y egresos con categoría, km, litros y moneda.",
  },
]

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
const INCOMES = [34, 42, 38, 55, 48, 68]
const EXPENSES = [26, 33, 30, 41, 37, 44]

const MOVEMENTS = [
  { label: "Flete · Montevideo → São Paulo", truck: "IKG", amount: "+ R$ 6.400", positive: true, currency: "BRL" },
  { label: "Gasoil", truck: "IWV", amount: "− R$ 1.120", positive: false, currency: "BRL" },
  { label: "Peaje", truck: "JRT", amount: "− USD 40", positive: false, currency: "USD" },
  { label: "Flete · Chuy → Porto Alegre", truck: "JRT", amount: "+ USD 1.980", positive: true, currency: "USD" },
  { label: "Salario chofer", truck: "IKG", amount: "− R$ 960", positive: false, currency: "BRL" },
  { label: "Mantenimiento", truck: "HXR", amount: "− R$ 2.150", positive: false, currency: "BRL" },
]

function Sidebar() {
  return (
    <div className="hidden shrink-0 border-r border-[var(--home-border)] bg-[var(--home-surface)]/60 md:flex md:w-44 md:flex-col">
      <div className="flex items-center gap-2 border-b border-[var(--home-border)] px-4 py-4">
        <ChartNoAxesCombined className="h-4 w-4 text-[var(--home-accent)]" aria-hidden="true" />
        <Wordmark className="text-sm" />
      </div>
      <nav className="flex-1 space-y-0.5 p-2" aria-label="Navegación del tablero">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <span
              key={item.label}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs",
                item.active
                  ? "bg-[var(--home-accent)]/12 font-medium text-[var(--home-accent)]"
                  : "text-[var(--home-text-tertiary)]"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {item.label}
            </span>
          )
        })}
      </nav>
      <div className="border-t border-[var(--home-border)] p-4">
        <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] tabular-nums text-[var(--home-text-disabled)]">
          {FLEET_SUMMARY.currency} · Demo
        </p>
      </div>
    </div>
  )
}

function KPIPanel() {
  const kpis = [
    { label: "Ingresos", value: FLEET_SUMMARY.revenue, prefix: "R$ ", accent: false },
    { label: "Egresos", value: FLEET_SUMMARY.costs, prefix: "R$ ", accent: false },
    { label: "Balance", value: FLEET_SUMMARY.profit, prefix: "R$ ", accent: true },
    { label: "Costo / km", value: FLEET_SUMMARY.costPerKm, prefix: "R$ ", decimals: 2, accent: false },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="rounded-[12px] border border-[var(--home-border)] bg-[var(--home-surface-elevated)] p-4">
          <p className="mb-2 text-[10px] text-[var(--home-text-tertiary)]">{kpi.label}</p>
          <p className={cn("font-[family-name:var(--font-jetbrains-mono)] text-base font-semibold tabular-nums sm:text-lg", kpi.accent ? "text-[var(--home-accent)]" : "text-[var(--home-text)]")}>
            <span className="kpi-value" data-target={kpi.value} data-prefix={kpi.prefix} data-decimals={kpi.decimals ?? 0}>
              {kpi.prefix}
              {(kpi.value ?? 0).toLocaleString("es-UY", { minimumFractionDigits: kpi.decimals ?? 0, maximumFractionDigits: kpi.decimals ?? 0 })}
            </span>
          </p>
          <p className="mt-1 text-[10px] text-[var(--home-text-tertiary)]">vs mes anterior</p>
        </div>
      ))}
    </div>
  )
}

function ChartPanel() {
  return (
    <div className="flex h-full flex-col justify-between rounded-[12px] border border-[var(--home-border)] bg-[var(--home-surface-elevated)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.1em] text-[var(--home-text-tertiary)]">
          Ingresos vs egresos
        </p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[10px] text-[var(--home-text-tertiary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--home-accent)]" /> Ingresos
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-[var(--home-text-tertiary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--home-text-tertiary)]/60" /> Egresos
          </span>
        </div>
      </div>
      <div className="flex h-40 items-end justify-between gap-2 sm:h-48">
        {MONTHS.map((m, i) => (
          <div key={m} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <div className="flex w-full flex-1 items-end justify-center gap-1">
              <div className="dash-bar w-2 rounded-t-[3px] bg-[var(--home-accent)] sm:w-2.5" style={{ height: `${INCOMES[i]}%` }} />
              <div className="dash-bar w-2 rounded-t-[3px] bg-[var(--home-text-tertiary)]/60 sm:w-2.5" style={{ height: `${EXPENSES[i]}%` }} />
            </div>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[var(--home-text-tertiary)]">{m}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TripsPanel() {
  return (
    <div className="flex h-full flex-col gap-2.5">
      {ACTIVE_TRIPS.map((trip) => (
        <div key={`${trip.origin}-${trip.destination}`} className="trip-row rounded-[12px] border border-[var(--home-border)] bg-[var(--home-surface-elevated)] px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-medium text-[var(--home-text)]">
              {trip.origin} <span className="text-[var(--home-text-tertiary)]">→</span> {trip.destination}
            </p>
            <span className="rounded-full border border-[var(--home-border-strong)] px-2 py-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[var(--home-text-secondary)]">
              {trip.truck} · {trip.currency}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1 flex-1 rounded-full bg-[var(--home-surface)]">
              <div className="h-1 rounded-full bg-[var(--home-accent)]" style={{ width: `${trip.progress}%` }} />
            </div>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] tabular-nums text-[var(--home-text-secondary)]">
              {trip.progress}% · {trip.balance}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function TrucksPanel() {
  const max = Math.max(...TRUCK_PROFITABILITY.map((t) => t.profitPerKm))
  return (
    <div className="flex h-full flex-col justify-center gap-3 rounded-[12px] border border-[var(--home-border)] bg-[var(--home-surface-elevated)] px-4 py-5 sm:px-5">
      {TRUCK_PROFITABILITY.map((truck) => (
        <div key={truck.plate} className="grid grid-cols-[52px_1fr_72px] items-center gap-3 sm:grid-cols-[52px_1fr_90px_88px]">
          <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[var(--home-text)]">{truck.plate}</span>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--home-surface)]">
            <div
              className="dash-truck-bar h-full rounded-full bg-[var(--home-accent)]"
              style={{ width: `${(truck.profitPerKm / max) * 100}%` }}
            />
          </div>
          <span className="text-right font-[family-name:var(--font-jetbrains-mono)] text-[11px] tabular-nums text-[var(--home-text)]">
            R$ {truck.profitPerKm.toFixed(2)}/km
          </span>
          <span
            className={cn(
              "hidden justify-self-end rounded-full px-2 py-0.5 text-[10px] font-medium sm:block",
              STATUS_TONE[truck.status] === "accent" && "bg-[var(--home-accent)]/12 text-[var(--home-accent)]",
              STATUS_TONE[truck.status] === "amber" && "bg-[var(--home-amber)]/12 text-[var(--home-amber)]",
              STATUS_TONE[truck.status] === "neutral" && "bg-white/5 text-[var(--home-text-secondary)]"
            )}
          >
            {truck.status}
          </span>
        </div>
      ))}
    </div>
  )
}

function MovementsPanel() {
  return (
    <div className="flex h-full flex-col gap-1.5 overflow-hidden">
      {MOVEMENTS.map((m) => (
        <div key={m.label} className="movement-row grid grid-cols-[1fr_auto] items-center gap-3 rounded-[10px] border border-[var(--home-border)] bg-[var(--home-surface-elevated)] px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--home-text-tertiary)]/50" />
            <p className="truncate text-[12px] text-[var(--home-text)]">{m.label}</p>
            <span className="shrink-0 rounded border border-[var(--home-border-strong)] px-1.5 py-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[var(--home-text-secondary)]">
              {m.truck}
            </span>
          </div>
          <span className={cn("font-[family-name:var(--font-jetbrains-mono)] text-[12px] tabular-nums", m.positive ? "text-[var(--home-accent)]" : "text-[var(--home-text-secondary)]")}>
            {m.amount}
          </span>
        </div>
      ))}
    </div>
  )
}

const PANELS = [KPIPanel, ChartPanel, TripsPanel, TrucksPanel, MovementsPanel]

export function DashboardSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("dash-stack")
      return
    }

    const ctx = gsap.context(() => {
      const panels = section.querySelectorAll<HTMLElement>(".dash-panel")
      const steps = section.querySelectorAll<HTMLElement>(".dash-step")

      gsap.set(panels, { opacity: 0, y: 22 })
      gsap.set(panels[0], { opacity: 1, y: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress
            const next = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length))
            setStep((prev) => (prev === next ? prev : next))
          },
        },
      })

      // Step captions crossfade
      gsap.set(steps[0], { opacity: 1, y: 0 })
      for (let i = 1; i < STEPS.length; i++) {
        gsap.set(steps[i], { opacity: 0, y: 16 })
      }
      const stepIn = 0.1
      const stepSpan = 0.85 / STEPS.length
      for (let i = 0; i < STEPS.length; i++) {
        if (i > 0) tl.to(steps[i - 1], { opacity: 0, y: -12, duration: 0.08 }, stepIn + i * stepSpan)
        tl.fromTo(
          steps[i],
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.08 },
          stepIn + i * stepSpan + 0.06
        )
      }

      // Panel crossfades
      const panelPos = [0.12, 0.29, 0.46, 0.63, 0.8]
      panels.forEach((panel, i) => {
        if (i > 0) tl.to(panels[i - 1], { opacity: 0, y: -18, duration: 0.1 }, panelPos[i] - 0.07)
        tl.fromTo(
          panel,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" },
          panelPos[i]
        )
      })

      // KPI counters at step 2 (panel index 0)
      section.querySelectorAll<HTMLElement>(".kpi-value").forEach((node) => {
        const prefix = node.dataset.prefix ?? ""
        const decimals = Number(node.dataset.decimals ?? 0)
        const target = Number(node.dataset.target ?? 0)
        const state = { v: 0 }
        tl.to(
          state,
          {
            v: target,
            duration: 0.5,
            ease: "power3.out",
            onUpdate: () => {
              node.textContent = `${prefix}${state.v.toLocaleString("es-UY", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
            },
          },
          panelPos[0] + 0.12
        )
      })

      // Chart bars grow
      tl.fromTo(
        section.querySelectorAll(".dash-bar"),
        { scaleY: 0 },
        { scaleY: 1, duration: 0.3, ease: "power3.out", stagger: 0.03, transformOrigin: "50% 100%" },
        panelPos[1] + 0.1
      )

      // Trip rows
      tl.fromTo(
        section.querySelectorAll(".trip-row"),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.12, stagger: 0.04 },
        panelPos[2] + 0.08
      )

      // Movement rows
      tl.fromTo(
        section.querySelectorAll(".movement-row"),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.12, stagger: 0.03 },
        panelPos[4] + 0.08
      )

      // Truck bars
      tl.fromTo(
        section.querySelectorAll(".dash-truck-bar"),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.3, ease: "power3.out", stagger: 0.05, transformOrigin: "0% 50%" },
        panelPos[3] + 0.1
      )
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative" aria-label="El tablero de KilometrIA">
      <div className="dash-pin h-[340vh]">
        <div className="dash-sticky sticky top-0 flex h-screen items-center overflow-hidden">
          <div
            className="pointer-events-none absolute -right-40 top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full opacity-[0.07] blur-[120px]"
            style={{ background: "var(--home-accent)" }}
            aria-hidden="true"
          />
          <div className="relative mx-auto w-full max-w-[1240px] px-5 sm:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="relative lg:col-span-5">
                <div className="mb-6 hidden lg:block">
                  <Eyebrow>EL SISTEMA</Eyebrow>
                </div>
                <div className="relative min-h-[220px] lg:min-h-[280px]">
                  {STEPS.map((s, i) => (
                    <div key={s.index} className={cn("dash-step absolute inset-0", i > 0 && "cin-hide")} aria-hidden={step !== i}>
                      <span className="mb-3 block font-[family-name:var(--font-jetbrains-mono)] text-xs tabular-nums text-[var(--home-accent)]">
                        {s.index}
                      </span>
                      <h3 className="text-[clamp(24px,2.9vw,34px)] font-medium leading-[1.08] tracking-[-0.03em] text-[var(--home-text)]">
                        {s.title}
                      </h3>
                      <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[var(--home-text-secondary)]">
                        {s.body}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 hidden items-center gap-1.5 lg:flex" aria-hidden="true">
                  {STEPS.map((s, i) => (
                    <span
                      key={s.index}
                      className={cn(
                        "h-1 rounded-full transition-all duration-500",
                        i <= step ? "bg-[var(--home-accent)]" : "bg-[var(--home-border-strong)]",
                        i === step ? "w-8" : "w-2"
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="mb-4 flex items-center justify-between lg:hidden">
                  <span className="text-sm font-medium text-[var(--home-text)]">{STEPS[step].title}</span>
                  <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] tabular-nums text-[var(--home-text-tertiary)]">
                    {STEPS[step].index} / {String(STEPS.length).padStart(2, "0")}
                  </span>
                </div>

                <div className="panel-surface overflow-hidden rounded-[16px]">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center justify-between border-b border-[var(--home-border)] px-4 py-3 sm:px-5">
                        <p className="text-[13px] font-medium text-[var(--home-text)]">Resumen</p>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-[var(--home-border)] px-2.5 py-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[var(--home-text-tertiary)]">
                            Jun 2026
                          </span>
                          <span className="hidden rounded-full bg-[var(--home-accent)]/12 px-2.5 py-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[var(--home-accent)] sm:inline">
                            En vivo
                          </span>
                        </div>
                      </div>
                  <div className="relative m-4 min-h-[320px] flex-1 sm:m-5 sm:min-h-[360px]">
                    {PANELS.map((Panel, i) => (
                      <div key={i} className={cn("dash-panel absolute inset-0", i > 0 && "cin-hide")} aria-hidden={step !== i}>
                        <Panel />
                      </div>
                    ))}
                  </div>
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-center font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--home-text-disabled)]">
                  Datos de demostración
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
