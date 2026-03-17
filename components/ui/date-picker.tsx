// components/ui/date-picker.tsx
"use client"
import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: Date | null
  onChange?: (date: Date | undefined) => void
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [month, setMonth] = useState<Date>(value ?? new Date())

  const handleMonthChange = (date: Date) => {
    setMonth(date)
    onChange?.(date)
  }

  const handleClear = () => {
  setMonth(new Date())
  onChange?.(undefined)
}
 return (
    <Popover>
      <PopoverTrigger render={
        <Button
          variant="outline"
          className={cn(
            "w-40 justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "MMMM yyyy", { locale: es }) : "Todos"}
        </Button>
      } />
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          month={month}
          onMonthChange={handleMonthChange}
          locale={es}
          initialFocus
          captionLayout="dropdown"
        />
        <div className="p-2 border-t">
  <Button
    variant="ghost"
    className="w-full text-sm"
     onClick={handleClear}
  >
    Ver todos
  </Button>
</div>
      </PopoverContent>
    </Popover>
  )
}