"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api";
import { useMaintenanceConcepts } from "@/hooks/use-maintenance-concepts";
import { getColumns } from "./columns";
import AddConceptForm from "./AddConceptForm";
import EditConceptForm from "./EditConceptForm";
import type { MaintenanceConcept } from "@/types/maintenance";
import type { ExpenseCategory } from "@/types/expense-category";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border">
      <div className="p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function ConceptsPage() {
  const { concepts, isLoading, refresh } = useMaintenanceConcepts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingConcept, setEditingConcept] = useState<MaintenanceConcept | null>(
    null
  );
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  useEffect(() => {
    fetchWithAuth(`/api/expense-categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Error al cargar categorías"));
  }, []);

  // ================= CRUD =================
  const handleAddConcept = (newConcept: MaintenanceConcept) => {
    refresh();
    setIsAddDialogOpen(false);
  };

  const handleUpdateConcept = (updated: MaintenanceConcept) => {
    refresh();
    setEditingConcept(null);
  };

  const handleDeleteConcept = useCallback(
    async (concept: MaintenanceConcept) => {
      try {
        const res = await fetchWithAuth(
          `/api/maintenances/concepts/${concept.id}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error();

        refresh();
        toast.success("Concepto eliminado");
      } catch {
        toast.error("Error al eliminar concepto");
      }
    },
    [refresh]
  );

  const columns = useMemo(
    () =>
      getColumns(
        (concept) => setEditingConcept(concept),
        handleDeleteConcept
      ),
    [handleDeleteConcept]
  );

  // ================= UI =================
  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/mantenimientos">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Conceptos de Mantenimiento</h1>
        </div>

        <Button onClick={() => setIsAddDialogOpen(true)}>
          Crear concepto
        </Button>

        <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Crear concepto</SheetTitle>
              <SheetDescription>
                Define un tipo de mantenimiento reutilizable.
              </SheetDescription>
            </SheetHeader>

            <div className="px-4 pb-6">
              <AddConceptForm categories={categories} onSuccess={handleAddConcept} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* EDIT SHEET */}
      <Sheet
        open={!!editingConcept}
        onOpenChange={(open) => {
          if (!open) setEditingConcept(null);
        }}
      >
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar concepto</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            {editingConcept && (
              <EditConceptForm
                concept={editingConcept}
                categories={categories}
                onSuccess={handleUpdateConcept}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={concepts}
          emptyMessage="No hay conceptos creados."
          searchPlaceholder="Buscar concepto..."
        />
      )}
    </div>
  );
}
