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
import type { Client } from "@/types/client";

export function getColumns(
  onEdit: (client: Client) => void,
  onDelete: (client: Client) => void,
  isDeleting: boolean,
): ColumnDef<Client>[] {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Editar cliente"
              onClick={() => onEdit(client)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="Eliminar cliente">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                }
              />
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará el cliente{" "}
                    <span className="font-medium text-foreground">{client.name}</span>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={() => onDelete(client)}
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
