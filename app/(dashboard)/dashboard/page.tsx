"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { toast } from "sonner"
import { useDateFilter } from "@/context/date-filter-context"
import { useCurrency } from "@/context/currency-context"
import { TotalIncomeCard } from "@/components/total-income-card"
import { TotalExpenseCard } from "@/components/total-expense-card"
import { NetBalanceCard } from "@/components/net-balance-card"
import { MonthlyComparisonChart } from "@/components/monthly-comparison-chart"
import { Skeleton } from "@/components/ui/skeleton"

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

function CardSkeleton() {
  return <Skeleton className="h-24 w-full rounded-xl" />
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

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-xl font-bold">Dashboard</h1>

      {/* CARDS */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TotalIncomeCard total={totalIncome} variation={incomeVariation} />
          <TotalExpenseCard total={totalExpense} variation={expenseVariation} />
          <NetBalanceCard income={totalIncome} expense={totalExpense} />
        </div>
      )}

      {/* CHART */}
      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : (
        <MonthlyComparisonChart data={monthlyData} />
      )}
    </div>
  )
}
