"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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

  const efficiencyData = useMemo(() => {
    // Group by truck to compute odometer deltas per truck
    const byTruck = new Map<string, typeof fuelExpenses>();
    for (const e of fuelExpenses) {
      const key = e.truckId ?? "__none__";
      if (!byTruck.has(key)) byTruck.set(key, []);
      byTruck.get(key)!.push(e);
    }

    const rows: {
      date: string;
      fullDate: string;
      kmDriven: number | null;
      liters: number;
      displayValue: number;
      kmPerLiter: number | null;
      costPerKm: number | null;
      pricePerLiter: number;
    }[] = [];

    for (const fills of byTruck.values()) {
      fills.forEach((expense, i) => {
        const displayVal = getDisplayValue(expense, displayCurrency);
        const liters = expense.liters ?? 0;
        const currentKm = expense.kilometers ?? 0;
        const prevKm = i > 0 ? (fills[i - 1].kilometers ?? 0) : null;
        const kmDriven = prevKm !== null ? currentKm - prevKm : null;

        rows.push({
          date: new Date(expense.date).toLocaleDateString("es-UY", { month: "short", day: "numeric" }),
          fullDate: expense.date,
          kmDriven,
          liters,
          displayValue: displayVal,
          kmPerLiter: kmDriven != null && kmDriven > 0 && liters > 0
            ? parseFloat((kmDriven / liters).toFixed(2))
            : null,
          costPerKm: kmDriven != null && kmDriven > 0
            ? parseFloat((displayVal / kmDriven).toFixed(2))
            : null,
          pricePerLiter: liters > 0 ? parseFloat((displayVal / liters).toFixed(2)) : 0,
        });
      });
    }

    return rows.sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [fuelExpenses, displayCurrency]);

  // Cálculos globales
  const rowsWithDelta = useMemo(() => efficiencyData.filter((r) => r.kmDriven != null && r.kmDriven > 0), [efficiencyData]);
  const totalLiters = useMemo(() => fuelExpenses.reduce((acc, e) => acc + (e.liters ?? 0), 0), [fuelExpenses]);
  const fuelCost = useMemo(() => fuelExpenses.reduce((acc, e) => acc + getDisplayValue(e, displayCurrency), 0), [fuelExpenses, displayCurrency]);
  const totalCost = useMemo(() => expenses.reduce((acc, e) => acc + getDisplayValue(e, displayCurrency), 0), [expenses, displayCurrency]);
  const totalKm = useMemo(() => {
    if (tripKm && tripKm > 0) return tripKm;
    const kmValues = fuelExpenses.map((e) => e.kilometers ?? 0).filter((km) => km > 0);
    if (kmValues.length < 2) return 0;
    return Math.max(...kmValues) - Math.min(...kmValues);
  }, [fuelExpenses, tripKm]);

  const avgKmPerLiter = useMemo(() => {
    return totalLiters > 0 ? totalKm / totalLiters : 0;
  }, [totalKm, totalLiters]);

  const avgCostPerKm = useMemo(() => {
    return totalKm > 0 ? totalCost / totalKm : 0;
  }, [totalCost, totalKm]);

  const avgPricePerLiter = useMemo(() => {
    return totalLiters > 0 ? fuelCost / totalLiters : 0;
  }, [fuelCost, totalLiters]);

  // Comparación: primeros 50% vs últimos 50% (solo filas con delta válido)
  const midpoint = Math.floor(rowsWithDelta.length / 2);
  const firstHalf = rowsWithDelta.slice(0, midpoint);
  const secondHalf = rowsWithDelta.slice(midpoint);

  const firstHalfAvg = useMemo(() => {
    if (firstHalf.length === 0) return 0;
    return firstHalf.reduce((acc, d) => acc + (d.kmPerLiter ?? 0), 0) / firstHalf.length;
  }, [firstHalf]);

  const secondHalfAvg = useMemo(() => {
    if (secondHalf.length === 0) return 0;
    return secondHalf.reduce((acc, d) => acc + (d.kmPerLiter ?? 0), 0) / secondHalf.length;
  }, [secondHalf]);

  const variation = useMemo(() => {
    if (firstHalfAvg === 0) return 0;
    return Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100);
  }, [firstHalfAvg, secondHalfAvg]);

  const variationIsPositive = variation >= 0;

  // Estado del combustible
  const getEfficiencyStatus = () => {
    if (avgKmPerLiter > 6.5) return { label: "Excelente", color: "bg-green-100 text-green-800 border-green-300" };
    if (avgKmPerLiter > 6) return { label: "Bueno", color: "bg-blue-100 text-blue-800 border-blue-300" };
    if (avgKmPerLiter > 5.5) return { label: "Normal", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
    return { label: "Bajo", color: "bg-red-100 text-red-800 border-red-300" };
  };

  const status = getEfficiencyStatus();

  if (fuelExpenses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* km/L */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eficiencia (km/L)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{avgKmPerLiter.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalKm.toLocaleString("es-UY")} km / {totalLiters.toFixed(1)} L
                </p>
              </div>
              <Badge variant="outline" className={status.color}>
                {status.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

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

      {/* Gráfico de Eficiencia */}
      {rowsWithDelta.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tendencia de Eficiencia</CardTitle>
            <CardDescription>km/L a lo largo del tiempo</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 pr-4">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={rowsWithDelta}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                <YAxis label={{ value: "km/L", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value) => typeof value === "number" ? value.toFixed(2) : value}
                  labelFormatter={(label) => `Fecha: ${label}`}
                  contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="kmPerLiter"
                  stroke="#3b82f6"
                  name="km/L"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Detalles */}
      {efficiencyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalles por Carga</CardTitle>
            <CardDescription>
              km/L se calcula en promedio total — el ratio por carga individual no es confiable con tanques parciales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {efficiencyData.map((data, idx) => (
                <div key={idx} className="flex justify-between items-center pb-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{data.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {data.kmDriven != null && data.kmDriven > 0
                        ? `${data.kmDriven.toLocaleString("es-UY")} km desde carga anterior`
                        : "Primera carga del período"
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{data.liters.toFixed(1)} L</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency2(data.pricePerLiter, displayCurrency)}/L
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
