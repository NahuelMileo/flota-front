import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button-variants"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Purely visual mockup — no real data, no client JS
function DashboardMockup() {
  const bars = [
    { income: 58, expense: 40 },
    { income: 72, expense: 51 },
    { income: 54, expense: 44 },
    { income: 82, expense: 57 },
    { income: 67, expense: 49 },
    { income: 91, expense: 63 },
  ]

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      {/* Ambient glow */}
      <div
        className="absolute -inset-4 -z-10 rounded-3xl opacity-30 blur-3xl"
        style={{ background: "oklch(0.488 0.243 264.376 / 0.35)" }}
        aria-hidden="true"
      />

      {/* Browser chrome */}
      <div
        className="overflow-hidden rounded-2xl shadow-2xl"
        style={{
          border: "1px solid oklch(1 0 0 / 0.10)",
          background: "oklch(0.17 0 0)",
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="block h-3 w-3 rounded-full bg-red-500/60" />
            <span className="block h-3 w-3 rounded-full bg-yellow-500/60" />
            <span className="block h-3 w-3 rounded-full bg-green-500/60" />
          </div>
          <div className="mx-auto flex-1 max-w-xs">
            <div
              className="rounded-md px-3 py-1 text-center text-xs"
              style={{
                background: "oklch(1 0 0 / 0.05)",
                color: "oklch(1 0 0 / 0.35)",
              }}
            >
              app.mileoexpress.com/dashboard
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-[10px] uppercase tracking-wider mb-0.5"
                style={{ color: "oklch(1 0 0 / 0.35)" }}
              >
                Julio 2025
              </p>
              <p className="text-sm font-medium" style={{ color: "oklch(1 0 0 / 0.75)" }}>
                Resumen del mes
              </p>
            </div>
            <div
              className="h-6 w-24 rounded-md"
              style={{ background: "oklch(1 0 0 / 0.06)" }}
            />
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Ingresos", value: "$142.800", delta: "+12%", positive: true },
              { label: "Egresos", value: "$89.200", delta: "+4%", positive: false },
              { label: "Utilidad", value: "$53.600", delta: "+24%", positive: true },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl p-3"
                style={{
                  border: "1px solid oklch(1 0 0 / 0.08)",
                  background: "oklch(1 0 0 / 0.04)",
                }}
              >
                <p
                  className="text-[10px] mb-2"
                  style={{ color: "oklch(1 0 0 / 0.38)" }}
                >
                  {kpi.label}
                </p>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "oklch(1 0 0 / 0.88)" }}
                >
                  {kpi.value}
                </p>
                <p
                  className="text-[10px]"
                  style={{
                    color: kpi.positive
                      ? "oklch(0.72 0.17 145)"
                      : "oklch(0.70 0.19 22)",
                  }}
                >
                  {kpi.delta} vs mes ant.
                </p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div
            className="rounded-xl p-4"
            style={{
              border: "1px solid oklch(1 0 0 / 0.08)",
              background: "oklch(1 0 0 / 0.04)",
            }}
          >
            <p
              className="text-[10px] mb-3 uppercase tracking-wider"
              style={{ color: "oklch(1 0 0 / 0.35)" }}
            >
              Comparativa mensual
            </p>
            <div className="flex items-end gap-1.5 h-14" aria-hidden="true">
              {bars.map((bar, i) => (
                <div key={i} className="flex flex-1 items-end gap-0.5">
                  <div
                    className="flex-1 rounded-t"
                    style={{
                      height: `${bar.income}%`,
                      background: "oklch(0.623 0.214 259.815 / 0.75)",
                    }}
                  />
                  <div
                    className="flex-1 rounded-t"
                    style={{
                      height: `${bar.expense}%`,
                      background: "oklch(1 0 0 / 0.18)",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="block h-2 w-2 rounded-full"
                  style={{ background: "oklch(0.623 0.214 259.815 / 0.75)" }}
                />
                <span className="text-[9px]" style={{ color: "oklch(1 0 0 / 0.30)" }}>
                  Ingresos
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="block h-2 w-2 rounded-full"
                  style={{ background: "oklch(1 0 0 / 0.18)" }}
                />
                <span className="text-[9px]" style={{ color: "oklch(1 0 0 / 0.30)" }}>
                  Egresos
                </span>
              </div>
            </div>
          </div>

          {/* Per-truck table */}
          <div
            className="rounded-xl p-3"
            style={{
              border: "1px solid oklch(1 0 0 / 0.08)",
              background: "oklch(1 0 0 / 0.04)",
            }}
          >
            <p
              className="text-[10px] uppercase tracking-wider mb-3"
              style={{ color: "oklch(1 0 0 / 0.35)" }}
            >
              Rendimiento por camión
            </p>
            <div className="space-y-2">
              {[
                { plate: "ABC 1234", util: "$20.700", cpm: "$0.82/km", positive: true },
                { plate: "XYZ 5678", util: "$18.200", cpm: "$0.89/km", positive: true },
                { plate: "DEF 9012", util: "$14.700", cpm: "$1.02/km", positive: false },
              ].map((truck) => (
                <div key={truck.plate} className="flex items-center justify-between">
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: "oklch(1 0 0 / 0.45)" }}
                  >
                    {truck.plate}
                  </span>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: "oklch(1 0 0 / 0.72)" }}
                  >
                    {truck.util}
                  </span>
                  <span
                    className="text-[10px] font-medium"
                    style={{
                      color: truck.positive
                        ? "oklch(0.623 0.214 259.815)"
                        : "oklch(0.70 0.19 22)",
                    }}
                  >
                    {truck.cpm}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section
      className="py-20 sm:py-28"
      style={{ background: "oklch(0.10 0 0)" }}
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">

          {/* Copy */}
          <div>
            <Badge
              variant="outline"
              className="mb-6"
              style={{
                borderColor: "oklch(1 0 0 / 0.14)",
                background: "oklch(1 0 0 / 0.05)",
                color: "oklch(1 0 0 / 0.55)",
              }}
            >
              Plataforma de Analytics para Flotas
            </Badge>

            <h1
              id="hero-heading"
              className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem]"
              style={{ color: "oklch(0.97 0 0)" }}
            >
              Sabé exactamente{" "}
              <span style={{ color: "oklch(0.623 0.214 259.815)" }}>
                qué gana cada camión
              </span>
              , cada mes.
            </h1>

            <p
              className="mb-8 text-lg leading-relaxed"
              style={{ color: "oklch(1 0 0 / 0.52)" }}
            >
              Mileo Express centraliza ingresos, egresos, viajes y KPIs de toda tu
              flota en un solo lugar. Tomá decisiones con datos reales, no con
              estimaciones.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2"
                )}
                style={{
                  background: "oklch(0.488 0.243 264.376)",
                  color: "white",
                  border: "none",
                }}
              >
                Crear cuenta gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                style={{
                  borderColor: "oklch(1 0 0 / 0.18)",
                  background: "transparent",
                  color: "oklch(1 0 0 / 0.75)",
                }}
              >
                Ver cómo funciona
              </a>
            </div>

            <p
              className="text-sm"
              style={{ color: "oklch(1 0 0 / 0.28)" }}
            >
              Sin tarjeta de crédito · 14 días gratis · Cancelá cuando quieras
            </p>
          </div>

          {/* Mockup */}
          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}
