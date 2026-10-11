import type { Metadata } from "next"
import { Landing } from "@/components/marketing/landing"

const TITLE = "Kilometría — Saiba quanto cada caminhão te dá de lucro"

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Gestão para transportadoras de carga: fretes, adiantamentos, saldos, pedágios, despesas, manutenções e vencimentos em um só lugar.",
  openGraph: {
    title: TITLE,
    description: "Fretes, adiantamentos, saldos, pedágios e despesas em um só lugar. Em real, peso ou dólar.",
    type: "website",
    locale: "pt_BR",
  },
}

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Kilometría",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "pt-BR",
  description: "Gestão de fretes, contas a receber, rentabilidade por caminhão, manutenções e vencimentos para transportadoras de carga.",
}

export default function BrazilLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <Landing locale="pt" />
    </>
  )
}
