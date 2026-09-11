// components/ui/date-picker.tsx
"use client"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: Date | null
  onChange?: (date: Date | undefined) => void
}

const MONTH_ITEMS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i),
  label: format(new Date(2000, i, 1), "MMMM", { locale: es }),
}))

const YEAR_RANGE = { past: 10, future: 5 }

export function DatePicker({ value, onChange }: DatePickerProps) {
  const view = value ?? new Date()
  const today = new Date()
  const currentYear = today.getFullYear()
  const yearItems = Array.from(
    { length: YEAR_RANGE.past + YEAR_RANGE.future + 1 },
    (_, i) => currentYear - YEAR_RANGE.past + i
  ).map((year) => ({ value: String(year), label: String(year) }))

  const selectMonth = (year: number, month: number) => {
    onChange?.(new Date(year, month, 1))
  }

  const goToMonth = (offset: number) => {
    const next = new Date(view.getFullYear(), view.getMonth() + offset, 1)
    onChange?.(next)
  }

  const handleClear = () => {
    onChange?.(undefined)
  }

  const isSameMonth = (date: Date, comparison: Date) =>
    date.getFullYear() === comparison.getFullYear() &&
    date.getMonth() === comparison.getMonth()

  const previousMonth = new Date(currentYear, today.getMonth() - 1, 1)

  return (
    <Popover>
      <PopoverTrigger render={
        <Button
          variant="outline"
          aria-label={value ? `Período: ${format(value, "MMMM yyyy", { locale: es })}` : "Período: todos los meses"}
          className={cn(
            "justify-start gap-2 text-left font-normal",
            value
              ? "border-border bg-muted hover:bg-muted/70"
              : "border-dashed border-border/70 bg-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <CalendarIcon className="size-3.5 text-muted-foreground" />
          <span className={value ? "font-medium text-foreground capitalize" : ""}>
            {value ? format(value, "MMMM yyyy", { locale: es }) : "Todos"}
          </span>
        </Button>
      } />
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0"
      >
        <PopoverHeader className="border-b px-4 py-3.5">
          <PopoverTitle className="text-base font-semibold">Período</PopoverTitle>
          <PopoverDescription>Elegí el mes que querés analizar.</PopoverDescription>
        </PopoverHeader>

        <div className="grid grid-cols-2 gap-2 px-4 pt-4">
          <Button
            type="button"
            variant={value && isSameMonth(value, today) ? "default" : "outline"}
            className={cn("justify-center", value && isSameMonth(value, today) && "border-primary")}
            onClick={() => selectMonth(currentYear, today.getMonth())}
          >
            Este mes
          </Button>
          <Button
            type="button"
            variant={value && isSameMonth(value, previousMonth) ? "default" : "outline"}
            className={cn("justify-center", value && isSameMonth(value, previousMonth) && "border-primary")}
            onClick={() => selectMonth(previousMonth.getFullYear(), previousMonth.getMonth())}
          >
            Mes anterior
          </Button>
        </div>

        <div className="flex items-center gap-1.5 px-4 py-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 border border-transparent hover:border-border"
            aria-label="Mes anterior"
            onClick={() => goToMonth(-1)}
          >
            <ChevronLeftIcon className="size-4" aria-hidden />
          </Button>

          <Select
            items={MONTH_ITEMS}
            value={String(view.getMonth())}
            onValueChange={(v) => selectMonth(view.getFullYear(), Number(v))}
          >
            <SelectTrigger aria-label="Mes" className="min-w-0 flex-1 capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {MONTH_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="capitalize">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            items={yearItems}
            value={String(view.getFullYear())}
            onValueChange={(v) => selectMonth(Number(v), view.getMonth())}
          >
            <SelectTrigger aria-label="Año" className="w-24 min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {yearItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 border border-transparent hover:border-border"
            aria-label="Mes siguiente"
            onClick={() => goToMonth(1)}
          >
            <ChevronRightIcon className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3">
          <p className="min-w-0 truncate text-xs text-muted-foreground">
            {value ? (
              <>Mostrando <span className="font-medium capitalize text-foreground">{format(value, "MMMM yyyy", { locale: es })}</span></>
            ) : "Mostrando todos los períodos"}
          </p>
          <Button variant="ghost" size="sm" className="shrink-0" onClick={handleClear} disabled={!value}>
            Ver todos
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
