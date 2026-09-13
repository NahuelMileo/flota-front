"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchWithAuth } from "@/lib/api"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
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
import { Bot, Check, Copy, RefreshCw, Trash2, Users, Tag, Lock } from "lucide-react"
import { AiConnectionsSection } from "@/components/ai-connections-section"
import type { ExpenseCategory } from "@/types/expense-category"

type JoinCode = { code: string; expiresAtUtc: string }

function InviteCodeSection() {
  const [joinCode, setJoinCode] = useState<JoinCode | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startCountdown(expiresAtUtc: string) {
    if (timerRef.current) clearInterval(timerRef.current)
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAtUtc).getTime() - Date.now()) / 1000))
      setSecondsLeft(diff)
      if (diff === 0) {
        clearInterval(timerRef.current!)
        setJoinCode(null)
      }
    }
    tick()
    timerRef.current = setInterval(tick, 1000)
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  async function handleGenerate() {
    const tenantId = localStorage.getItem("tenantId")
    if (!tenantId) return
    setIsGenerating(true)
    try {
      const res = await fetchWithAuth(
        `/api/tenants/${tenantId}/join-codes`,
        { method: "POST" }
      )
      if (!res.ok) throw new Error()
      const data: JoinCode = await res.json()
      setJoinCode(data)
      startCountdown(data.expiresAtUtc)
    } catch {
      toast.error("Error al generar el código")
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleCopy() {
    if (!joinCode) return
    await navigator.clipboard.writeText(joinCode.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isExpiringSoon = secondsLeft <= 60 && secondsLeft > 0

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 border-b pb-2 font-semibold">
        <Users className="size-4 text-muted-foreground" />
        Equipo
      </h2>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Generá un código de invitación temporal para que un nuevo usuario se una a tu empresa. El código es válido por 5 minutos y de un solo uso.
        </p>

        {joinCode && secondsLeft > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-between rounded-md border bg-muted/40 px-4 py-2.5">
                <span className="font-mono text-lg font-semibold tracking-widest">
                  {joinCode.code}
                </span>
                <span className={`text-xs tabular-nums ${isExpiringSoon ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                  {minutes}:{String(seconds).padStart(2, "0")}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-1.5"
                onClick={handleCopy}
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="w-fit gap-1.5 text-muted-foreground"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <RefreshCw className="size-3.5" />
              Generar nuevo código
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-fit"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "Generando..." : "Generar código de invitación"}
          </Button>
        )}
      </div>
    </section>
  )
}

function CategoriesSection() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    setIsLoading(true)
    try {
      const res = await fetchWithAuth(`/api/expense-categories`)
      if (!res.ok) throw new Error()
      setCategories(await res.json())
    } catch {
      toast.error("Error al cargar categorías")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setIsAdding(true)
    try {
      const res = await fetchWithAuth(
        `/api/expense-categories`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }
      )
      if (!res.ok) throw new Error()
      const created: ExpenseCategory = await res.json()
      setCategories((prev) => [...prev, created])
      setNewName("")
      toast.success("Categoría creada")
    } catch {
      toast.error("Error al crear categoría")
    } finally {
      setIsAdding(false)
    }
  }

  async function handleDelete(category: ExpenseCategory) {
    try {
      const res = await fetchWithAuth(
        `/api/expense-categories/${category.id}`,
        { method: "DELETE" }
      )
      if (res.status === 400) {
        toast.error("Esta categoría está en uso y no se puede eliminar.")
        return
      }
      if (!res.ok) throw new Error()
      setCategories((prev) => prev.filter((c) => c.id !== category.id))
      toast.success("Categoría eliminada")
    } catch {
      toast.error("Error al eliminar categoría")
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="border-b pb-2 font-semibold">Categorías de egresos</h2>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre de la nueva categoría"
          className="flex-1"
        />
        <Button type="submit" disabled={isAdding || !newName.trim()} size="sm" className="border-primary">
          Agregar
        </Button>
      </form>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay categorías registradas.</p>
      ) : (
        <ul className="divide-y">
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">{cat.name}</span>
                {cat.isDefault && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Por defecto
                  </Badge>
                )}
              </div>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Eliminar categoría"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  }
                />
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se eliminará la categoría <strong>{cat.name}</strong>. Si está en uso por algún egreso o costo fijo, no se podrá eliminar.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => handleDelete(cat)}
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ChangePasswordSection() {
  const router = useRouter()
  const MINIMUM_PASSWORD_LENGTH = 8
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  function validateForm() {
    const newErrors: Record<string, string> = {}

    if (!currentPassword.trim()) {
      newErrors.currentPassword = "La contraseña actual es requerida"
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "La contraseña nueva es requerida"
    } else if (newPassword.length < MINIMUM_PASSWORD_LENGTH) {
      newErrors.newPassword = `La contraseña debe tener al menos ${MINIMUM_PASSWORD_LENGTH} caracteres`
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Debe confirmar la contraseña"
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const res = await fetchWithAuth(
        `/api/users/me/password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      )

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg: string = data.message || ""
        if (res.status === 400 && msg.startsWith("Current password")) {
          setErrors({ currentPassword: "La contraseña actual es incorrecta" })
        } else if (res.status === 400 && msg.toLowerCase().includes("weak patterns")) {
          setErrors({ newPassword: "La contraseña contiene patrones comunes débiles. Elegí una más única." })
        } else if (res.status === 400 && msg.toLowerCase().includes("too weak")) {
          setErrors({ newPassword: "La contraseña es muy débil. Combiná mayúsculas, minúsculas, números y símbolos." })
        } else {
          toast.error(msg || "Error al cambiar la contraseña")
        }
        setIsLoading(false)
        return
      }

      toast.success("Contraseña actualizada correctamente")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setErrors({})

      setTimeout(async () => {
        try {
          await fetchWithAuth("/api/auth/logout", { method: "POST" })
        } catch {
          // igual limpiamos el estado local aunque el logout remoto falle
        }
        localStorage.removeItem("isAuthenticated")
        localStorage.removeItem("username")
        localStorage.removeItem("email")
        localStorage.removeItem("userId")
        localStorage.removeItem("tenantId")
        localStorage.removeItem("tenantName")
        localStorage.removeItem("displayCurrency")
        router.push("/login")
      }, 1500)
    } catch {
      toast.error("Error al cambiar la contraseña")
      setIsLoading(false)
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="border-b pb-2 font-semibold">Cambiar contraseña</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="current-password" className="text-sm font-medium">
            Contraseña actual
          </label>
          <Input
            id="current-password"
            type="password"
            placeholder="Ingresá tu contraseña actual"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value)
              if (errors.currentPassword) {
                setErrors((prev) => {
                  const updated = { ...prev }
                  delete updated.currentPassword
                  return updated
                })
              }
            }}
          />
          {errors.currentPassword && (
            <p className="text-xs text-destructive">{errors.currentPassword}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="new-password" className="text-sm font-medium">
            Contraseña nueva
          </label>
          <Input
            id="new-password"
            type="password"
            placeholder="Ingresá tu nueva contraseña"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              if (errors.newPassword) {
                setErrors((prev) => {
                  const updated = { ...prev }
                  delete updated.newPassword
                  return updated
                })
              }
            }}
          />
          {errors.newPassword && (
            <p className="text-xs text-destructive">{errors.newPassword}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Mínimo {MINIMUM_PASSWORD_LENGTH} caracteres
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirm-password" className="text-sm font-medium">
            Confirmar contraseña
          </label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirmá tu nueva contraseña"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword) {
                setErrors((prev) => {
                  const updated = { ...prev }
                  delete updated.confirmPassword
                  return updated
                })
              }
            }}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full border-primary sm:w-auto">
          {isLoading ? "Cambiando..." : "Cambiar contraseña"}
        </Button>
      </form>
    </section>
  )
}

export default function ConfiguracionPage() {
  const [activeSection, setActiveSection] = useState("equipo")

  const sections = [
    { id: "equipo", label: "Equipo", icon: Users },
    { id: "categorias", label: "Categorías", icon: Tag },
    { id: "seguridad", label: "Seguridad", icon: Lock },
    { id: "asistentes", label: "Asistentes IA", icon: Bot },
  ]

  return (
    <div className="p-6 flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Administrá la configuración de tu empresa</p>

      <div className="flex gap-6 max-w-5xl">
        {/* Sidebar */}
        <nav className="flex w-48 shrink-0 flex-col gap-1">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  activeSection === section.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                <span>{section.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 space-y-4 min-w-0">
          {activeSection === "equipo" && <InviteCodeSection />}
          {activeSection === "categorias" && <CategoriesSection />}
          {activeSection === "seguridad" && <ChangePasswordSection />}
          {activeSection === "asistentes" && <AiConnectionsSection />}
        </div>
      </div>
    </div>
  )
}
