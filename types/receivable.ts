// La API serializa los enums como strings.
export type ReceivableItemKind = "Advance" | "Balance" | "Toll"

export type ReceivableItemStatus = "NotApplicable" | "Pending" | "Collected"

export type ReceivableStatus = "Pending" | "Partial" | "Collected"

export type ReceivableItem = {
  kind: ReceivableItemKind
  amount: number
  status: ReceivableItemStatus
  incomeId: string | null
  collectedAt: string | null
}

export type Receivable = {
  id: string
  clientId: string
  clientName: string
  truckId: string
  truckLicensePlate: string
  truckColor: string | null
  tripId: string | null
  dateUtc: string
  currency: string // "USD" | "BRL" | "UYU"
  freightValue: number
  advanceAmount: number
  balanceAmount: number
  tollAmount: number
  totalAmount: number
  collectedAmount: number
  pendingAmount: number
  status: ReceivableStatus
  items: ReceivableItem[]
  notes: string | null
  valueUSD: number | null
  valueBRL: number | null
  valueUYU: number | null
}

export const RECEIVABLE_ITEM_LABELS: Record<ReceivableItemKind, string> = {
  Advance: "Adelanto",
  Balance: "Saldo",
  Toll: "Peaje",
}

// Un solo par de colores para toda la pantalla: los mismos de las celdas de monto
// pintan la barra de cobranza, así el resumen y la grilla hablan el mismo idioma.
export const RECEIVABLE_COLORS = {
  collected: "#57E355",
  pending: "#F0453F",
} as const

export const RECEIVABLE_STATUS_LABELS: Record<ReceivableStatus, string> = {
  Pending: "Pendiente",
  Partial: "Parcial",
  Collected: "Cobrado",
}

// Los montos por ítem vienen en la moneda del registro, pero los KPI se muestran en la
// moneda de visualización. La tasa es la misma para toda la fila, así que alcanza con
// aplicar la proporción cobrada al total ya convertido.
export function splitDisplayTotal(receivable: Receivable, displayTotal: number) {
  if (receivable.totalAmount === 0) return { collected: 0, pending: 0 }
  const collected = displayTotal * (receivable.collectedAmount / receivable.totalAmount)
  return { collected, pending: displayTotal - collected }
}
