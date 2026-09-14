"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api"
import { useRealtimeEvent } from "@/context/realtime-context"
import type { DueDate } from "@/types/due-date"

// Vencido > vence hoy > próximo; dentro de cada grupo, no leídos primero y el más cercano primero.
const STATUS_PRIORITY: Partial<Record<DueDate["status"], number>> = {
  Overdue: 0,
  DueToday: 1,
  Upcoming: 2,
}

function sortReminders(reminders: DueDate[]): DueDate[] {
  return [...reminders].sort((a, b) => {
    const pa = STATUS_PRIORITY[a.status] ?? 3
    const pb = STATUS_PRIORITY[b.status] ?? 3
    if (pa !== pb) return pa - pb
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1
    return a.dueOn.localeCompare(b.dueOn)
  })
}

interface DueDateRemindersContextType {
  reminders: DueDate[]
  isLoading: boolean
  hasError: boolean
  unreadCount: number
  refetch: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
}

const DueDateRemindersContext = createContext<DueDateRemindersContextType | null>(null)

// Avisos de vencimientos para la campanita. El backend calcula la etapa con la fecha de
// hoy: no hay evento de socket cuando cambia el día, así que además de DueDatesChanged se
// refetchea al volver a la pestaña (una pestaña abierta desde ayer ve los avisos de hoy).
export function DueDateRemindersProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<DueDate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const fetchReminders = useCallback(async () => {
    setIsLoading(true)
    setHasError(false)
    try {
      const res = await fetchWithAuth("/api/due-dates/notifications")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setReminders(sortReminders(Array.isArray(data) ? data : []))
    } catch {
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReminders()
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchReminders()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [fetchReminders])

  useRealtimeEvent("DueDatesChanged", fetchReminders)

  const markAsRead = useCallback(async (id: string) => {
    const previous = reminders
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, isRead: true } : r)))
    try {
      const res = await fetchWithAuth(`/api/due-dates/${id}/read`, { method: "PATCH" })
      if (!res.ok) throw new Error()
    } catch {
      setReminders(previous)
      toast.error("No se pudo marcar el aviso como leído")
    }
  }, [reminders])

  const unreadCount = reminders.filter((r) => !r.isRead).length

  return (
    <DueDateRemindersContext.Provider
      value={{ reminders, isLoading, hasError, unreadCount, refetch: fetchReminders, markAsRead }}
    >
      {children}
    </DueDateRemindersContext.Provider>
  )
}

export function useDueDateReminders() {
  const ctx = useContext(DueDateRemindersContext)
  if (!ctx) throw new Error("useDueDateReminders must be used within DueDateRemindersProvider")
  return ctx
}
