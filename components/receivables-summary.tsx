"use client"
import { formatCurrency } from "@/lib/format"
import { useCurrency } from "@/context/currency-context"
import { RECEIVABLE_COLORS } from "@/types/receivable"
import { ProportionSummary } from "@/components/proportion-summary"

type Props = {
  total: number
  collected: number
  pending: number
  /** Fletes del mes. */
  count: number
  /** Fletes que todavía deben algo: es lo que el usuario cuenta cuando mira lo pendiente. */
  pendingCount: number
}

/**
 * Lo que esta pantalla responde es una sola pregunta: cuánto falta cobrar. La barra usa
 * los mismos verde y rojo de las celdas de monto, así el resumen y la grilla se leen
 * como una sola cosa.
 */
export function ReceivablesSummary({ total, collected, pending, count, pendingCount }: Props) {
  const { displayCurrency } = useCurrency()

  if (count === 0) {
    return <p className="text-sm text-muted-foreground">Sin fletes registrados en este mes.</p>
  }

  // Con todo cobrado, "0 a recibir de 4 fletes" se lee como si faltara cobrar cuatro.
  if (pendingCount === 0) {
    return (
      <ProportionSummary
        headline={formatCurrency(collected, displayCurrency)}
        headlineLabel={`cobrados, sin nada pendiente en ${count} ${count === 1 ? "flete" : "fletes"}`}
        context=""
        ratio={1}
        colors={{ done: RECEIVABLE_COLORS.collected, rest: RECEIVABLE_COLORS.pending }}
        ariaLabel="Resumen de cobranza"
      />
    )
  }

  return (
    <ProportionSummary
      headline={formatCurrency(pending, displayCurrency)}
      headlineLabel={`a recibir de ${pendingCount} ${pendingCount === 1 ? "flete" : "fletes"}`}
      context={`${formatCurrency(collected, displayCurrency)} cobrados de ${formatCurrency(total, displayCurrency)}`}
      ratio={total > 0 ? collected / total : 0}
      colors={{ done: RECEIVABLE_COLORS.collected, rest: RECEIVABLE_COLORS.pending }}
      ariaLabel="Resumen de cobranza"
    />
  )
}
