"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type FuelEfficiencyCardProps = {
  expenses: Expense[];
  truckId?: string;
  tripKm?: number;
};

export function FuelEfficiencyCard({ expenses, truckId, tripKm }: FuelEfficiencyCardProps) {
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
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* $/km */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Costo por km</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCurrency2(avgCostPerKm, displayCurrency)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Total: {formatCurrency(totalCost, displayCurrency)}
          </p>
        </CardContent>
      </Card>

      {/* $/L */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Precio por litro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">
              {formatCurrency2(avgPricePerLiter, displayCurrency)}
            </p>
            {variationIsPositive ? (
              <div className="flex items-center gap-1 text-red-600">
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm">{Math.abs(variation)}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-600">
                <ArrowDown className="h-4 w-4" />
                <span className="text-sm">{Math.abs(variation)}%</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            vs período anterior
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
