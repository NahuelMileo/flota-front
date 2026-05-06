"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useOdometerReadings } from "@/hooks/use-odometer-readings"
import { getOdometerSourceLabel } from "@/types/odometer"
import { formatKm } from "@/lib/format"

function formatDate(dateUtc: string): string {
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateUtc))
}

interface OdometerReadingsPanelProps {
  truckId: string
  year: number
}

export function OdometerReadingsPanel({ truckId, year }: OdometerReadingsPanelProps) {
  const { readings, isLoading } = useOdometerReadings(truckId, year)

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">Historial de odómetro</h2>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : readings.length === 0 ? (
        <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
          Todavía no hay lecturas de odómetro para este período.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Fecha</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Km</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Origen</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Nota</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 text-xs tabular-nums text-muted-foreground">
                    {formatDate(r.readingDateUtc)}
                  </td>
                  <td className="px-3 py-2 text-right text-xs tabular-nums font-medium">
                    {formatKm(r.km)}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <span className="rounded px-1.5 py-0.5 text-[11px] bg-muted text-muted-foreground">
                      {getOdometerSourceLabel(r.source)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground max-w-xs truncate">
                    {r.notes ?? <span className="text-muted-foreground/40">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
