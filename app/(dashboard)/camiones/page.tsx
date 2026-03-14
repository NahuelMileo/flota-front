"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api";
import { getColumns, Truck } from "./columns";

export default function TruckPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trucks`,
        { method: "GET" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error();
      setTrucks(data);
    } catch {
      toast.error("Error al cargar camiones", {
        position: "bottom-right",
        richColors: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function handleAddTruck(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const licensePlate = formData.get("matricula");
    const model = formData.get("modelo");
    const year = parseInt(formData.get("anio") as string);

    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trucks`,
        {
          method: "POST",
          body: JSON.stringify({ licensePlate, model, year }),
        },
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIsAddDialogOpen(false);
      setTrucks((prev) => [...prev, data]);
      toast.success("Camión agregado exitosamente", {
        position: "bottom-right",
        richColors: true,
      });
    } catch {
      toast.error("Error al agregar camión", {
        position: "bottom-right",
        richColors: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditTruck(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingTruck) return;
    setIsUpdating(true);
    const formData = new FormData(event.currentTarget);
    const licensePlate = formData.get("matricula");
    const model = formData.get("modelo");
    const year = parseInt(formData.get("anio") as string);

    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trucks/${editingTruck.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ licensePlate, model, year }),
        },
      );
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTrucks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTruck(null);
      toast.success("Camión actualizado", {
        position: "bottom-right",
        richColors: true,
      });
    } catch {
      toast.error("Error al actualizar camión", {
        position: "bottom-right",
        richColors: true,
      });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteTruck(truck: Truck) {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trucks/${truck.id}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error();
      setTrucks((prev) => prev.filter((t) => t.id !== truck.id));
      toast.success("Camión eliminado", {
        position: "bottom-right",
        richColors: true,
      });
    } catch {
      toast.error("Error al eliminar camión", {
        position: "bottom-right",
        richColors: true,
      });
    }
  }

  const columns = getColumns(
    (truck) => setEditingTruck(truck),
    handleDeleteTruck,
  );

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="mb-20">
        <div className="flex justify-between">
          <h1 className="text-xl font-bold">Camiones</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger
              render={<Button variant="outline">Añadir un camión</Button>}
            />
            <DialogContent className="sm:max-w-sm">
              <form onSubmit={handleAddTruck}>
                <DialogHeader>
                  <DialogTitle>Agregar camión</DialogTitle>
                  <DialogDescription>
                    Agrega un camión a tu flota.
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup>
                  <Field>
                    <Label htmlFor="matricula">Matrícula</Label>
                    <Input
                      id="matricula"
                      name="matricula"
                      placeholder="ABC1D23"
                      required
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input id="modelo" name="modelo" placeholder="Volvo FH16" />
                  </Field>
                  <Field>
                    <Label htmlFor="anio">Año</Label>
                    <Input
                      id="anio"
                      name="anio"
                      type="number"
                      placeholder="2020"
                    />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <DialogClose
                    render={<Button variant="outline">Cerrar</Button>}
                  />
                  <Button disabled={isSubmitting} type="submit">
                    Agregar camión
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">Gestiona tu flota de camiones</p>
      </div>
      {/* Dialog de editar */}
      <Dialog
        open={!!editingTruck}
        onOpenChange={(open) => !open && setEditingTruck(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <form key={editingTruck?.id} onSubmit={handleEditTruck}>
            <DialogHeader>
              <DialogTitle>Editar camión</DialogTitle>
              <DialogDescription>
                Modificá los datos del camión.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <Label htmlFor="edit-matricula">Matrícula</Label>
                <Input
                  id="edit-matricula"
                  name="matricula"
                  defaultValue={editingTruck?.licensePlate}
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="edit-modelo">Modelo</Label>
                <Input
                  id="edit-modelo"
                  name="modelo"
                  defaultValue={editingTruck?.model}
                />
              </Field>
              <Field>
                <Label htmlFor="edit-anio">Año</Label>
                <Input
                  id="edit-anio"
                  name="anio"
                  type="number"
                  defaultValue={editingTruck?.year}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" type="button">
                    Cerrar
                  </Button>
                }
              />
              <Button disabled={isUpdating} type="submit">
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando camiones...</p>
      ) : (
        <DataTable columns={columns} data={trucks} />
      )}
    </div>
  );
}
