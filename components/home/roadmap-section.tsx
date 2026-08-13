import { Reveal } from "@/components/home/reveal"
import { Eyebrow } from "@/components/home/live-dot"

const UPCOMING = [
  "Carga de comprobantes desde WhatsApp",
  "Lectura automática de comprobantes",
  "Seguimiento de pagos pendientes",
  "Gestión de choferes",
  "Alertas de mantenimiento",
  "Consultas sobre datos de la flota",
]

export function RoadmapSection() {
  return (
    <section className="py-24 sm:py-32" aria-labelledby="roadmap-heading">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="rounded-[14px] border border-dashed border-[var(--home-border-strong)] p-8 sm:p-10">
          <Reveal>
            <Eyebrow className="mb-5">ROADMAP</Eyebrow>
            <h2
              id="roadmap-heading"
              className="max-w-xl text-[clamp(26px,3.2vw,36px)] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--home-text)]"
            >
              Una operación cada vez más automática.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--home-text-tertiary)]">
              Estas capacidades están planificadas y todavía no forman parte
              completa del producto actual.
            </p>
          </Reveal>

          <Reveal delay={150} className="mt-8">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {UPCOMING.map((item) => (
                <li
                  key={item}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--home-border)] bg-[var(--home-surface)] px-4 py-3"
                >
                  <span className="text-sm text-[var(--home-text-secondary)]">{item}</span>
                  <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-wide text-[var(--home-text-tertiary)]">
                    Próximamente
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
