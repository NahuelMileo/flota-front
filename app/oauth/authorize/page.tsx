"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowLeftRight, BadgeCheck, Eye, Lock, ShieldAlert, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchWithSession } from "@/lib/api"
import { loginUrlReturningHere } from "@/lib/return-to"

/*
  Pantalla de consentimiento OAuth: ChatGPT/Claude abren esta URL cuando un Owner quiere
  conectarlos a Kilometría. Los parámetros los arma el cliente (client_id, redirect_uri,
  code_challenge, state…) y el back valida todo; esta pantalla solo muestra y reenvía.

  Nunca armar URLs de redirección acá: la redirección siempre la devuelve el back, que ya
  verificó que el redirect_uri pertenece al cliente.
*/

type AuthorizeRequest = {
  responseType: string | null
  clientId: string | null
  redirectUri: string | null
  codeChallenge: string | null
  codeChallengeMethod: string | null
  state: string | null
  scope: string | null
  resource: string | null
}

type Validation = {
  clientName: string
  clientHost: string | null
  redirectHost: string
  tenantName: string
  scopes: string[]
}

type ApiError = {
  error?: string
  errorDescription?: string
  redirectUrl?: string | null
}

type ViewState =
  | { kind: "loading" }
  | { kind: "consent"; validation: Validation }
  | { kind: "owner-required" }
  | { kind: "error"; title: string; description: string }
  | { kind: "redirecting"; message: string }

function readRequest(): AuthorizeRequest {
  const params = new URLSearchParams(window.location.search)
  return {
    responseType: params.get("response_type"),
    clientId: params.get("client_id"),
    redirectUri: params.get("redirect_uri"),
    codeChallenge: params.get("code_challenge"),
    codeChallengeMethod: params.get("code_challenge_method"),
    state: params.get("state"),
    scope: params.get("scope"),
    resource: params.get("resource"),
  }
}

function clearLocalSession() {
  // La sesión del servidor ya no existe: si quedara "isAuthenticated", el login devolvería al
  // usuario acá y esta pantalla lo mandaría al login de nuevo, en loop.
  for (const key of ["isAuthenticated", "username", "email", "userId", "tenantId", "tenantName", "displayCurrency"]) {
    localStorage.removeItem(key)
  }
}

const PERMISSIONS = [
  "Ver ingresos, egresos y utilidad",
  "Ver costos fijos por camión y por mes",
  "Ver cuentas a cobrar y clientes",
  "Ver camiones y categorías de egreso",
]

export default function AuthorizePage() {
  const [request, setRequest] = useState<AuthorizeRequest | null>(null)
  const [view, setView] = useState<ViewState>({ kind: "loading" })
  const [submitting, setSubmitting] = useState<"approve" | "deny" | null>(null)

  // Traduce cualquier respuesta no exitosa del back a lo que ve el usuario.
  const handleFailure = useCallback(async (response: Response) => {
    if (response.status === 429) {
      setView({ kind: "error", title: "Demasiados intentos", description: "Esperá un minuto y volvé a intentar la conexión." })
      return
    }

    const body: ApiError = await response.json().catch(() => ({}))
    // 401 sin código OAuth = no hay sesión. Con código (ej. invalid_client) es un error del
    // pedido: mandar al login lo haría volver acá y entrar en loop.
    if (response.status === 401 && !body.error) {
      clearLocalSession()
      window.location.href = loginUrlReturningHere()
      return
    }
    if (body.error === "owner_required") {
      setView({ kind: "owner-required" })
      return
    }
    if (body.redirectUrl) {
      // Error que el back decidió devolverle a la aplicación (ej. parámetros inválidos).
      setView({ kind: "redirecting", message: "Volviendo a la aplicación…" })
      window.location.assign(body.redirectUrl)
      return
    }
    setView({
      kind: "error",
      title: body.error === "invalid_client" ? "Aplicación no reconocida" : "No se puede completar la conexión",
      description:
        body.error === "invalid_client"
          ? "La aplicación que intenta conectarse no está registrada o no es válida."
          : "El pedido de conexión es inválido o venció. Volvé a iniciar la conexión desde ChatGPT o Claude.",
    })
  }, [])

  useEffect(() => {
    const current = readRequest()
    setRequest(current)

    async function validate() {
      try {
        const response = await fetchWithSession("/api/oauth/authorize/validate", {
          method: "POST",
          body: JSON.stringify(current),
        })
        if (!response.ok) {
          await handleFailure(response)
          return
        }
        setView({ kind: "consent", validation: await response.json() })
      } catch {
        setView({ kind: "error", title: "No se pudo conectar con Kilometría", description: "Revisá tu conexión e intentá de nuevo." })
      }
    }

    validate()
  }, [handleFailure])

  async function decide(action: "approve" | "deny") {
    if (!request) return
    setSubmitting(action)
    try {
      const response = await fetchWithSession(`/api/oauth/authorize/${action}`, {
        method: "POST",
        body: JSON.stringify(request),
      })
      if (!response.ok) {
        await handleFailure(response)
        return
      }
      const { redirectUrl } = (await response.json()) as { redirectUrl: string }
      setView({
        kind: "redirecting",
        message: action === "approve" ? "Listo. Volviendo a la aplicación…" : "Conexión cancelada. Volviendo a la aplicación…",
      })
      window.location.assign(redirectUrl)
    } catch {
      setView({ kind: "error", title: "No se pudo conectar con Kilometría", description: "Revisá tu conexión e intentá de nuevo." })
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <span className="text-xl font-semibold tracking-tight text-foreground">Kilometria</span>
          </div>

          {view.kind === "loading" && <LoadingCard />}

          {view.kind === "consent" && (
            <ConsentCard validation={view.validation} submitting={submitting} onDecide={decide} />
          )}

          {view.kind === "owner-required" && (
            <MessageCard
              icon={<ShieldAlert className="h-5 w-5 text-foreground" />}
              title="Solo el dueño de la flota puede conectar un asistente"
              description="Conectar ChatGPT o Claude da acceso a los datos financieros de la empresa. Pedile al dueño de la cuenta que haga la conexión."
              action={<Button variant="outline" className="w-full" onClick={() => (window.location.href = "/dashboard")}>Ir al dashboard</Button>}
            />
          )}

          {view.kind === "error" && (
            <MessageCard
              icon={<TriangleAlert className="h-5 w-5 text-foreground" />}
              title={view.title}
              description={view.description}
              action={<Button variant="outline" className="w-full" onClick={() => (window.location.href = "/dashboard")}>Ir al dashboard</Button>}
            />
          )}

          {view.kind === "redirecting" && (
            <p className="text-center text-sm text-muted-foreground" role="status">{view.message}</p>
          )}
        </div>
      </div>
    </main>
  )
}

function ConsentCard({
  validation,
  submitting,
  onDecide,
}: {
  validation: Validation
  submitting: "approve" | "deny" | null
  onDecide: (action: "approve" | "deny") => void
}) {
  const { clientName, clientHost, redirectHost, tenantName } = validation

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
          <ArrowLeftRight className="h-5 w-5 text-foreground" />
        </div>
        <CardTitle className="text-lg font-semibold text-balance">
          {clientName} quiere acceder a {tenantName}
        </CardTitle>
        <CardDescription className="text-sm">
          {clientHost ? (
            <span className="inline-flex items-center gap-1">
              <BadgeCheck className="h-4 w-4" aria-hidden />
              Aplicación verificada: {clientHost}
            </span>
          ) : (
            <span>El nombre lo informó la propia aplicación. Confirmá que iniciaste esta conexión vos.</span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-0">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Eye className="h-4 w-4" aria-hidden />
            Solo lectura
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {PERMISSIONS.map((permission) => (
              <li key={permission} className="flex gap-2">
                <span aria-hidden>·</span>
                {permission}
              </li>
            ))}
          </ul>
        </div>

        <p className="flex gap-2 rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            No puede crear, modificar ni borrar nada. Podés revocar el acceso en cualquier momento.
          </span>
        </p>

        <p className="text-xs text-muted-foreground">
          Al permitir, vas a volver a <span className="font-medium text-foreground">{redirectHost}</span>.
        </p>
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button variant="outline" className="flex-1" disabled={submitting !== null} onClick={() => onDecide("deny")}>
          {submitting === "deny" ? "Cancelando…" : "Cancelar"}
        </Button>
        <Button className="flex-1" disabled={submitting !== null} onClick={() => onDecide("approve")}>
          {submitting === "approve" ? "Autorizando…" : "Permitir acceso"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function MessageCard({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">{icon}</div>
        <CardTitle className="text-lg font-semibold text-balance">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardFooter>{action}</CardFooter>
    </Card>
  )
}

function LoadingCard() {
  return (
    <Card className="border-border/60" aria-busy="true" aria-label="Verificando la conexión">
      <CardHeader>
        <Skeleton className="mb-3 h-11 w-11 rounded-xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </CardContent>
    </Card>
  )
}
