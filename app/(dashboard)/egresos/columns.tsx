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

export type Expense = {
  id: string;
  date: string;
  type: number;
  value: number;
  truckId: string | null;
  truckLicensePlate: string | null;
  name: string | null;
  kilometers: number | null;
  liters: number | null;
};

export const expenseTypeLabels: Record<number, string> = {
  1: "Gasoil",
  2: "Arla 32",
  3: "Mantenimiento",
  4: "Gomería",
  5: "Aceite",
  6: "Estacionamiento",
  7: "Peaje",
  8: "Salario",
  9: "Contador",
  10: "Financiamiento",
  11: "Otro",
};

export function getColumns(
  onEdit: (expense: Expense) => void,
  onDelete: (expense: Expense) => void,
): ColumnDef<Expense>[] {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => {
        const name = row.getValue("name") as string | null;
        if (!name) return <span className="text-muted-foreground">—</span>;
        return name;
      },
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("type") as number;
        return <Badge variant="outline">{expenseTypeLabels[type] ?? "Desconocido"}</Badge>;
      },
    },
    {
      accessorKey: "value",
      header: "Valor",
      cell: ({ row }) => {
        const value: number = row.getValue("value");
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        }).format(value);
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
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => {
        const date: string = row.getValue("date");
        return new Date(date + "T00:00:00").toLocaleDateString("es-UY");
      },
    },
    {
      accessorKey: "kilometers",
      header: "Km",
      cell: ({ row }) => {
        const km = row.getValue("kilometers") as number | null;
        if (km == null) return <span className="text-muted-foreground">—</span>;
        return km.toLocaleString("es-UY");
      },
    },
    {
      accessorKey: "liters",
      header: "Litros",
      cell: ({ row }) => {
        const liters = row.getValue("liters") as number | null;
        if (liters == null) return <span className="text-muted-foreground">—</span>;
        return liters.toLocaleString("es-UY");
      },
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div key={expense.id} className="flex gap-2 justify-end">
            <Button variant="ghost" size="icon" onClick={() => onEdit(expense)}>
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
                  <AlertDialogTitle>¿Eliminar egreso?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará el egreso{" "}
                    <span className="font-medium text-foreground">
                      {expense.name ?? expenseTypeLabels[expense.type]}
                    </span>{" "}
                    por valor de{" "}
                    <span className="font-medium text-foreground">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(expense.value)}
                    </span>{" "}
                    de tu registro.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => onDelete(expense)}
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
