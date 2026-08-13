import type Lenis from "lenis"

// Module-level handle so anchor links (nav / footer / CTAs) can request a
// smooth scroll through the same Lenis instance the page is running on.
let instance: Lenis | null = null

export function setLenis(lenis: Lenis | null) {
  instance = lenis
}

export function getLenis(): Lenis | null {
  return instance
}

export function scrollToTarget(target: string | HTMLElement | null, offset = -76) {
  if (!target) return
  if (instance) {
    instance.scrollTo(target, { offset })
    return
  }
  if (typeof target === "string") {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" })
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}
