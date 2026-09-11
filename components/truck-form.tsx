"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Info, Palette } from "lucide-react"
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
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Elegí un color válido")
    .optional(),
})

// La paleta del Excel que este sistema reemplaza: cada camión se reconoce por su
// color antes que por la patente.
const TRUCK_COLORS = [
  { label: "Verde agua", value: "#4FD1C5" },
  { label: "Amarillo", value: "#F6E05E" },
  { label: "Rosado", value: "#F687B3" },
  { label: "Gris", value: "#A0AEC0" },
  { label: "Celeste", value: "#63B3ED" },
  { label: "Naranja", value: "#F6AD55" },
  { label: "Violeta", value: "#B794F4" },
  { label: "Verde", value: "#68D391" },
]

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
    setValue,
    watch,
    formState: { errors },
  } = useForm<TruckFormValues>({
    resolver: zodResolver(truckSchema),
    defaultValues: {
      licensePlate: defaultValues?.licensePlate ?? "",
      model: defaultValues?.model ?? "",
      year: defaultValues?.year,
      estimatedMonthlyKm: defaultValues?.estimatedMonthlyKm,
      color: defaultValues?.color ?? undefined,
    },
  })

  const selectedColor = watch("color")
  // El picker nativo devuelve el hex en minúscula y la paleta está en mayúscula:
  // sin normalizar, elegir un color de la paleta con el picker no lo resaltaría.
  const sameColor = (a?: string, b?: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase()
  const isCustomColor = !!selectedColor && !TRUCK_COLORS.some((c) => sameColor(c.value, selectedColor))

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
        <Field>
          <Label>Color</Label>
          <div className="flex flex-wrap items-center gap-2">
            {TRUCK_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                title={color.label}
                aria-label={color.label}
                aria-pressed={sameColor(selectedColor, color.value)}
                onClick={() =>
                  setValue(
                    "color",
                    sameColor(selectedColor, color.value) ? undefined : color.value,
                    { shouldValidate: true },
                  )
                }
                className={`size-7 rounded-full border-2 transition ${
                  sameColor(selectedColor, color.value)
                    ? "border-foreground scale-110"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: color.value }}
              />
            ))}

            {/* Para cualquier color fuera de la paleta. El input nativo siempre tiene
                un valor, así que cuando el camión no tiene color arranca en negro pero
                no lo asigna hasta que el usuario elige uno. */}
            <label
              title="Elegir otro color"
              className="relative size-7 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/50 hover:border-foreground"
              style={isCustomColor ? { backgroundColor: selectedColor, borderStyle: "solid" } : undefined}
            >
              <span className="sr-only">Elegir otro color</span>
              <input
                type="color"
                value={selectedColor ?? "#000000"}
                onChange={(e) => setValue("color", e.target.value, { shouldValidate: true })}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
              {!isCustomColor && (
                <Palette
                  aria-hidden
                  className="pointer-events-none absolute inset-0 m-auto size-3.5 text-muted-foreground"
                />
              )}
            </label>

            {selectedColor && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => setValue("color", undefined, { shouldValidate: true })}
              >
                Sin color
              </Button>
            )}
          </div>
          <FieldError errors={[errors.color]} />
        </Field>
      </FieldGroup>
      <Button className="w-full border-primary" disabled={isSubmitting} type="submit">
        {submitLabel}
      </Button>
    </form>
  )
}
