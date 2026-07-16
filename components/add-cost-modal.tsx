"use client"

import { useState, useEffect } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
import type { Truck } from "@/types/truck"
import type { ExpenseCategory } from "@/types/expense-category"

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

const fixedSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  amount: z.number().positive("El valor debe ser mayor a 0"),
  scope: z.enum(["PerTruck", "CompanyWide"]),
  expenseCategoryId: z
    .string()
    .nullable()
    .refine((v) => v !== null && v !== "none", { message: "La categoría es requerida" }),
  startMonth: z.string().min(1, "Seleccioná un mes"),
  startYear: z.number().int().min(2000).max(2100),
})

type FixedFormValues = z.infer<typeof fixedSchema>

function FixedCostForm({
  truckId,
  trucks,
  categories,
  onSuccess,
}: {
  truckId?: string
  trucks?: Truck[]
  categories: ExpenseCategory[]
  onSuccess: () => void
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(fixedSchema),
    defaultValues: {
      scope: "PerTruck" as const,
      expenseCategoryId: null as string | null,
      startMonth: String(new Date().getMonth() + 1),
      startYear: new Date().getFullYear(),
    },
  })

  const expenseCategoryId = useWatch({ control, name: "expenseCategoryId" })
  const scope = useWatch({ control, name: "scope" })
  const [selectedTruckId, setSelectedTruckId] = useState<string>("")

  const categoryItems = categories.map((c) => ({ label: c.name, value: c.id }))

  async function onSubmit(data: FixedFormValues) {
    const resolvedTruckId = truckId ?? (data.scope === "PerTruck" ? selectedTruckId || null : null)
    try {
      const res = await fetchWithAuth(
        `/api/costs/templates`,
        {
          method: "POST",
          body: JSON.stringify({
            ...data,
            truckId: resolvedTruckId,
            expenseCategoryId: data.expenseCategoryId === "none" ? null : data.expenseCategoryId,
            startMonth: parseInt(data.startMonth),
          }),
          headers: { "Content-Type": "application/json" },
        }
      )
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Error al crear costo fijo") }
      toast.success("Costo fijo creado")
      reset()
      setSelectedTruckId("")
      onSuccess()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear costo fijo")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="py-3">
        <Field>
          <Label>Nombre</Label>
          <Input {...register("name")} placeholder="Ej: Seguro del vehículo" />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field>
          <Label>Categoría</Label>
          <Select
            items={categoryItems}
            value={expenseCategoryId ?? null}
            onValueChange={(v) => setValue("expenseCategoryId", v === "none" ? null : (v ?? null))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {categoryItems.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError errors={[errors.expenseCategoryId]} />
        </Field>
        <Field>
          <Label>Monto mensual</Label>
          <Input
            {...register("amount", {
              setValueAs: (v) => v === "" || v == null ? undefined : parseFloat(String(v)),
            })}
            type="number"
            step="0.01"
            placeholder="5000"
          />
          <FieldError errors={[errors.amount]} />
        </Field>
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
              {...register("startYear", {
                setValueAs: (v) => v === "" || v == null ? undefined : parseInt(String(v), 10),
              })}
              type="number"
              placeholder="2026"
            />
            <FieldError errors={[errors.startYear]} />
          </Field>
        </div>
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
        {!truckId && trucks && scope === "PerTruck" && (
          <Field>
            <Label>Camión</Label>
            <Select
              items={[
                { label: "Sin asignar", value: "" },
                ...trucks.map((t) => ({
                  label: `${t.licensePlate}${t.model ? ` — ${t.model}` : ""}`,
                  value: t.id,
                })),
              ]}
              value={selectedTruckId}
              onValueChange={(v) => setSelectedTruckId(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar camión (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {trucks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.licensePlate}{t.model ? ` — ${t.model}` : ""}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        )}
      </FieldGroup>
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        Crear costo fijo
      </Button>
    </form>
  )
}

interface AddCostModalProps {
  truckId?: string
  year?: number
  onSuccess: () => void
}

export function AddCostModal({ truckId, onSuccess }: AddCostModalProps) {
  const [open, setOpen] = useState(false)
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])

  useEffect(() => {
    if (!open) return
    const fetchData = async () => {
      const [trucksRes, catsRes] = await Promise.all([
        truckId ? Promise.resolve(null) : fetchWithAuth(`/api/trucks`),
        fetchWithAuth(`/api/expense-categories`),
      ])
      if (trucksRes) {
        const data = trucksRes.ok ? await trucksRes.json() : []
        setTrucks(data)
      }
      if (catsRes.ok) {
        setCategories(await catsRes.json())
      }
    }
    fetchData().catch(() => {})
  }, [open, truckId])

  function handleSuccess() {
    setOpen(false)
    onSuccess()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button size="sm"><PlusIcon className="size-4 mr-1" />Agregar costo</Button>} />
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Agregar costo fijo</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <FixedCostForm truckId={truckId} trucks={truckId ? undefined : trucks} categories={categories} onSuccess={handleSuccess} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
