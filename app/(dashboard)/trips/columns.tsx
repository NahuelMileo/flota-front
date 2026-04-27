"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export type Trip = {
  id: string;
  departureDate: string;
  arrivalDate: string;
  origin: string;
  destination: string;
  truckId: string;
  truckLicensePlate: string;
  driverName: string | null;
  kilometers: number | null;
  status: number;
  notes: string | null;
};

const tripStatusLabels: Record<number, string> = {
  1: "Programado",
  2: "En progreso",
  3: "Completado",
  4: "Cancelado",
};

const tripStatusColorMap: Record<number, string> = {
  1: "bg-yellow-100 text-yellow-800 border-yellow-300",
  2: "bg-blue-100 text-blue-800 border-blue-300",
  3: "bg-green-100 text-green-800 border-green-300",
  4: "bg-red-100 text-red-800 border-red-300",
};

export function getColumns(
  onView: (trip: Trip) => void,
  onEdit: (trip: Trip) => void,
  onDelete: (trip: Trip) => void,
): ColumnDef<Trip>[] {
  return [
    {
      accessorKey: "departureDate",
      header: "Salida",
      cell: ({ row }) => {
        const date: string = row.getValue("departureDate");
        return new Date(date).toLocaleDateString("es-UY");
      },
    },
    {
      id: "route",
      header: "Ruta",
      cell: ({ row }) => {
        const origin = row.original.origin;
        const destination = row.original.destination;
        return <span>{origin} → {destination}</span>;
      },
    },
    {
      accessorKey: "truckLicensePlate",
      header: "Camión",
      cell: ({ row }) => {
        const plate = row.getValue("truckLicensePlate") as string;
        return <Badge variant="outline">{plate}</Badge>;
      },
    },
    {
      accessorKey: "driverName",
      header: "Chofer",
      cell: ({ row }) => {
        const driver = row.getValue("driverName") as string | null;
        if (!driver) return <span className="text-muted-foreground">—</span>;
        return driver;
      },
    },
    {
      accessorKey: "kilometers",
      header: "Km",
      cell: ({ row }) => {
        const km = row.getValue("kilometers") as number | null;
        if (!km) return <span className="text-muted-foreground">—</span>;
        return `${km} km`;
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as number;
        const label = tripStatusLabels[status] || "Desconocido";
        const colorClass = tripStatusColorMap[status] || "bg-gray-100 text-gray-800 border-gray-300";
        return (
          <Badge variant="outline" className={colorClass}>
            {label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const trip = row.original;
        return (
          <div key={trip.id} className="flex gap-2 justify-end">
            <Button variant="ghost" size="icon" onClick={() => onView(trip)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(trip)}>
              <Pencil className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                }
              />
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar viaje?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará el viaje de{" "}
                    <span className="font-medium text-foreground">
                      {trip.origin}
                    </span>{" "}
                    a{" "}
                    <span className="font-medium text-foreground">
                      {trip.destination}
                    </span>{" "}
                    de tu registro.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => onDelete(trip)}
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];
}
