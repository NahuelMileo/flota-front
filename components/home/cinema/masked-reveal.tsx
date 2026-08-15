"use client"

import { useEffect, useRef, type ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { reducedMotionPref } from "@/components/home/cinema/scroll-provider"

gsap.registerPlugin(ScrollTrigger)

/**
 * Masked line reveal for expressive headlines. Each `lines` entry is wrapped
 * in an overflow-hidden mask and slides up into place when scrolled into view.
 * With reduced motion (or no JS) the lines render fully visible — see the
 * `.mask-line` rules in globals.css.
 */
export function MaskedReveal({
  lines,
  className,
  as = "h2",
  id,
  start = "top 82%",
  stagger = 0.08,
  duration = 0.9,
}: {
  lines: ReactNode[]
  className?: string
  as?: "h1" | "h2" | "h3" | "p" | "div"
  id?: string
  start?: string
  stagger?: number
  duration?: number
}) {
  const Tag = as as "div"
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node || reducedMotionPref()) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".mask-inner",
        { yPercent: 112 },
        {
          yPercent: 0,
          duration,
          ease: "power4.out",
          stagger,
          scrollTrigger: { trigger: node, start, once: true },
        }
      )
    }, node)
    return () => ctx.revert()
  }, [start, stagger, duration])

  return (
    <Tag ref={ref} id={id} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="mask-line">
          <span className="mask-inner">{line}</span>
        </span>
      ))}
    </Tag>
  )
}
