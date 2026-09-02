"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useConceptStatusByTruck } from "@/hooks/use-concept-status-by-truck";
import type { MaintenanceConcept } from "@/types/maintenance";

export default function ConceptDetailPage() {
  const params = useParams<{ id: string }>();
  const conceptId = params.id;
  const [concept, setConcept] = useState<MaintenanceConcept | null>(null);
  const [isLoadingConcept, setIsLoadingConcept] = useState(true);
  const { status, isLoading: isLoadingStatus } = useConceptStatusByTruck(conceptId);

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
          <Button variant="ghost" size="icon">
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

      <div className="rounded-md border">
        {isLoadingStatus ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : status.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            Ningún camión tiene mantenimientos de este concepto todavía.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="p-3 font-medium">Camión</th>
                <th className="p-3 font-medium">Último cambio</th>
                <th className="p-3 font-medium">Próximo vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {status.map((s) => (
                <tr key={s.truckId} className="border-b last:border-0">
                  <td className="p-3 font-medium">{s.truckLicensePlate}</td>
                  <td className="p-3">
                    {formatDate(s.lastMaintenanceDate)} —{" "}
                    {s.lastKilometers.toLocaleString("es-UY")} km
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {s.nextDueKilometers
                      ? `${s.nextDueKilometers.toLocaleString("es-UY")} km`
                      : ""}
                    {s.nextDueKilometers && s.nextDueDate ? " / " : ""}
                    {s.nextDueDate ? formatDate(s.nextDueDate) : ""}
                    {!s.nextDueKilometers && !s.nextDueDate ? "—" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
