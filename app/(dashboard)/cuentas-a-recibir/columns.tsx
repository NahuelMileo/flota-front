"use client";
import { ColumnDef } from "@tanstack/react-table";
import { createContext, useContext, useState } from "react";
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

/**
 * La cuenta cuyo cobro está en curso, para deshabilitar sus celdas mientras viaja el
 * pedido. Va por contexto y no por parámetro de `getColumns`: cada llamada a `getColumns`
 * crea funciones `cell` nuevas, y como flexRender las usa como tipo de componente, React
 * desmonta y vuelve a montar cada celda. Con el botón recreado en medio del cobro no hay
 * transición de color ni de altura posible.
 */
export const CollectingReceivableContext = createContext<string | null>(null);

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
}: {
  receivable: Receivable;
  kind: ReceivableItemKind;
  onCollect: (receivable: Receivable, kind: ReceivableItemKind, dateUtc: string) => void;
  onUndoCollect: (receivable: Receivable, kind: ReceivableItemKind) => void;
}) {
  const [collectDate, setCollectDate] = useState(todayIso);
  /*
    El diálogo se controla desde acá porque AlertDialogAction es un botón común, no un
    Close: antes se cerraba de casualidad, porque cobrar reemplazaba el árbol entero de la
    celda y se llevaba el diálogo puesto. Ahora el nodo sobrevive (que es lo que permite
    animar), así que hay que cerrarlo a mano.
  */
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isBusy = useContext(CollectingReceivableContext) === receivable.id;

  const item = receivable.items.find((i) => i.kind === kind);
  if (!item || item.status === "NotApplicable") return null;

  const isCollected = item.status === "Collected";
  const amount = formatCurrency2(item.amount, receivable.currency as DisplayCurrency);
  const label = RECEIVABLE_ITEM_LABELS[kind];
  const colors = itemClasses(item.status);

  /*
    Mientras viaja el pedido la celda queda deshabilitada pero **no** se apaga: un
    `opacity-60` sobre el rojo pleno se lee como un flash blanco justo antes de que arranque
    la transición de color, y encima salta de golpe porque opacity no transiciona acá. El
    acuse de recibo ya lo dan el diálogo cerrándose y el color cambiando.

    Un solo botón para los dos estados, y adentro del diálogo se decide qué se pregunta.
    Antes eran dos árboles distintos y cada cobro montaba un botón nuevo: el rojo→verde no
    tenía desde dónde transicionar y la fecha aparecía de golpe, empujando la fila. Siendo
    el mismo nodo, el color transiciona solo y la fecha puede abrirse y cerrarse.
  */
  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger
        render={
          <button
            type="button"
            disabled={isBusy}
            aria-label={
              isCollected ? `${label} cobrado, deshacer cobro` : `Cobrar ${label.toLowerCase()}`
            }
            className={`block w-full cursor-pointer rounded-md px-2.5 py-1.5 text-left font-semibold tabular-nums transition-[background-color,color,transform] duration-(--dur-base) ease-emphasis active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-wait ${colors}`}
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
                onClick={() => {
                  setIsDialogOpen(false);
                  onUndoCollect(receivable, kind);
                }}
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
              <AlertDialogAction
                onClick={() => {
                  setIsDialogOpen(false);
                  onCollect(receivable, kind, collectDate);
                }}
              >
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
