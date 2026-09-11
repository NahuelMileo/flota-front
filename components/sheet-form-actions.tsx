"use client"

import { Button } from "@/components/ui/button"

type Props = {
  submitLabel: string
  isSubmitting: boolean
  /** Texto mientras se envía; por defecto "Guardando...". */
  submittingLabel?: string
}

/**
 * Acciones de un formulario dentro de un sheet. Van pegadas abajo y no al final del
 * contenido: en un formulario de ocho campos, el botón de guardar quedaba fuera de
 * pantalla y había que scrollear para encontrarlo. El cierre secundario queda en la X
 * del encabezado para no competir con la acción principal.
 */
export function SheetFormActions({
  submitLabel,
  isSubmitting,
  submittingLabel = "Guardando...",
}: Props) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-6 border-t bg-background px-4 py-3">
      <Button type="submit" className="w-full border-primary" disabled={isSubmitting}>
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </div>
  )
}
