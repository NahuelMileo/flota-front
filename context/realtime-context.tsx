"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import * as signalR from "@microsoft/signalr"
import { apiUrl } from "@/lib/api"

const RealtimeContext = createContext<signalR.HubConnection | null>(null)

// Una sola conexión SignalR por sesión del dashboard. El hub (hubs/maintenance-alerts)
// solo avisa "algo cambió para tu tenant" con eventos sin payload —MaintenanceAlertsChanged,
// DueDatesChanged— y cada pantalla reacciona refetcheando su GET: los datos que se
// muestran siempre salen de REST, nunca del mensaje del socket.
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null)

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(apiUrl("/hubs/maintenance-alerts"), { withCredentials: true })
      .withAutomaticReconnect()
      .build()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConnection(conn)

    // React StrictMode (dev) monta cada efecto dos veces (monta -> limpia -> monta):
    // si el cleanup llamara stop() de forma sincrónica, cortaría la negociación de la
    // primera conexión a mitad de camino ("stopped during negotiation" / "Load failed").
    // Encadenar el stop() al propio start() (con .finally) asegura que solo se cierre
    // una vez que terminó de conectar (o de fallar), nunca a mitad de la negociación.
    const startPromise = conn.start().catch(() => {
      // Si el hub no está disponible, las pantallas siguen funcionando con su fetch
      // inicial; simplemente no se actualizan en tiempo real hasta reconectar.
    })

    return () => {
      startPromise.finally(() => conn.stop())
    }
  }, [])

  return <RealtimeContext.Provider value={connection}>{children}</RealtimeContext.Provider>
}

/** Ejecuta `handler` cada vez que el hub emite `event`. El handler puede cambiar de identidad. */
export function useRealtimeEvent(event: string, handler: () => void) {
  const connection = useContext(RealtimeContext)
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    if (!connection) return
    const listener = () => handlerRef.current()
    connection.on(event, listener)
    return () => connection.off(event, listener)
  }, [connection, event])
}
