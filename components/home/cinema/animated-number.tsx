"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { reducedMotionPref } from "@/components/home/cinema/scroll-provider"

gsap.registerPlugin(ScrollTrigger)

export function formatEs(num: number, decimals = 0): string {
  return num.toLocaleString("es-UY", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Counts from `start` to `value` when scrolled into view. Renders the final
 * value server-side so the page is correct with no JS; the counting happens
 * on top once the trigger fires. Reduced motion shows the final value.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.6,
  className,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const fmt = (n: number) => `${prefix}${formatEs(n, decimals)}${suffix}`

    if (reducedMotionPref()) {
      node.textContent = fmt(value)
      return
    }

    const state = { v: 0 }
    const tween = gsap.to(state, {
      v: value,
      duration,
      ease: "power3.out",
      onUpdate: () => {
        node.textContent = fmt(state.v)
      },
    })
    tween.pause()

    const st = ScrollTrigger.create({
      trigger: node,
      start: "top 90%",
      once: true,
      onEnter: () => {
        node.textContent = fmt(0)
        tween.play()
      },
    })

    return () => {
      tween.kill()
      st.kill()
    }
  }, [value, decimals, prefix, suffix, duration])

  return (
    <span ref={ref} className={className} aria-label={formatEs(value, decimals)}>
      {`${prefix}${formatEs(value, decimals)}${suffix}`}
    </span>
  )
}
