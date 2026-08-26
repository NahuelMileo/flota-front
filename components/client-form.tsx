"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import type { Client } from "@/types/client"

export const clientSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),
})

export type ClientFormValues = z.infer<typeof clientSchema>

export function ClientForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Guardar",
}: {
  defaultValues?: Partial<Client>
  onSubmit: (data: ClientFormValues) => Promise<void>
  isSubmitting: boolean
  submitLabel?: string
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="py-3">
        <Field>
          <Label>Nombre</Label>
          <Input {...register("name")} placeholder="Nombre del cliente" />
          <FieldError errors={[errors.name]} />
        </Field>
      </FieldGroup>
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {submitLabel}
      </Button>
    </form>
  )
}
