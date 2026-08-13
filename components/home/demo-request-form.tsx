"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { SITE_CONFIG } from "@/lib/site-config"

const demoRequestSchema = z.object({
  name: z.string().min(1, "Ingresá tu nombre"),
  company: z.string().min(1, "Ingresá el nombre de tu empresa"),
  fleetSize: z.string().min(1, "Contanos cuántos camiones tenés"),
  contact: z.string().min(1, "Ingresá un teléfono o correo de contacto"),
  message: z.string().optional(),
})

type DemoRequestValues = z.infer<typeof demoRequestSchema>

// No hay todavía un endpoint propio para recibir estas solicitudes: se arma
// un mailto con los datos cargados para que el envío funcione igual.
function buildMailto(values: DemoRequestValues): string {
  const subject = `Solicitud de demo — ${values.company}`
  const body = [
    `Nombre: ${values.name}`,
    `Empresa: ${values.company}`,
    `Cantidad de camiones: ${values.fleetSize}`,
    `Contacto: ${values.contact}`,
    values.message ? `Mensaje: ${values.message}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  return `mailto:${SITE_CONFIG.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function DemoRequestForm() {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DemoRequestValues>({
    resolver: zodResolver(demoRequestSchema),
    defaultValues: { name: "", company: "", fleetSize: "", contact: "", message: "" },
  })

  function onSubmit(values: DemoRequestValues) {
    window.open(buildMailto(values), "_self")
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="size-10 text-[var(--home-accent)]" aria-hidden="true" />
        <p className="font-medium">Se abrió tu cliente de correo</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Completá el envío desde ahí. Si no se abrió automáticamente,
          escribinos a{" "}
          <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="underline underline-offset-4">
            {SITE_CONFIG.contactEmail}
          </a>
          .
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="py-2">
        <Field>
          <Label htmlFor="home-demo-name">Nombre</Label>
          <Input id="home-demo-name" {...register("name")} placeholder="Tu nombre" />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field>
          <Label htmlFor="home-demo-company">Empresa</Label>
          <Input id="home-demo-company" {...register("company")} placeholder="Nombre de tu empresa" />
          <FieldError errors={[errors.company]} />
        </Field>
        <Field>
          <Label htmlFor="home-demo-fleet-size">Cantidad de camiones</Label>
          <Input
            id="home-demo-fleet-size"
            {...register("fleetSize")}
            placeholder="Ej: 5"
            inputMode="numeric"
          />
          <FieldError errors={[errors.fleetSize]} />
        </Field>
        <Field>
          <Label htmlFor="home-demo-contact">Teléfono o correo</Label>
          <Input id="home-demo-contact" {...register("contact")} placeholder="Cómo te contactamos" />
          <FieldError errors={[errors.contact]} />
        </Field>
        <Field>
          <Label htmlFor="home-demo-message">Mensaje (opcional)</Label>
          <Textarea
            id="home-demo-message"
            {...register("message")}
            placeholder="Contanos brevemente tu situación actual"
          />
        </Field>
      </FieldGroup>
      <Button
        className="w-full rounded-[10px] bg-[var(--home-accent)] text-[var(--home-accent-foreground)] shadow-none hover:bg-[var(--home-accent)]/90"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enviando…" : "Solicitar una demo"}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Demo personalizada, sin compromiso.
      </p>
    </form>
  )
}
