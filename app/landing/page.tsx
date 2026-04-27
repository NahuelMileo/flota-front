import type { Metadata } from "next"
import { LandingNav } from "@/components/landing/landing-nav"
import { HeroSection } from "@/components/landing/hero-section"
import { ProblemSection } from "@/components/landing/problem-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { KPISection } from "@/components/landing/kpi-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { CTASection } from "@/components/landing/cta-section"
import { LandingFooter } from "@/components/landing/landing-footer"

export const metadata: Metadata = {
  title: "Mileo Express — Gestión inteligente de flotas de transporte",
  description:
    "Controlá ingresos, egresos y KPIs por camión en tiempo real. La plataforma de analytics para empresas de transporte que toman decisiones con datos.",
  keywords: [
    "gestión de flota",
    "analytics de transporte",
    "costo por km",
    "utilidad por camión",
    "software logística",
    "transporte de cargas",
  ],
  openGraph: {
    title: "Mileo Express — Gestión inteligente de flotas",
    description:
      "Plataforma de analytics para empresas de transporte. KPIs en tiempo real, parsing de comprobantes con IA y más.",
    type: "website",
    locale: "es_UY",
  },
}

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <KPISection />
        <HowItWorks />
        <CTASection />
      </main>
      <LandingFooter />
    </>
  )
}
