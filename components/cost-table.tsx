"use client"

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CostRow, SummaryMonth } from "@/types/costs"
import type { UseTruckCostsReturn } from "@/hooks/use-truck-costs"

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
]

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

function CellPopover({
  entryId,
  month,
  amount,
  isPaid,
  onMarkPaid,
  onUpdateAmount,
}: {
  entryId: string
  month: number
  amount: number
  isPaid: boolean
  onMarkPaid: (id: string, month: number, isPaid: boolean) => void
  onUpdateAmount: (id: string, month: number, amount: number) => void
}) {
  const [editAmount, setEditAmount] = useState(String(amount))
  const [open, setOpen] = useState(false)

  function handleAmountSave() {
    const parsed = parseFloat(editAmount)
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateAmount(entryId, month, parsed)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            className={cn(
              "w-full h-full text-right px-2 py-1 text-xs tabular-nums hover:bg-black/5 transition-colors rounded",
              isPaid && "line-through text-muted-foreground"
            )}
          >
            {formatBRL(amount)}
          </button>
        }
      />
      <PopoverContent className="w-56 p-3 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isPaid}
            onCheckedChange={(checked) =>
              onMarkPaid(entryId, month, checked as boolean)
            }
          />
          <span className="text-sm">Marcar como pagado</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Editar monto</span>
          <div className="flex gap-1">
            <Input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="h-7 text-xs"
              step="0.01"
            />
            <Button size="sm" className="h-7 px-2 text-xs" onClick={handleAmountSave}>
              OK
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface CostTableProps {
  costRows: CostRow[]
  summary: SummaryMonth[]
  isLoading: boolean
  onMarkPaid: UseTruckCostsReturn["markAsPaid"]
  onUpdateAmount: UseTruckCostsReturn["updateAmount"]
  onDeleteTemplate?: (templateId: string) => Promise<void>
  onDeleteEntry?: (entryId: string) => Promise<void>
  onDeleteInstallmentPlan?: (planId: string) => Promise<void>
}

export function CostTable({
  costRows,
  summary,
  isLoading,
  onMarkPaid,
  onUpdateAmount,
  onDeleteTemplate,
  onDeleteEntry,
  onDeleteInstallmentPlan,
}: CostTableProps) {
  const monthTotals = MONTHS.map((_, i) => {
    const m = i + 1
    return costRows.reduce((acc, row) => {
      const entry = row.months[m]
      return acc + (entry?.amount ?? 0)
    }, 0)
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    )
  }

  if (costRows.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        No hay costos registrados para este año.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-muted/50 border-b">
            <th className="sticky left-0 z-10 bg-muted/80 text-left px-3 py-2 font-medium text-muted-foreground w-44 min-w-44">
              Concepto
            </th>
            {MONTHS.map((m) => (
              <th
                key={m}
                className="px-2 py-2 text-right font-medium text-muted-foreground w-20 min-w-20"
              >
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {costRows.map((row) => (
            <tr
              key={`${row.name}__${row.type}`}
              className={cn(
                "border-b last:border-b-0 hover:brightness-95 transition-colors",
                row.type === "Fixed"
                  ? "bg-green-50 dark:bg-green-950/20"
                  : "bg-background"
              )}
            >
              <td className={cn(
                "sticky left-0 z-10 px-3 py-1 font-medium text-xs max-w-44",
                row.type === "Fixed"
                  ? "bg-green-50 dark:bg-green-950/20"
                  : "bg-background"
              )}>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="truncate flex-1">{row.name}</span>
                  {row.scope === "CompanyWide" && (
                    <span className="shrink-0 rounded px-1 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      Empresa
                    </span>
                  )}
                  {onDeleteTemplate && row.costTemplateId && (
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <button className="shrink-0 p-0.5 rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="size-3" />
                          </button>
                        }
                      />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar costo fijo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminará <strong>{row.name}</strong> y todas sus entradas desde el mes actual en adelante. Los meses anteriores se conservan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => onDeleteTemplate(row.costTemplateId!)}
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {row.type === "Variable" && row.installmentPlanId && onDeleteInstallmentPlan && (
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <button className="shrink-0 p-0.5 rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="size-3" />
                          </button>
                        }
                      />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar gasto?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminarán todas las cuotas de <strong>{row.name}</strong>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => onDeleteInstallmentPlan(row.installmentPlanId!)}
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {row.type === "Variable" && !row.installmentPlanId && onDeleteEntry && (() => {
                    const firstEntry = Object.values(row.months).find(Boolean)
                    if (!firstEntry) return null
                    return (
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <button className="shrink-0 p-0.5 rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors">
                              <Trash2 className="size-3" />
                            </button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar costo variable?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se eliminará <strong>{row.name}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => onDeleteEntry(firstEntry.id)}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )
                  })()}
                </div>
              </td>
              {MONTHS.map((_, i) => {
                const m = i + 1
                const entry = row.months[m]
                return (
                  <td key={m} className="px-0 py-0 text-right">
                    {entry ? (
                      <CellPopover
                        entryId={entry.id}
                        month={m}
                        amount={entry.amount}
                        isPaid={entry.isPaid}
                        onMarkPaid={onMarkPaid}
                        onUpdateAmount={onUpdateAmount}
                      />
                    ) : (
                      <span className="px-2 py-1 block text-right text-xs text-muted-foreground/40">
                        —
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}

          {/* Total row */}
          <tr className="border-t-2 bg-muted/50 font-bold">
            <td className="sticky left-0 z-10 bg-muted/50 px-3 py-2 text-xs font-bold">
              Total
            </td>
            {monthTotals.map((total, i) => (
              <td key={i} className="px-2 py-2 text-right text-xs tabular-nums">
                {total > 0 ? formatBRL(total) : <span className="text-muted-foreground/40">—</span>}
              </td>
            ))}
          </tr>

          {/* Costo x KM row */}
          <tr className="bg-cyan-50 dark:bg-cyan-950/20">
            <td className="sticky left-0 z-10 bg-cyan-50 dark:bg-cyan-950/20 px-3 py-2 text-xs font-medium text-cyan-700 dark:text-cyan-300">
              Costo x KM
            </td>
            {MONTHS.map((_, i) => {
              const m = i + 1
              const s = summary.find((s) => s.month === m)
              const cpk = s?.costPerKm ?? null
              return (
                <td key={m} className="px-2 py-2 text-right text-xs tabular-nums text-cyan-700 dark:text-cyan-300">
                  {cpk != null ? (
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(cpk)
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
