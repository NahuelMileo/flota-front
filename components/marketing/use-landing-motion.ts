"use client"

import Lenis from "lenis"
import { useEffect, type RefObject } from "react"
import { EASE, fmt } from "./demo-data"

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Todo el movimiento de la landing (/br y /uy). Trabaja sobre el DOM con
 * atributos data-* (igual que la plantilla original) y Web Animations, que no
 * tocan el atributo style: así React puede volver a renderizar sin pisarlo.
 *
 * - data-reveal / data-delay: aparece con blur al entrar en pantalla.
 * - data-lines > data-line: titulares que suben línea por línea.
 * - data-grow="x|y": barras que crecen desde cero.
 * - data-count / data-dec / data-prefix: cifras que cuentan desde cero.
 * - data-demo: demos animadas (cuentas, avisos, donut, chat).
 * - data-scene / data-frag / data-step / data-scenewin: la escena fijada del problema.
 * - data-spot: brillo que sigue al mouse.
 *
 * Con prefers-reduced-motion todo queda en su estado final y no hay Lenis.
 */
export function useLandingMotion(
  rootRef: RefObject<HTMLDivElement | null>,
  lenisRef: RefObject<Lenis | null>,
  onScrolled: (scrolled: boolean) => void,
  onSaldoPaid: (paid: boolean) => void,
) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let alive = true
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
    const timers: number[] = []
    const rafs = new Set<number>()
    const cleanups: (() => void)[] = []

    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms))
    }
    const sleep = (ms: number) => new Promise<void>((resolve) => later(resolve, ms))
    const frame = (fn: FrameRequestCallback) => {
      const id = requestAnimationFrame((t) => {
        rafs.delete(id)
        fn(t)
      })
      rafs.add(id)
    }
    const listen = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
      window.addEventListener(type, fn, opts)
      cleanups.push(() => window.removeEventListener(type, fn, opts))
    }

    const q = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s)
    const qa = (s: string) => Array.from(root.querySelectorAll<HTMLElement>(s))

    // Una animación de 1 ms con fill: "forwards" congela el estado inicial
    // (oculto) sin escribir en el style del elemento.
    const holds = new WeakMap<Element, Animation>()
    const hold = (el: Element, kf: Keyframe) => {
      holds.set(el, el.animate([kf, kf], { duration: 1, fill: "forwards" }))
    }
    const release = (el: Element) => {
      holds.get(el)?.cancel()
      holds.delete(el)
    }
    const siblingIndex = (el: Element, attr: string) =>
      el.parentElement
        ? Array.from(el.parentElement.children)
            .filter((c) => c.hasAttribute(attr))
            .indexOf(el)
        : 0

    const count = (el: HTMLElement, from: number, to: number, dur: number, pre = "", dec = 0) =>
      new Promise<void>((resolve) => {
        if (reduced) {
          el.textContent = pre + fmt(to, dec)
          resolve()
          return
        }
        const t0 = performance.now()
        const step = (now: number) => {
          const t = clamp((now - t0) / dur)
          el.textContent = pre + fmt(from + (to - from) * easeOut(t), dec)
          if (t < 1 && alive) frame(step)
          else resolve()
        }
        frame(step)
      })

    // --- Demos -------------------------------------------------------------

    const loopCuentas = async (box: HTMLElement) => {
      const cursor = box.querySelector<HTMLElement>("[data-cursor]")
      const owed = box.querySelector<HTMLElement>("[data-owed]")
      if (!cursor || !owed) return
      // El total antes y después de cobrar el saldo viene del markup (cambia por país).
      const before = Number(owed.dataset.from)
      const after = Number(owed.dataset.to)
      const pre = owed.dataset.prefix ?? ""
      while (alive) {
        await sleep(1000)
        const target = box.querySelector("[data-target='1']")
        if (!target || !alive) return
        cursor.getAnimations().forEach((a) => a.cancel())
        const b = box.getBoundingClientRect()
        const r = target.getBoundingClientRect()
        const tx = r.left - b.left + 26
        const ty = r.top - b.top + 14
        const sx = b.width - 60
        const sy = b.height - 40
        await cursor.animate(
          [
            { transform: `translate(${sx}px,${sy}px)`, opacity: 0 },
            { transform: `translate(${tx}px,${ty}px)`, opacity: 1 },
          ],
          { duration: 1100, easing: EASE, fill: "forwards" },
        ).finished
        await cursor.animate(
          [
            { transform: `translate(${tx}px,${ty}px) scale(1)`, opacity: 1 },
            { transform: `translate(${tx}px,${ty}px) scale(.8)`, opacity: 1 },
            { transform: `translate(${tx}px,${ty}px) scale(1)`, opacity: 1 },
          ],
          { duration: 260, fill: "forwards" },
        ).finished
        onSaldoPaid(true)
        await sleep(40)
        box.querySelector("[data-target='1'] > *")?.animate(
          [
            { transform: "scale(.82)", opacity: 0.3, filter: "blur(3px)" },
            { transform: "scale(1)", opacity: 1, filter: "blur(0)" },
          ],
          { duration: 450, easing: EASE },
        )
        await count(owed, before, after, 1200, pre)
        await sleep(2400)
        await cursor.animate(
          [
            { transform: `translate(${tx}px,${ty}px)`, opacity: 1 },
            { transform: `translate(${tx + 20}px,${ty + 20}px)`, opacity: 0 },
          ],
          { duration: 500, easing: EASE, fill: "forwards" },
        ).finished
        await sleep(1600)
        if (!alive) return
        onSaldoPaid(false)
        owed.textContent = pre + fmt(before)
        owed.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 400 })
      }
    }

    const typeChat = async (el: HTMLElement) => {
      const qEl = el.querySelector<HTMLElement>("[data-q]")
      const aEl = el.querySelector<HTMLElement>("[data-a]")
      const bubble = el.querySelector<HTMLElement>("[data-abubble]")
      if (!qEl || !aEl || !bubble) return
      const question = qEl.dataset.text ?? ""
      const answer = aEl.dataset.text ?? ""
      await sleep(500)
      for (let i = 1; i <= question.length && alive; i++) {
        qEl.textContent = question.slice(0, i)
        await sleep(32)
      }
      await sleep(450)
      release(bubble)
      bubble.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 400, easing: EASE })
      for (let i = 1; i <= answer.length && alive; i++) {
        aEl.textContent = answer.slice(0, i)
        await sleep(18)
      }
    }

    const runDemo = (name: string | undefined, el: HTMLElement) => {
      if (reduced) return
      if (name === "cuentas") loopCuentas(el).catch(() => {})
      if (name === "chat") typeChat(el).catch(() => {})
      if (name === "avisos") {
        const bell = el.querySelector("[data-bell]")
        later(
          () =>
            bell?.animate(
              ["0", "-16deg", "13deg", "-9deg", "6deg", "-3deg", "0"].map((d) => ({ transform: `rotate(${d})` })),
              { duration: 900, easing: "ease-out" },
            ),
          250,
        )
      }
      if (name === "donut") {
        el.querySelector("[data-donut]")?.animate(
          [
            { transform: "rotate(-270deg) scale(.85)", opacity: 0 },
            { transform: "rotate(-90deg) scale(1)", opacity: 1 },
          ],
          { duration: 1200, delay: 200, easing: EASE, fill: "backwards" },
        )
      }
    }

    // --- Reveals al entrar en pantalla ------------------------------------

    const pending = new Map<Element, (() => void)[]>()
    const add = (watch: Element | null, fn: () => void) => {
      if (!watch) return
      const list = pending.get(watch)
      if (list) list.push(fn)
      else pending.set(watch, [fn])
    }

    if (!reduced) {
      const hidden: Keyframe = { opacity: 0, transform: "translateY(16px)", filter: "blur(6px)" }
      qa("[data-reveal]").forEach((el) => {
        hold(el, hidden)
        add(el, () => {
          const delay = Number(el.dataset.delay ?? 0) + Math.max(0, siblingIndex(el, "data-reveal")) * 70
          release(el)
          el.animate([hidden, { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" }], {
            duration: 600,
            delay,
            easing: EASE,
            fill: "backwards",
          })
        })
      })

      qa("[data-lines]").forEach((heading) => {
        const lines = Array.from(heading.querySelectorAll("[data-line]"))
        lines.forEach((l) => hold(l, { transform: "translateY(110%)" }))
        add(heading, () =>
          lines.forEach((l, i) => {
            release(l)
            l.animate([{ transform: "translateY(110%)" }, { transform: "translateY(0)" }], {
              duration: 900,
              delay: i * 90,
              easing: EASE,
              fill: "backwards",
            })
          }),
        )
      })

      qa("[data-grow]").forEach((el) => {
        const from = el.dataset.grow === "y" ? "scaleY(0)" : "scaleX(0)"
        hold(el, { transform: from })
        add(el.parentElement, () => {
          release(el)
          // Sin keyframe final: anima hasta el transform que ya tiene el elemento.
          el.animate([{ transform: from, offset: 0 }], {
            duration: 1100,
            delay: Number(el.dataset.delay ?? 0),
            easing: EASE,
            fill: "backwards",
          })
        })
      })

      qa("[data-count]").forEach((el) => {
        const to = parseFloat(el.dataset.count ?? "0")
        const dec = Number(el.dataset.dec ?? 0)
        const pre = el.dataset.prefix ?? ""
        el.textContent = pre + fmt(0, dec)
        add(el, () => later(() => void count(el, 0, to, 1200, pre, dec), 300))
      })
    }

    qa("[data-demo]").forEach((el) => {
      add(el, () => runDemo(el.dataset.demo, el))
      if (!reduced && el.dataset.demo === "chat") {
        const qEl = el.querySelector("[data-q]")
        const aEl = el.querySelector("[data-a]")
        const bubble = el.querySelector("[data-abubble]")
        if (qEl) qEl.textContent = ""
        if (aEl) aEl.textContent = ""
        if (bubble) hold(bubble, { opacity: 0, transform: "translateY(8px)" })
      }
    })

    const fire = (el: Element) => {
      const fns = pending.get(el)
      if (!fns) return
      pending.delete(el)
      io.unobserve(el)
      fns.forEach((fn) => fn())
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && fire(en.target)),
      { threshold: 0.2, rootMargin: "0px 0px -5% 0px" },
    )
    pending.forEach((_, el) => io.observe(el))

    // Red de seguridad: lo que ya está en pantalla y el observer no disparó.
    const checkPending = () => {
      if (!pending.size) return
      const vh = innerHeight
      Array.from(pending.keys()).forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top < vh * 0.95 && r.bottom > 0) fire(el)
      })
    }

    // --- Scroll: barra de progreso, header, tilt, escena y pasos ----------

    const progress = q("[data-progress]")
    const tilt = q("[data-tilt]")
    const sceneEl = q("[data-scene]")
    const stage = q("[data-stage]")
    const frags = qa("[data-frag]")
    const sceneWin = q("[data-scenewin]")
    const steps = qa("[data-step]")
    const stepsSec = q("[data-steps]")
    const stepLine = q<SVGElement>("[data-stepline]")
    let lastScrolled = false

    const scene = (p: number) => {
      if (!stage || !sceneWin) return
      const W = stage.clientWidth
      const H = stage.clientHeight
      const t = easeOut(clamp(p / 0.72))
      const fade = 1 - clamp((p - 0.5) / 0.22)
      frags.forEach((f) => {
        const x = (Number(f.dataset.x) * W) / 100
        const y = (Number(f.dataset.y) * H) / 100
        const r = Number(f.dataset.r)
        const z = Number(f.dataset.z) || 1
        const k = 1 - t
        f.style.transform = `translate(-50%,-50%) translate(${x * k}px, ${y * k - p * 60 * z * k}px) rotate(${r * k + Math.sin(p * 6 + z) * 2 * k}deg) scale(${1 - 0.6 * t})`
        f.style.opacity = String(fade)
      })
      const o = clamp((p - 0.58) / 0.22)
      sceneWin.style.opacity = String(o)
      sceneWin.style.transform = `translate(-50%,-50%) scale(${0.88 + 0.12 * easeOut(o)})`
      const idx = p < 0.25 ? 0 : p < 0.48 ? 1 : p < 0.7 ? 2 : 3
      steps.forEach((s, i) => {
        s.style.opacity = i === idx ? "1" : "0"
        s.style.transform = i === idx ? "translateY(0)" : `translateY(${i < idx ? -14 : 14}px)`
      })
    }

    const tick = () => {
      checkPending()
      const y = scrollY
      const vh = innerHeight
      const H = document.documentElement.scrollHeight
      if (progress) progress.style.transform = `scaleX(${clamp(y / Math.max(1, H - vh))})`
      const scrolled = y > 24
      if (scrolled !== lastScrolled) {
        lastScrolled = scrolled
        onScrolled(scrolled)
      }
      if (tilt) tilt.style.transform = reduced ? "none" : `rotateX(${8 * (1 - clamp(y / (vh * 0.55)))}deg)`
      if (sceneEl) {
        if (reduced) scene(1)
        else {
          const r = sceneEl.getBoundingClientRect()
          scene(clamp(-r.top / Math.max(1, r.height - vh)))
        }
      }
      if (stepsSec && stepLine) {
        const r = stepsSec.getBoundingClientRect()
        const p = reduced ? 1 : clamp((vh * 0.85 - r.top) / (r.height * 0.8))
        stepLine.style.strokeDashoffset = String(1 - p)
      }
    }

    let tickQueued = false
    const onScroll = () => {
      if (tickQueued) return
      tickQueued = true
      frame(() => {
        tickQueued = false
        tick()
      })
    }
    listen("scroll", onScroll, { passive: true })
    listen("resize", tick)

    // --- Brillo que sigue al mouse ----------------------------------------

    if (matchMedia("(hover: hover)").matches) {
      let last: HTMLElement | null = null
      const onMove = (e: MouseEvent) => {
        const spot = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-spot]") : null
        if (last && last !== spot) last.style.setProperty("--o", "0")
        last = spot
        if (!spot) return
        const r = spot.getBoundingClientRect()
        spot.style.setProperty("--x", `${e.clientX - r.left}px`)
        spot.style.setProperty("--y", `${e.clientY - r.top}px`)
        spot.style.setProperty("--o", "1")
      }
      document.addEventListener("mousemove", onMove, { passive: true })
      cleanups.push(() => document.removeEventListener("mousemove", onMove))
    }

    // --- Scroll suave -----------------------------------------------------

    if (!reduced) {
      const lenis = new Lenis({ lerp: 0.1 })
      lenisRef.current = lenis
      const loop = (t: number) => {
        lenis.raf(t)
        if (alive) frame(loop)
      }
      frame(loop)
      cleanups.push(() => {
        lenis.destroy()
        lenisRef.current = null
      })
    }

    checkPending()
    later(checkPending, 2500)
    tick()

    return () => {
      alive = false
      timers.forEach(clearTimeout)
      rafs.forEach(cancelAnimationFrame)
      io.disconnect()
      cleanups.forEach((fn) => fn())
    }
  }, [rootRef, lenisRef, onScrolled, onSaldoPaid])
}
