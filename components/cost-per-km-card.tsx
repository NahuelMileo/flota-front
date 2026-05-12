"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/app/(dashboard)/egresos/columns";
import { formatCurrency2 } from "@/lib/format";
import { useCurrency } from "@/context/currency-context";

const FUEL_CATEGORY_NAMES = new Set(["Gasoil", "Arla 32", "Aceite"])

type Props = {
  expenses: Expense[];
};

export function CostPerKmCard({ expenses }: Props) {
  const { displayCurrency, getDisplayValue } = useCurrency();

  const fuelExpenses = expenses.filter(
    (e) => FUEL_CATEGORY_NAMES.has(e.categoryName ?? "") && e.value && e.kilometers
  );

  const totalValue = fuelExpenses.reduce((acc, e) => acc + getDisplayValue(e), 0);
  const totalKm = fuelExpenses.reduce((acc, e) => acc + (e.kilometers ?? 0), 0);

  if (totalKm === 0) return null;

  const costPerKm = totalValue / totalKm;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Costo por km (combustible)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency2(costPerKm, displayCurrency)}/km</div>
        <p className="text-xs text-muted-foreground mt-1">
          {totalKm.toLocaleString("es-UY")} km registrados
        </p>
      </CardContent>
    </Card>
  );
}
