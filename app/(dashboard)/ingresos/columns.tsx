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
import { Badge } from "@/components/ui/badge"

export type Income = {
  id: string
  description: string
  value: number,
  truckId: string,
  truckLicensePlate: string | null,
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
      cell: ({ row }) => {
        const value: number = row.getValue("value")
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        }).format(value)
      },
    },
   {
  accessorKey: "truckLicensePlate",
  header: "Camión",
  cell: ({ row }) => {
    const plate = row.getValue("truckLicensePlate") as string | null
    if (!plate) return <span className="text-muted-foreground">—</span>
    return <Badge variant="outline">{plate}</Badge>
  },
},
   {
  accessorKey: "dateUtc",
  header: "Fecha",
  cell: ({ row }) => {
    const date: string = row.getValue("dateUtc");
    return new Date(date + "T00:00:00").toLocaleDateString("es-UY");
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
                  <AlertDialogTitle>¿Eliminar ingreso?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará el ingreso <span className="font-medium text-foreground">{income.description}</span> de tu registro.
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