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
import { expenseTypeLabels, Expense } from "@/app/(dashboard)/egresos/columns";

type Props = {
  expenses: Expense[];
};

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ExpenseBreakdownChart({ expenses }: Props) {
  const data = Object.entries(
    expenses.reduce((acc, e) => {
      const label = expenseTypeLabels[e.type] ?? "Desconocido";
      acc[label] = (acc[label] ?? 0) + e.value;
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
              tickFormatter={(v) => formatBRL(v)}
              tick={{ fontSize: 11 }}
              width={90}
            />
            <Tooltip
              formatter={(value) => [
                typeof value === "number" ? formatBRL(value) : value,
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
