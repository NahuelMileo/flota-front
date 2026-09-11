"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { fetchWithAuth } from "@/lib/api"
import { ProportionSummary } from "@/components/proportion-summary"
import { DataTable } from "@/components/data-table"
import { getColumns } from "./columns"
import { getTemplateDisplayAmount, monthsUntilGenerated } from "@/lib/costs"
import type { FixedCost } from "@/types/costs"
import { formatCurrency, type DisplayCurrency } from "@/lib/format"
import { useCurrency } from "@/context/currency-context"
import { useDateFilter } from "@/context/date-filter-context"

import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AlertTriangle, CalendarDays, CalendarPlus, Pencil, Power, Trash2, TruckIcon } from "lucide-react"
import { AddCostModal } from "@/components/add-cost-modal"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { ExpenseCategory } from "@/types/expense-category"
import type { CostEntry } from "@/types/costs"

const editSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  amount: z.number().positive("El valor debe ser mayor a 0"),
  expenseCategoryId: z
    .string()
    .nullable()
    .refine((v) => v !== null && v !== "none", { message: "La categoría es requerida" }),
})
type EditFormValues = z.infer<typeof editSchema>

function EditFixedCostModal({
  template,
  categories,
  onClose,
  onSuccess,
}: {
  template: FixedCost
  categories: ExpenseCategory[]
  onClose: () => void
  onSuccess: (updated: FixedCost) => void
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: template.name,
      amount: template.amount,
      expenseCategoryId: template.expenseCategoryId ?? null,
    },
  })

  const expenseCategoryId = watch("expenseCategoryId")

  const categoryItems = categories.map((c) => ({ label: c.name, value: c.id }))

  async function onSubmit(data: EditFormValues) {
    try {
      const res = await fetchWithAuth(
        `/api/costs/templates/${template.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            amount: data.amount,
            expenseCategoryId: data.expenseCategoryId === "none" ? null : data.expenseCategoryId,
          }),
        }
      )
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || e.title || "Error al actualizar costo fijo") }
      const updated = await res.json()
      toast.success("Costo fijo actualizado")
      onSuccess(updated)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar costo fijo")
    }
  }

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar costo fijo</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="py-3">
              <Field>
                <Label>Nombre</Label>
                <Input {...register("name")} />
                <FieldError errors={[errors.name]} />
              </Field>
              <Field>
                <Label>Categoría</Label>
                <Select
                  items={categoryItems}
                  value={expenseCategoryId ?? null}
                  onValueChange={(v) => setValue("expenseCategoryId", v === "none" ? null : (v ?? null), { shouldValidate: true })}
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
                <FieldError errors={[errors.expenseCategoryId]} />
              </Field>
              <Field>
                <Label>Monto mensual</Label>
                <Input
                  {...register("amount", { setValueAs: (v) => v === "" ? undefined : Number(v) })}
                  type="number"
                  step="0.01"
                />
                <FieldError errors={[errors.amount]} />
              </Field>
            </FieldGroup>
            <Button className="w-full border-primary" type="submit" disabled={isSubmitting}>
              Guardar cambios
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function CostosPage() {
  const { displayCurrency } = useCurrency()
  const { selectedDate } = useDateFilter()
  const [templates, setTemplates] = useState<FixedCost[]>([])
  const [monthlyEntries, setMonthlyEntries] = useState<CostEntry[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<FixedCost | null>(null)

  const columns = useMemo(
    () =>
      getColumns(
        setEditingTemplate,
        handleDelete,
        (updated) => setTemplates((prev) => prev.map((x) => (x.id === updated.id ? updated : x))),
        displayCurrency,
      ),
    // handleDelete se redefine en cada render; las columnas dependen de lo que muestran.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [displayCurrency],
  )

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
      const activeMonth = selectedDate ?? new Date()
      const [templatesRes, monthlyRes, catsRes] = await Promise.all([
        fetchWithAuth(`/api/costs/templates`),
        fetchWithAuth(`/api/costs/monthly?month=${activeMonth.getMonth() + 1}&year=${activeMonth.getFullYear()}`),
        fetchWithAuth(`/api/expense-categories`),
      ])
      if (!templatesRes.ok || !monthlyRes.ok) throw new Error()
      const [data, monthlyData] = await Promise.all([
        templatesRes.json(),
        monthlyRes.json(),
      ])
      setTemplates(Array.isArray(data) ? data : [])
      setMonthlyEntries(Array.isArray(monthlyData) ? monthlyData : [])
      if (catsRes.ok) setCategories(await catsRes.json())
    } catch {
      toast.error("Error al cargar costos fijos")
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  async function handleDelete(id: string) {
    const res = await fetchWithAuth(
      `/api/costs/templates/${id}`,
      { method: "DELETE" }
    )
    if (!res.ok) { const e = await res.json().catch(() => ({})); toast.error(e.message || e.title || "Error al eliminar el costo fijo"); return }
    toast.success("Costo fijo eliminado")
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const getEntryDisplayAmount = (entry: CostEntry): number => {
    if (displayCurrency === "USD") return entry.valueUSD ?? entry.amount
    if (displayCurrency === "UYU") return entry.valueUYU ?? entry.amount
    return entry.valueBRL ?? entry.amount
  }

  // Los KPI representan el mes actual. Las plantillas son configuración y pueden
  // diferir de las entradas ya generadas (por cambios de monto o vigencia).
  const monthlyTotal = monthlyEntries
    .reduce((acc, entry) => acc + getEntryDisplayAmount(entry), 0)

  const companyWideTotal = monthlyEntries
    .filter((entry) => entry.truckId == null)
    .reduce((acc, entry) => acc + getEntryDisplayAmount(entry), 0)

  const perTruckTotal = monthlyEntries
    .filter((entry) => entry.truckId != null)
    .reduce((acc, entry) => acc + getEntryDisplayAmount(entry), 0)

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Todos los costos fijos activos de la empresa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            render={
              <Link
                href={`/costos/mensual?month=${(selectedDate ?? new Date()).getFullYear()}-${String((selectedDate ?? new Date()).getMonth() + 1).padStart(2, "0")}`}
              />
            }
          >
            <CalendarDays className="size-4" />
            Vista mensual
          </Button>
          <AddCostModal onSuccess={fetchTemplates} />
        </div>
      </div>

      {/* KPI cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      ) : (
        // Por camión y toda la empresa son las dos mitades del total mensual: la barra
        // muestra cómo se reparte, en vez de repetir la misma cifra en tres cajas.
        <ProportionSummary
          headline={formatCurrency(monthlyTotal, displayCurrency)}
          headlineLabel="de costo fijo por mes"
          context={`${formatCurrency(perTruckTotal, displayCurrency)} por camión · ${formatCurrency(companyWideTotal, displayCurrency)} toda la empresa`}
          ratio={monthlyTotal > 0 ? perTruckTotal / monthlyTotal : 0}
          colors={{ done: "var(--primary)", rest: "var(--border)" }}
          ariaLabel="Reparto de los costos fijos"
        />
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={templates}
          emptyMessage="No hay costos fijos registrados."
          searchPlaceholder="Buscar costo fijo..."
        />
      )}

      {editingTemplate && (
        <EditFixedCostModal
          template={editingTemplate}
          categories={categories}
          onClose={() => setEditingTemplate(null)}
          onSuccess={(updated) => {
            setTemplates((prev) => prev.map((t) => t.id === updated.id ? updated : t))
            setEditingTemplate(null)
          }}
        />
      )}
    </div>
  )
}
