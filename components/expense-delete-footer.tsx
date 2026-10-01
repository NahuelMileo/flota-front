"use client"

import { useState } from "react"
import { AlertDialogCancel, AlertDialogFooter } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ConfirmDeleteAction } from "@/components/confirm-delete-action"

type Props = {
  /** Id del ingreso del que salió el egreso (salario del chofer), si lo hay. */
  incomeId?: string | null
  onConfirm: (alsoDeleteIncome: boolean) => Promise<unknown> | void
}

/**
 * Pie del diálogo "¿Eliminar egreso?". Si el egreso es el salario de un ingreso, ofrece
 * borrar también el ingreso; por defecto no, para no borrar un flete por accidente.
 */
export function ExpenseDeleteFooter({ incomeId, onConfirm }: Props) {
  const [alsoDeleteIncome, setAlsoDeleteIncome] = useState(false)

  return (
    <>
      {incomeId && (
        <div className="flex items-center gap-2">
          <Checkbox
            id={`delete-income-${incomeId}`}
            checked={alsoDeleteIncome}
            onCheckedChange={(checked) => setAlsoDeleteIncome(!!checked)}
          />
          <Label htmlFor={`delete-income-${incomeId}`} className="text-sm cursor-pointer">
            Borrar también el ingreso del que salió este salario
          </Label>
        </div>
      )}
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <ConfirmDeleteAction onConfirm={() => onConfirm(alsoDeleteIncome)} />
      </AlertDialogFooter>
    </>
  )
}
