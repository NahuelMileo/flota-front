"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, AlertCircle } from "lucide-react";
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
import { Maintenance, MaintenanceConcept } from "@/types/maintenance";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function getDisplayValue(
  item: Pick<Maintenance, "value" | "valueUSD" | "valueBRL" | "valueUYU">,
  currency: DisplayCurrency
): number {
  if (currency === "USD") return item.valueUSD ?? item.value ?? 0;
  if (currency === "UYU") return item.valueUYU ?? item.value ?? 0;
  return item.valueBRL ?? item.value ?? 0;
}

function isMaintenanceOverdue(
  maintenance: Maintenance,
  concept: MaintenanceConcept
): boolean {
  if (!concept.lastMaintenanceDate && !concept.lastKilometers) return false;

  const now = new Date();
  const lastDate = concept.lastMaintenanceDate
    ? new Date(concept.lastMaintenanceDate)
    : null;

  if (concept.dateInterval && lastDate) {
    const daysElapsed = Math.floor(
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysElapsed > concept.dateInterval;
  }

  if (concept.kilometerInterval && concept.lastKilometers) {
    return maintenance.kilometers > concept.lastKilometers + concept.kilometerInterval;
  }

  return false;
}

export type MaintenanceRow = Maintenance & { concept: MaintenanceConcept };

export function getColumns(
  concepts: MaintenanceConcept[],
  onEdit: (maintenance: Maintenance) => void,
  onDelete: (maintenance: Maintenance) => void,
  displayCurrency: DisplayCurrency = "BRL"
): ColumnDef<MaintenanceRow>[] {
  return [
    {
      accessorKey: "conceptName",
      header: "Concepto",
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        if (type === "Preventive")
          return (
            <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
              Preventivo
            </Badge>
          );
        return (
          <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">
            Correctivo
          </Badge>
        );
      },
    },
    {
      accessorKey: "truckLicensePlate",
      header: "Camión",
      cell: ({ row }) => {
        const plate = row.getValue("truckLicensePlate") as string;
        return <Badge variant="outline">{plate}</Badge>;
      },
    },
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => {
        const date: string = row.getValue("date");
        return formatDate(date);
      },
    },
    {
      accessorKey: "kilometers",
      header: "Km",
    },
    {
      accessorKey: "value",
      header: "Valor",
      cell: ({ row }) => {
        const value = row.original.value;
        if (!value) return <span className="text-muted-foreground">—</span>;
        const displayVal = getDisplayValue(row.original, displayCurrency);
        return formatCurrency(displayVal, displayCurrency);
      },
    },
    {
      id: "overdue",
      header: "",
      cell: ({ row }) => {
        const concept = concepts.find((c) => c.id === row.original.conceptId);
        if (!concept || !isMaintenanceOverdue(row.original, concept))
          return null;

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </TooltipTrigger>
              <TooltipContent>Intervalo de mantenimiento vencido</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const maintenance = row.original;
        return (
          <div key={maintenance.id} className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(maintenance)}
            >
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
                  <AlertDialogTitle>¿Eliminar mantenimiento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => onDelete(maintenance)}
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
