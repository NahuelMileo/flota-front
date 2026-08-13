"use client"

import { useEffect, useRef, type ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"
import { motion, useMotionValue, useSpring } from "motion/react"
import { setLenis } from "@/components/home/cinema/lenis-store"

gsap.registerPlugin(ScrollTrigger)

export function reducedMotionPref(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(-9999)
  const y = useMotionValue(-9999)
  const sx = useSpring(x, { stiffness: 90, damping: 22, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 90, damping: 22, mass: 0.6 })

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    if (!finePointer || reducedMotionPref()) return

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      className="cursor-glow"
      aria-hidden="true"
      style={{ x: sx, y: sy }}
    />
  )
}

/**
 * Global cinematic shell: Lenis smooth scrolling wired into GSAP's ticker and
 * ScrollTrigger, plus the cursor spotlight. Everything is skipped when the
 * user prefers reduced motion — native scroll and full visibility remain.
 */
export function ScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const prefersReduced = reducedMotionPref()
    if (prefersReduced) return

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      smoothWheel: true,
      touchMultiplier: 1.4,
    })
    setLenis(lenis)

    lenis.on("scroll", ScrollTrigger.update)
    const onTick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    // Re-measure pins once images/fonts settle and after the hero mounts.
    const refresh = () => ScrollTrigger.refresh()
    const t = window.setTimeout(refresh, 400)
    window.addEventListener("load", refresh, { once: true })

    return () => {
      window.clearTimeout(t)
      window.removeEventListener("load", refresh)
      gsap.ticker.remove(onTick)
      setLenis(null)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <CursorGlow />
      {children}
    </>
  )
}
