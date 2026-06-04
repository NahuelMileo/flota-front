export type ARStatus = "Cobrado" | "Pendiente" | "Parcial" | "Vencido"

export type PaymentRecord = {
  id: string
  date: string
  amount: number
  currency: "USD" | "BRL" | "UYU"
  note?: string
}