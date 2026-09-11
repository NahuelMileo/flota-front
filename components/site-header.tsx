"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDateFilter } from "@/context/date-filter-context";
import { useCurrency } from "@/context/currency-context";
import { usePathname } from "next/navigation";
import { DatePicker } from "./ui/date-picker";
import type { DisplayCurrency } from "@/lib/format";
import { MaintenanceNotificationsBell } from "@/components/notifications/maintenance-notifications-bell";

const CURRENCIES: DisplayCurrency[] = ["USD", "BRL", "UYU"];

export function SiteHeader() {
  const pathname = usePathname();
  const { selectedDate, setSelectedDate } = useDateFilter();
  const { displayCurrency, setDisplayCurrency } = useCurrency();

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
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <div
            role="group"
            aria-label="Moneda de visualización"
            className="flex h-8 items-center gap-0.5 rounded-lg bg-muted p-0.5"
          >
            {CURRENCIES.map((cur) => (
              <button
                key={cur}
                type="button"
                aria-pressed={displayCurrency === cur}
                onClick={() => setDisplayCurrency(cur)}
                className={`flex h-full cursor-pointer items-center rounded-md px-2 text-xs font-medium transition-colors ${
                  displayCurrency === cur
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
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
          <MaintenanceNotificationsBell />
        </div>
      </div>
    </header>
  );
}
