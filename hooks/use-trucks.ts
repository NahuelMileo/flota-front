"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api"
import type { Truck } from "@/types/truck"

export function useTrucks() {
  const [trucks, setTrucks] = useState<Truck[]>([])

  useEffect(() => {
    let cancelled = false
    fetchWithAuth("/api/trucks")
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setTrucks(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) toast.error("Error al cargar camiones")
      })
    return () => {
      cancelled = true
    }
  }, [])

  return trucks
}
