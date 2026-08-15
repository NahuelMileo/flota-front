"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight, MousePointer2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { DemoDialog } from "@/components/home/demo-dialog"
import { Eyebrow } from "@/components/home/live-dot"
import { MaskedReveal } from "@/components/home/cinema/masked-reveal"
import { AnimatedNumber } from "@/components/home/cinema/animated-number"
import { FLEET_SUMMARY, DEMO_LABEL } from "@/components/home/demo-data"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

const BARS = [
  { label: "Ene", height: 34, muted: true },
  { label: "Feb", height: 42, muted: true },
  { label: "Mar", height: 38, muted: true },
  { label: "Abr", height: 55, muted: false },
  { label: "May", height: 48, muted: false },
  { label: "Jun", height: 68, muted: true },
]

function FloatPanel({
  label,
  value,
  sub,
  className,
  tint,
  floatDelay = 0,
}: {
  label: string
  value: string
  sub?: string
  className?: string
  tint?: "accent" | "amber"
  floatDelay?: number
}) {
  return (
    <div
      className={cn(
        "hero-float cin-hide panel-surface rounded-[14px] px-4 py-3 backdrop-blur-md motion-safe:animate-[home-chip-float_7s_ease-in-out_infinite]",
        className
      )}
      style={{ animationDelay: `${floatDelay}s` }}
    >
      <p className="mb-1 flex items-center gap-1.5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.1em] text-[var(--home-text-tertiary)]">
        <span
          className={cn(
            "block h-1 w-1 rounded-full",
            tint === "accent" ? "bg-[var(--home-accent)]" : tint === "amber" ? "bg-[var(--home-amber)]" : "bg-[var(--home-border-strong)]"
          )}
        />
        {label}
      </p>
      <p className="font-[family-name:var(--font-jetbrains-mono)] text-lg font-semibold tabular-nums text-[var(--home-text)]">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-[var(--home-text-tertiary)]">{sub}</p>}
    </div>
  )
}

function HeroDashboard() {
  return (
    <div className="hero-scene relative mx-auto w-full max-w-[560px]">
      <div className="panel-surface hero-panel cin-hide-scale relative rounded-[16px] p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <Eyebrow>RENTABILIDAD DE FLOTA</Eyebrow>
          <span className="rounded-full border border-[var(--home-border)] px-2 py-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] tabular-nums text-[var(--home-text-tertiary)]">
            {FLEET_SUMMARY.currency}
          </span>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <div>
            <p className="mb-1 text-[11px] text-[var(--home-text-tertiary)]">Facturación</p>
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-base font-semibold tabular-nums text-[var(--home-text)]">
              <AnimatedNumber value={FLEET_SUMMARY.revenue} prefix={`${FLEET_SUMMARY.currency} `} />
            </p>
          </div>
          <div>
            <p className="mb-1 text-[11px] text-[var(--home-text-tertiary)]">Costos</p>
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-base font-semibold tabular-nums text-[var(--home-text)]">
              <AnimatedNumber value={FLEET_SUMMARY.costs} prefix={`${FLEET_SUMMARY.currency} `} />
            </p>
          </div>
          <div>
            <p className="mb-1 text-[11px] text-[var(--home-text-tertiary)]">Utilidad</p>
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-base font-semibold tabular-nums text-[var(--home-accent)]">
              <AnimatedNumber value={FLEET_SUMMARY.profit} prefix={`${FLEET_SUMMARY.currency} `} />
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-[10px] border border-[var(--home-border)] bg-[var(--home-surface-elevated)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.1em] text-[var(--home-text-tertiary)]">
              Ingresos · últimos 6 meses
            </p>
            <span className="rounded-full bg-[var(--home-accent)]/12 px-2 py-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] tabular-nums text-[var(--home-accent)]">
              +18%
            </span>
          </div>
          <div className="flex h-24 items-end gap-2">
            {BARS.map((bar) => (
              <div key={bar.label} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-20 w-full items-end">
                  <div
                    className={cn(
                      "hero-bar w-full rounded-[4px]",
                      bar.muted ? "bg-[var(--home-text-secondary)]/25" : "bg-[var(--home-accent)] shadow-[0_0_18px_oklch(0.88_0.19_142/35%)]"
                    )}
                    style={{ height: `${bar.height}%` }}
                  />
                </div>
                <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[var(--home-text-tertiary)]">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--home-border)] pt-4">
          <div>
            <p className="text-[11px] text-[var(--home-text-tertiary)]">Costo / km</p>
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-medium tabular-nums text-[var(--home-text)]">
              {FLEET_SUMMARY.currency} <AnimatedNumber value={FLEET_SUMMARY.costPerKm} decimals={2} />
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[var(--home-text-tertiary)]">Utilidad / km</p>
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-medium tabular-nums text-[var(--home-accent)]">
              {FLEET_SUMMARY.currency} <AnimatedNumber value={FLEET_SUMMARY.profitPerKm} decimals={2} />
            </p>
          </div>
        </div>
      </div>

      <FloatPanel
        label="Camión IKG"
        value="9.194 km"
        sub="Rentable"
        tint="accent"
        floatDelay={1.2}
        className="absolute -top-7 -left-6 hidden w-[150px] sm:block"
      />
      <FloatPanel
        label="Viajes activos"
        value="3"
        sub="Montevideo → São Paulo"
        floatDelay={2.4}
        className="absolute -top-10 right-2 hidden w-[170px] md:block"
      />
      <FloatPanel
        label="Mantenimiento"
        value="IWV"
        sub="Próximo service · 620 km"
        tint="amber"
        floatDelay={3.1}
        className="absolute -bottom-8 left-6 hidden w-[180px] sm:block"
      />
      <div className="hero-float panel-surface absolute -right-2 -bottom-6 hidden items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-md md:flex">
        <span className="flex gap-1" aria-hidden="true">
          {["UYU", "BRL", "USD"].map((c, i) => (
            <span
              key={c}
              className={cn(
                "rounded-full px-2 py-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium tabular-nums",
                i === 1
                  ? "bg-[var(--home-accent)] text-[var(--home-accent-foreground)]"
                  : "text-[var(--home-text-secondary)]"
              )}
            >
              {c}
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const ctx = gsap.context(() => {
      // --- Intro (time-based) ---
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.fromTo(
        ".hero-eyebrow",
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 }
      )
        .fromTo(
          ".hero-copy",
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.35"
        )
        .fromTo(
          ".hero-actions",
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.6"
        )
        .fromTo(
          ".hero-note",
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(
          ".hero-panel",
          { scale: 0.94, y: 26, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 1.1, ease: "power4.out" },
          0.15
        )
        .fromTo(
          ".hero-bar",
          { scaleY: 0 },
          { scaleY: 1, duration: 0.9, ease: "power4.out", stagger: 0.06, transformOrigin: "50% 100%" },
          "-=0.55"
        )
        .fromTo(
          ".hero-float",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 },
          "-=0.6"
        )

      // --- Scroll-linked parallax (scrub) ---
      const heroGhost = section.querySelector<HTMLElement>(".hero-ghost")
      const heroGlow = section.querySelector<HTMLElement>(".hero-glow")
      const heroContent = section.querySelector<HTMLElement>(".hero-content")
      const heroScene = section.querySelector<HTMLElement>(".hero-scene")
      const heroFloats = Array.from(section.querySelectorAll<HTMLElement>(".hero-float"))

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          if (heroGhost) {
            heroGhost.style.transform = `translateY(${-p * 160}px)`
            heroGhost.style.opacity = String(Math.max(0, 1 - p * 1.6))
          }
          if (heroGlow) {
            heroGlow.style.opacity = String(0.14 * (1 - p * 1.4))
          }
          if (heroContent) {
            heroContent.style.transform = `translateY(${-p * 60}px)`
            heroContent.style.opacity = String(1 - p * 0.9)
          }
          if (heroScene) {
            heroScene.style.transform = `translateY(${-p * 34}px)`
          }
          heroFloats.forEach((el, i) => {
            const speed = 40 + i * 22
            el.style.transform = `translateY(${-p * speed}px)`
          })
        },
      })

      return () => {
        tl.kill()
        st.kill()
      }
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28"
      aria-labelledby="hero-heading"
    >
      <div className="grid-overlay" />
      <div
        className="hero-glow pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.14] blur-[120px]"
        style={{ background: "var(--home-accent)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 top-24 h-[360px] w-[360px] rounded-full opacity-[0.08] blur-[110px]"
        style={{ background: "var(--home-amber)" }}
        aria-hidden="true"
      />
      <div className="hero-ghost ghost-word pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 text-[22vw] opacity-[0.9]" aria-hidden="true">
        KILOMETRIA
      </div>

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="hero-content grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
          <div>
            <div className="hero-eyebrow cin-hide-up mb-6">
              <Eyebrow>Gestión operativa para empresas de transporte</Eyebrow>
            </div>

            <MaskedReveal
              as="h1"
              id="hero-heading"
              className="mb-6 text-[clamp(48px,7.4vw,88px)] font-medium leading-[0.98] tracking-[-0.045em] text-[var(--home-text)]"
              lines={[
                "Sabé cuánto",
                <span key="gain" className="text-[var(--home-text)]">
                  <span className="text-[var(--home-accent)]">gana</span> cada camión.
                </span>,
              ]}
            />

            <p className="hero-copy cin-hide-up mb-8 max-w-lg text-[17px] leading-relaxed tracking-[-0.01em] text-[var(--home-text-secondary)]">
              Registrá viajes, ingresos, gastos y mantenimientos. KilometrIA
              calcula el costo y la rentabilidad de tu flota.
            </p>

            <div className="hero-actions cin-hide-up mb-6 flex flex-wrap gap-3">
              <DemoDialog
                trigger={
                  <Button
                    size="lg"
                    className="group/cta gap-2 rounded-[10px] bg-[var(--home-accent)] text-[var(--home-accent-foreground)] shadow-[inset_0_1px_0_oklch(1_0_0/30%)] hover:bg-[var(--home-accent)]/90 hover:shadow-[0_0_0_1px_oklch(0.88_0.19_142/40%),0_0_20px_oklch(0.88_0.19_142/25%)]"
                  >
                    Solicitar una demo
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
                  </Button>
                }
              />
              <a
                href="#como-funciona"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-[10px] border-[var(--home-border-strong)] bg-transparent text-[var(--home-text)] hover:bg-white/5"
                )}
              >
                Ver cómo funciona
              </a>
            </div>

            <p className="hero-note cin-hide flex max-w-md items-center gap-2 text-sm text-[var(--home-text-tertiary)]">
              <MousePointer2 className="h-3.5 w-3.5" aria-hidden="true" />
              Diseñado desde una operación de transporte que trabaja entre
              Uruguay y Brasil.
            </p>
          </div>

          <HeroDashboard />
        </div>

        <p className="mt-10 text-center font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--home-text-disabled)]">
          {DEMO_LABEL}
        </p>
      </div>
    </section>
  )
}
