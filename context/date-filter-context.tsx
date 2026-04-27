"use client"
import { createContext, useContext, useState } from "react"

interface DateFilterContextType {
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
}

const DateFilterContext = createContext<DateFilterContextType | null>(null)

export function DateFilterProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  return (
    <DateFilterContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateFilterContext.Provider>
  )
}

export function useDateFilter() {
  const ctx = useContext(DateFilterContext)
  if (!ctx) throw new Error("useDateFilter must be used within DateFilterProvider")
  return ctx
}