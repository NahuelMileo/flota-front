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
import { Income } from "@/app/(dashboard)/ingresos/columns";
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
  incomes: Income[];
  displayCurrency: DisplayCurrency;
};

export function IncomeByTruckChart({ incomes, displayCurrency }: Props) {
  const data = Object.entries(
    incomes.reduce((acc, i) => {
      const label = i.truckLicensePlate ?? "Empresa";
      acc[label] = (acc[label] ?? 0) + getDisplayValue(i, displayCurrency);
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  return (
    <section className="space-y-3">
      <h2 className="border-b pb-2 font-semibold">Ingresos por camión</h2>
        {data.length === 0 ? (
          <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
            Todavía no hay ingresos para mostrar.
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
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
            <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        )}
    </section>
  );
}
