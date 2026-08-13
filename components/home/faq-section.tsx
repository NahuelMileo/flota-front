import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "@/components/ui/accordion"
import { Reveal } from "@/components/home/reveal"
import { Eyebrow } from "@/components/home/live-dot"

const FAQS = [
  {
    question: "¿KilometrIA sirve para empresas con pocos camiones?",
    answer:
      "Sí. El producto está pensado inicialmente para operaciones pequeñas y medianas que necesitan ordenar su información sin implementar un sistema complejo.",
  },
  {
    question: "¿Puedo trabajar con reales, dólares y pesos uruguayos?",
    answer:
      "Sí. KilometrIA permite registrar movimientos en UYU, BRL y USD y consultar los resultados de forma clara.",
  },
  {
    question: "¿Necesito instalar algo?",
    answer: "No. Se accede desde el navegador y funciona en computadoras, tablets y celulares modernos.",
  },
  {
    question: "¿Puedo importar información desde Excel?",
    answer:
      "La importación depende de la estructura de la planilla. Durante la implementación se revisa qué información puede migrarse.",
  },
  {
    question: "¿Cómo se calcula el costo por kilómetro?",
    answer:
      "Se consideran los egresos asociados al vehículo y los kilómetros recorridos durante el período seleccionado. También pueden incorporarse costos fijos recurrentes.",
  },
  {
    question: "¿Puedo controlar cada camión por separado?",
    answer: "Sí. Los viajes, ingresos, egresos, mantenimientos y métricas pueden analizarse por vehículo.",
  },
  {
    question: "¿KilometrIA reemplaza mi sistema contable?",
    answer:
      "No necesariamente. KilometrIA está orientado a la gestión operativa y al análisis de rentabilidad de la flota. Puede complementar el trabajo contable de la empresa.",
  },
  {
    question: "¿Qué funcionalidades están disponibles actualmente?",
    answer:
      "La disponibilidad exacta depende de la versión del producto. La demo muestra claramente qué módulos están implementados y cuáles están en desarrollo.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-24 sm:py-32" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-[760px] px-5 sm:px-8">
        <Reveal className="mb-12 text-center">
          <Eyebrow className="mb-5 justify-center">PREGUNTAS FRECUENTES</Eyebrow>
          <h2
            id="faq-heading"
            className="text-[clamp(28px,3.6vw,40px)] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--home-text)]"
          >
            Lo que suelen preguntarnos
          </h2>
        </Reveal>

        <Reveal delay={150}>
          <Accordion className="rounded-[14px] border border-[var(--home-border)] bg-[var(--home-surface)] px-6">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question} className="border-[var(--home-border)]">
                <AccordionTrigger className="text-[var(--home-text)] hover:text-[var(--home-accent)]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionPanel className="text-[var(--home-text-secondary)]">{faq.answer}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}
