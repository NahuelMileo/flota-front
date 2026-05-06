"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Truck } from "@/types/truck"

function toOptionalNumber(v: string) {
  if (v === "" || v == null) return undefined
  const n = Number(v)
  return isNaN(n) ? undefined : n
}

export const truckSchema = z.object({
  licensePlate: z.string().min(1, "La matrícula es requerida"),
  model: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  estimatedMonthlyKm: z.number().min(0, "Debe ser ≥ 0").optional(),
})

export type TruckFormValues = z.infer<typeof truckSchema>

export function TruckForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Guardar",
}: {
  defaultValues?: Partial<Truck>
  onSubmit: (data: TruckFormValues) => Promise<void>
  isSubmitting: boolean
  submitLabel?: string
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TruckFormValues>({
    resolver: zodResolver(truckSchema),
    defaultValues: {
      licensePlate: defaultValues?.licensePlate ?? "",
      model: defaultValues?.model ?? "",
      year: defaultValues?.year,
      estimatedMonthlyKm: defaultValues?.estimatedMonthlyKm,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="py-3">
        <Field>
          <Label>Matrícula</Label>
          <Input {...register("licensePlate")} placeholder="ABC1D23" />
          <FieldError errors={[errors.licensePlate]} />
        </Field>
        <Field>
          <Label>Modelo</Label>
          <Input {...register("model")} placeholder="Volvo FH16" />
        </Field>
        <Field>
          <Label>Año</Label>
          <Input
            {...register("year", { setValueAs: toOptionalNumber })}
            type="number"
            placeholder="2020"
          />
          <FieldError errors={[errors.year]} />
        </Field>
        <Field>
          <div className="flex items-center gap-1.5">
            <Label>Km mensuales estimados</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="size-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  Se usa para calcular el costo por km mensual
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            {...register("estimatedMonthlyKm", { setValueAs: toOptionalNumber })}
            type="number"
            min={0}
            placeholder="9000"
          />
          <FieldError errors={[errors.estimatedMonthlyKm]} />
        </Field>
      </FieldGroup>
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {submitLabel}
      </Button>
    </form>
  )
}
