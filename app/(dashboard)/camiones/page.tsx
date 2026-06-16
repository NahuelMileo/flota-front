"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "./data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api"
import { getColumns } from "./columns"
import { Skeleton } from "@/components/ui/skeleton"
import { TruckForm, type TruckFormValues } from "@/components/truck-form"
import type { Truck } from "@/types/truck"

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border">
      <div className="p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  )
}

export default function TruckPage() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    fetchTrucks()
  }, [])

  async function fetchTrucks() {
    setIsLoading(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/trucks`)
      const data = await res.json()
      if (!res.ok) throw new Error()
      setTrucks(data)
    } catch {
      toast.error("Error al cargar camiones", { position: "bottom-right", richColors: true })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddTruck(data: TruckFormValues) {
    setIsSubmitting(true)
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/trucks`, {
        method: "POST",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setIsAddDialogOpen(false)
      setTrucks((prev) => [...prev, created])
      toast.success("Camión agregado exitosamente", { position: "bottom-right", richColors: true })
    } catch {
      toast.error("Error al agregar camión", { position: "bottom-right", richColors: true })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleEditTruck(data: TruckFormValues) {
    if (!editingTruck) return
    setIsUpdating(true)
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trucks/${editingTruck.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ currentKm: editingTruck.currentKm, ...data }),
        }
      )
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setTrucks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      setEditingTruck(null)
      toast.success("Camión actualizado", { position: "bottom-right", richColors: true })
    } catch {
      toast.error("Error al actualizar camión", { position: "bottom-right", richColors: true })
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleDeleteTruck(truck: Truck) {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trucks/${truck.id}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error()
      setTrucks((prev) => prev.filter((t) => t.id !== truck.id))
      toast.success("Camión eliminado", { position: "bottom-right", richColors: true })
    } catch {
      toast.error("Error al eliminar camión", { position: "bottom-right", richColors: true })
    }
  }

  const columns = getColumns((truck) => setEditingTruck(truck), handleDeleteTruck)

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="mb-20">
        <div className="flex justify-between">
          <h1 className="text-xl font-bold">Camiones</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger render={<Button variant="outline">Añadir un camión</Button>} />
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Agregar camión</DialogTitle>
                <DialogDescription>Agrega un camión a tu flota.</DialogDescription>
              </DialogHeader>
              <TruckForm
                onSubmit={handleAddTruck}
                isSubmitting={isSubmitting}
                submitLabel="Agregar camión"
              />
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">Gestiona tu flota de camiones</p>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingTruck} onOpenChange={(open) => !open && setEditingTruck(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar camión</DialogTitle>
            <DialogDescription>Modificá los datos del camión.</DialogDescription>
          </DialogHeader>
          {editingTruck && (
            <TruckForm
              key={editingTruck.id}
              defaultValues={editingTruck}
              onSubmit={handleEditTruck}
              isSubmitting={isUpdating}
              submitLabel="Guardar cambios"
            />
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={trucks}
          emptyMessage="No hay camiones registrados."
          searchPlaceholder="Buscar camión..."
        />
      )}
    </div>
  )
}
