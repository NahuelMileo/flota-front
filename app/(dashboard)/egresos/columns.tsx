"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteAction } from "@/components/confirm-delete-action";
import { formatCurrency, formatDate, DisplayCurrency } from "@/lib/format";
import { getDisplayValue } from "@/lib/currency";

export type Expense = {
  id: string;
  date: string;
  createdAt: string | null;
  expenseCategoryId: string | null;
  categoryName: string | null;
  value: number;
  valueUSD: number | null;
  valueBRL: number | null;
  valueUYU: number | null;
  currency: string;
  truckId: string | null;
  truckLicensePlate: string | null;
  name: string | null;
  kilometers: number | null;
  liters: number | null;
  tripId?: string | null;
  maintenanceId?: string | null;
};

export function getColumns(
  onEdit: (expense: Expense) => void,
  onDelete: (expense: Expense) => Promise<void>,
  displayCurrency: DisplayCurrency = "BRL",
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
      accessorKey: "value",
      header: "Valor",
      cell: ({ row }) => (
        <span className="font-medium tabular-nums text-danger">
          {formatCurrency(getDisplayValue(row.original, displayCurrency), displayCurrency)}
        </span>
      ),
    },
    {
      accessorKey: "categoryName",
      header: "Tipo",
      cell: ({ row }) => {
        const name = row.getValue("categoryName") as string | null;
        return <Badge variant="outline">{name ?? "Sin categoría"}</Badge>;
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
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.date;
        const dateB = rowB.original.date;
        if (dateA !== dateB) return dateA < dateB ? -1 : 1;
        const ca = rowA.original.createdAt ?? "";
        const cb = rowB.original.createdAt ?? "";
        return ca < cb ? -1 : ca > cb ? 1 : 0;
      },
      cell: ({ row }) => {
        const date: string = row.getValue("date");
        return formatDate(date);
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
            <Button variant="ghost" size="icon" aria-label="Editar egreso" onClick={() => onEdit(expense)}>
              <Pencil className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="Eliminar egreso">
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
                      {expense.name ?? expense.categoryName ?? "Sin categoría"}
                    </span>{" "}
                    por valor de{" "}
                    <span className="font-medium text-foreground">
                      {formatCurrency(getDisplayValue(expense, displayCurrency), displayCurrency)}
                    </span>{" "}
                    de tu registro.
                    {expense.maintenanceId && " También se eliminará el mantenimiento asociado."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <ConfirmDeleteAction onConfirm={() => onDelete(expense)} />
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];
}
