"use client"
import { AnimatedCurrency } from "@/components/animated-figure"

type Props = {
  total: number
  count: number
  /** Singular y plural de lo que se está contando: "ingreso" / "ingresos". */
  noun: [string, string]
  variation?: number
  /** Si subir es bueno (ingresos) o malo (egresos): define el color de la variación. */
  higherIsBetter: boolean
  /** Color de la cifra: verde lo que entra, rojo lo que sale. */
  tone?: "positive" | "negative"
}

/**
 * Una sola cifra no necesita una card: el total de la tabla que sigue va como línea de
 * contexto sobre ella, con la variación contra el mes anterior al costado.
 */
export function TotalLine({ total, count, noun, variation, higherIsBetter, tone }: Props) {
  const isGood = variation === undefined || (higherIsBetter ? variation >= 0 : variation <= 0)

  return (
    <p className="flex flex-wrap items-baseline gap-x-2 text-sm text-muted-foreground tabular-nums">
      <span
        className={`text-2xl font-semibold ${
          tone === "positive"
            ? "text-success"
            : tone === "negative"
              ? "text-danger"
              : "text-foreground"
        }`}
      >
        <AnimatedCurrency value={total} />
      </span>
      <span>
        en {count} {count === 1 ? noun[0] : noun[1]}
      </span>
      {variation !== undefined && (
        <span
          className={
            isGood ? "text-success" : "text-danger"
          }
        >
          {variation >= 0 ? "+" : ""}
          {variation}% vs mes anterior
        </span>
      )}
    </p>
  )
}
