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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  if (data.every(d => d.ingresos === 0 && d.egresos === 0)) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Ingresos vs Egresos — últimos 6 meses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => formatCurrency(v, displayCurrency)} tick={{ fontSize: 11 }} width={90} />
            <Tooltip formatter={(value) => [typeof value === "number" ? formatCurrency(value, displayCurrency) : value]} />
            <Legend />
            <Bar dataKey="ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="egresos" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
