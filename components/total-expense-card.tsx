import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  total: number
  variation?: number
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

export function TotalExpenseCard({ total, variation }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Egresos totales
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {formatBRL(total)}
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
