"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useConceptStatusByTruck } from "@/hooks/use-concept-status-by-truck";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { TruckConceptStatus } from "@/types/maintenance";
import type { MaintenanceConcept } from "@/types/maintenance";

export default function ConceptDetailPage() {
  const params = useParams<{ id: string }>();
  const conceptId = params.id;
  const [concept, setConcept] = useState<MaintenanceConcept | null>(null);
  const [isLoadingConcept, setIsLoadingConcept] = useState(true);
  const { status, isLoading: isLoadingStatus } = useConceptStatusByTruck(conceptId);

  const columns = useMemo<ColumnDef<TruckConceptStatus>[]>(
    () => [
      {
        accessorKey: "truckLicensePlate",
        header: "Camión",
        cell: ({ row }) => <span className="font-medium">{row.original.truckLicensePlate}</span>,
      },
      {
        accessorKey: "lastMaintenanceDate",
        header: "Último cambio",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatDate(row.original.lastMaintenanceDate)} —{" "}
            {row.original.lastKilometers.toLocaleString("es-UY")} km
          </span>
        ),
      },
      {
        id: "nextDue",
        header: "Próximo vencimiento",
        cell: ({ row }) => {
          const s = row.original;
          if (!s.nextDueKilometers && !s.nextDueDate) {
            return <span className="text-muted-foreground">—</span>;
          }
          return (
            <span className="tabular-nums text-muted-foreground">
              {s.nextDueKilometers ? `${s.nextDueKilometers.toLocaleString("es-UY")} km` : ""}
              {s.nextDueKilometers && s.nextDueDate ? " / " : ""}
              {s.nextDueDate ? formatDate(s.nextDueDate) : ""}
            </span>
          );
        },
      },
    ],
    [],
  );

  useEffect(() => {
    fetchWithAuth(`/api/maintenances/concepts/${conceptId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setConcept)
      .finally(() => setIsLoadingConcept(false));
  }, [conceptId]);

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/mantenimientos/conceptos">
          <Button variant="ghost" size="icon" aria-label="Volver a conceptos">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        {isLoadingConcept ? (
          <Skeleton className="h-7 w-48" />
        ) : (
          <h1 className="text-xl font-bold">{concept?.name ?? "Concepto"}</h1>
        )}
      </div>

      {!isLoadingConcept && concept && (
        <p className="text-sm text-muted-foreground">
          Intervalo:{" "}
          {concept.kilometerInterval
            ? `${concept.kilometerInterval.toLocaleString("es-UY")} km`
            : "sin intervalo de km"}
          {concept.dateInterval ? ` / ${concept.dateInterval} días` : ""}
        </p>
      )}

      {isLoadingStatus ? (
        <div className="space-y-3 py-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={status}
          emptyMessage="Ningún camión tiene mantenimientos de este concepto todavía."
          searchPlaceholder="Buscar camión..."
        />
      )}
    </div>
  );
}
