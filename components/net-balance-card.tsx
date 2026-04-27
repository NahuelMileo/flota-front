import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  income: number
  expense: number
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

export function NetBalanceCard({ income, expense }: Props) {
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
        <div className={`text-2xl font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? "+" : ""}{formatBRL(balance)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Ingresos − Egresos
        </p>
      </CardContent>
    </Card>
  )
}
