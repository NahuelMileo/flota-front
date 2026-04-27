"use client"

import { useEffect, useMemo, useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { toast } from "sonner"
import { useDateFilter } from "@/context/date-filter-context"
import { TotalIncomeCard } from "@/components/total-income-card"
import { TotalExpenseCard } from "@/components/total-expense-card"
import { NetBalanceCard } from "@/components/net-balance-card"
import { CostPerKmCard } from "@/components/cost-per-km-card"
import { MonthlyComparisonChart } from "@/components/monthly-comparison-chart"
import { Skeleton } from "@/components/ui/skeleton"

type Income = {
  id: string
  value: number
  dateUtc: string
  truckLicensePlate: string | null
  type: string
}

type Expense = {
  id: string
  value: number
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
  const [isLoading, setIsLoading] = useState(true)

  const { selectedDate } = useDateFilter()

  useEffect(() => {
    Promise.all([
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/incomes`, { method: "GET" }),
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses`, { method: "GET" }),
    ])
      .then(async ([incRes, expRes]) => {
        if (!incRes.ok || !expRes.ok) throw new Error()
        const [incData, expData] = await Promise.all([incRes.json(), expRes.json()])
        setIncomes(incData)
        setExpenses(expData)
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

  const totalIncome = useMemo(() => filteredIncomes.reduce((acc, i) => acc + i.value, 0), [filteredIncomes])
  const totalExpense = useMemo(() => filteredExpenses.reduce((acc, e) => acc + e.value, 0), [filteredExpenses])

  // Previous month totals for variation
  const prevMonthIncome = useMemo(() => {
    if (!selectedDate) return 0
    const prev = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1)
    return incomes
      .filter((i) => {
        const d = new Date(i.dateUtc)
        return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear()
      })
      .reduce((acc, i) => acc + i.value, 0)
  }, [incomes, selectedDate])

  const prevMonthExpense = useMemo(() => {
    if (!selectedDate) return 0
    const prev = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1)
    return expenses
      .filter((e) => {
        const d = new Date(e.date + "T00:00:00")
        return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear()
      })
      .reduce((acc, e) => acc + e.value, 0)
  }, [expenses, selectedDate])

  const incomeVariation = useMemo(() => {
    if (prevMonthIncome === 0) return undefined
    return Math.round(((totalIncome - prevMonthIncome) / prevMonthIncome) * 100)
  }, [totalIncome, prevMonthIncome])

  const expenseVariation = useMemo(() => {
    if (prevMonthExpense === 0) return undefined
    return Math.round(((totalExpense - prevMonthExpense) / prevMonthExpense) * 100)
  }, [totalExpense, prevMonthExpense])

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
        .reduce((acc, inc) => acc + inc.value, 0)

      const monthExpense = expenses
        .filter((exp) => {
          const ed = new Date(exp.date + "T00:00:00")
          return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear()
        })
        .reduce((acc, exp) => acc + exp.value, 0)

      return { month: label, ingresos: monthIncome, egresos: monthExpense }
    })
  }, [incomes, expenses])

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
          <CostPerKmCard expenses={filteredExpenses} />
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
