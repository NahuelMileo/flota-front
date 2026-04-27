import { TrendingUp, Gauge, Clock, ShieldCheck } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Stat {
  icon: LucideIcon
  value: string
  label: string
  description: string
}

const STATS: Stat[] = [
  {
    icon: TrendingUp,
    value: "+40%",
    label: "Visibilidad financiera",
    description:
      "Empresas que usan Mileo Express reportan mayor claridad sobre rentabilidad real por unidad.",
  },
  {
    icon: Gauge,
    value: "11",
    label: "Categorías de gasto",
    description:
      "Gasoil, ARLA 32, neumáticos, mantenimiento, peajes, salarios y más. Sin categorías genéricas.",
  },
  {
    icon: Clock,
    value: "−3h",
    label: "Por semana en admin",
    description:
      "Menos tiempo consolidando datos manualmente. Más tiempo tomando decisiones con información real.",
  },
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Multi-empresa",
    description:
      "Arquitectura multi-tenant. Cada empresa ve únicamente sus propios datos, aislados y seguros.",
  },
]

interface KpiMetric {
  label: string
  value: string
  unit: string
  color: string
}

const KPI_EXAMPLE: KpiMetric[] = [
  {
    label: "Costo/km promedio",
    value: "$0.87",
    unit: "por km",
    color: "oklch(0.623 0.214 259.815)",
  },
  {
    label: "Ingreso/km promedio",
    value: "$1.43",
    unit: "por km",
    color: "oklch(0.809 0.105 251.813)",
  },
  {
    label: "Margen de utilidad",
    value: "39.2%",
    unit: "este mes",
    color: "oklch(0.72 0.17 145)",
  },
  {
    label: "Rendimiento gasoil",
    value: "2.8",
    unit: "km / litro",
    color: "oklch(0.546 0.245 262.881)",
  },
]

export function KPISection() {
  return (
    <section
      id="kpis"
      className="py-20 sm:py-24"
      style={{ background: "oklch(0.10 0 0)" }}
      aria-labelledby="kpi-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-2xl text-center mb-14">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "oklch(1 0 0 / 0.35)" }}
          >
            Impacto real
          </p>
          <h2
            id="kpi-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "oklch(0.97 0 0)" }}
          >
            Métricas que cambian cómo gestionás tu empresa
          </h2>
        </div>

        {/* Stat cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="rounded-xl p-6"
                style={{
                  border: "1px solid oklch(1 0 0 / 0.09)",
                  background: "oklch(1 0 0 / 0.04)",
                }}
              >
                <Icon
                  className="h-5 w-5 mb-4"
                  style={{ color: "oklch(0.623 0.214 259.815)" }}
                  aria-hidden="true"
                />
                <div
                  className="mb-1 text-4xl font-bold"
                  style={{ color: "oklch(0.97 0 0)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="mb-3 text-sm font-medium"
                  style={{ color: "oklch(1 0 0 / 0.65)" }}
                >
                  {stat.label}
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "oklch(1 0 0 / 0.38)" }}
                >
                  {stat.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* KPI example row */}
        <div
          className="rounded-xl p-6 sm:p-8"
          style={{
            border: "1px solid oklch(1 0 0 / 0.09)",
            background: "oklch(1 0 0 / 0.03)",
          }}
        >
          <p
            className="text-[10px] uppercase tracking-widest mb-6"
            style={{ color: "oklch(1 0 0 / 0.28)" }}
          >
            Ejemplo de dashboard · Julio 2025
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {KPI_EXAMPLE.map((kpi) => (
              <div key={kpi.label} className="text-center">
                <div
                  className="text-2xl font-bold mb-0.5 sm:text-3xl"
                  style={{ color: kpi.color }}
                >
                  {kpi.value}
                </div>
                <div
                  className="text-[10px] mb-1.5"
                  style={{ color: "oklch(1 0 0 / 0.22)" }}
                >
                  {kpi.unit}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "oklch(1 0 0 / 0.48)" }}
                >
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
