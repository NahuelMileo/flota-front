"use client"

/**
 * Contenido que se está recargando pero ya tiene datos en pantalla.
 *
 * Cambiar de mes volvía a los skeletons: la pantalla se desarmaba entera y se rearmaba,
 * y como el pedido suele tardar poco, el resultado era un parpadeo. Acá los datos viejos
 * se quedan apenas apagados hasta que llegan los nuevos, y entonces las cifras
 * transicionan hasta su valor nuevo en vez de reaparecer de la nada.
 *
 * Los skeletons siguen siendo lo correcto para la primera carga, cuando no hay nada que
 * mostrar todavía.
 */
export function Refreshing({
  busy,
  children,
  className,
}: {
  busy: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      aria-busy={busy || undefined}
      className={`${busy ? "opacity-60" : "opacity-100"} transition-opacity duration-(--dur-base) ease-emphasis motion-reduce:transition-none ${className ?? ""}`}
    >
      {children}
    </div>
  )
}
