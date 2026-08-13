"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DemoDialog } from "@/components/home/demo-dialog"
import { Reveal } from "@/components/home/reveal"
import { Eyebrow } from "@/components/home/live-dot"
import { FLEET_SIZE_BUCKETS, type FleetSizeBucket } from "@/components/home/demo-data"
import { cn } from "@/lib/utils"

const INCLUDED = ["Implementación inicial", "Soporte", "Reportes principales", "Actualizaciones del producto"]

export function PricingSection() {
  const [bucket, setBucket] = useState<FleetSizeBucket | null>(null)

  return (
    <section id="precios" className="py-24 sm:py-32" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5">
            <Eyebrow className="mb-5">PRECIOS</Eyebrow>
            <h2
              id="pricing-heading"
              className="text-[clamp(28px,3.6vw,40px)] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--home-text)]"
            >
              Un plan acorde al tamaño de tu flota.
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-[var(--home-text-secondary)]">
              El precio se define según la cantidad de camiones y las
              funcionalidades que necesite tu operación.
            </p>
            <ul className="mt-6 space-y-2.5">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-[var(--home-text-secondary)]">
                  <span className="block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--home-accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={150} className="lg:col-span-7">
            <div className="panel-surface rounded-[14px] p-6 sm:p-8">
              <p className="mb-4 font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.1em] text-[var(--home-text-tertiary)]">
                ¿Cuántos camiones tiene tu flota?
              </p>
              <div className="mb-6 flex flex-wrap gap-2" role="radiogroup" aria-label="Cantidad de camiones">
                {FLEET_SIZE_BUCKETS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    role="radio"
                    aria-checked={bucket === b.id}
                    onClick={() => setBucket(b.id)}
                    className={cn(
                      "rounded-[8px] border px-4 py-2 text-sm font-medium transition-colors",
                      bucket === b.id
                        ? "border-[var(--home-accent)] bg-[var(--home-accent)]/10 text-[var(--home-accent)]"
                        : "border-[var(--home-border)] text-[var(--home-text-secondary)] hover:border-[var(--home-border-strong)] hover:text-[var(--home-text)]"
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <div
                className="min-h-[68px] rounded-[10px] border border-[var(--home-border)] bg-[var(--home-surface-elevated)] p-4"
                aria-live="polite"
              >
                <p className="text-sm leading-relaxed text-[var(--home-text-secondary)]">
                  {bucket
                    ? "Coordinemos una demo para definir el plan adecuado."
                    : "Elegí el tamaño de tu flota para continuar."}
                </p>
              </div>

              <DemoDialog
                trigger={
                  <Button className="mt-6 w-full bg-[var(--home-accent)] text-[var(--home-accent-foreground)] hover:bg-[var(--home-accent)]/90">
                    Consultar por mi flota
                  </Button>
                }
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
