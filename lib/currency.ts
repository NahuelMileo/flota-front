import type { DisplayCurrency } from "@/lib/format"

export type CurrencyItem = {
  valueUSD?: number | null
  valueBRL?: number | null
  valueUYU?: number | null
  value?: number | null
  // CostEntry y FixedCost usan `amount` como valor original en lugar de `value`
  amount?: number | null
  /** Moneda en la que se registró el valor original ("USD" | "BRL" | "UYU"). */
  currency?: string | null
}

/**
 * El valor de un registro en la moneda elegida: la columna convertida por el back con la
 * cotización del día del registro. Si esa columna falta, el valor original solo sirve
 * cuando ya está en la moneda elegida; sumarlo en otra moneda mezclaría reales con dólares
 * o pesos sin avisar, así que en ese caso el registro no suma.
 */
export function getDisplayValue(item: CurrencyItem, currency: DisplayCurrency): number {
  const converted =
    currency === "USD" ? item.valueUSD : currency === "UYU" ? item.valueUYU : item.valueBRL
  if (converted != null) return converted

  const original = item.value ?? item.amount
  if (original == null) return 0
  return item.currency === currency ? original : 0
}
