"use client"

import { useAnimatedValue } from "@/hooks/use-animated-value"
import { formatCurrency } from "@/lib/format"
import { useCurrency } from "@/context/currency-context"

/**
 * Una cifra que transiciona cuando cambia el dato que la alimenta: al cambiar el mes del
 * filtro global, al cambiar la moneda de visualización, al cobrar un flete. Sin esto el
 * número salta y no queda claro que lo de abajo se recalculó.
 *
 * Lo que se anima es siempre el valor ya convertido: el tween pasa por importes
 * intermedios que no existen, así que el número real va aparte para el lector de
 * pantalla y el texto que corre queda oculto.
 */
export function AnimatedFigure({
  value,
  format,
  className,
}: {
  value: number
  format: (value: number) => string
  className?: string
}) {
  const animated = useAnimatedValue(value)
  const isSettled = animated === value

  return (
    <span className={className}>
      <span aria-hidden={!isSettled}>{format(animated)}</span>
      {!isSettled && <span className="sr-only">{format(value)}</span>}
    </span>
  )
}

/** La variante que usan casi todas las pantallas: un monto en la moneda de visualización. */
export function AnimatedCurrency({ value, className }: { value: number; className?: string }) {
  const { displayCurrency } = useCurrency()
  return (
    <AnimatedFigure
      value={value}
      format={(v) => formatCurrency(v, displayCurrency)}
      className={className}
    />
  )
}

/** Porcentajes (margen, variación): se redondean, así que el tween se ve entero. */
export function AnimatedPercent({
  value,
  withSign = false,
  className,
}: {
  value: number
  withSign?: boolean
  className?: string
}) {
  return (
    <AnimatedFigure
      value={value}
      format={(v) => `${withSign && value >= 0 ? "+" : ""}${Math.round(v)}%`}
      className={className}
    />
  )
}
