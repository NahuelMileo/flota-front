"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { useCurrency } from "@/context/currency-context"

type Props = {
  income: number
  expense: number
}

export function NetBalanceCard({ income, expense }: Props) {
  const { displayCurrency } = useCurrency()
  const balance = income - expense
  const isPositive = balance >= 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Balance neto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${isPositive ? "text-green-600" : "text-red-500"}`}>
          {isPositive ? "+" : ""}{formatCurrency(balance, displayCurrency)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Ingresos − Egresos
        </p>
      </CardContent>
    </Card>
  )
}
