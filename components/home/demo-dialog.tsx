"use client"

import type { ReactElement } from "react"
import { useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DemoRequestForm } from "@/components/home/demo-request-form"

// La raíz .home tiene su propia paleta (verde) y variable de fuente display.
// Los diálogos de base-ui se portan a <body> por defecto, así que se
// redirige el portal al contenedor .home para que hereden ese tema.
export function DemoDialog({ trigger }: { trigger: ReactElement }) {
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    containerRef.current = document.getElementById("home-scope")
  }, [])

  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent container={containerRef} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar una demo</DialogTitle>
          <DialogDescription>
            Contanos un poco sobre tu operación y coordinamos una demostración
            personalizada.
          </DialogDescription>
        </DialogHeader>
        <DemoRequestForm />
      </DialogContent>
    </Dialog>
  )
}
