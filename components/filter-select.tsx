"use client"

import type { LucideIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

export type FilterOption = { label: string; value: string }

type Props = {
  /** Qué se filtra: "Camión", "Cliente", "Estado". */
  label: string
  /** `null` = sin filtrar. */
  value: string | null
  onChange: (value: string | null) => void
  options: FilterOption[]
  /** Texto de la opción sin filtro: "Todos". */
  allLabel: string
  /** Ícono del dominio que se filtra; ayuda a reconocer el control de un vistazo. */
  icon?: LucideIcon
}

/**
 * Filtro de listado. No es un campo de formulario —no se completa, describe el estado de
 * la vista— así que no va encajonado como un input. Pero sin ningún contorno se pierde
 * de vista: el borde punteado lo marca como un control que espera una elección, y al
 * elegir una pasa a borde sólido con fondo, de modo que se ve al golpe cuáles filtros
 * están puestos sin tener que leer los valores.
 */
export function FilterSelect({ label, value, onChange, options, allLabel, icon: Icon }: Props) {
  const items = [{ label: allLabel, value: "all" }, ...options]
  const selected = options.find((o) => o.value === value)
  const isActive = !!selected

  return (
    <Select
      items={items}
      value={value ?? "all"}
      onValueChange={(next) => onChange(next === "all" ? null : next)}
    >
      <SelectTrigger
        aria-label={label}
        className={
          isActive
            ? "gap-1.5 border-border bg-muted px-2.5 hover:bg-muted/70"
            : "gap-1.5 border-dashed border-border/70 bg-transparent px-2.5 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
        }
      >
        {Icon && <Icon aria-hidden className="size-3.5 opacity-70" />}
        <span className={isActive ? "text-muted-foreground" : ""}>{label}</span>
        <span className={isActive ? "font-medium text-foreground" : ""}>
          {selected?.label ?? allLabel}
        </span>
      </SelectTrigger>
      {/*
        El popup por defecto copia el ancho del trigger y se superpone alineando la
        opción elegida; con un trigger angosto queda apretado y saltando de posición.
        Y llegaba con sombra media y anillo, un peso visual que no pega con un control
        liviano: va apoyado en un borde fino y una sombra suave, desplegado debajo.
      */}
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        className="w-auto min-w-[max(var(--anchor-width),10rem)] rounded-lg border border-border p-1 shadow-sm ring-0"
      >
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value} className="py-1.5 pl-2">
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
