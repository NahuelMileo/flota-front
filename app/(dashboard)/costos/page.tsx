"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { fetchWithAuth } from "@/lib/api"
import { formatCurrency, type DisplayCurrency } from "@/lib/format"
import { useCurrency } from "@/context/currency-context"
import { useDateFilter } from "@/context/date-filter-context"

function getTemplateDisplayAmount(t: FixedCost, currency: DisplayCurrency): number {
  if (currency === "USD") return t.valueUSD ?? t.amount
  if (currency === "UYU") return t.valueUYU ?? t.amount
  return t.valueBRL ?? t.amount
}
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

type FixedCost = {
  id: string
  name: string
  amount: number
  valueUSD: number | null
  valueBRL: number | null
  valueUYU: number | null
  type: string
  scope: "PerTruck" | "CompanyWide"
  truckId: string | null
  isActive: boolean
  expenseCategoryId: string | null
  categoryName: string | null
  truckLicensePlate: string | null
  generatedUntilYear: number | null
  generatedUntilMonth: number | null
}

// Meses que faltan entre el mes actual y el último generado (negativo si ya se cortó)
function monthsUntilGenerated(t: FixedCost): number | null {
  if (t.generatedUntilYear == null || t.generatedUntilMonth == null) return null
  const now = new Date()
  return (
    (t.generatedUntilYear * 12 + t.generatedUntilMonth) -
    (now.getFullYear() * 12 + now.getMonth() + 1)
  )
}

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
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              Guardar cambios
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ExtendTemplatePopover({
  template,
  onSuccess,
}: {
  template: FixedCost
  onSuccess: (updated: FixedCost) => void
}) {
  const [open, setOpen] = useState(false)
  const [months, setMonths] = useState("12")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleExtend() {
    const parsed = parseInt(months, 10)
    if (isNaN(parsed) || parsed < 1 || parsed > 60) {
      toast.error("Ingresá una cantidad de meses entre 1 y 60")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetchWithAuth(
        `/api/costs/templates/${template.id}/extend`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ months: parsed }),
        }
      )
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || e.title || "Error al expandir el costo fijo") }
      const updated = await res.json()
      toast.success("Costo fijo expandido")
      onSuccess(updated)
      setOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al expandir el costo fijo")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            title="Expandir generación"
            className="p-1.5 rounded text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
          >
            <CalendarPlus className="size-4" />
          </button>
        }
      />
      <PopoverContent className="w-56 p-3" align="end">
        <p className="text-sm font-medium mb-1">Expandir generación</p>
        <p className="text-xs text-muted-foreground mb-2">
          Genera cuotas por los próximos meses (1 a 60).
        </p>
        <div className="flex gap-1.5">
          <Input
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExtend()}
            type="number"
            min={1}
            max={60}
            className="h-8 text-sm"
            autoFocus
          />
          <Button size="sm" className="h-8" onClick={handleExtend} disabled={isSubmitting}>
            Expandir
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ToggleActiveButton({
  template,
  onSuccess,
}: {
  template: FixedCost
  onSuccess: (updated: FixedCost) => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function patchIsActive(isActive: boolean) {
    setIsSubmitting(true)
    try {
      const res = await fetchWithAuth(
        `/api/costs/templates/${template.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        }
      )
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || e.title || "Error al actualizar el costo fijo") }
      const updated = await res.json()
      toast.success(isActive ? "Costo fijo reactivado" : "Costo fijo desactivado")
      onSuccess(updated)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar el costo fijo")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!template.isActive) {
    return (
      <button
        title="Reactivar"
        disabled={isSubmitting}
        onClick={() => patchIsActive(true)}
        className="p-1.5 rounded text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
      >
        <Power className="size-4" />
      </button>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <button
            title="Desactivar"
            disabled={isSubmitting}
            className="p-1.5 rounded text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
          >
            <Power className="size-4" />
          </button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Desactivar costo fijo?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{template.name}</strong> dejará de generar costos desde el mes que viene
            y las cuotas futuras sin pagar se eliminarán.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => patchIsActive(false)}
          >
            Desactivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Costos Fijos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Todos los costos fijos activos de la empresa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/costos/mensual?month=${(selectedDate ?? new Date()).getFullYear()}-${String((selectedDate ?? new Date()).getMonth() + 1).padStart(2, "0")}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border rounded-md px-3 py-1.5"
          >
            <CalendarDays className="size-4" />
            Vista mensual
          </Link>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Total mensual</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(monthlyTotal, displayCurrency)}</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Por camión (suma)</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(perTruckTotal, displayCurrency)}</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Toda la empresa</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(companyWideTotal, displayCurrency)}</p>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border p-10 text-center text-sm text-muted-foreground">
          No hay costos fijos registrados.
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Concepto</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Categoría</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Alcance</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Camión</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Monto/mes</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Generado hasta</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr
                  key={t.id}
                  className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    <span className={t.isActive ? "" : "text-muted-foreground line-through"}>
                      {t.name}
                    </span>
                    {!t.isActive && (
                      <span className="ml-2 text-xs text-muted-foreground">(inactivo)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">
                      {t.categoryName ?? "Sin categoría"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {t.scope === "CompanyWide" ? (
                      <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                        Empresa
                      </Badge>
                    ) : (
                      <Badge variant="outline">Por camión</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t.scope === "PerTruck" && t.truckLicensePlate ? (
                      <Link
                        href={`/camiones/${t.truckId}/costos`}
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                      >
                        <TruckIcon className="size-3.5" />
                        {t.truckLicensePlate}
                      </Link>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className="font-medium">{formatCurrency(getTemplateDisplayAmount(t, displayCurrency), displayCurrency)}</span>
                    {t.scope === "CompanyWide" && (
                      <p className="text-xs text-muted-foreground">total empresa</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {t.generatedUntilYear != null && t.generatedUntilMonth != null ? (
                      (() => {
                        const remaining = monthsUntilGenerated(t) ?? 0
                        const label = `${String(t.generatedUntilMonth).padStart(2, "0")}/${t.generatedUntilYear}`
                        if (t.isActive && remaining <= 2) {
                          return (
                            <span
                              className="inline-flex items-center gap-1.5 text-amber-600"
                              title="La generación está por cortarse — expandí el costo para que siga generando cuotas"
                            >
                              <AlertTriangle className="size-3.5" />
                              <span className="tabular-nums font-medium">{label}</span>
                            </span>
                          )
                        }
                        return <span className="tabular-nums text-muted-foreground">{label}</span>
                      })()
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                    <ExtendTemplatePopover
                      template={t}
                      onSuccess={(updated) =>
                        setTemplates((prev) => prev.map((x) => x.id === updated.id ? updated : x))
                      }
                    />
                    <ToggleActiveButton
                      template={t}
                      onSuccess={(updated) =>
                        setTemplates((prev) => prev.map((x) => x.id === updated.id ? updated : x))
                      }
                    />
                    <button
                      onClick={() => setEditingTemplate(t)}
                      className="p-1.5 rounded text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <button className="p-1.5 rounded text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="size-4" />
                          </button>
                        }
                      />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar costo fijo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminará <strong>{t.name}</strong> y todas sus entradas desde el mes actual en adelante.
                            {t.scope === "CompanyWide" && (
                              <> Esto afecta a <strong>todos los camiones</strong> de la empresa.</>
                            )}
                            {" "}Los meses anteriores se conservan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(t.id)}
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
