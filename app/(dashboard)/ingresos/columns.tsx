"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
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
} from "@/components/ui/alert-dialog"

export type Income = {
  id: string
  description: string
  value: number,
  dateUtc: string
}

export function getColumns(
  onEdit: (income: Income) => void,
  onDelete: (income: Income) => void
): ColumnDef<Income>[] {
  return [
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      accessorKey: "value",
      header: "Valor",
    },
   {
  accessorKey: "dateUtc",
  header: "Fecha",
  cell: ({ row }) => {
    const date: string = row.getValue("dateUtc");
    return new Date(date).toLocaleDateString("es-UY");
  },
},
    {
      id: "actions",
      cell: ({ row }) => {
        const income = row.original
        return (
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(income)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>} />
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar camión?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará el camión <span className="font-medium text-foreground">{income.description}</span> de tu flota.
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
        )
      },
    },
  ]
}