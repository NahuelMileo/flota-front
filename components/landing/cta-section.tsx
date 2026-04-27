import Link from "next/link"
import { ArrowRight, CalendarDays } from "lucide-react"
import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"

export function CTASection() {
  return (
    <section className="py-20 sm:py-24" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card px-8 py-14 text-center shadow-sm sm:px-14">

          <h2
            id="cta-heading"
            className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Empezá a controlar tu flota hoy
          </h2>

          <p className="mb-8 text-muted-foreground leading-relaxed">
            14 días sin costo. Sin tarjeta de crédito requerida.
            Configuración en menos de 10 minutos.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "lg" }), "gap-2")}
            >
              Crear cuenta gratis
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            {/* TODO: replace href with actual demo booking URL (e.g. Calendly) */}
            <a
              href="mailto:demo@mileoexpress.com"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Solicitar una demo
            </a>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            ¿Tenés preguntas?{" "}
            <a
              href="mailto:soporte@mileoexpress.com"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Escribinos directamente.
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
