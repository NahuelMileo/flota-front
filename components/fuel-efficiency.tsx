"use client";

import { useMemo } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency2, formatCurrency, type DisplayCurrency } from "@/lib/format";
import { useCurrency } from "@/context/currency-context";

const FUEL_CATEGORY_NAMES = new Set(["Gasoil", "Arla 32", "Arla32", "Aceite"])

type Expense = {
  id: string;
  date: string;
  expenseCategoryId?: string | null;
  categoryName?: string | null;
  value: number;
  valueUSD?: number | null;
  valueBRL?: number | null;
  valueUYU?: number | null;
  kilometers?: number | null;
  liters?: number | null;
  name?: string | null;
  truckId?: string | null;
};

function getDisplayValue(
  item: { value: number; valueUSD?: number | null; valueBRL?: number | null; valueUYU?: number | null },
  currency: DisplayCurrency
): number {
  if (currency === "USD") return item.valueUSD ?? item.value;
  if (currency === "UYU") return item.valueUYU ?? item.value;
  return item.valueBRL ?? item.value;
}

type FuelEfficiencyProps = {
  expenses: Expense[];
  truckId?: string;
  tripKm?: number;
};

export function FuelEfficiency({ expenses, truckId, tripKm }: FuelEfficiencyProps) {
  const { displayCurrency } = useCurrency();

  const fuelExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        const isFuel = FUEL_CATEGORY_NAMES.has(e.categoryName ?? "");
        const hasKmAndLiters = (e.kilometers ?? 0) > 0 && (e.liters ?? 0) > 0;
        const matchesTruck = !truckId || e.truckId === truckId;
        return isFuel && hasKmAndLiters && matchesTruck;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses, truckId]);


  const totalLiters = useMemo(() => fuelExpenses.reduce((acc, e) => acc + (e.liters ?? 0), 0), [fuelExpenses]);
  const fuelCost = useMemo(() => fuelExpenses.reduce((acc, e) => acc + getDisplayValue(e, displayCurrency), 0), [fuelExpenses, displayCurrency]);
  const totalCost = useMemo(() => expenses.reduce((acc, e) => acc + getDisplayValue(e, displayCurrency), 0), [expenses, displayCurrency]);
  const totalKm = useMemo(() => {
    if (tripKm && tripKm > 0) return tripKm;
    const kmValues = fuelExpenses.map((e) => e.kilometers ?? 0).filter((km) => km > 0);
    if (kmValues.length < 2) return 0;
    return Math.max(...kmValues) - Math.min(...kmValues);
  }, [fuelExpenses, tripKm]);

  const avgCostPerKm = useMemo(() => {
    return totalKm > 0 ? totalCost / totalKm : 0;
  }, [totalCost, totalKm]);

  const avgPricePerLiter = useMemo(() => {
    return totalLiters > 0 ? fuelCost / totalLiters : 0;
  }, [fuelCost, totalLiters]);

  const variation = useMemo(() => {
    if (fuelExpenses.length < 2) return 0;
    const half = Math.floor(fuelExpenses.length / 2);
    const firstHalf = fuelExpenses.slice(0, half);
    const secondHalf = fuelExpenses.slice(half);

    const firstAvg = firstHalf.length > 0
      ? firstHalf.reduce((acc, e) => acc + (e.liters ?? 0), 0) / firstHalf.length
      : 0;
    const secondAvg = secondHalf.length > 0
      ? secondHalf.reduce((acc, e) => acc + (e.liters ?? 0), 0) / secondHalf.length
      : 0;

    return firstAvg === 0 ? 0 : Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
  }, [fuelExpenses]);

  const variationIsPositive = variation >= 0;

  if (fuelExpenses.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin datos de combustible en este viaje.</p>;
  }

  // Dos cifras no necesitan dos cards: van como una línea de datos, igual que el resto
  // de los resúmenes de la app.
  return (
    <section className="space-y-3">
      <h2 className="border-b pb-2 font-semibold">Combustible</h2>
      <dl className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
        <div className="flex items-center gap-1.5">
          <dt className="text-muted-foreground">Costo/km</dt>
          <dd className="font-medium tabular-nums">
            {formatCurrency2(avgCostPerKm, displayCurrency)}
          </dd>
          <span className="text-muted-foreground tabular-nums">
            ({formatCurrency(totalCost, displayCurrency)} en total)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="text-muted-foreground">Precio/litro</dt>
          <dd className="font-medium tabular-nums">
            {formatCurrency2(avgPricePerLiter, displayCurrency)}
          </dd>
          {variation !== 0 && (
            <span
              className={`flex items-center gap-0.5 tabular-nums ${
                variationIsPositive
                  ? "text-danger"
                  : "text-success"
              }`}
            >
              {variationIsPositive ? (
                <ArrowUp className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <ArrowDown className="h-3.5 w-3.5" aria-hidden />
              )}
              {Math.abs(variation)}% vs período anterior
            </span>
          )}
        </div>
      </dl>
    </section>
  );
}
