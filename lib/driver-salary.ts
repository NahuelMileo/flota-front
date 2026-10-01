import { fetchWithAuth } from "@/lib/api"
import type { Expense } from "@/app/(dashboard)/egresos/columns"

/**
 * El egreso "Salario chofer" lo crea y recalcula el backend junto con el ingreso; esto
 * trae su versión actual para refrescar las listas de egresos que estén en pantalla.
 */
export async function fetchDriverSalary(expenseId: string | null | undefined): Promise<Expense | undefined> {
  if (!expenseId) return undefined
  try {
    const res = await fetchWithAuth(`/api/expenses/${expenseId}`)
    return res.ok ? await res.json() : undefined
  } catch {
    return undefined
  }
}

/**
 * Borra un egreso. Si salió de un ingreso y se pidió borrar también el ingreso, se borra
 * el ingreso: el backend se lleva el salario con él.
 */
export async function deleteExpense(
  expense: Pick<Expense, "id" | "incomeId">,
  alsoDeleteIncome: boolean,
): Promise<void> {
  const url = alsoDeleteIncome && expense.incomeId
    ? `/api/incomes/${expense.incomeId}`
    : `/api/expenses/${expense.id}`
  const res = await fetchWithAuth(url, { method: "DELETE" })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e.message || e.title || "Error al eliminar egreso")
  }
}
