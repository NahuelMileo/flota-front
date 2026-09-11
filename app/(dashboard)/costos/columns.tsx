"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { useState } from "react"
import { AlertTriangle, CalendarPlus, Pencil, Power, Trash2, TruckIcon } from "lucide-react"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import { formatCurrency, type DisplayCurrency } from "@/lib/format"
import { getTemplateDisplayAmount, monthsUntilGenerated } from "@/lib/costs"
import type { FixedCost } from "@/types/costs"

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

export function getColumns(
  onEdit: (template: FixedCost) => void,
  onDelete: (templateId: string) => void,
  onTemplateUpdated: (updated: FixedCost) => void,
  displayCurrency: DisplayCurrency,
): ColumnDef<FixedCost>[] {
  return [
    {
      accessorKey: "name",
      header: "Concepto",
      cell: ({ row }) => {
        const t = row.original
        return (
          <span className="font-medium">
            {/* Un costo inactivo se atenúa; tacharlo lo haría leer como anulado. */}
            <span className={t.isActive ? "" : "text-muted-foreground"}>{t.name}</span>
            {!t.isActive && <span className="ml-2 text-xs text-muted-foreground">(inactivo)</span>}
          </span>
        )
      },
    },
    {
      accessorKey: "categoryName",
      header: "Categoría",
      cell: ({ row }) => <Badge variant="outline">{row.original.categoryName ?? "Sin categoría"}</Badge>,
    },
    {
      accessorKey: "scope",
      header: "Alcance",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.scope === "CompanyWide" ? "Empresa" : "Por camión"}
        </Badge>
      ),
    },
    {
      accessorKey: "truckLicensePlate",
      header: "Camión",
      cell: ({ row }) => {
        const t = row.original
        if (t.scope !== "PerTruck" || !t.truckLicensePlate) {
          return <span className="text-muted-foreground">—</span>
        }
        return (
          <Link
            href={`/camiones/${t.truckId}/costos`}
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <TruckIcon className="size-3.5" />
            {t.truckLicensePlate}
          </Link>
        )
      },
    },
    {
      accessorKey: "amount",
      header: "Monto/mes",
      cell: ({ row }) => {
        const t = row.original
        return (
          <div className="text-right">
            <span className="font-medium tabular-nums">
              {formatCurrency(getTemplateDisplayAmount(t, displayCurrency), displayCurrency)}
            </span>
            {t.scope === "CompanyWide" && (
              <p className="text-xs text-muted-foreground">total empresa</p>
            )}
          </div>
        )
      },
    },
    {
      id: "generatedUntil",
      header: "Generado hasta",
      cell: ({ row }) => {
        const t = row.original
        if (t.generatedUntilYear == null || t.generatedUntilMonth == null) {
          return <span className="text-muted-foreground">—</span>
        }
        const label = `${String(t.generatedUntilMonth).padStart(2, "0")}/${t.generatedUntilYear}`
        const remaining = monthsUntilGenerated(t) ?? 0
        if (t.isActive && remaining <= 2) {
          return (
            <span
              className="inline-flex items-center gap-1.5 text-warning"
              title="La generación está por cortarse — expandí el costo para que siga generando cuotas"
            >
              <AlertTriangle className="size-3.5" />
              <span className="font-medium tabular-nums">{label}</span>
            </span>
          )
        }
        return <span className="tabular-nums text-muted-foreground">{label}</span>
      },
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const t = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <ExtendTemplatePopover template={t} onSuccess={onTemplateUpdated} />
            <ToggleActiveButton template={t} onSuccess={onTemplateUpdated} />
            <button
              aria-label="Editar costo fijo"
              onClick={() => onEdit(t)}
              className="rounded p-1.5 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
            >
              <Pencil className="size-4" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <button
                    aria-label="Eliminar costo fijo"
                    className="rounded p-1.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar costo fijo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se eliminará <strong>{t.name}</strong> y todas sus entradas desde el mes actual
                    en adelante.
                    {t.scope === "CompanyWide" && (
                      <> Esto afecta a <strong>todos los camiones</strong> de la empresa.</>
                    )}
                    {" "}Los meses anteriores se conservan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => onDelete(t.id)}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]
}
