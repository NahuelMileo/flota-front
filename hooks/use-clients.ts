"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api"
import type { Client, ClientListResponse } from "@/types/client"

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    let cancelled = false
    // pageSize al máximo que acepta la API: el select los muestra todos juntos.
    fetchWithAuth("/api/clients?page=1&pageSize=100")
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data: ClientListResponse) => {
        if (!cancelled) setClients(Array.isArray(data?.items) ? data.items : [])
      })
      .catch(() => {
        if (!cancelled) toast.error("Error al cargar clientes")
      })
    return () => {
      cancelled = true
    }
  }, [])

  return clients
}
