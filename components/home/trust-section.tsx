import { Reveal } from "@/components/home/reveal"
import { Eyebrow } from "@/components/home/live-dot"

export function TrustSection() {
  return (
    <section className="py-24 sm:py-32" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-6">
            <Eyebrow className="mb-5">ORIGEN</Eyebrow>
            <h2
              id="trust-heading"
              className="text-[clamp(28px,3.6vw,40px)] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--home-text)]"
            >
              Construido desde una operación real.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-[var(--home-text-secondary)]">
              KilometrIA nació para resolver problemas cotidianos de una
              empresa familiar que trabaja entre Uruguay y Brasil: comprobantes
              enviados por WhatsApp, costos en distintas monedas y poca
              visibilidad sobre la rentabilidad de cada camión.
            </p>
            <p className="mt-4 text-sm text-[var(--home-text-tertiary)]">
              Actualmente estamos validando el producto con empresas del
              sector.
            </p>
          </Reveal>

          <Reveal delay={150} className="lg:col-span-6">
            <div className="panel-surface flex h-full flex-col justify-center rounded-[14px] p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="text-center">
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-medium tabular-nums text-[var(--home-text)]">
                    Uruguay
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--home-text-tertiary)]">UYU</p>
                </div>
                <div className="relative h-px flex-1 bg-[var(--home-border-strong)]">
                  <span className="absolute left-1/3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--home-accent)]" />
                  <span className="absolute left-2/3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--home-accent)]" />
                </div>
                <div className="text-center">
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-medium tabular-nums text-[var(--home-text)]">
                    Brasil
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--home-text-tertiary)]">BRL</p>
                </div>
              </div>
              <p className="mt-6 text-center font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.1em] text-[var(--home-text-disabled)]">
                Operación binacional, un solo sistema
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
