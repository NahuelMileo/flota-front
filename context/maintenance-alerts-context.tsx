"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { useRealtimeEvent } from "@/context/realtime-context"
import { toast } from "sonner"
import type { MaintenanceAlert } from "@/types/maintenance-alert"

// Vencido > Próximo > Resuelto (igual prioridad que el backend); dentro de cada
// grupo, no leídas primero, y más reciente primero.
const STATUS_PRIORITY: Record<MaintenanceAlert["status"], number> = {
  Overdue: 0,
  Upcoming: 1,
  Resolved: 2,
}

function sortAlerts(alerts: MaintenanceAlert[]): MaintenanceAlert[] {
  return [...alerts].sort((a, b) => {
    if (a.status !== b.status) return STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1
    return new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime()
  })
}

interface MaintenanceAlertsContextType {
  alerts: MaintenanceAlert[]
  isLoading: boolean
  hasError: boolean
  unreadCount: number
  refetch: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
}

const MaintenanceAlertsContext = createContext<MaintenanceAlertsContextType | null>(null)

// El hub solo avisa "algo cambió para tu tenant" (sin payload), y acá reaccionamos
// refetcheando el mismo GET — así los datos que se muestran siempre vienen de la fuente
// de verdad (REST), nunca del mensaje del socket. La conexión vive en RealtimeProvider.
export function MaintenanceAlertsProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Identidad estable (deps vacías): puede entrar como dependencia del efecto de
  // conexión sin que este se reinicie en cada render.
  const fetchAlerts = useCallback(async () => {
    setIsLoading(true)
    setHasError(false)
    try {
      const res = await fetchWithAuth("/api/maintenance-alerts")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAlerts(sortAlerts(Array.isArray(data) ? data : []))
    } catch {
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  useRealtimeEvent("MaintenanceAlertsChanged", fetchAlerts)

  const markAsRead = useCallback(async (id: string) => {
    const previous = alerts
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, isRead: true } : alert))
    )
    try {
      const res = await fetchWithAuth(`/api/maintenance-alerts/${id}/read`, {
        method: "PATCH",
      })
      if (!res.ok) throw new Error()
    } catch {
      setAlerts(previous)
      toast.error("No se pudo marcar la notificación como leída")
    }
  }, [alerts])

  const unreadCount = alerts.filter((alert) => !alert.isRead).length

  return (
    <MaintenanceAlertsContext.Provider
      value={{ alerts, isLoading, hasError, unreadCount, refetch: fetchAlerts, markAsRead }}
    >
      {children}
    </MaintenanceAlertsContext.Provider>
  )
}

export function useMaintenanceAlertsContext() {
  const ctx = useContext(MaintenanceAlertsContext)
  if (!ctx) throw new Error("useMaintenanceAlertsContext must be used within MaintenanceAlertsProvider")
  return ctx
}
