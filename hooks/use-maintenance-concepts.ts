import { useState, useEffect } from "react"
import { MaintenanceConcept } from "@/types/maintenance"
import { fetchWithAuth } from "@/lib/api"

export function useMaintenanceConcepts() {
  const [concepts, setConcepts] = useState<MaintenanceConcept[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchConcepts()
  }, [])

  const fetchConcepts = async () => {
    setIsLoading(true)
    try {
      const res = await fetchWithAuth("/api/maintenances/concepts")
      if (res.ok) {
        const data = await res.json()
        setConcepts(data)
      }
    } catch {
      console.error("Error loading concepts")
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = () => fetchConcepts()

  return { concepts, isLoading, refresh }
}
