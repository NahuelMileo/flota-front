"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { DataTable, DataTableSkeleton } from "@/components/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api"
import { getColumns } from "./columns"
import { TruckForm, type TruckFormValues } from "@/components/truck-form"
import type { Truck } from "@/types/truck"

export default function TruckPage() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null)
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)

  useEffect(() => {
    fetchTrucks()
  }, [])

  async function fetchTrucks() {
    setIsLoading(true)
    try {
      const res = await fetchWithAuth(`/api/trucks`)
      const data = await res.json()
      if (!res.ok) throw new Error()
      setTrucks(data)
    } catch {
      toast.error("Error al cargar camiones")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddTruck(data: TruckFormValues) {
    setIsSubmitting(true)
    try {
      const res = await fetchWithAuth(`/api/trucks`, {
        method: "POST",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setIsAddSheetOpen(false)
      setTrucks((prev) => [...prev, created])
      toast.success("Camión agregado exitosamente")
    } catch {
      toast.error("Error al agregar camión")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleEditTruck(data: TruckFormValues) {
    if (!editingTruck) return
    setIsUpdating(true)
    try {
      const res = await fetchWithAuth(
        `/api/trucks/${editingTruck.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ currentKm: editingTruck.currentKm, ...data }),
        }
      )
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setTrucks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      setEditingTruck(null)
      toast.success("Camión actualizado")
    } catch {
      toast.error("Error al actualizar camión")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteTruck = useCallback(async (truck: Truck) => {
    try {
      const res = await fetchWithAuth(
        `/api/trucks/${truck.id}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error()
      setTrucks((prev) => prev.filter((t) => t.id !== truck.id))
      toast.success("Camión eliminado")
    } catch {
      toast.error("Error al eliminar camión")
    }
  }, [])

  // Memoizado porque recrear las columnas cambia la identidad de las funciones `cell`, y
  // flexRender las usa como tipo de componente: React desmonta y vuelve a montar todas
  // las celdas en cada render.
  const columns = useMemo(
    () => getColumns((truck) => setEditingTruck(truck), handleDeleteTruck),
    [handleDeleteTruck],
  )

  return (
    <div className="p-6 flex flex-col gap-4">
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
        <DataTableSkeleton columns={6} showToolbarAction />
      ) : (
        <DataTable
          columns={columns}
          data={trucks}
          emptyMessage="No hay camiones registrados."
          searchPlaceholder="Buscar camión..."
          toolbarAction={
            <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
              <SheetTrigger render={<Button>Añadir camión</Button>} />
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Agregar camión</SheetTitle>
                  <SheetDescription>Registrá un camión en tu flota.</SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6">
                  <TruckForm
                    onSubmit={handleAddTruck}
                    isSubmitting={isSubmitting}
                    submitLabel="Agregar camión"
                  />
                </div>
              </SheetContent>
            </Sheet>
          }
        />
      )}
    </div>
  )
}
