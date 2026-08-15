"use client"

import Link from "next/link"
import { useEffect, useState, type MouseEvent } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { DemoDialog } from "@/components/home/demo-dialog"
import { Wordmark } from "@/components/home/wordmark"
import { scrollToTarget } from "@/components/home/cinema/lenis-store"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Producto", href: "#producto" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Precios", href: "#precios" },
]

function smoothAnchorClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
  const target = href.startsWith("#") ? href : null
  if (!target) return
  const el = document.querySelector(target)
  if (!el) return
  e.preventDefault()
  scrollToTarget(target)
}

export function HomeNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>("")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.href.slice(1))).filter(
      (el): el is HTMLElement => el !== null
    )
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActive(`#${visible.target.id}`)
      },
      { rootMargin: "-45% 0px -45% 0px" }
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300",
        scrolled
          ? "border-[var(--home-border)] bg-[var(--home-bg)]/80 backdrop-blur-xl saturate-150"
          : "border-transparent bg-transparent"
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-[var(--home-accent)]"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Wordmark />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={active === link.href ? "true" : undefined}
                onClick={(e) => smoothAnchorClick(e, link.href)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[13px] font-medium tracking-tight transition-colors",
                  active === link.href
                    ? "text-[var(--home-text)]"
                    : "text-[var(--home-text-secondary)] hover:text-[var(--home-text)]"
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-[var(--home-text-secondary)] hover:bg-white/5 hover:text-[var(--home-text)]"
              )}
            >
              Iniciar sesión
            </Link>
            <DemoDialog
              trigger={
                <Button
                  size="sm"
                  className="ml-1 bg-[var(--home-accent)] text-[var(--home-accent-foreground)] shadow-[inset_0_1px_0_oklch(1_0_0/30%)] hover:bg-[var(--home-accent)]/90 hover:shadow-[0_0_0_1px_oklch(0.88_0.19_142/40%),0_0_16px_oklch(0.88_0.19_142/25%)]"
                >
                  Solicitar una demo
                </Button>
              }
            />
          </div>

          <button
            type="button"
            className="rounded-md p-2 text-[var(--home-text-secondary)] transition-colors hover:text-[var(--home-text)] md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="home-mobile-menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        id="home-mobile-menu"
        className={cn(
          "overflow-hidden border-t transition-all duration-200 ease-in-out md:hidden",
          open ? "max-h-96 border-[var(--home-border)]" : "max-h-0 border-transparent"
        )}
        aria-hidden={!open}
      >
        <nav className="bg-[var(--home-bg)] px-5 pb-4 pt-3" aria-label="Menú móvil">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  smoothAnchorClick(e, link.href)
                  setOpen(false)
                }}
                className="rounded-md px-3 py-2.5 text-sm text-[var(--home-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--home-text)]"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-[var(--home-border)] pt-3">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start text-[var(--home-text-secondary)] hover:bg-white/5 hover:text-[var(--home-text)]"
              )}
            >
              Iniciar sesión
            </Link>
            <DemoDialog
              trigger={
                <Button size="sm" className="w-full bg-[var(--home-accent)] text-[var(--home-accent-foreground)]">
                  Solicitar una demo
                </Button>
              }
            />
          </div>
        </nav>
      </div>
    </header>
  )
}
