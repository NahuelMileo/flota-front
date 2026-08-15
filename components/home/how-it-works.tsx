import { ClipboardList, Link2, LineChart } from "lucide-react"
import { Reveal } from "@/components/home/reveal"
import { Eyebrow } from "@/components/home/live-dot"

const STEPS = [
  {
    icon: ClipboardList,
    title: "Registrás la operación",
    description: "Cargás viajes, ingresos, gastos y mantenimientos desde una interfaz simple.",
  },
  {
    icon: Link2,
    title: "Los datos quedan relacionados",
    description: "Cada movimiento se vincula con el camión, el viaje y el período correspondiente.",
  },
  {
    icon: LineChart,
    title: "Ves la rentabilidad",
    description: "Consultás resultados mensuales, costos por kilómetro y rendimiento por vehículo.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 sm:py-32" aria-labelledby="how-heading">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow className="mb-5">EL RECORRIDO</Eyebrow>
          <h2
            id="how-heading"
            className="text-[clamp(30px,4vw,44px)] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--home-text)]"
          >
            Del movimiento al margen.
          </h2>
        </Reveal>

        <Reveal delay={150} className="mt-16">
          <ol className="relative grid gap-10 sm:grid-cols-3 sm:gap-6">
            <div
              className="absolute top-5 left-0 hidden h-px w-full bg-[var(--home-border)] sm:block"
              aria-hidden="true"
            />
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <li key={step.title} className="relative">
                  <div className="relative z-10 mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--home-border-strong)] bg-[var(--home-surface)]">
                    <Icon className="h-4 w-4 text-[var(--home-accent)]" aria-hidden="true" />
                  </div>
                  <p className="mb-2 font-[family-name:var(--font-jetbrains-mono)] text-[11px] tabular-nums text-[var(--home-text-tertiary)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mb-2 text-[15px] font-medium text-[var(--home-text)]">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--home-text-secondary)]">{step.description}</p>
                </li>
              )
            })}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}
