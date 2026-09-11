"use client"

type Props = {
  /** La cifra que la pantalla existe para responder. */
  headline: string
  /** Qué es esa cifra, en las palabras del negocio. */
  headlineLabel: string
  /** Contexto al costado: de cuánto sale, cuánto se completó. */
  context: string
  /** 0 a 1: qué parte del total ya está resuelta. */
  ratio: number
  /** Color de lo resuelto y de lo que falta. Los mismos que use la tabla de abajo. */
  colors: { done: string; rest: string }
  ariaLabel: string
}

/**
 * Resumen de una pantalla que responde "cuánto falta de X". Deliberadamente no son
 * cards: total, hecho y pendiente son el mismo dato visto de tres ángulos, así que se
 * muestran como una cifra, una línea de contexto y una barra de proporción — no como
 * tres cajas que repiten la misma información.
 */
export function ProportionSummary({
  headline,
  headlineLabel,
  context,
  ratio,
  colors,
  ariaLabel,
}: Props) {
  const percent = Math.round(ratio * 100)

  return (
    <section className="flex flex-col gap-2.5" aria-label={ariaLabel}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-2xl font-semibold tabular-nums">
          {headline}
          <span className="ml-2 text-sm font-normal text-muted-foreground">{headlineLabel}</span>
        </p>
        <p className="text-sm text-muted-foreground tabular-nums">{context}</p>
      </div>

      <div
        className="flex h-1.5 overflow-hidden rounded-full"
        style={{ backgroundColor: colors.rest }}
        role="img"
        aria-label={`${percent}% completado`}
      >
        <div
          className="transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%`, backgroundColor: colors.done }}
        />
      </div>
    </section>
  )
}
