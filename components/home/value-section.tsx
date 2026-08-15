import { Reveal } from "@/components/home/reveal"
import { Eyebrow } from "@/components/home/live-dot"
import { TRUCK_PROFITABILITY } from "@/components/home/demo-data"

function ModuleCard({
  title,
  description,
  className,
  children,
}: {
  title: string
  description: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-[14px] border border-[var(--home-border)] bg-[var(--home-surface)] p-6 ${className ?? ""}`}>
      <h3 className="mb-1.5 text-[15px] font-medium tracking-[-0.01em] text-[var(--home-text)]">{title}</h3>
      <p className="mb-5 text-sm leading-relaxed text-[var(--home-text-secondary)]">{description}</p>
      {children}
    </div>
  )
}

function TripsVisual() {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-xs font-medium text-[var(--home-text)]">Montevideo</p>
        <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[var(--home-text-tertiary)]">
          0 km
        </p>
      </div>
      <div className="relative h-px flex-1 bg-[var(--home-border-strong)]">
        <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--home-text-tertiary)]" />
        <span className="absolute left-[64%] top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--home-accent)]" />
        <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--home-text-tertiary)]" />
      </div>
      <div>
        <p className="text-xs font-medium text-[var(--home-text)]">São Paulo</p>
        <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[var(--home-text-tertiary)]">
          890 km
        </p>
      </div>
    </div>
  )
}

function MovementsVisual() {
  const rows = [
    { label: "Flete — IKG", value: "+R$ 6.400", currency: "BRL", positive: true },
    { label: "Gasoil — IWV", value: "−R$ 1.120", currency: "BRL", positive: false },
    { label: "Peaje — JRT", value: "−USD 40", currency: "USD", positive: false },
  ]
  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.label} className="flex items-center justify-between text-sm">
          <span className="text-[var(--home-text-secondary)]">{row.label}</span>
          <span
            className="font-[family-name:var(--font-jetbrains-mono)] text-xs tabular-nums"
            style={{ color: row.positive ? "var(--home-accent)" : "var(--home-text-tertiary)" }}
          >
            {row.value}
          </span>
        </li>
      ))}
    </ul>
  )
}

function ProfitabilityVisual() {
  const max = Math.max(...TRUCK_PROFITABILITY.map((t) => t.profitPerKm))
  return (
    <div className="space-y-3">
      {TRUCK_PROFITABILITY.slice(0, 3).map((truck) => (
        <div key={truck.plate} className="flex items-center gap-3">
          <span className="w-9 shrink-0 font-[family-name:var(--font-jetbrains-mono)] text-xs tabular-nums text-[var(--home-text-tertiary)]">
            {truck.plate}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--home-surface-elevated)]">
            <div
              className="h-full rounded-full bg-[var(--home-accent)]"
              style={{ width: `${(truck.profitPerKm / max) * 100}%` }}
            />
          </div>
          <span className="w-14 shrink-0 text-right font-[family-name:var(--font-jetbrains-mono)] text-xs tabular-nums text-[var(--home-text)]">
            R$ {truck.profitPerKm.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  )
}

function MaintenanceVisual() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-[var(--home-text-tertiary)]">Próxima revisión</p>
        <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-medium tabular-nums text-[var(--home-text)]">
          IWV · 620 km
        </p>
      </div>
      <div className="h-10 w-10 shrink-0 rounded-full border-2 border-[var(--home-amber)]/40" style={{
        background: `conic-gradient(var(--home-amber) 0deg 288deg, transparent 288deg 360deg)`,
        borderRadius: "9999px",
      }} />
    </div>
  )
}

function FixedCostsVisual() {
  const segments = [
    { label: "Seguro", pct: 38 },
    { label: "Cuotas", pct: 34 },
    { label: "Salarios", pct: 28 },
  ]
  const perTruck = [
    { plate: "IKG", pct: 26 },
    { plate: "IWV", pct: 24 },
    { plate: "JRT", pct: 26 },
    { plate: "HXR", pct: 24 },
  ]
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.1em] text-[var(--home-text-tertiary)]">
          Distribución por mes
        </span>
        <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] tabular-nums text-[var(--home-text-secondary)]">
          100%
        </span>
      </div>
      <div className="mb-3 flex h-2 overflow-hidden rounded-full">
        {segments.map((s, i) => (
          <div
            key={s.label}
            className="h-full"
            style={{
              width: `${s.pct}%`,
              background: i === 0 ? "var(--home-accent)" : i === 1 ? "var(--home-text-secondary)" : "var(--home-text-tertiary)",
            }}
          />
        ))}
      </div>
      <div className="mb-5 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s) => (
          <span key={s.label} className="text-xs text-[var(--home-text-tertiary)]">
            {s.label} <span className="font-[family-name:var(--font-jetbrains-mono)] tabular-nums">{s.pct}%</span>
          </span>
        ))}
      </div>
      <div className="border-t border-[var(--home-border)] pt-4">
        <p className="mb-3 font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.1em] text-[var(--home-text-tertiary)]">
          Distribución por camión
        </p>
        <div className="space-y-2.5">
          {perTruck.map((t) => (
            <div key={t.plate} className="flex items-center gap-3">
              <span className="w-9 shrink-0 font-[family-name:var(--font-jetbrains-mono)] text-xs tabular-nums text-[var(--home-text-tertiary)]">
                {t.plate}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--home-surface-elevated)]">
                <div
                  className="h-full rounded-full bg-[var(--home-accent)]"
                  style={{ width: `${t.pct}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right font-[family-name:var(--font-jetbrains-mono)] text-xs tabular-nums text-[var(--home-text)]">
                {t.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FuelVisual() {
  const trucks = [
    { plate: "IKG", kml: 3.1 },
    { plate: "JRT", kml: 2.9 },
    { plate: "HXR", kml: 2.6 },
    { plate: "IWV", kml: 2.3 },
  ]
  const max = Math.max(...trucks.map((t) => t.kml))
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.1em] text-[var(--home-text-tertiary)]">
          Consumo por camión
        </span>
        <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-semibold tabular-nums text-[var(--home-text)]">
          2.7 <span className="text-[10px] font-medium text-[var(--home-text-tertiary)]">km/L promedio</span>
        </span>
      </div>
      <div className="space-y-3">
        {trucks.map((t) => (
          <div key={t.plate} className="flex items-center gap-3">
            <span className="w-9 shrink-0 font-[family-name:var(--font-jetbrains-mono)] text-xs tabular-nums text-[var(--home-text-tertiary)]">
              {t.plate}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--home-surface-elevated)]">
              <div
                className="h-full rounded-full bg-[var(--home-amber)]"
                style={{ width: `${(t.kml / max) * 100}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right font-[family-name:var(--font-jetbrains-mono)] text-xs tabular-nums text-[var(--home-text)]">
              {t.kml.toFixed(1)} km/L
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CurrencyVisual() {
  return (
    <div className="flex items-center gap-2">
      {["UYU", "BRL", "USD"].map((c, i) => (
        <span
          key={c}
          className="rounded-[8px] px-3 py-1.5 font-[family-name:var(--font-jetbrains-mono)] text-xs font-medium tabular-nums"
          style={
            i === 1
              ? { background: "var(--home-accent)", color: "var(--home-accent-foreground)" }
              : { border: "1px solid var(--home-border-strong)", color: "var(--home-text-secondary)" }
          }
        >
          {c}
        </span>
      ))}
    </div>
  )
}

export function ValueSection() {
  return (
    <section id="funcionalidades" className="py-24 sm:py-32" aria-labelledby="value-heading">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <Eyebrow className="mb-5">FUNCIONALIDADES</Eyebrow>
          <h2
            id="value-heading"
            className="max-w-2xl text-[clamp(30px,4vw,44px)] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--home-text)]"
          >
            Todo lo necesario para controlar tu flota.
          </h2>
        </Reveal>

        <Reveal delay={150} className="mt-14">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <ModuleCard
              title="Rentabilidad por camión"
              description="Comparás ingresos, costos, utilidad y costo por kilómetro entre vehículos."
              className="lg:col-span-7"
            >
              <ProfitabilityVisual />
            </ModuleCard>

            <ModuleCard
              title="Multi-moneda"
              description="Trabajá con UYU, BRL y USD sin perder claridad en los resultados."
              className="lg:col-span-5"
            >
              <CurrencyVisual />
            </ModuleCard>

            <ModuleCard
              title="Viajes"
              description="Registrá kilómetros, origen, destino, ingresos y estado de cada viaje."
              className="lg:col-span-4"
            >
              <TripsVisual />
            </ModuleCard>

            <ModuleCard
              title="Ingresos y egresos"
              description="Sabé qué entró, qué salió y a qué camión corresponde cada movimiento."
              className="lg:col-span-4"
            >
              <MovementsVisual />
            </ModuleCard>

            <ModuleCard
              title="Mantenimiento"
              description="Controlá mantenimientos preventivos y correctivos por fecha o kilometraje."
              className="lg:col-span-4"
            >
              <MaintenanceVisual />
            </ModuleCard>

            <ModuleCard
              title="Costos fijos"
              description="Distribuí seguros, cuotas, salarios y otros costos recurrentes dentro de la operación."
              className="lg:col-span-6"
            >
              <FixedCostsVisual />
            </ModuleCard>

            <ModuleCard
              title="Combustible y rendimiento"
              description="Cargás combustible con km y litros y ves el consumo real de cada camión."
              className="lg:col-span-6"
            >
              <FuelVisual />
            </ModuleCard>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
