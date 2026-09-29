"use client"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { type DisplayCurrency } from "@/lib/format"
import { type CurrencyItem, getDisplayValue as pickDisplayValue } from "@/lib/currency"

interface CurrencyContextType {
  displayCurrency: DisplayCurrency
  setDisplayCurrency: (currency: DisplayCurrency) => Promise<void>
  getDisplayValue: (item: CurrencyItem) => number
}

const CurrencyContext = createContext<CurrencyContextType | null>(null)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>("BRL")

  useEffect(() => {
    const stored = localStorage.getItem("displayCurrency") as DisplayCurrency | null
    if (stored) setDisplayCurrencyState(stored)
    // Sync with API
    fetchWithAuth(`/api/users/me/currency`, { method: "GET" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.currency) {
          setDisplayCurrencyState(data.currency as DisplayCurrency)
          localStorage.setItem("displayCurrency", data.currency)
        }
      })
      .catch(() => {})
  }, [])

  const setDisplayCurrency = useCallback(async (currency: DisplayCurrency) => {
    setDisplayCurrencyState(currency)
    localStorage.setItem("displayCurrency", currency)
    try {
      await fetchWithAuth(`/api/users/me/currency`, {
        method: "PATCH",
        body: JSON.stringify({ currency }),
      })
    } catch {}
  }, [])

  const getDisplayValue = useCallback(
    (item: CurrencyItem): number => pickDisplayValue(item, displayCurrency),
    [displayCurrency],
  )

  return (
    <CurrencyContext.Provider value={{ displayCurrency, setDisplayCurrency, getDisplayValue }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider")
  return ctx
}
