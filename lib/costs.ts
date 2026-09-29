import type { DisplayCurrency } from "@/lib/format"
import { getDisplayValue } from "@/lib/currency"
import type { FixedCost } from "@/types/costs"

export function getTemplateDisplayAmount(t: FixedCost, currency: DisplayCurrency): number {
  // Los costos fijos no traen moneda: el back los registra siempre en reales.
  return getDisplayValue({ ...t, currency: "BRL" }, currency)
}

/** Meses que faltan entre el mes actual y el último generado (negativo si ya se cortó). */
export function monthsUntilGenerated(t: FixedCost): number | null {
  if (t.generatedUntilYear == null || t.generatedUntilMonth == null) return null
  const now = new Date()
  return (
    (t.generatedUntilYear * 12 + t.generatedUntilMonth) -
    (now.getFullYear() * 12 + now.getMonth() + 1)
  )
}
