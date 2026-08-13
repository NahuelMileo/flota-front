"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { DemoDialog } from "@/components/home/demo-dialog"
import { MaskedReveal } from "@/components/home/cinema/masked-reveal"
import { whatsappHref } from "@/lib/site-config"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

const ASSURANCES = ["Sin planillas", "Sin fórmulas", "Sin sorpresas a fin de mes"]

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const ctx = gsap.context(() => {
      const ghost = section.querySelector<HTMLElement>(".cta-ghost")
      const glow = section.querySelector<HTMLElement>(".cta-glow")
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          if (ghost) {
            ghost.style.transform = `translateY(${p * 90}px)`
          }
          if (glow) {
            glow.style.opacity = String(0.12 + p * 0.1)
            glow.style.transform = `scale(${1 + p * 0.25})`
          }
        },
      })
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-28 sm:py-36" aria-labelledby="cta-heading">
      <div className="grid-overlay" />
      <div
        className="cta-glow pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.12] blur-[130px]"
        style={{ background: "var(--home-accent)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-[300px] w-[420px] rounded-full opacity-[0.06] blur-[120px]"
        style={{ background: "var(--home-amber)" }}
        aria-hidden="true"
      />
      <div className="cta-ghost ghost-word pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[24vw]" aria-hidden="true">
        KILOMETRIA
      </div>

      <div className="relative mx-auto max-w-[860px] px-5 text-center sm:px-8">
        <p className="mb-6 font-[family-name:var(--font-jetbrains-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--home-text-tertiary)]">
          Demo de producto · sin costo
        </p>
        <MaskedReveal
          as="h2"
          id="cta-heading"
          className="text-[clamp(34px,5.4vw,64px)] font-medium leading-[1.02] tracking-[-0.04em] text-[var(--home-text)]"
          lines={[
            "Empezá a controlar",
            <span key="profit" className="text-[var(--home-accent)]">
              la rentabilidad
            </span>,
            "de tu flota.",
          ]}
        />
        <p className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-[var(--home-text-secondary)]">
          Coordiná una demo y revisamos cómo estás gestionando hoy tus viajes,
          costos e ingresos. En media hora ves tu operación con otros ojos.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <DemoDialog
            trigger={
              <Button
                size="lg"
                className="group/cta gap-2 rounded-[10px] bg-[var(--home-accent)] text-[var(--home-accent-foreground)] shadow-[inset_0_1px_0_oklch(1_0_0/30%)] hover:bg-[var(--home-accent)]/90 hover:shadow-[0_0_0_1px_oklch(0.88_0.19_142/40%),0_0_28px_oklch(0.88_0.19_142/30%)]"
              >
                Solicitar una demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
              </Button>
            }
          />
          <a
            href={whatsappHref("Hola, quiero coordinar una demo de KilometrIA.")}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-[10px] border-[var(--home-border-strong)] bg-transparent text-[var(--home-text)] hover:bg-white/5"
            )}
          >
            Hablar por WhatsApp
          </a>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-[var(--home-border)] pt-8">
          {ASSURANCES.map((item) => (
            <span key={item} className="flex items-center gap-2 text-sm text-[var(--home-text-tertiary)]">
              <span className="block h-1 w-1 rounded-full bg-[var(--home-accent)]" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
