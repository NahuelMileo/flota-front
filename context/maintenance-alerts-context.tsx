"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import * as signalR from "@microsoft/signalr"
import { fetchWithAuth, apiUrl } from "@/lib/api"
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

// Conexión SignalR única compartida por toda la sesión del dashboard: el hub solo
// avisa "algo cambió para tu tenant" (sin payload), y acá reaccionamos refetcheando
// el mismo GET que ya se usaba antes — así los datos que se muestran siempre vienen
// de la fuente de verdad (REST), nunca del mensaje del socket.
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

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(apiUrl("/hubs/maintenance-alerts"), { withCredentials: true })
      .withAutomaticReconnect()
      .build()

    connection.on("MaintenanceAlertsChanged", () => {
      fetchAlerts()
    })

    // React StrictMode (dev) monta cada efecto dos veces (monta -> limpia -> monta):
    // si el cleanup llamara stop() de forma sincrónica, cortaría la negociación de la
    // primera conexión a mitad de camino ("stopped during negotiation" / "Load failed").
    // Encadenar el stop() al propio start() (con .finally) asegura que solo se cierre
    // una vez que terminó de conectar (o de fallar), nunca a mitad de la negociación.
    const startPromise = connection.start().catch(() => {
      // Si el hub no está disponible, la campanita sigue funcionando con el fetch
      // inicial; simplemente no se actualiza en tiempo real hasta reconectar.
    })

    return () => {
      startPromise.finally(() => connection.stop())
    }
  }, [fetchAlerts])

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
