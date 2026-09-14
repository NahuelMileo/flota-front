"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { toast } from "sonner"
import { useDateFilter } from "@/context/date-filter-context"
import { useCurrency } from "@/context/currency-context"
import { MonthBalance } from "@/components/month-balance"
import { MonthlyComparisonChart } from "@/components/monthly-comparison-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Refreshing } from "@/components/refreshing"
import { UpcomingDueDates } from "@/components/due-dates/upcoming-due-dates"

type MonthlyTotal = {
  month: number
  year: number
  incomeUSD: number
  incomeBRL: number
  incomeUYU: number
  expenseUSD: number
  expenseBRL: number
  expenseUYU: number
}

type DashboardSummary = {
  currentMonth: MonthlyTotal
  previousMonth: MonthlyTotal
  last6Months: MonthlyTotal[]
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { selectedDate } = useDateFilter()
  const { displayCurrency } = useCurrency()

  // Los totales, la variación % y los últimos 6 meses ya vienen sumarizados
  // del backend (GROUP BY mes) — el frontend no trae filas crudas para sumar.
  const fetchSummary = useCallback(async () => {
    const date = selectedDate ?? new Date()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    setIsLoading(true)
    try {
      const res = await fetchWithAuth(`/api/dashboard/summary?month=${month}&year=${year}`, { method: "GET" })
      if (!res.ok) throw new Error()
      setSummary(await res.json())
    } catch {
      toast.error("Error al cargar datos")
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const pickIncome = useCallback((m: MonthlyTotal) => {
    if (displayCurrency === "USD") return m.incomeUSD
    if (displayCurrency === "UYU") return m.incomeUYU
    return m.incomeBRL
  }, [displayCurrency])

  const pickExpense = useCallback((m: MonthlyTotal) => {
    if (displayCurrency === "USD") return m.expenseUSD
    if (displayCurrency === "UYU") return m.expenseUYU
    return m.expenseBRL
  }, [displayCurrency])

  const totalIncome = summary ? pickIncome(summary.currentMonth) : 0
  const totalExpense = summary ? pickExpense(summary.currentMonth) : 0
  const prevMonthIncome = summary ? pickIncome(summary.previousMonth) : 0
  const prevMonthExpense = summary ? pickExpense(summary.previousMonth) : 0

  const incomeVariation = useMemo(() => {
    if (prevMonthIncome === 0) return undefined
    return Math.round(((totalIncome - prevMonthIncome) / prevMonthIncome) * 100)
  }, [totalIncome, prevMonthIncome])

  const expenseVariation = useMemo(() => {
    if (prevMonthExpense === 0) return undefined
    return Math.round(((totalExpense - prevMonthExpense) / prevMonthExpense) * 100)
  }, [totalExpense, prevMonthExpense])

  const monthlyData = useMemo(() => {
    if (!summary) return []
    return summary.last6Months.map((m) => {
      const label = new Date(m.year, m.month - 1, 1).toLocaleDateString("es-UY", { month: "short", year: "2-digit" })
      return { month: label, ingresos: pickIncome(m), egresos: pickExpense(m) }
    })
  }, [summary, pickIncome, pickExpense])

  // Skeletons sólo mientras no hay nada que mostrar. Al cambiar de mes ya hay datos en
  // pantalla: se apagan un momento y las cifras cuentan hasta el valor nuevo, en vez de
  // desarmar la pantalla entera y rearmarla por un pedido que tarda medio segundo.
  const isFirstLoad = isLoading && !summary

  return (
    <div className="p-6 flex flex-col gap-4">
      {isFirstLoad ? (
        <>
          {/* BALANCE */}
          <div className="flex flex-col gap-3">
            <Skeleton className="h-9 w-80" />
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton className="h-5 w-96" />
          </div>
          {/* CHART */}
          <Skeleton className="h-72 w-full rounded-xl" />
        </>
      ) : (
        <Refreshing busy={isLoading} className="fv-rise flex flex-col gap-4">
          <MonthBalance
            income={totalIncome}
            expense={totalExpense}
            incomeVariation={incomeVariation}
            expenseVariation={expenseVariation}
          />
          <MonthlyComparisonChart data={monthlyData} />
        </Refreshing>
      )}
      <UpcomingDueDates />
    </div>
  )
}
