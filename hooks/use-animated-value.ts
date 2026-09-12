"use client"

import { useEffect, useRef, useState } from "react"

function prefersReducedMotion() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Lleva un número desde el valor anterior hasta el nuevo con un tween propio.
 *
 * A diferencia del contador de la landing (`components/home/cinema/animated-number.tsx`),
 * que cuenta desde cero al entrar en viewport, este anima *entre* valores: en el
 * dashboard lo que importa es el momento en que la cifra cambia — al cambiar de mes, de
 * moneda o al cobrar algo — no la primera vez que se ve.
 *
 * Mientras no hay tween en curso devuelve el valor tal cual, así que el primer render
 * (y el de reduced motion, y el del servidor) ya tiene la cifra correcta.
 */
export function useAnimatedValue(value: number, duration = 420): number {
  const [tweened, setTweened] = useState<number | null>(null)
  const fromRef = useRef(value)
  const currentRef = useRef(value)

  useEffect(() => {
    const from = fromRef.current
    fromRef.current = value
    currentRef.current = value

    const skip =
      from === value ||
      !Number.isFinite(from) ||
      !Number.isFinite(value) ||
      prefersReducedMotion()
    if (skip) return

    const start = performance.now()
    const delta = value - from
    let frame = 0

    function step(now: number) {
      const t = Math.min((now - start) / duration, 1)
      // La misma curva que var(--ease-emphasis): arranca rápido y frena largo.
      const eased = 1 - Math.pow(1 - t, 3)
      currentRef.current = from + delta * eased
      if (t < 1) {
        setTweened(currentRef.current)
        frame = requestAnimationFrame(step)
      } else {
        // Terminado: se vuelve a renderizar el valor real, sin intermediarios.
        setTweened(null)
      }
    }

    frame = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frame)
      // Si el valor vuelve a cambiar a mitad del tween, el siguiente arranca de donde
      // quedó la animación y no del valor viejo: cambiar de mes rápido no salta.
      fromRef.current = currentRef.current
    }
  }, [value, duration])

  return tweened ?? value
}
