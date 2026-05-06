"use client"

import { useCallback, useEffect, useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import type { OdometerReading } from "@/types/odometer"

export function useOdometerReadings(truckId: string, year: number, month?: number) {
  const [readings, setReadings] = useState<OdometerReading[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchReadings = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ year: String(year) })
      if (month != null) params.set("month", String(month))
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trucks/${truckId}/odometer-readings?${params}`
      )
      if (res.ok) {
        const data = await res.json()
        setReadings(Array.isArray(data) ? data : [])
      }
    } catch {
      // silent — panel shows empty state
    } finally {
      setIsLoading(false)
    }
  }, [truckId, year, month])

  useEffect(() => {
    fetchReadings()
  }, [fetchReadings])

  return { readings, isLoading, refetch: fetchReadings }
}
