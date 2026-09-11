import type { DisplayCurrency } from "@/lib/format"
import type { FixedCost } from "@/types/costs"

export function getTemplateDisplayAmount(t: FixedCost, currency: DisplayCurrency): number {
  if (currency === "USD") return t.valueUSD ?? t.amount
  if (currency === "UYU") return t.valueUYU ?? t.amount
  return t.valueBRL ?? t.amount
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
