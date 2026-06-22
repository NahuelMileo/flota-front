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
import { formatDate } from "@/lib/format";
import { MaintenanceConcept } from "@/types/maintenance";

export function getColumns(
  onEdit: (concept: MaintenanceConcept) => void,
  onDelete: (concept: MaintenanceConcept) => void
): ColumnDef<MaintenanceConcept>[] {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "kilometerInterval",
      header: "Intervalo km",
      cell: ({ row }) => {
        const km = row.getValue("kilometerInterval") as number | null;
        if (!km) return <span className="text-muted-foreground">—</span>;
        return `${km.toLocaleString("es-UY")} km`;
      },
    },
    {
      accessorKey: "dateInterval",
      header: "Intervalo días",
      cell: ({ row }) => {
        const days = row.getValue("dateInterval") as number | null;
        if (!days) return <span className="text-muted-foreground">—</span>;
        return `${days} días`;
      },
    },
    {
      accessorKey: "lastMaintenanceDate",
      header: "Último mantenimiento",
      cell: ({ row }) => {
        const date = row.getValue("lastMaintenanceDate") as string | null;
        if (!date) return <span className="text-muted-foreground">Sin registros</span>;
        return formatDate(date);
      },
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const concept = row.original;
        return (
          <div key={concept.id} className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(concept)}
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
                  <AlertDialogTitle>¿Eliminar concepto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará el concepto{" "}
                    <span className="font-medium text-foreground">
                      {concept.name}
                    </span>
                    .
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => onDelete(concept)}
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
