import {
  Truck,
  ArrowLeftRight,
  BarChart2,
  Route,
  ScanLine,
  DollarSign,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  available: boolean
}

const FEATURES: Feature[] = [
  {
    icon: Truck,
    title: "Gestión de flota",
    description:
      "Registrá cada unidad con patente, modelo y año. Todo el historial operativo de cada camión en un solo lugar, con visibilidad individual.",
    available: true,
  },
  {
    icon: ArrowLeftRight,
    title: "Ingresos y egresos",
    description:
      "Registrá fletes, gasoil, ARLA 32, neumáticos, peajes, salarios y más. Con 11 categorías específicas para transporte de cargas.",
    available: true,
  },
  {
    icon: BarChart2,
    title: "KPIs por camión",
    description:
      "Costo por km, ingreso por km, utilidad por unidad y rendimiento de combustible. Todo calculado automáticamente, sin fórmulas manuales.",
    available: true,
  },
  {
    icon: Route,
    title: "Viajes y cargas",
    description:
      "Registrá origen, destino, kilómetros recorridos y toneladas por viaje. Entendé por qué un flete de 20 tn puede gastar menos gasoil que uno de 5.",
    available: false,
  },
  {
    icon: ScanLine,
    title: "Parsing de comprobantes con IA",
    description:
      "Fotografiá un ticket de gasoil o un peaje y la IA extrae fecha, monto, litros y estación automáticamente. Sin tipeo manual, sin errores.",
    available: false,
  },
  {
    icon: DollarSign,
    title: "Multi-moneda",
    description:
      "Operá en USD y moneda local con tipo de cambio por fecha. Reportes consolidados en la moneda base que elijas, sin conversiones manuales.",
    available: false,
  },
]

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-20 sm:py-24"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-2xl text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Características
          </p>
          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Todo lo que necesitás para controlar tu flota
          </h2>
          <p className="mt-4 text-muted-foreground">
            Diseñado por y para empresas de transporte de cargas. Sin funciones
            genéricas ni módulos que nunca vas a usar.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <article
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-foreground/70" aria-hidden="true" />
                  </div>
                  <span
                    className={[
                      "mt-0.5 rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0",
                      feature.available
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-muted text-muted-foreground",
                    ].join(" ")}
                  >
                    {feature.available ? "Disponible" : "Próximamente"}
                  </span>
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
