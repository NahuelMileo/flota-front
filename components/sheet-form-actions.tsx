"use client"

import { Button } from "@/components/ui/button"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

type Props = {
  submitLabel: string
  isSubmitting: boolean
  /** Texto mientras se envía; por defecto "Guardando...". */
  submittingLabel?: string
}

/**
 * Acciones de un formulario dentro de un sheet. Van pegadas abajo y no al final del
 * contenido: en un formulario de ocho campos, el botón de guardar quedaba fuera de
 * pantalla y había que scrollear para encontrarlo. Cancelar explícito, porque la X de
 * la esquina no se lee como "descartar lo que escribí".
 */
export function SheetFormActions({
  submitLabel,
  isSubmitting,
  submittingLabel = "Guardando...",
}: Props) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-6 flex gap-2 border-t bg-background px-4 py-3">
      <SheetPrimitive.Close
        render={
          <Button type="button" variant="ghost" className="flex-1" disabled={isSubmitting}>
            Cancelar
          </Button>
        }
      />
      <Button type="submit" className="flex-1" disabled={isSubmitting}>
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </div>
  )
}
