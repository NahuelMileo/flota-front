export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("T")[0].split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("es-UY");
}

export function formatKm(value: number): string {
  return new Intl.NumberFormat("es-UY").format(Math.round(value)) + " km"
}

export type DisplayCurrency = "USD" | "BRL" | "UYU"

export function formatCurrency(value: number, currency: DisplayCurrency): string {
  if (currency === "UYU") {
    return "UYU " + new Intl.NumberFormat("es-UY", { maximumFractionDigits: 0 }).format(value)
  }
  if (currency === "USD") {
    return "U$S " + new Intl.NumberFormat("es-UY", { maximumFractionDigits: 0 }).format(value)
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCurrency2(value: number, currency: DisplayCurrency): string {
  if (currency === "UYU") {
    return "UYU " + new Intl.NumberFormat("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  }
  if (currency === "USD") {
    return "U$S " + new Intl.NumberFormat("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
