import type { Metadata } from "next"
import { Landing } from "@/components/marketing/landing"

const TITLE = "Kilometría — Sabé cuánto te deja cada camión"

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Gestión para empresas de transporte de carga: fletes, adelantos, saldos, peajes, gastos, mantenimientos y vencimientos en un solo lugar.",
  openGraph: {
    title: TITLE,
    description: "Fletes, adelantos, saldos, peajes y gastos en un solo lugar. En pesos, reales o dólares.",
    type: "website",
    locale: "es_UY",
  },
}

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Kilometría",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "es-UY",
  description: "Gestión de fletes, cuentas a cobrar, rentabilidad por camión, mantenimientos y vencimientos para empresas de transporte de carga.",
}

export default function UruguayLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <Landing locale="es" />
    </>
  )
}
