"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { DataTable, DataTableSkeleton } from "@/components/data-table"
import { getColumns } from "./columns"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api"
import { ClientForm, type ClientFormValues } from "@/components/client-form"
import type { Client, ClientListResponse } from "@/types/client"

const PAGE_SIZE = 20

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const fetchClients = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      })
      if (search) params.set("search", search)
      const res = await fetchWithAuth(`/api/clients?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data: ClientListResponse = await res.json()
      setClients(data.items)
      setTotalCount(data.totalCount)
    } catch {
      setIsError(true)
      toast.error("Error al cargar clientes")
    } finally {
      setIsLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  async function handleAddClient(data: ClientFormValues) {
    setIsSubmitting(true)
    try {
      const res = await fetchWithAuth(`/api/clients`, {
        method: "POST",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setIsAddDialogOpen(false)
      toast.success("Cliente agregado exitosamente")
      await fetchClients()
    } catch {
      toast.error("Error al agregar cliente")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleEditClient(data: ClientFormValues) {
    if (!editingClient) return
    setIsUpdating(true)
    try {
      const res = await fetchWithAuth(`/api/clients/${editingClient.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setEditingClient(null)
      toast.success("Cliente actualizado")
      await fetchClients()
    } catch {
      toast.error("Error al actualizar cliente")
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleDeleteClient(client: Client) {
    setIsDeleting(true)
    try {
      const res = await fetchWithAuth(`/api/clients/${client.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success("Cliente eliminado")
      if (clients.length === 1 && page > 1) {
        setPage((p) => p - 1)
      } else {
        await fetchClients()
      }
    } catch {
      toast.error("Error al eliminar cliente")
    } finally {
      setIsDeleting(false)
    }
  }

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const columns = useMemo(
    () => getColumns(setEditingClient, handleDeleteClient, isDeleting),
    // handleDeleteClient se redefine en cada render; las columnas solo dependen
    // de lo que muestran.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDeleting],
  )

  return (
    <div className="p-6 flex flex-col gap-4">
      {/* Edit sheet */}
      <Sheet open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar cliente</SheetTitle>
            <SheetDescription>Modificá el nombre del cliente.</SheetDescription>
          </SheetHeader>
          <div className="px-4">
            {editingClient && (
              <ClientForm
                key={editingClient.id}
                defaultValues={editingClient}
                onSubmit={handleEditClient}
                isSubmitting={isUpdating}
                submitLabel="Guardar cambios"
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {isLoading ? (
        <DataTableSkeleton columns={3} showToolbarAction />
      ) : isError ? (
        <p className="text-sm text-muted-foreground">No se pudieron cargar los clientes.</p>
      ) : (
        <DataTable
          columns={columns}
          data={clients}
          emptyMessage="No hay clientes registrados."
          searchPlaceholder="Buscar cliente..."
          toolbarAction={
            <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <SheetTrigger render={<Button>Nuevo cliente</Button>} />
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Agregar cliente</SheetTitle>
                  <SheetDescription>Agrega un cliente a tu empresa.</SheetDescription>
                </SheetHeader>
                <div className="px-4">
                  <ClientForm
                    onSubmit={handleAddClient}
                    isSubmitting={isSubmitting}
                    submitLabel="Agregar cliente"
                  />
                </div>
              </SheetContent>
            </Sheet>
          }
          serverSide={{
            page,
            pageCount,
            onPageChange: setPage,
            search: searchInput,
            onSearchChange: setSearchInput,
          }}
        />
      )}
    </div>
  )
}
