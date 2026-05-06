"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { useCurrency } from "@/context/currency-context"

type Props = {
  total: number
  variation?: number
}

export function TotalExpenseCard({ total, variation }: Props) {
  const { displayCurrency } = useCurrency()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Egresos totales
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(total, displayCurrency)}
        </div>

        {variation !== undefined && (
          <p
            className={`text-xs mt-1 ${
              variation >= 0 ? "text-red-500" : "text-green-500"
            }`}
          >
            {variation >= 0 ? "+" : ""}
            {variation}% vs mes anterior
          </p>
        )}
      </CardContent>
    </Card>
  )
}
