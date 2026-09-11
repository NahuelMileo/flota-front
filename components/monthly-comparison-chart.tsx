"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatCurrency } from "@/lib/format"
import { useCurrency } from "@/context/currency-context"

type MonthlyData = {
  month: string
  ingresos: number
  egresos: number
}

type Props = {
  data: MonthlyData[]
}


export function MonthlyComparisonChart({ data }: Props) {
  const { displayCurrency } = useCurrency()
  const isEmpty = data.every(d => d.ingresos === 0 && d.egresos === 0)

  return (
    <section className="space-y-3">
      <h2 className="border-b pb-2 font-semibold">Ingresos vs Egresos — últimos 6 meses</h2>
        {isEmpty ? (
          <div className="flex h-65 items-center justify-center text-sm text-muted-foreground">
            Todavía no hay datos de ingresos o egresos para mostrar.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => formatCurrency(v, displayCurrency)} tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={(value) => [typeof value === "number" ? formatCurrency(value, displayCurrency) : value]} />
              <Legend />
              <Bar dataKey="ingresos" fill="var(--success)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="egresos" fill="var(--danger)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
    </section>
  )
}
