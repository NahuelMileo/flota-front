import { UserPlus, Truck, LineChart } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Step {
  number: string
  icon: LucideIcon
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    number: "1",
    icon: UserPlus,
    title: "Registrá tu empresa",
    description:
      "Creá tu cuenta y configurá tu empresa en minutos. No hace falta instalar nada; funciona desde cualquier navegador. Invitá a tu equipo con un código único.",
  },
  {
    number: "2",
    icon: Truck,
    title: "Cargá tu flota y operaciones",
    description:
      "Agregá tus camiones y empezá a registrar ingresos y egresos del mes. Asociá cada gasto a una unidad específica para tener visibilidad real por camión.",
  },
  {
    number: "3",
    icon: LineChart,
    title: "Tomá decisiones con datos reales",
    description:
      "El dashboard se actualiza en tiempo real. Identificá qué camiones son rentables, cuáles gastan de más, y dónde están las oportunidades de mejora.",
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-muted/40 py-20 sm:py-24"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-2xl text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Cómo funciona
          </p>
          <h2
            id="how-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            De cero a datos en un día
          </h2>
          <p className="mt-4 text-muted-foreground">
            Sin onboarding complejo. Sin migración de datos obligatoria. Empezás a
            ver valor desde el primer registro.
          </p>
        </div>

        <ol className="relative grid gap-10 lg:grid-cols-3" aria-label="Pasos para comenzar">
          {/* Desktop connector line */}
          <div
            className="absolute left-0 right-0 hidden h-px lg:block"
            style={{ top: "3rem" }}
            aria-hidden="true"
          >
            <div className="mx-auto h-full max-w-2xl bg-border" />
          </div>

          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <li key={step.number} className="relative flex flex-col items-start lg:items-center lg:text-center">

                {/* Icon with step number */}
                <div className="relative mb-6 shrink-0">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-border bg-background shadow-sm">
                    <Icon className="h-8 w-8 text-foreground/70" aria-hidden="true" />
                  </div>
                  <span
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>
                </div>

                <h3 className="mb-3 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground max-w-xs lg:max-w-none">
                  {step.description}
                </p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
