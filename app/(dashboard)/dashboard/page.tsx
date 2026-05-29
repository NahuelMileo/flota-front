"use client"

import { useEffect, useMemo, useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { toast } from "sonner"
import { useDateFilter } from "@/context/date-filter-context"
import { useCurrency } from "@/context/currency-context"
import { TotalIncomeCard } from "@/components/total-income-card"
import type { Expense as ColumnExpense } from "@/app/(dashboard)/egresos/columns"
import { TotalExpenseCard } from "@/components/total-expense-card"
import { NetBalanceCard } from "@/components/net-balance-card"
import { CostPerKmCard } from "@/components/cost-per-km-card"
import { MonthlyComparisonChart } from "@/components/monthly-comparison-chart"
import { Skeleton } from "@/components/ui/skeleton"

type Income = {
  id: string
  value: number
  valueUSD: number | null
  valueBRL: number | null
  valueUYU: number | null
  dateUtc: string
  truckLicensePlate: string | null
  type: string
}

type Expense = {
  id: string
  value: number
  valueUSD: number | null
  valueBRL: number | null
  valueUYU: number | null
  date: string
  type: number
  truckId: string | null
  truckLicensePlate: string | null
  name: string | null
  kilometers: number | null
  liters: number | null
}

function CardSkeleton() {
  return <Skeleton className="h-24 w-full rounded-xl" />
}

export default function DashboardPage() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [trips, setTrips] = useState<{ departureDate: string; kilometers: number | null; initialKm: number | null; finalKm: number | null }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { selectedDate } = useDateFilter()
  const { getDisplayValue } = useCurrency()

  useEffect(() => {
    Promise.all([
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/incomes`, { method: "GET" }),
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses`, { method: "GET" }),
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/trips`, { method: "GET" }),
    ])
      .then(async ([incRes, expRes, tripsRes]) => {
        if (!incRes.ok || !expRes.ok) throw new Error()
        const [incData, expData] = await Promise.all([incRes.json(), expRes.json()])
        setIncomes(incData)
        setExpenses(expData)
        if (tripsRes.ok) setTrips(await tripsRes.json())
      })
      .catch(() => toast.error("Error al cargar datos"))
      .finally(() => setIsLoading(false))
  }, [])

  // Filter by selected month
  const filteredIncomes = useMemo(() => {
    if (!selectedDate) return incomes
    return incomes.filter((i) => {
      const d = new Date(i.dateUtc)
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear()
    })
  }, [incomes, selectedDate])

  const filteredExpenses = useMemo(() => {
    if (!selectedDate) return expenses
    return expenses.filter((e) => {
      const d = new Date(e.date + "T00:00:00")
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear()
    })
  }, [expenses, selectedDate])

  const totalIncome = useMemo(() => filteredIncomes.reduce((acc, i) => acc + getDisplayValue(i), 0), [filteredIncomes, getDisplayValue])
  const totalExpense = useMemo(() => filteredExpenses.reduce((acc, e) => acc + getDisplayValue(e), 0), [filteredExpenses, getDisplayValue])

  // Previous month totals for variation
  const prevMonthIncome = useMemo(() => {
    if (!selectedDate) return 0
    const prev = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1)
    return incomes
      .filter((i) => {
        const d = new Date(i.dateUtc)
        return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear()
      })
      .reduce((acc, i) => acc + getDisplayValue(i), 0)
  }, [incomes, selectedDate, getDisplayValue])

  const prevMonthExpense = useMemo(() => {
    if (!selectedDate) return 0
    const prev = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1)
    return expenses
      .filter((e) => {
        const d = new Date(e.date + "T00:00:00")
        return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear()
      })
      .reduce((acc, e) => acc + getDisplayValue(e), 0)
  }, [expenses, selectedDate, getDisplayValue])

  const incomeVariation = useMemo(() => {
    if (prevMonthIncome === 0) return undefined
    return Math.round(((totalIncome - prevMonthIncome) / prevMonthIncome) * 100)
  }, [totalIncome, prevMonthIncome])

  const expenseVariation = useMemo(() => {
    if (prevMonthExpense === 0) return undefined
    return Math.round(((totalExpense - prevMonthExpense) / prevMonthExpense) * 100)
  }, [totalExpense, prevMonthExpense])

  const totalTripKm = useMemo(() => {
    return trips
      .filter((t) => {
        if (!selectedDate) return true;
        const d = new Date(t.departureDate);
        return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
      })
      .reduce((acc, t) => {
        const km = t.initialKm != null && t.finalKm != null ? t.finalKm - t.initialKm : (t.kilometers ?? 0);
        return acc + km;
      }, 0);
  }, [trips, selectedDate]);

  // Last 6 months for chart
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setDate(1)
      d.setMonth(d.getMonth() - (5 - i))
      const label = d.toLocaleDateString("es-UY", { month: "short", year: "2-digit" })

      const monthIncome = incomes
        .filter((inc) => {
          const id = new Date(inc.dateUtc)
          return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear()
        })
        .reduce((acc, inc) => acc + getDisplayValue(inc), 0)

      const monthExpense = expenses
        .filter((exp) => {
          const ed = new Date(exp.date + "T00:00:00")
          return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear()
        })
        .reduce((acc, exp) => acc + getDisplayValue(exp), 0)

      return { month: label, ingresos: monthIncome, egresos: monthExpense }
    })
  }, [incomes, expenses, getDisplayValue])

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TotalIncomeCard total={totalIncome} variation={incomeVariation} />
          <TotalExpenseCard total={totalExpense} variation={expenseVariation} />
          <NetBalanceCard income={totalIncome} expense={totalExpense} />
          <CostPerKmCard expenses={filteredExpenses as unknown as ColumnExpense[]} totalKm={totalTripKm} />
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
