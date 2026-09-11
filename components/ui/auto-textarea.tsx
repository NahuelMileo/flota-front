"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Campo de texto que arranca con la altura de un input y crece a medida que se escribe.
 * Para notas de una línea (una ruta, una aclaración), un textarea de alto fijo deja un
 * hueco muerto en el formulario y rompe el ritmo del resto de los campos.
 */
const AutoTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, onChange, ...props }, forwardedRef) => {
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null)

  function resize(el: HTMLTextAreaElement) {
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }

  // Al montar (y cuando cambia el valor desde afuera, como al abrir el form de edición)
  // hay que medir de nuevo: el contenido ya está puesto sin que haya pasado un onChange.
  React.useLayoutEffect(() => {
    if (innerRef.current) resize(innerRef.current)
  }, [props.value, props.defaultValue])

  return (
    <textarea
      ref={(node) => {
        innerRef.current = node
        if (typeof forwardedRef === "function") forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      }}
      rows={1}
      onChange={(e) => {
        resize(e.currentTarget)
        onChange?.(e)
      }}
      className={cn(
        "min-h-8 w-full resize-none overflow-hidden rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
})
AutoTextarea.displayName = "AutoTextarea"

export { AutoTextarea }
