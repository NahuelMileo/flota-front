"use client"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { useCurrency } from "@/context/currency-context"

type Props = {
  income: number
  expense: number
  incomeVariation?: number
  expenseVariation?: number
  /** Qué período resume: "este mes" por defecto, "en este viaje" en el detalle. */
  period?: string
  /** Métricas propias del contexto (costo/km, ingreso/km) bajo la composición. */
  children?: React.ReactNode
}

function Variation({ value, higherIsBetter }: { value?: number; higherIsBetter: boolean }) {
  if (value === undefined) return null
  const isGood = higherIsBetter ? value >= 0 : value <= 0
  return (
    <span className={isGood ? "text-success" : "text-danger"}>
      {value >= 0 ? "+" : ""}
      {value}%
    </span>
  )
}

/**
 * La pregunta del mes es cuánto quedó, no cuánto entró: la utilidad manda y los
 * ingresos y egresos aparecen como su composición. La barra muestra qué parte de lo
 * facturado se fue en gastos, que es el margen leído de un vistazo.
 */
export function MonthBalance({
  income,
  expense,
  incomeVariation,
  expenseVariation,
  period = "este mes",
  children,
}: Props) {
  const { displayCurrency } = useCurrency()
  const balance = income - expense
  const margin = income > 0 ? Math.round((balance / income) * 100) : 0
  const expenseRatio = income > 0 ? Math.min(expense / income, 1) : 0
  const isProfit = balance >= 0

  if (income === 0 && expense === 0) {
    return <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>
  }

  return (
    <section className="flex flex-col gap-3" aria-label="Balance del mes">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        {/* Convención contable: la ganancia en verde, la pérdida en rojo. El texto que
            sigue dice cuál es, así que el color refuerza y no es el único indicador. */}
        <p
          className={`text-3xl font-semibold tabular-nums ${
            isProfit
              ? "text-success"
              : "text-danger"
          }`}
        >
          {formatCurrency(balance, displayCurrency)}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {isProfit ? "de utilidad" : "de pérdida"} {period}
          </span>
        </p>
        {income > 0 && (
          <p className="text-sm text-muted-foreground tabular-nums">margen {margin}%</p>
        )}
      </div>

      <div
        className="flex h-1.5 overflow-hidden rounded-full bg-success"
        role="img"
        aria-label={`${Math.round(expenseRatio * 100)}% de los ingresos se fue en egresos`}
      >
        <div
          className="bg-danger transition-[width] duration-500 ease-out"
          style={{ width: `${expenseRatio * 100}%` }}
        />
      </div>

      <dl className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
        <div className="flex items-center gap-1.5">
          <ArrowUpRight aria-hidden className="size-4 text-success" />
          <dt className="text-muted-foreground">Ingresos</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(income, displayCurrency)}</dd>
          <Variation value={incomeVariation} higherIsBetter />
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowDownRight aria-hidden className="size-4 text-danger" />
          <dt className="text-muted-foreground">Egresos</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(expense, displayCurrency)}</dd>
          <Variation value={expenseVariation} higherIsBetter={false} />
        </div>
        {children}
      </dl>
    </section>
  )
}
