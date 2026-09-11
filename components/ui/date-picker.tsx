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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  const currentYear = new Date().getFullYear()
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

  return (
    <Popover>
      <PopoverTrigger render={
        <Button
          variant="outline"
          className={cn(
            "justify-start gap-1.5 text-left font-normal",
            value
              ? "border-border bg-muted hover:bg-muted/70"
              : "border-dashed border-border/70 bg-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <CalendarIcon className="size-3.5 opacity-70" />
          <span className="text-muted-foreground">Mes</span>
          <span className={value ? "font-medium text-foreground capitalize" : ""}>
            {value ? format(value, "MMMM yyyy", { locale: es }) : "Todos"}
          </span>
        </Button>
      } />
      <PopoverContent className="w-80 p-3">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            aria-label="Mes anterior"
            onClick={() => goToMonth(-1)}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>

          <Select
            items={MONTH_ITEMS}
            value={String(view.getMonth())}
            onValueChange={(v) => selectMonth(view.getFullYear(), Number(v))}
          >
            <SelectTrigger className="w-32 min-w-0 capitalize">
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
            <SelectTrigger className="w-22 min-w-0">
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
            className="shrink-0"
            aria-label="Mes siguiente"
            onClick={() => goToMonth(1)}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>

        <div className="mt-3 border-t pt-2">
          <Button variant="ghost" className="w-full text-sm" onClick={handleClear}>
            Ver todos
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
