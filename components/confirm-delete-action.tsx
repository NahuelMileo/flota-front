"use client"

import { useRef, useState } from "react"
import { AlertDialogAction } from "@/components/ui/alert-dialog"

type Props = {
  onConfirm: () => Promise<unknown> | void
  label?: string
  /** Texto mientras se borra; por defecto "Eliminando...". */
  pendingLabel?: string
}

/**
 * Botón "Eliminar" de un AlertDialog de confirmación. El diálogo queda abierto hasta que
 * responde la API, y sin esto el botón no cambiaba: parecía que el click no había hecho
 * nada y daban ganas de volver a apretarlo.
 */
export function ConfirmDeleteAction({
  onConfirm,
  label = "Eliminar",
  pendingLabel = "Eliminando...",
}: Props) {
  const [isPending, setIsPending] = useState(false)
  // El estado tarda un render en deshabilitar el botón; el ref frena el doble click.
  const pendingRef = useRef(false)

  async function handleClick() {
    if (pendingRef.current) return
    pendingRef.current = true
    setIsPending(true)
    try {
      await onConfirm()
    } finally {
      pendingRef.current = false
      setIsPending(false)
    }
  }

  return (
    <AlertDialogAction
      variant="destructive"
      disabled={isPending}
      aria-busy={isPending}
      onClick={handleClick}
    >
      {isPending ? pendingLabel : label}
    </AlertDialogAction>
  )
}
