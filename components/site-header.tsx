"use client";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useDateFilter } from "@/context/date-filter-context";
import { useCurrency } from "@/context/currency-context";
import { usePathname } from "next/navigation";
import { DatePicker } from "./ui/date-picker";
import type { DisplayCurrency } from "@/lib/format";
import { WhatsNewModal, type WhatsNewNote } from "@/components/whats-new-modal";

const CURRENCIES: DisplayCurrency[] = ["USD", "BRL", "UYU"];

// TODO(preview): borrar este flag y el bloque asociado una vez validado visualmente
const WHATS_NEW_PREVIEW = true;

const MOCK_WHATS_NEW_NOTES: WhatsNewNote[] = [
  {
    id: "1",
    title: "Costos fijos por camión",
    description:
      "Ahora podés configurar los km mensuales estimados para calcular el costo/km automáticamente.",
    imageUrl: "https://picsum.photos/seed/novedad1/480/240",
  },
  {
    id: "2",
    title: "Categorías de egresos dinámicas",
    description:
      "Creá y administrá tus propias categorías de egresos desde Configuración.",
    imageUrl: "https://picsum.photos/seed/novedad2/480/240",
  },
  {
    id: "3",
    title: "Lecturas de odómetro",
    description:
      "El km actual del camión ahora se actualiza también desde combustible, mantenimientos y viajes.",
    imageUrl: "https://picsum.photos/seed/novedad3/480/240",
  },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { selectedDate, setSelectedDate } = useDateFilter();
  const { displayCurrency, setDisplayCurrency } = useCurrency();
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);

  // Detectar si es una ruta de detalle y mostrar título apropiado
  const getTitleFromPathname = (path: string): string => {
    const segments = path.split("/").filter(Boolean);

    // Si es /trips/[id], mostrar "Ver viaje"
    if (segments[0] === "trips" && segments[1]) {
      return "Ver viaje";
    }

    // Si es /camiones/[id], mostrar "Detalle de camión"
    if (segments[0] === "camiones" && segments[1]) {
      return "Detalle de camión";
    }

    // Si es /mantenimientos/conceptos/[id], mostrar "Detalle de concepto"
    if (segments[0] === "mantenimientos" && segments[1] === "conceptos" && segments[2]) {
      return "Detalle de concepto";
    }

    // Para otras rutas, usar el último segmento capitalizado
    const lastSegment = segments.pop() || "Inicio";
    return lastSegment
      .replace(/^\w/, (c) => c.toUpperCase())
      .replace(/-/g, " ");
  };

  const title = getTitleFromPathname(pathname);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          {WHATS_NEW_PREVIEW && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWhatsNewOpen(true)}
            >
              Preview novedades
            </Button>
          )}
          <div className="flex rounded-md border overflow-hidden">
            {CURRENCIES.map((cur) => (
              <button
                key={cur}
                type="button"
                onClick={() => setDisplayCurrency(cur)}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  displayCurrency === cur
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
          <DatePicker
            value={selectedDate}
            onChange={(d) => setSelectedDate(d ?? null)}
          />
        </div>
      </div>
      {WHATS_NEW_PREVIEW && (
        <WhatsNewModal
          notes={MOCK_WHATS_NEW_NOTES}
          open={whatsNewOpen}
          onClose={() => setWhatsNewOpen(false)}
        />
      )}
    </header>
  );
}
