"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { formatCurrency, formatCurrency2, formatDate, DisplayCurrency } from "@/lib/format";
import { readableTextColor } from "@/lib/color-contrast";
import { todayIso } from "./ReceivableFormFields";
import {
  RECEIVABLE_ITEM_LABELS,
  RECEIVABLE_STATUS_LABELS,
  type Receivable,
  type ReceivableItemKind,
  type ReceivableItemStatus,
} from "@/types/receivable";

/** Clases de la pastilla según el estado del ítem. */
function itemClasses(status: ReceivableItemStatus) {
  return status === "Collected"
    ? "bg-green-600 text-white hover:bg-green-700"
    : "bg-red-600 text-white hover:bg-red-700";
}

function displayValue(receivable: Receivable, currency: DisplayCurrency): number {
  if (currency === "USD") return receivable.valueUSD ?? receivable.totalAmount;
  if (currency === "UYU") return receivable.valueUYU ?? receivable.totalAmount;
  return receivable.valueBRL ?? receivable.totalAmount;
}

function AmountCell({
  receivable,
  kind,
  onCollect,
  onUndoCollect,
  isBusy,
}: {
  receivable: Receivable;
  kind: ReceivableItemKind;
  onCollect: (receivable: Receivable, kind: ReceivableItemKind, dateUtc: string) => void;
  onUndoCollect: (receivable: Receivable, kind: ReceivableItemKind) => void;
  isBusy: boolean;
}) {
  const [collectDate, setCollectDate] = useState(todayIso);

  const item = receivable.items.find((i) => i.kind === kind);
  if (!item || item.status === "NotApplicable") return null;

  const isCollected = item.status === "Collected";
  const amount = formatCurrency2(item.amount, receivable.currency as DisplayCurrency);
  const label = RECEIVABLE_ITEM_LABELS[kind];
  const colors = itemClasses(item.status);

  /*
    Un solo botón para los dos estados, y adentro del diálogo se decide qué se pregunta.
    Antes eran dos árboles distintos y cada cobro montaba un botón nuevo: el rojo→verde no
    tenía desde dónde transicionar y la fecha aparecía de golpe, empujando la fila. Siendo
    el mismo nodo, el color transiciona solo y la fecha puede abrirse y cerrarse.
  */
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <button
            type="button"
            disabled={isBusy}
            aria-label={
              isCollected ? `${label} cobrado, deshacer cobro` : `Cobrar ${label.toLowerCase()}`
            }
            className={`block w-full cursor-pointer rounded-md px-2.5 py-1.5 text-left font-semibold tabular-nums transition-[background-color,color,transform] duration-(--dur-base) ease-emphasis active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-wait disabled:opacity-60 ${colors}`}
          >
            {amount}
            {/*
              La fecha de cobro se desliza hacia abajo en lugar de aparecer: lo que crece
              es la altura real, así que la fila y la tabla acompañan el movimiento en vez
              de pegar el salto. `initial={false}` para que al cargar la grilla las celdas
              ya cobradas no se abran todas de una.
            */}
            <AnimatePresence initial={false}>
              {isCollected && item.collectedAt && (
                <motion.span
                  key="collected-at"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 0.7 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                  className="block overflow-hidden text-xs font-normal tabular-nums"
                >
                  {formatDate(item.collectedAt)}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        }
      />
      <AlertDialogContent size="sm">
        {isCollected ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Deshacer el cobro?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminará el ingreso de{" "}
                <span className="font-medium text-foreground">{amount}</span> generado por el{" "}
                {label.toLowerCase()} de {receivable.clientName}, y el ítem volverá a figurar como
                no cobrado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => onUndoCollect(receivable, kind)}
              >
                Deshacer cobro
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Cobrar {label.toLowerCase()}</AlertDialogTitle>
              <AlertDialogDescription>
                Se registrará un ingreso de{" "}
                <span className="font-medium text-foreground">{amount}</span> de{" "}
                {receivable.clientName} ({receivable.truckLicensePlate}).
              </AlertDialogDescription>
            </AlertDialogHeader>
            {/* La fecha se pregunta al cobrar en vez de asumir hoy: los cobros suelen
                cargarse unos días después de que entró la plata. */}
            <div className="px-4">
              <Label htmlFor={`collect-date-${receivable.id}-${kind}`}>Fecha de cobro</Label>
              <Input
                id={`collect-date-${receivable.id}-${kind}`}
                type="date"
                value={collectDate}
                onChange={(e) => setCollectDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onCollect(receivable, kind, collectDate)}>
                Cobrar
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function getColumns(
  onEdit: (receivable: Receivable) => void,
  onDelete: (receivable: Receivable) => void,
  onCollect: (receivable: Receivable, kind: ReceivableItemKind, dateUtc: string) => void,
  onUndoCollect: (receivable: Receivable, kind: ReceivableItemKind) => void,
  displayCurrency: DisplayCurrency = "BRL",
  busyId: string | null = null,
): ColumnDef<Receivable>[] {
  const itemColumn = (id: string, header: string, kind: ReceivableItemKind): ColumnDef<Receivable> => ({
    id,
    header,
    enableSorting: false,
    cell: ({ row }) => (
      <AmountCell
        receivable={row.original}
        kind={kind}
        onCollect={onCollect}
        onUndoCollect={onUndoCollect}
        isBusy={busyId === row.original.id}
      />
    ),
  });

  return [
    {
      accessorKey: "dateUtc",
      header: "Fecha",
      cell: ({ row }) => <span className="tabular-nums">{formatDate(row.getValue("dateUtc"))}</span>,
    },
    {
      accessorKey: "truckLicensePlate",
      header: "Camión",
      cell: ({ row }) => {
        const { truckLicensePlate, truckColor } = row.original;
        if (!truckColor) return <span className="font-medium">{truckLicensePlate}</span>;
        return (
          <span
            className="inline-block rounded-md px-2.5 py-1 font-mono text-[0.8125rem] font-medium tracking-tight"
            style={{ backgroundColor: truckColor, color: readableTextColor(truckColor) }}
          >
            {truckLicensePlate}
          </span>
        );
      },
    },
    {
      accessorKey: "clientName",
      header: "Cliente",
    },
    itemColumn("advance", "Adelanto", "Advance"),
    itemColumn("balance", "Saldo", "Balance"),
    itemColumn("toll", "Peaje", "Toll"),
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums">
          {formatCurrency(displayValue(row.original, displayCurrency), displayCurrency)}
        </span>
      ),
    },
    {
      accessorKey: "notes",
      header: "Ruta",
      cell: ({ row }) =>
        row.original.notes ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => RECEIVABLE_STATUS_LABELS[row.original.status],
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const receivable = row.original;
        const collectedItems = receivable.items.filter((i) => i.status === "Collected");
        return (
          <div key={receivable.id} className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Editar cuenta a recibir"
              onClick={() => onEdit(receivable)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="Eliminar cuenta a recibir">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                }
              />
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar la cuenta a recibir?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará la cuenta de{" "}
                    <span className="font-medium text-foreground">{receivable.clientName}</span> del{" "}
                    {formatDate(receivable.dateUtc)} por{" "}
                    <span className="font-medium text-foreground">
                      {formatCurrency2(receivable.totalAmount, receivable.currency as DisplayCurrency)}
                    </span>
                    .
                    {collectedItems.length > 0 && (
                      <>
                        {" "}
                        Tiene{" "}
                        <span className="font-medium text-foreground">
                          {collectedItems.length}{" "}
                          {collectedItems.length === 1 ? "cobro registrado" : "cobros registrados"}
                        </span>{" "}
                        por{" "}
                        <span className="font-medium text-foreground">
                          {formatCurrency2(
                            receivable.collectedAmount,
                            receivable.currency as DisplayCurrency,
                          )}
                        </span>
                        : esos ingresos también se eliminan.
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => onDelete(receivable)}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];
}
