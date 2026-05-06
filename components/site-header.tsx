"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDateFilter } from "@/context/date-filter-context";
import { useCurrency } from "@/context/currency-context";
import { usePathname } from "next/navigation";
import { DatePicker } from "./ui/date-picker";
import type { DisplayCurrency } from "@/lib/format";

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
    </header>
  );
}
