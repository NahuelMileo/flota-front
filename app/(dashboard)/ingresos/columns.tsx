"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, DisplayCurrency } from "@/lib/format";

const incomeTypeMap: Record<string, "1" | "2"> = {
  "1": "1", Freight: "1", Flete: "1",
  "2": "2", Other: "2", Otro: "2",
}

export function normalizeIncomeType(type: string): "1" | "2" {
  return incomeTypeMap[type] ?? "1"
}

export type Income = {
  id: string;
  description: string;
  value: number;
  valueUSD: number | null;
  valueBRL: number | null;
  valueUYU: number | null;
  truckId: string | null;
  truckLicensePlate: string | null;
  dateUtc: string;
  type: string;
  currency: string; // "USD" | "BRL" | "UYU"
  tripId?: string | null;
};

function getDisplayValue(
  item: Pick<Income, "value" | "valueUSD" | "valueBRL" | "valueUYU">,
  currency: DisplayCurrency
): number {
  if (currency === "USD") return item.valueUSD ?? item.value;
  if (currency === "UYU") return item.valueUYU ?? item.value;
  return item.valueBRL ?? item.value;
}

export function getColumns(
  onEdit: (income: Income) => void,
  onDelete: (income: Income) => void,
  displayCurrency: DisplayCurrency = "BRL",
): ColumnDef<Income>[] {
  return [
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      accessorKey: "value",
      header: "Valor",
      cell: ({ row }) => {
        const displayVal = getDisplayValue(row.original, displayCurrency);
        return formatCurrency(displayVal, displayCurrency);
      },
    },
    {
      accessorKey: "currency",
      header: "Moneda",
      cell: ({ row }) => {
        const currency = row.original.currency;
        const colorMap: Record<string, string> = {
          USD: "text-blue-600 border-blue-300 bg-blue-50",
          BRL: "text-green-600 border-green-300 bg-green-50",
          UYU: "text-purple-600 border-purple-300 bg-purple-50",
        };
        return (
          <Badge variant="outline" className={colorMap[currency] ?? ""}>
            {currency}
          </Badge>
        );
      },
    },
    {
      accessorKey: "truckLicensePlate",
      header: "Camión",
      cell: ({ row }) => {
        const plate = row.getValue("truckLicensePlate") as string | null;
        if (!plate) return <span className="text-muted-foreground">—</span>;
        return <Badge variant="outline">{plate}</Badge>;
      },
    },
    {
      accessorKey: "dateUtc",
      header: "Fecha",
      cell: ({ row }) => {
        const date: string = row.getValue("dateUtc");
        return formatDate(date);
      },
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        const normalized = normalizeIncomeType(type);
        if (normalized === "1") return <Badge variant="outline" className="text-green-400 border-green-400 bg-green-100">Flete</Badge>;
        return <Badge variant="outline">Otro</Badge>;
      },
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const income = row.original;
        return (
          <div key={income.id} className="flex gap-2 justify-end">
            <Button variant="ghost" size="icon" onClick={() => onEdit(income)}>
              <Pencil className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                }
              />
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar ingreso?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará el ingreso{" "}
                    <span className="font-medium text-foreground">
                      {income.description}
                    </span>{" "}
                    por valor de{" "}
                    <span className="font-medium text-foreground">
                      {formatCurrency(getDisplayValue(income, displayCurrency), displayCurrency)}
                    </span>{" "}
                    de tu registro.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => onDelete(income)}
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];
}
