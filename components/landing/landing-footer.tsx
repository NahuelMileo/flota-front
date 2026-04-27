import Link from "next/link"
import { Truck } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const FOOTER_SECTIONS = {
  Producto: [
    { label: "Características", href: "#features" },
    { label: "Cómo funciona", href: "#how-it-works" },
    { label: "Métricas", href: "#kpis" },
  ],
  Acceso: [
    { label: "Iniciar sesión", href: "/login" },
    { label: "Crear cuenta", href: "/signup" },
  ],
  Soporte: [
    { label: "Contacto", href: "mailto:soporte@mileoexpress.com" },
    // { label: "Documentación", href: "/docs" },   // enable when ready
    // { label: "Changelog", href: "/changelog" },  // enable when ready
  ],
} as const

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/landing" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Truck className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="font-semibold">Mileo Express</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Plataforma de gestión y analytics para empresas de transporte de
              cargas. KPIs en tiempo real, sin hojas de cálculo.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(FOOTER_SECTIONS).map(([section, links]) => (
            <nav key={section} aria-label={`Sección ${section}`}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {section}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>© 2025 Mileo Express. Todos los derechos reservados.</p>
          <p>Construido para empresas de transporte de cargas.</p>
        </div>
      </div>
    </footer>
  )
}
