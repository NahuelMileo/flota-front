"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { fetchWithAuth } from "@/lib/api"
import { formatCurrency, type DisplayCurrency } from "@/lib/format"
import { useCurrency } from "@/context/currency-context"

function getTemplateDisplayAmount(t: CostTemplate, currency: DisplayCurrency): number {
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
import { CalendarDays, Pencil, Trash2, TruckIcon } from "lucide-react"
import { AddCostModal } from "@/components/add-cost-modal"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { ExpenseCategory } from "@/types/expense-category"

type CostTemplate = {
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
}

const editSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  amount: z.number().positive("El valor debe ser mayor a 0"),
  expenseCategoryId: z.string().nullable(),
})
type EditFormValues = z.infer<typeof editSchema>

function EditFixedCostModal({
  template,
  categories,
  onClose,
  onSuccess,
}: {
  template: CostTemplate
  categories: ExpenseCategory[]
  onClose: () => void
  onSuccess: (updated: CostTemplate) => void
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

  const categoryItems = [
    { label: "Sin categoría", value: "none" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ]

  async function onSubmit(data: EditFormValues) {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/costs/templates/${template.id}`,
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
      if (!res.ok) throw new Error()
      const updated = await res.json()
      toast.success("Costo fijo actualizado")
      onSuccess(updated)
    } catch {
      toast.error("Error al actualizar costo fijo")
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
                  value={expenseCategoryId ?? "none"}
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

export default function CostosPage() {
  const { displayCurrency } = useCurrency()
  const [templates, setTemplates] = useState<CostTemplate[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<CostTemplate | null>(null)

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
      const [templatesRes, catsRes] = await Promise.all([
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/costs/templates`),
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/expense-categories`),
      ])
      if (!templatesRes.ok) throw new Error()
      const data = await templatesRes.json()
      setTemplates(data)
      if (catsRes.ok) setCategories(await catsRes.json())
    } catch {
      toast.error("Error al cargar costos fijos")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  async function handleDelete(id: string) {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/costs/templates/${id}`,
      { method: "DELETE" }
    )
    if (!res.ok) { toast.error("Error al eliminar el costo fijo"); return }
    toast.success("Costo fijo eliminado")
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const monthlyTotal = templates
    .filter((t) => t.isActive)
    .reduce((acc, t) => acc + getTemplateDisplayAmount(t, displayCurrency), 0)

  const companyWideTotal = templates
    .filter((t) => t.isActive && t.scope === "CompanyWide")
    .reduce((acc, t) => acc + getTemplateDisplayAmount(t, displayCurrency), 0)

  const perTruckTotal = templates
    .filter((t) => t.isActive && t.scope === "PerTruck")
    .reduce((acc, t) => acc + getTemplateDisplayAmount(t, displayCurrency), 0)

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
            href={`/costos/mensual?month=${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`}
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
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
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
