"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/app/(dashboard)/egresos/columns";
import { getExpenseTypeLabel } from "@/lib/expense-types";
import { formatCurrency, DisplayCurrency } from "@/lib/format";

function getDisplayValue(
  item: { value: number; valueUSD?: number | null; valueBRL?: number | null; valueUYU?: number | null },
  currency: DisplayCurrency
): number {
  if (currency === "USD") return item.valueUSD ?? item.value;
  if (currency === "UYU") return item.valueUYU ?? item.value;
  return item.valueBRL ?? item.value;
}

type Props = {
  expenses: Expense[];
  displayCurrency: DisplayCurrency;
};

export function ExpenseBreakdownChart({ expenses, displayCurrency }: Props) {
  const data = Object.entries(
    expenses.reduce((acc, e) => {
      const label = getExpenseTypeLabel(e.type) ?? "Desconocido";
      acc[label] = (acc[label] ?? 0) + getDisplayValue(e, displayCurrency);
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Egresos por categoría
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tickFormatter={(v) => formatCurrency(v, displayCurrency)}
              tick={{ fontSize: 11 }}
              width={90}
            />
            <Tooltip
              formatter={(value) => [
                typeof value === "number" ? formatCurrency(value, displayCurrency) : value,
                "Total",
              ]}
            />
            <Bar dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
