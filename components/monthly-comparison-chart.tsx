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

type MonthlyData = {
  month: string
  ingresos: number
  egresos: number
}

type Props = {
  data: MonthlyData[]
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

export function MonthlyComparisonChart({ data }: Props) {
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
            <YAxis tickFormatter={(v) => formatBRL(v)} tick={{ fontSize: 11 }} width={90} />
            <Tooltip formatter={(value) => [typeof value === "number" ? formatBRL(value) : value]} />
            <Legend />
            <Bar dataKey="ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="egresos" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
