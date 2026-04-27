"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type Expense = {
  id: string;
  date: string;
  type: number;
  value: number;
  kilometers?: number | null;
  liters?: number | null;
  name?: string | null;
  truckId?: string | null;
};

type FuelEfficiencyCardProps = {
  expenses: Expense[];
  truckId?: string;
};

export function FuelEfficiencyCard({ expenses, truckId }: FuelEfficiencyCardProps) {
  const fuelExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        // Tipo 1 = Gasoil/Combustible
        const isFuel = e.type === 1;
        const hasKmAndLiters = (e.kilometers ?? 0) > 0 && (e.liters ?? 0) > 0;
        const matchesTruck = !truckId || e.truckId === truckId;
        return isFuel && hasKmAndLiters && matchesTruck;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses, truckId]);

  const efficiencyData = useMemo(() => {
    return fuelExpenses.map((expense, index) => {
      const kmPerLiter = (expense.kilometers ?? 0) / (expense.liters ?? 1);
      const costPerKm = (expense.value ?? 0) / (expense.kilometers ?? 1);
      const pricePerLiter = (expense.value ?? 0) / (expense.liters ?? 1);

      return {
        date: new Date(expense.date).toLocaleDateString("es-UY", { month: "short", day: "numeric" }),
        fullDate: expense.date,
        kmPerLiter: parseFloat(kmPerLiter.toFixed(2)),
        costPerKm: parseFloat(costPerKm.toFixed(2)),
        pricePerLiter: parseFloat(pricePerLiter.toFixed(2)),
        km: expense.kilometers || 0,
        liters: expense.liters || 0,
      };
    });
  }, [fuelExpenses]);

  // Cálculos globales
  const totalKm = useMemo(() => fuelExpenses.reduce((acc, e) => acc + (e.kilometers ?? 0), 0), [fuelExpenses]);
  const totalLiters = useMemo(() => fuelExpenses.reduce((acc, e) => acc + (e.liters ?? 0), 0), [fuelExpenses]);
  const totalCost = useMemo(() => fuelExpenses.reduce((acc, e) => acc + (e.value ?? 0), 0), [fuelExpenses]);

  const avgKmPerLiter = useMemo(() => {
    return totalLiters > 0 ? totalKm / totalLiters : 0;
  }, [totalKm, totalLiters]);

  const avgCostPerKm = useMemo(() => {
    return totalKm > 0 ? totalCost / totalKm : 0;
  }, [totalCost, totalKm]);

  const avgPricePerLiter = useMemo(() => {
    return totalLiters > 0 ? totalCost / totalLiters : 0;
  }, [totalCost, totalLiters]);

  // Comparación: primeros 50% vs últimos 50%
  const midpoint = Math.floor(efficiencyData.length / 2);
  const firstHalf = efficiencyData.slice(0, midpoint);
  const secondHalf = efficiencyData.slice(midpoint);

  const firstHalfAvg = useMemo(() => {
    if (firstHalf.length === 0) return 0;
    return firstHalf.reduce((acc, d) => acc + d.kmPerLiter, 0) / firstHalf.length;
  }, [firstHalf]);

  const secondHalfAvg = useMemo(() => {
    if (secondHalf.length === 0) return 0;
    return secondHalf.reduce((acc, d) => acc + d.kmPerLiter, 0) / secondHalf.length;
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
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 2,
              }).format(avgCostPerKm)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total: {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
              }).format(totalCost)}
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
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 2,
                }).format(avgPricePerLiter)}
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
      {efficiencyData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tendencia de Eficiencia</CardTitle>
            <CardDescription>km/L a lo largo del tiempo</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 pr-4">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                <YAxis label={{ value: "km/L", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value) => value.toFixed(2)}
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
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {efficiencyData.map((data, idx) => (
                <div key={idx} className="flex justify-between items-center pb-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{data.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {data.km.toLocaleString("es-UY")} km • {data.liters.toFixed(1)} L
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{data.kmPerLiter.toFixed(2)} km/L</p>
                    <p className="text-xs text-muted-foreground">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 2,
                      }).format(data.costPerKm)}/km
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
