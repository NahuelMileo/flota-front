"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/app/(dashboard)/egresos/columns";
import { formatCurrency2 } from "@/lib/format";
import { useCurrency } from "@/context/currency-context";

type Props = {
  expenses: Expense[];
  totalKm?: number;
};

export function CostPerKmCard({ expenses, totalKm }: Props) {
  const { displayCurrency, getDisplayValue } = useCurrency();

  const totalValue = expenses.reduce((acc, e) => acc + getDisplayValue(e), 0);

  if (!totalKm || totalKm === 0 || totalValue === 0) return null;

  const costPerKm = totalValue / totalKm;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Costo por km
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency2(costPerKm, displayCurrency)}/km</div>
        <p className="text-xs text-muted-foreground mt-1">
          {totalKm.toLocaleString("es-UY")} km en viajes
        </p>
      </CardContent>
    </Card>
  );
}
