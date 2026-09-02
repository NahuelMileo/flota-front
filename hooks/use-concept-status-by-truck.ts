import { useState, useEffect } from "react"
import { TruckConceptStatus } from "@/types/maintenance"
import { fetchWithAuth } from "@/lib/api"

// Trae, para un concepto, el último mantenimiento y el próximo vencimiento
// (calculado con el intervalo del concepto) de cada camión que ya lo usó.
export function useConceptStatusByTruck(conceptId: string) {
  const [status, setStatus] = useState<TruckConceptStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchWithAuth(`/api/maintenances/concepts/${conceptId}/trucks`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setStatus(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) console.error("Error loading concept status by truck")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [conceptId])

  return { status, isLoading }
}
