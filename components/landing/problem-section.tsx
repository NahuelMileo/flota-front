import { FileSpreadsheet, BarChart3, Receipt } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface ProblemCard {
  icon: LucideIcon
  title: string
  description: string
}

const PROBLEMS: ProblemCard[] = [
  {
    icon: FileSpreadsheet,
    title: "¿Seguís usando planillas de cálculo?",
    description:
      "Cada cierre de mes, alguien dedica horas a consolidar datos de distintas fuentes. Mientras tanto, tomás decisiones sin información actualizada y con margen de error.",
  },
  {
    icon: BarChart3,
    title: "No sabés cuáles camiones te generan pérdidas",
    description:
      "Tenés unidades trabajando pero no sabés cuál es realmente rentable. El costo por km, la utilidad por viaje y el rendimiento de combustible quedan completamente invisibles.",
  },
  {
    icon: Receipt,
    title: "Los comprobantes se pierden o se cargan tarde",
    description:
      "Tickets de gasoil, peajes, mecánica, ARLA 32. Si no los ingresás el mismo día se acumulan. Tu contabilidad deja de reflejar la realidad operativa.",
  },
]

export function ProblemSection() {
  return (
    <section className="bg-muted/40 py-20 sm:py-24" aria-labelledby="problem-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-2xl text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            El problema real
          </p>
          <h2
            id="problem-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Gestionar una flota sin datos es operar a ciegas
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {PROBLEMS.map((problem) => {
            const Icon = problem.icon
            return (
              <article
                key={problem.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <Icon className="h-5 w-5 text-destructive" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-semibold leading-snug">{problem.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {problem.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
