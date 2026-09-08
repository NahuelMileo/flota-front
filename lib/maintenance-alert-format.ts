const numberFormatter = new Intl.NumberFormat("es-UY")

// KmRemaining: positivo = faltan km, 0 = límite alcanzado, negativo = excedido.
export function formatKmRemaining(kmRemaining?: number | null): string | null {
  if (kmRemaining === null || kmRemaining === undefined) return null

  const rounded = Math.round(Math.abs(kmRemaining))

  if (kmRemaining === 0) return "Límite de kilometraje alcanzado"
  if (kmRemaining > 0) return `Faltan ${numberFormatter.format(rounded)} km`
  return `${numberFormatter.format(rounded)} km excedidos`
}

// DaysRemaining: el backend define Overdue como <= 0; acá solo se formatea el texto,
// nunca se recalcula el status.
export function formatDaysRemaining(daysRemaining?: number | null): string | null {
  if (daysRemaining === null || daysRemaining === undefined) return null

  if (daysRemaining > 1) return `Faltan ${daysRemaining} días`
  if (daysRemaining === 1) return "Falta 1 día"
  if (daysRemaining === 0) return "Vence hoy"

  const overdueDays = Math.abs(daysRemaining)
  return overdueDays === 1 ? "1 día vencido" : `${overdueDays} días vencido`
}

export function formatAlertRemaining(kmRemaining?: number | null, daysRemaining?: number | null): string | null {
  const parts = [formatKmRemaining(kmRemaining), formatDaysRemaining(daysRemaining)].filter(
    (part): part is string => part !== null
  )
  return parts.length > 0 ? parts.join(" · ") : null
}
