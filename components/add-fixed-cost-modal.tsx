"use client"

import { useEffect, useState } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusIcon } from "lucide-react"
import { FIXED_EXPENSE_TYPES } from "@/lib/expense-types"

type Truck = { id: string; licensePlate: string; model?: string }

const MONTHS_OPTIONS = [
  { label: "Enero", value: "1" },
  { label: "Febrero", value: "2" },
  { label: "Marzo", value: "3" },
  { label: "Abril", value: "4" },
  { label: "Mayo", value: "5" },
  { label: "Junio", value: "6" },
  { label: "Julio", value: "7" },
  { label: "Agosto", value: "8" },
  { label: "Septiembre", value: "9" },
  { label: "Octubre", value: "10" },
  { label: "Noviembre", value: "11" },
  { label: "Diciembre", value: "12" },
]

const schema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    expenseType: z.string().min(1, "Seleccioná un tipo"),
    amount: z.number().positive("El valor debe ser mayor a 0"),
    scope: z.enum(["PerTruck", "CompanyWide"]),
    truckId: z.string().optional(),
    startMonth: z.string().min(1, "Seleccioná un mes"),
    startYear: z.number().int().min(2000).max(2100),
  })
  .refine(
    (d) => d.scope === "CompanyWide" || (d.truckId && d.truckId !== ""),
    { message: "Seleccioná un camión", path: ["truckId"] }
  )

type FormValues = z.infer<typeof schema>

interface AddFixedCostModalProps {
  onSuccess: () => void
}

export function AddFixedCostModal({ onSuccess }: AddFixedCostModalProps) {
  const [open, setOpen] = useState(false)
  const [trucks, setTrucks] = useState<Truck[]>([])

  useEffect(() => {
    if (!open) return
    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/trucks`)
      .then((r) => r.json())
      .then((data) => setTrucks(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Error al cargar camiones"))
  }, [open])

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      scope: "PerTruck",
      expenseType: "",
      truckId: "",
      startMonth: String(new Date().getMonth() + 1),
      startYear: new Date().getFullYear(),
    },
  })

  const scope = useWatch({ control, name: "scope" })
  const expenseType = useWatch({ control, name: "expenseType" })

  async function onSubmit(data: FormValues) {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/costs/templates`,
        {
          method: "POST",
          body: JSON.stringify({
            name: data.name,
            amount: data.amount,
            scope: data.scope,
            expenseType: parseInt(data.expenseType),
            truckId: data.scope === "PerTruck" ? data.truckId : null,
            startMonth: parseInt(data.startMonth),
            startYear: data.startYear,
            type: 1,
          }),
          headers: { "Content-Type": "application/json" },
        }
      )
      if (!res.ok) throw new Error()
      toast.success("Costo fijo creado")
      reset({
        scope: "PerTruck",
        expenseType: "",
        truckId: "",
        startMonth: String(new Date().getMonth() + 1),
        startYear: new Date().getFullYear(),
      })
      setOpen(false)
      onSuccess()
    } catch {
      toast.error("Error al crear costo fijo")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <PlusIcon className="size-4 mr-1" />
            Agregar costo fijo
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Nuevo costo fijo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="py-3">
            <Field>
              <Label>Nombre</Label>
              <Input {...register("name")} placeholder="Ej: Seguro del vehículo" />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field>
              <Label>Tipo</Label>
              <Select
                items={FIXED_EXPENSE_TYPES}
                value={expenseType}
                onValueChange={(v) => setValue("expenseType", v ?? "", { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {FIXED_EXPENSE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={[errors.expenseType]} />
            </Field>

            <Field>
              <Label>Monto mensual</Label>
              <Input
                {...register("amount", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="5000"
              />
              <FieldError errors={[errors.amount]} />
            </Field>

            <Controller
              name="scope"
              control={control}
              render={({ field }) => (
                <Field>
                  <Label>Alcance</Label>
                  <Select
                    items={[
                      { label: "Por camión", value: "PerTruck" },
                      { label: "Toda la empresa", value: "CompanyWide" },
                    ]}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v ?? "PerTruck")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar alcance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="PerTruck">Por camión</SelectItem>
                        <SelectItem value="CompanyWide">Toda la empresa</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[errors.scope]} />
                </Field>
              )}
            />

            <div className="flex gap-2">
              <Controller
                name="startMonth"
                control={control}
                render={({ field }) => (
                  <Field className="flex-1">
                    <Label>Mes inicio</Label>
                    <Select
                      items={MONTHS_OPTIONS}
                      value={field.value ?? ""}
                      onValueChange={(v) => field.onChange(v ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Mes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {MONTHS_OPTIONS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[errors.startMonth]} />
                  </Field>
                )}
              />
              <Field className="flex-1">
                <Label>Año inicio</Label>
                <Input
                  {...register("startYear", { valueAsNumber: true })}
                  type="number"
                  placeholder="2026"
                />
                <FieldError errors={[errors.startYear]} />
              </Field>
            </div>

            {scope === "PerTruck" && (
              <Controller
                name="truckId"
                control={control}
                render={({ field }) => (
                  <Field>
                    <Label>Camión</Label>
                    <Select
                      items={trucks.map((t) => ({
                        label: `${t.licensePlate}${t.model ? ` — ${t.model}` : ""}`,
                        value: t.id,
                      }))}
                      value={field.value ?? ""}
                      onValueChange={(v) => field.onChange(v ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar camión" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {trucks.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.licensePlate}{t.model ? ` — ${t.model}` : ""}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[errors.truckId]} />
                  </Field>
                )}
              />
            )}
          </FieldGroup>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            Crear costo fijo
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
