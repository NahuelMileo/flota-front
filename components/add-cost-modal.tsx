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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
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
  expenseCategoryId: z.string().nullable(),
  startMonth: z.string().min(1, "Seleccioná un mes"),
  startYear: z.number().int().min(2000).max(2100),
})

const singleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  expenseCategoryId: z.string().nullable(),
  amount: z.number().positive("El valor debe ser mayor a 0"),
  month: z.string().min(1, "Seleccioná un mes"),
  year: z.number().int().min(2000).max(2100),
  odometerKm: z.number().min(0, "El km debe ser 0 o mayor").optional(),
  odometerNotes: z.string().max(200).optional(),
})

const installmentsSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  expenseCategoryId: z.string().nullable(),
  totalAmount: z.number().positive("El valor debe ser mayor a 0"),
  installmentCount: z
    .number()
    .int()
    .min(2, "Mínimo 2 cuotas")
    .max(60, "Máximo 60 cuotas"),
  startMonth: z.string().min(1, "Seleccioná un mes"),
  startYear: z.number().int().min(2000).max(2100),
})

type FixedFormValues = z.infer<typeof fixedSchema>
type SingleFormValues = z.infer<typeof singleSchema>
type InstallmentsFormValues = z.infer<typeof installmentsSchema>

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

  const categoryItems = [
    { label: "Sin categoría", value: "none" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ]

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
            type: 1,
            expenseCategoryId: data.expenseCategoryId === "none" ? null : data.expenseCategoryId,
            startMonth: parseInt(data.startMonth),
          }),
          headers: { "Content-Type": "application/json" },
        }
      )
      if (!res.ok) throw new Error()
      toast.success("Costo fijo creado")
      reset()
      setSelectedTruckId("")
      onSuccess()
    } catch {
      toast.error("Error al crear costo fijo")
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
            value={expenseCategoryId ?? "none"}
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

function VariableCostForm({
  truckId,
  trucks,
  categories,
  defaultYear,
  onSuccess,
}: {
  truckId?: string
  trucks?: Truck[]
  categories: ExpenseCategory[]
  defaultYear: number
  onSuccess: () => void
}) {
  const [paymentType, setPaymentType] = useState<"single" | "installments">("single")
  const [selectedTruckId, setSelectedTruckId] = useState<string>("")

  const singleForm = useForm({
    resolver: zodResolver(singleSchema),
    defaultValues: { year: defaultYear, month: "", expenseCategoryId: null as string | null },
  })

  const installmentsForm = useForm({
    resolver: zodResolver(installmentsSchema),
    defaultValues: { startYear: defaultYear, startMonth: "", expenseCategoryId: null as string | null },
  })

  const singleCategoryId = useWatch({ control: singleForm.control, name: "expenseCategoryId" })
  const installmentsCategoryId = useWatch({ control: installmentsForm.control, name: "expenseCategoryId" })

  const categoryItems = [
    { label: "Sin categoría", value: "none" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ]

  async function onSubmitSingle(data: SingleFormValues) {
    const resolvedTruckId = truckId ?? (selectedTruckId || null)
    const odometerKm =
      data.odometerKm != null && !isNaN(data.odometerKm) ? data.odometerKm : undefined
    const payload = {
      name: data.name,
      expenseCategoryId: data.expenseCategoryId === "none" ? null : data.expenseCategoryId,
      amount: data.amount,
      month: parseInt(data.month),
      year: data.year,
      truckId: resolvedTruckId,
      ...(odometerKm != null && {
        odometerKm,
        odometerNotes: data.odometerNotes || undefined,
      }),
    }
    try {
      const res = await fetchWithAuth(
        `/api/costs/entries`,
        {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        }
      )
      if (!res.ok) {
        let errorMsg = "Error al crear costo variable"
        try {
          const errData = await res.json()
          const msg: string = errData?.message ?? ""
          if (msg.toLowerCase().includes("decrease") || msg.toLowerCase().includes("menor")) {
            errorMsg = "El kilometraje no puede ser menor al último registrado."
          } else if (msg.toLowerCase().includes("negative") || msg.toLowerCase().includes("negativo")) {
            errorMsg = "El kilometraje no puede ser negativo."
          }
        } catch { /* ignore */ }
        toast.error(errorMsg)
        return
      }
      toast.success("Costo variable creado")
      singleForm.reset({ year: defaultYear, month: "", expenseCategoryId: null })
      onSuccess()
    } catch {
      toast.error("Error al crear costo variable")
    }
  }

  async function onSubmitInstallments(data: InstallmentsFormValues) {
    const resolvedTruckId = truckId ?? (selectedTruckId || null)
    try {
      const res = await fetchWithAuth(
        `/api/costs/installments`,
        {
          method: "POST",
          body: JSON.stringify({
            name: data.name,
            expenseCategoryId: data.expenseCategoryId === "none" ? null : data.expenseCategoryId,
            totalAmount: data.totalAmount,
            installmentCount: data.installmentCount,
            startMonth: parseInt(data.startMonth),
            startYear: data.startYear,
            truckId: resolvedTruckId,
          }),
          headers: { "Content-Type": "application/json" },
        }
      )
      if (!res.ok) throw new Error()
      toast.success("Plan de cuotas creado")
      installmentsForm.reset({ startYear: defaultYear, startMonth: "", expenseCategoryId: null })
      onSuccess()
    } catch {
      toast.error("Error al crear cuotas")
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPaymentType("single")}
          className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
            paymentType === "single"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background hover:bg-muted"
          }`}
        >
          Pago único
        </button>
        <button
          type="button"
          onClick={() => setPaymentType("installments")}
          className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
            paymentType === "installments"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background hover:bg-muted"
          }`}
        >
          En cuotas
        </button>
      </div>

      {paymentType === "single" ? (
        <form onSubmit={singleForm.handleSubmit(onSubmitSingle)}>
          <FieldGroup className="py-3">
            {!truckId && trucks && (
              <Field>
                <Label>Camión (opcional)</Label>
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
                    <SelectValue placeholder="Seleccionar camión" />
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
            <Field>
              <Label>Nombre</Label>
              <Input
                {...singleForm.register("name")}
                placeholder="Ej: Reparación de motor"
              />
              <FieldError errors={[singleForm.formState.errors.name]} />
            </Field>
            <Field>
              <Label>Categoría</Label>
              <Select
                items={categoryItems}
                value={singleCategoryId ?? "none"}
                onValueChange={(v) => singleForm.setValue("expenseCategoryId", v === "none" ? null : (v ?? null))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categoryItems.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={[singleForm.formState.errors.expenseCategoryId]} />
            </Field>
            <Field>
              <Label>Monto</Label>
              <Input
                {...singleForm.register("amount", {
                  setValueAs: (v) => v === "" || v == null ? undefined : parseFloat(String(v)),
                })}
                type="number"
                step="0.01"
                placeholder="15000"
              />
              <FieldError errors={[singleForm.formState.errors.amount]} />
            </Field>
            <div className="flex gap-2">
              <Controller
                name="month"
                control={singleForm.control}
                render={({ field }) => (
                  <Field className="flex-1">
                    <Label>Mes</Label>
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
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[singleForm.formState.errors.month]} />
                  </Field>
                )}
              />
              <Field className="flex-1">
                <Label>Año</Label>
                <Input
                  {...singleForm.register("year", {
                    setValueAs: (v) => v === "" || v == null ? undefined : parseInt(String(v), 10),
                  })}
                  type="number"
                  placeholder="2025"
                />
                <FieldError errors={[singleForm.formState.errors.year]} />
              </Field>
            </div>

            <div className="border-t pt-3 flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Kilometraje <span className="font-normal normal-case">(opcional)</span>
              </p>
              <Field>
                <Label>Km actual del camión</Label>
                <Input
                  {...singleForm.register("odometerKm", {
                    setValueAs: (v) =>
                      v === "" || v === undefined ? undefined : parseFloat(v),
                  })}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ej: 125500"
                />
                <FieldError errors={[singleForm.formState.errors.odometerKm]} />
              </Field>
              <Field>
                <Label>Nota del odómetro</Label>
                <Input
                  {...singleForm.register("odometerNotes")}
                  placeholder="Ej: carga de gasoil en ruta / taller"
                />
                <FieldError errors={[singleForm.formState.errors.odometerNotes]} />
              </Field>
              <p className="text-xs text-muted-foreground">
                Si informás el kilometraje, se actualizará el km actual del camión y se guardará en el historial.
              </p>
            </div>
          </FieldGroup>
          <Button
            className="w-full"
            type="submit"
            disabled={singleForm.formState.isSubmitting}
          >
            Crear costo
          </Button>
        </form>
      ) : (
        <form onSubmit={installmentsForm.handleSubmit(onSubmitInstallments)}>
          <FieldGroup className="py-3">
            {!truckId && trucks && (
              <Field>
                <Label>Camión (opcional)</Label>
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
                    <SelectValue placeholder="Seleccionar camión" />
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
            <Field>
              <Label>Nombre</Label>
              <Input
                {...installmentsForm.register("name")}
                placeholder="Ej: Financiamiento neumáticos"
              />
              <FieldError errors={[installmentsForm.formState.errors.name]} />
            </Field>
            <Field>
              <Label>Categoría</Label>
              <Select
                items={categoryItems}
                value={installmentsCategoryId ?? "none"}
                onValueChange={(v) => installmentsForm.setValue("expenseCategoryId", v === "none" ? null : (v ?? null))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categoryItems.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={[installmentsForm.formState.errors.expenseCategoryId]} />
            </Field>
            <Field>
              <Label>Monto total</Label>
              <Input
                {...installmentsForm.register("totalAmount", {
                  setValueAs: (v) => v === "" || v == null ? undefined : parseFloat(String(v)),
                })}
                type="number"
                step="0.01"
                placeholder="60000"
              />
              <FieldError errors={[installmentsForm.formState.errors.totalAmount]} />
            </Field>
            <Field>
              <Label>Cantidad de cuotas</Label>
              <Input
                {...installmentsForm.register("installmentCount", {
                  setValueAs: (v) => v === "" || v == null ? undefined : parseInt(String(v), 10),
                })}
                type="number"
                min="2"
                max="60"
                placeholder="12"
              />
              <FieldError errors={[installmentsForm.formState.errors.installmentCount]} />
            </Field>
            <div className="flex gap-2">
              <Controller
                name="startMonth"
                control={installmentsForm.control}
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
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[installmentsForm.formState.errors.startMonth]} />
                  </Field>
                )}
              />
              <Field className="flex-1">
                <Label>Año inicio</Label>
                <Input
                  {...installmentsForm.register("startYear", {
                    setValueAs: (v) => v === "" || v == null ? undefined : parseInt(String(v), 10),
                  })}
                  type="number"
                  placeholder="2025"
                />
                <FieldError errors={[installmentsForm.formState.errors.startYear]} />
              </Field>
            </div>
          </FieldGroup>
          <Button
            className="w-full"
            type="submit"
            disabled={installmentsForm.formState.isSubmitting}
          >
            Crear plan de cuotas
          </Button>
        </form>
      )}
    </div>
  )
}

interface AddCostModalProps {
  truckId?: string
  year?: number
  onSuccess: () => void
}

export function AddCostModal({ truckId, year, onSuccess }: AddCostModalProps) {
  const [open, setOpen] = useState(false)
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const defaultYear = year ?? new Date().getFullYear()

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
          <SheetTitle>Agregar costo</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <Tabs defaultValue="fixed">
            <TabsList className="w-full">
              <TabsTrigger value="fixed" className="flex-1">
                Costo Fijo
              </TabsTrigger>
              <TabsTrigger value="variable" className="flex-1">
                Costo Variable
              </TabsTrigger>
            </TabsList>
            <TabsContent value="fixed">
              <FixedCostForm truckId={truckId} trucks={truckId ? undefined : trucks} categories={categories} onSuccess={handleSuccess} />
            </TabsContent>
            <TabsContent value="variable">
              <VariableCostForm
                truckId={truckId}
                trucks={truckId ? undefined : trucks}
                categories={categories}
                defaultYear={defaultYear}
                onSuccess={handleSuccess}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
