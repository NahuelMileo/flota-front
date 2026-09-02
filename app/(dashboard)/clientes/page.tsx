"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api"
import { ClientForm, type ClientFormValues } from "@/components/client-form"
import type { Client, ClientListResponse } from "@/types/client"

const PAGE_SIZE = 20

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
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
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
      setDeletingClient(null)
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

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="mb-20">
        <div className="flex justify-between">
          <h1 className="text-xl font-bold">Clientes</h1>
          <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <SheetTrigger render={<Button variant="outline">Nuevo cliente</Button>} />
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
        </div>
        <p className="text-muted-foreground">Gestiona los clientes de tu empresa</p>
      </div>

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

      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar cliente..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <div className="rounded-md border p-6 text-center text-muted-foreground">
          No se pudieron cargar los clientes.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-0" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length ? (
                  clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Editar cliente"
                            onClick={() => setEditingClient(client)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog
                            open={deletingClient?.id === client.id}
                            onOpenChange={(open) => !open && setDeletingClient(null)}
                          >
                            <AlertDialogTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Eliminar cliente"
                                  onClick={() => setDeletingClient(client)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              }
                            />
                            <AlertDialogContent size="sm">
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará el cliente{" "}
                                  <span className="font-medium text-foreground">{client.name}</span>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  variant="destructive"
                                  disabled={isDeleting}
                                  onClick={() => handleDeleteClient(client)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                      No hay clientes registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {pageCount > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Página {page} de {pageCount}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page >= pageCount}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
