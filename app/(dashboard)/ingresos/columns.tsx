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
import { RECEIVABLE_ITEM_LABELS, type ReceivableItemKind } from "@/types/receivable";

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
  // Presentes solo cuando el ingreso es el cobro de una cuenta a recibir.
  receivableId?: string | null;
  receivableKind?: ReceivableItemKind | null;
  receivableClientName?: string | null;
  // Egreso "Salario chofer" generado desde este ingreso, si lo hay.
  driverSalaryExpenseId?: string | null;
  driverSalaryPercentage?: number | null;
};

export function getColumns(
  onEdit: (income: Income) => void,
  onDelete: (income: Income) => Promise<void>,
  displayCurrency: DisplayCurrency = "BRL",
): ColumnDef<Income>[] {
  return [
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      // Ordena por lo que se muestra (convertido a la moneda elegida), no por el valor
      // en su moneda original: mezclar USD, BRL y UYU daba un orden sin sentido.
      id: "value",
      accessorFn: (row) => getDisplayValue(row, displayCurrency),
      header: "Valor",
      cell: ({ row }) => (
        <span className="font-medium tabular-nums text-success">
          {formatCurrency(getDisplayValue(row.original, displayCurrency), displayCurrency)}
        </span>
      ),
    },
    {
      accessorKey: "currency",
      header: "Moneda",
      cell: ({ row }) => {
        const currency = row.original.currency;
        const colorMap: Record<string, string> = {
          USD: "text-blue-600 border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400",
          BRL: "border-success-border bg-success-surface text-success",
          UYU: "text-purple-600 border-purple-300 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-400",
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
      header: "Categoría",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        const normalized = normalizeIncomeType(type);
        if (normalized === "1") return <Badge variant="outline" className="border-success-border bg-success-surface text-success">Flete</Badge>;
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
            <Button variant="ghost" size="icon" aria-label="Editar ingreso" onClick={() => onEdit(income)}>
              <Pencil className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="Eliminar ingreso">
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
                    {income.receivableId && (
                      <>
                        {" "}
                        Es el{" "}
                        <span className="font-medium text-foreground">
                          {income.receivableKind
                            ? RECEIVABLE_ITEM_LABELS[income.receivableKind].toLowerCase()
                            : "cobro"}
                        </span>{" "}
                        de la cuenta a recibir del {formatDate(income.dateUtc)}
                        {income.truckLicensePlate ? ` · ${income.truckLicensePlate}` : ""}
                        {income.receivableClientName ? ` · ${income.receivableClientName}` : ""}: si
                        lo borrás, ese ítem vuelve a figurar como no cobrado.
                      </>
                    )}
                    {income.driverSalaryExpenseId && " También se eliminará el egreso de salario del chofer."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <ConfirmDeleteAction onConfirm={() => onDelete(income)} />
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];
}
