import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/app/(dashboard)/egresos/columns";

// Gasoil (1), Arla 32 (2), Aceite (5)
const FUEL_TYPES = new Set([1, 2, 5]);

type Props = {
  expenses: Expense[];
};

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function CostPerKmCard({ expenses }: Props) {
  const fuelExpenses = expenses.filter(
    (e) => FUEL_TYPES.has(e.type) && e.value && e.kilometers
  );

  const totalValue = fuelExpenses.reduce((acc, e) => acc + e.value, 0);
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
        <div className="text-2xl font-bold">{formatBRL(costPerKm)}/km</div>
        <p className="text-xs text-muted-foreground mt-1">
          {totalKm.toLocaleString("es-UY")} km registrados
        </p>
      </CardContent>
    </Card>
  );
}
