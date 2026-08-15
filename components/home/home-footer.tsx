import Link from "next/link"
import { Wordmark } from "@/components/home/wordmark"
import { LiveDot } from "@/components/home/live-dot"
import { SITE_CONFIG } from "@/lib/site-config"

const FOOTER_SECTIONS = [
  {
    title: "Producto",
    links: [
      { label: "Producto", href: "#producto" },
      { label: "Cómo funciona", href: "#como-funciona" },
      { label: "Precios", href: "#precios" },
    ],
  },
  {
    title: "Funcionalidades",
    links: [
      { label: "Funcionalidades", href: "#funcionalidades" },
      { label: "Preguntas frecuentes", href: "#faq" },
    ],
  },
  {
    title: "Cuenta",
    links: [{ label: "Iniciar sesión", href: "/login" }],
  },
  {
    title: "Legal",
    links: [
      { label: "Política de privacidad", href: "/privacidad" },
      { label: "Términos", href: "/terminos" },
    ],
  },
] as const

export function HomeFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--home-border)]">
      <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-4 inline-flex items-center gap-2">
              <Wordmark />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--home-text-tertiary)]">
              Gestión para empresas de transporte. Viajes, costos, ingresos y
              rentabilidad por camión en un solo lugar.
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <nav key={section.title} aria-label={`Sección ${section.title}`}>
              <h3 className="mb-3 font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--home-text-tertiary)]">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--home-text-tertiary)] transition-colors hover:text-[var(--home-text)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Sección Contacto">
            <h3 className="mb-3 font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--home-text-tertiary)]">
              Contacto
            </h3>
            <a
              href={`mailto:${SITE_CONFIG.contactEmail}`}
              className="text-sm text-[var(--home-text-tertiary)] transition-colors hover:text-[var(--home-text)]"
            >
              {SITE_CONFIG.contactEmail}
            </a>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[var(--home-border)] pt-6 text-xs text-[var(--home-text-tertiary)] sm:flex-row">
          <p>© {year} KilometrIA — Gestión para empresas de transporte.</p>
          <div className="flex items-center gap-2">
            <LiveDot />
            <span className="font-[family-name:var(--font-jetbrains-mono)] tracking-wide">En validación con empresas del sector</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
