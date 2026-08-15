import { Reveal } from "@/components/home/reveal"
import { Eyebrow } from "@/components/home/live-dot"

const CAPABILITIES = [
  { label: "Gestión por camión" },
  { label: "Gestión por viaje" },
  { label: "Costo por kilómetro" },
  { label: "Rentabilidad por vehículo" },
  { label: "UYU, BRL y USD" },
  { label: "Mantenimientos por fecha y km" },
  { label: "Distribución de costos fijos" },
  { label: "Sin fórmulas de Excel" },
]

export function DifferentiationSection() {
  return (
    <section id="producto" className="py-24 sm:py-32" aria-labelledby="diff-heading">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5">
            <Eyebrow className="mb-5">DIFERENCIACIÓN</Eyebrow>
            <h2
              id="diff-heading"
              className="text-[clamp(28px,3.6vw,40px)] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--home-text)]"
            >
              Hecho para transportistas, no adaptado desde otro rubro.
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-[var(--home-text-secondary)]">
              KilometrIA no reemplaza tu sistema contable ni pretende hacer
              todo. Se ocupa de una cosa: darte visibilidad real sobre cómo
              rinde cada camión.
            </p>
          </Reveal>

          <Reveal delay={150} className="lg:col-span-7">
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-[var(--home-border)] bg-[var(--home-border)] sm:grid-cols-2">
              {CAPABILITIES.map((cap) => (
                <div
                  key={cap.label}
                  className="flex items-center gap-3 bg-[var(--home-surface)] px-5 py-4"
                >
                  <span className="block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--home-accent)]" />
                  <span className="text-sm text-[var(--home-text)]">{cap.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
