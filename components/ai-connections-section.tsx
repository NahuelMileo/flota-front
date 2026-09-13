"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { BadgeCheck, Bot, Check, Copy, Unplug } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { apiUrl, fetchWithAuth } from "@/lib/api"

// Asistentes de IA (ChatGPT, Claude) conectados al servidor MCP de Kilometría.
// Endpoints: GET/DELETE /api/mcp/connections (solo Owner). Revocar corta el acceso en la
// siguiente pregunta del asistente, no cuando vence su token.

type McpConnection = {
  id: string
  clientName: string
  clientHost: string | null
  connectedBy: string
  createdAtUtc: string
  lastUsedAtUtc: string | null
}

function ago(dateUtc: string): string {
  return formatDistanceToNow(new Date(dateUtc), { addSuffix: true, locale: es })
}

export function AiConnectionsSection() {
  const [connections, setConnections] = useState<McpConnection[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "forbidden" | "error">("loading")
  const [copied, setCopied] = useState(false)
  const mcpUrl = apiUrl("/mcp")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchWithAuth("/api/mcp/connections")
        if (res.status === 403) {
          setStatus("forbidden")
          return
        }
        if (!res.ok) throw new Error()
        setConnections(await res.json())
        setStatus("ready")
      } catch {
        setStatus("error")
      }
    }
    load()
  }, [])

  async function handleCopy() {
    await navigator.clipboard.writeText(mcpUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRevoke(connection: McpConnection) {
    try {
      const res = await fetchWithAuth(`/api/mcp/connections/${connection.id}`, { method: "DELETE" })
      if (!res.ok && res.status !== 404) throw new Error()
      setConnections((prev) => prev.filter((c) => c.id !== connection.id))
      toast.success(`${connection.clientName} desconectado`, {
        description: "Ya no puede leer los datos de la empresa.",
      })
    } catch {
      toast.error("No se pudo desconectar", { description: "Intentá de nuevo en unos segundos." })
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 border-b pb-2 font-semibold">
        <Bot className="size-4 text-muted-foreground" />
        Asistentes IA
      </h2>

      <p className="text-sm text-muted-foreground">
        Conectá ChatGPT o Claude para hacerle preguntas sobre la empresa: facturación, utilidad, gastos, costos fijos y
        cuentas a cobrar. Solo pueden leer; no crean, modifican ni borran nada.
      </p>

      {status === "forbidden" ? (
        <p className="rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Solo el dueño de la flota puede ver y administrar los asistentes conectados.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">URL del conector</span>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md border bg-muted/40 px-3 py-2 font-mono text-sm">{mcpUrl}</code>
              <Button size="sm" variant="outline" className="shrink-0 gap-1.5" onClick={handleCopy}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              En ChatGPT o Claude, agregá un conector personalizado con esta URL. Te va a pedir iniciar sesión en Kilometría y
              autorizar el acceso.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Conectados</span>

            {status === "loading" && (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            )}

            {status === "error" && (
              <p className="text-sm text-destructive">No se pudieron cargar los asistentes conectados.</p>
            )}

            {status === "ready" && connections.length === 0 && (
              <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                Todavía no hay asistentes conectados.
              </p>
            )}

            {status === "ready" &&
              connections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between gap-4 rounded-md border px-4 py-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 font-medium">
                      {connection.clientName}
                      {connection.clientHost && (
                        <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
                          <BadgeCheck className="size-3.5" aria-hidden />
                          {connection.clientHost}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Conectado por {connection.connectedBy} {ago(connection.createdAtUtc)} ·{" "}
                      {connection.lastUsedAtUtc ? `último uso ${ago(connection.lastUsedAtUtc)}` : "sin uso todavía"}
                    </span>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger
                      render={<Button size="sm" variant="outline" className="shrink-0 gap-1.5" />}
                    >
                      <Unplug className="size-3.5" />
                      Desconectar
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Desconectar {connection.clientName}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Deja de poder leer los datos de la empresa desde su próxima pregunta. Para volver a usarlo hay que
                          autorizarlo de nuevo.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRevoke(connection)}>Desconectar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
          </div>
        </>
      )}
    </section>
  )
}
