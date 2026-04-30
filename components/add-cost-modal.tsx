"use client"

import { useState } from "react"
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
import { FIXED_EXPENSE_TYPES } from "@/lib/expense-types"

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
  expenseType: z.string().min(1, "Seleccioná un tipo"),
  startMonth: z.string().min(1, "Seleccioná un mes"),
  startYear: z.number().int().min(2000).max(2100),
})

const singleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  expenseType: z.string().min(1, "Seleccioná un tipo"),
  amount: z.number().positive("El valor debe ser mayor a 0"),
  month: z.string().min(1, "Seleccioná un mes"),
  year: z.number().int().min(2000).max(2100),
})

const installmentsSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  expenseType: z.string().min(1, "Seleccioná un tipo"),
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
  onSuccess,
}: {
  truckId: string
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
      expenseType: "",
      startMonth: String(new Date().getMonth() + 1),
      startYear: new Date().getFullYear(),
    },
  })

  const fixedExpenseType = useWatch({ control, name: "expenseType" })

  async function onSubmit(data: FixedFormValues) {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/costs/templates`,
        {
          method: "POST",
          body: JSON.stringify({
            ...data,
            truckId,
            type: 1,
            expenseType: parseInt(data.expenseType),
            startMonth: parseInt(data.startMonth),
          }),
          headers: { "Content-Type": "application/json" },
        }
      )
      if (!res.ok) throw new Error()
      toast.success("Costo fijo creado")
      reset()
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
          <Label>Tipo</Label>
          <Select
            items={FIXED_EXPENSE_TYPES}
            value={fixedExpenseType}
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
      </FieldGroup>
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        Crear costo fijo
      </Button>
    </form>
  )
}

function VariableCostForm({
  truckId,
  defaultYear,
  onSuccess,
}: {
  truckId: string
  defaultYear: number
  onSuccess: () => void
}) {
  const [paymentType, setPaymentType] = useState<"single" | "installments">("single")

  const singleForm = useForm({
    resolver: zodResolver(singleSchema),
    defaultValues: { year: defaultYear, month: "", expenseType: "" },
  })

  const installmentsForm = useForm({
    resolver: zodResolver(installmentsSchema),
    defaultValues: { startYear: defaultYear, startMonth: "", expenseType: "" },
  })

  const singleExpenseType = useWatch({ control: singleForm.control, name: "expenseType" })
  const installmentsExpenseType = useWatch({ control: installmentsForm.control, name: "expenseType" })

  async function onSubmitSingle(data: SingleFormValues) {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/costs/entries`,
        {
          method: "POST",
          body: JSON.stringify({
            name: data.name,
            expenseType: parseInt(data.expenseType),
            amount: data.amount,
            month: parseInt(data.month),
            year: data.year,
            truckId,
          }),
          headers: { "Content-Type": "application/json" },
        }
      )
      if (!res.ok) throw new Error()
      toast.success("Costo variable creado")
      singleForm.reset({ year: defaultYear, month: "", expenseType: "" })
      onSuccess()
    } catch {
      toast.error("Error al crear costo variable")
    }
  }

  async function onSubmitInstallments(data: InstallmentsFormValues) {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/costs/installments`,
        {
          method: "POST",
          body: JSON.stringify({
            name: data.name,
            expenseType: parseInt(data.expenseType),
            totalAmount: data.totalAmount,
            installmentCount: data.installmentCount,
            startMonth: parseInt(data.startMonth),
            startYear: data.startYear,
            truckId,
          }),
          headers: { "Content-Type": "application/json" },
        }
      )
      if (!res.ok) throw new Error()
      toast.success("Plan de cuotas creado")
      installmentsForm.reset({ startYear: defaultYear, startMonth: "", expenseType: "" })
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
            <Field>
              <Label>Nombre</Label>
              <Input
                {...singleForm.register("name")}
                placeholder="Ej: Reparación de motor"
              />
              <FieldError errors={[singleForm.formState.errors.name]} />
            </Field>
            <Field>
              <Label>Tipo</Label>
              <Select
                items={FIXED_EXPENSE_TYPES}
                value={singleExpenseType}
                onValueChange={(v) => singleForm.setValue("expenseType", v ?? "", { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {FIXED_EXPENSE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={[singleForm.formState.errors.expenseType]} />
            </Field>
            <Field>
              <Label>Monto</Label>
              <Input
                {...singleForm.register("amount", { valueAsNumber: true })}
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
                  {...singleForm.register("year", { valueAsNumber: true })}
                  type="number"
                  placeholder="2025"
                />
                <FieldError errors={[singleForm.formState.errors.year]} />
              </Field>
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
            <Field>
              <Label>Nombre</Label>
              <Input
                {...installmentsForm.register("name")}
                placeholder="Ej: Financiamiento neumáticos"
              />
              <FieldError errors={[installmentsForm.formState.errors.name]} />
            </Field>
            <Field>
              <Label>Tipo</Label>
              <Select
                items={FIXED_EXPENSE_TYPES}
                value={installmentsExpenseType}
                onValueChange={(v) => installmentsForm.setValue("expenseType", v ?? "", { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {FIXED_EXPENSE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={[installmentsForm.formState.errors.expenseType]} />
            </Field>
            <Field>
              <Label>Monto total</Label>
              <Input
                {...installmentsForm.register("totalAmount", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="60000"
              />
              <FieldError errors={[installmentsForm.formState.errors.totalAmount]} />
            </Field>
            <Field>
              <Label>Cantidad de cuotas</Label>
              <Input
                {...installmentsForm.register("installmentCount", { valueAsNumber: true })}
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
                  {...installmentsForm.register("startYear", { valueAsNumber: true })}
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
  truckId: string
  year: number
  onSuccess: () => void
}

export function AddCostModal({ truckId, year, onSuccess }: AddCostModalProps) {
  const [open, setOpen] = useState(false)

  function handleSuccess() {
    setOpen(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><PlusIcon className="size-4 mr-1" />Agregar costo</Button>} />
      <DialogContent className="sm:max-w-md overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Agregar costo</DialogTitle>
        </DialogHeader>
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
            <FixedCostForm truckId={truckId} onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="variable">
            <VariableCostForm
              truckId={truckId}
              defaultYear={year}
              onSuccess={handleSuccess}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
