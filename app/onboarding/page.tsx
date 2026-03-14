"use client"

import { useState } from "react"
import { Building2, Users, ArrowRight, Ticket } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { toast } from "sonner"
import OnboardingAuth from "@/components/ui/onboarding-auth"
import { fetchWithAuth } from "@/lib/api"

export default function OnboardingPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  async function handleCreateCompany(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const companyName = formData.get("company-name") as string

    if (!companyName?.trim()) return

    setIsCreating(true)
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenants`,
        {
          method: "POST",
          body: JSON.stringify({ companyName }),
        }
      )

      const data = await response.json()
      if (!response.ok) {
        toast.error("Error al crear la empresa", {
          description:
            data.message ||
            "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
          position: "bottom-right",
          richColors: true,
        })
        return
      }

      toast.success("Empresa creada exitosamente", {
        description: "Redirigiendote al dashboard...",
        position: "bottom-right",
        richColors: true, 
      })

      if (data.tenantId) {
        localStorage.setItem("tenantId", data.tenantId)
      }

      localStorage.setItem("accessToken", data.accessToken);


      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1500);
     
    } catch (error) {
      toast.error("Error al crear la empresa", {
        description:
          "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        position: "bottom-right",
        richColors: true,
      })
    } finally {
      setIsCreating(false)
    }
  }

  async function handleJoinCompany(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const inviteCode = formData.get("invite-code") as string

    if (!inviteCode?.trim()) return

    setIsJoining(true)
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/companies/join`,
        {
          method: "POST",
          body: JSON.stringify({ inviteCode }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        toast.error("Error al unirse a la empresa", {
          description:
            data.message ||
            "Código de invitación inválido. Por favor, verifica e intenta de nuevo.",
          position: "bottom-right",
          richColors: true,
        })
        return
      }

      toast.success("Te has unido exitosamente", {
        description: "Redirigiendote al dashboard...",
        position: "bottom-right",
        richColors: true,
      })

      if (data.tenantId) {
        localStorage.setItem("tenantId", data.tenantId)
      }

      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1500)
    } catch (error) {
      toast.error("Error al unirse a la empresa", {
        description:
          "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        position: "bottom-right",
        richColors: true,
      })
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <OnboardingAuth>
    <main className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          {/* Logo */}
          <div className="mb-12 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground">
                <span className="text-lg font-bold text-background">M</span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-foreground">
                Mileo Express
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Bienvenido a Mileo Express
            </h1>
            <p className="mt-3 text-pretty text-base text-muted-foreground sm:text-lg">
              Para continuar, crea tu empresa o únete a una existente.
            </p>
            <p className="mt-2 text-sm text-muted-foreground/80">
              Cada cuenta debe pertenecer a un espacio de trabajo antes de acceder a la plataforma.
            </p>
          </div>

          {/* Cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Create Company Card */}
            <Card className="group relative overflow-hidden border-border/60 bg-card transition-all duration-200 hover:border-foreground/20 hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                  <Building2 className="h-5 w-5 text-foreground" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Crear una empresa
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Configura una nueva empresa y conviértete en su propietario.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleCreateCompany}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="company-name">Nombre de la empresa</FieldLabel>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="company-name"
                          name="company-name"
                          type="text"
                          placeholder="Ingresa el nombre de la empresa"
                          required
                          className="pl-10"
                        />
                      </div>
                    </Field>
                    <Field>
                      <Button 
                        type="submit"
                        className="w-full gap-2"
                        disabled={isCreating}
                      >
                        {isCreating ? "Creando..." : "Crear empresa"}
                        {!isCreating && <ArrowRight className="h-4 w-4" />}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>

            {/* Join Company Card */}
            <Card className="group relative overflow-hidden border-border/60 bg-card transition-all duration-200 hover:border-foreground/20 hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                  <Users className="h-5 w-5 text-foreground" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Unirse a una empresa
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Usa un código de invitación compartido por el propietario.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleJoinCompany}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="invite-code">Código de invitación</FieldLabel>
                      <div className="relative">
                        <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="invite-code"
                          name="invite-code"
                          type="text"
                          placeholder="Ingresa el código de invitación"
                          required
                          className="pl-10"
                        />
                      </div>
                    </Field>
                    <Field>
                      <Button 
                        type="submit"
                        variant="outline" 
                        className="w-full gap-2 border-border/60 hover:border-foreground/20 hover:bg-secondary"
                        disabled={isJoining}
                      >
                        {isJoining ? "Uniéndose..." : "Unirse con código"}
                        {!isJoining && <ArrowRight className="h-4 w-4" />}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Footer Note */}
          <p className="mt-8 text-center text-sm text-muted-foreground/70">
            Siempre puedes cambiar de empresa más tarde si tu rol lo permite.
          </p>
        </div>
      </div>
    </main>
    </OnboardingAuth>
  )
}
