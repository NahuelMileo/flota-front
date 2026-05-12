"use client"

import { useEffect, useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Trash2 } from "lucide-react"
import type { ExpenseCategory } from "@/types/expense-category"

export default function ConfiguracionPage() {
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
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/expense-categories`)
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/expense-categories`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/expense-categories/${category.id}`,
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
    <div className="p-6 flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Administrá las categorías de egresos de tu empresa</p>
      </div>

      <div className="rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-sm">Categorías de egresos</h2>
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} className="px-4 py-3 border-b flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre de la nueva categoría"
            className="flex-1"
          />
          <Button type="submit" disabled={isAdding || !newName.trim()} size="sm">
            Agregar
          </Button>
        </form>

        {/* List */}
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No hay categorías registradas.
          </div>
        ) : (
          <ul className="divide-y">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between px-4 py-2.5">
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
                      <button className="p-1.5 rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="size-4" />
                      </button>
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
      </div>
    </div>
  )
}
