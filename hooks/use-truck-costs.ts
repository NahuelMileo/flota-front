"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { toast } from "sonner"
import type { AllMonthsData, CostRow, SummaryMonth } from "@/types/costs"

export function useTruckCosts(truckId: string, year: number) {
  const [summary, setSummary] = useState<SummaryMonth[]>([])
  const [monthsData, setMonthsData] = useState<AllMonthsData>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetchingRef = useRef(false)

  const fetchAll = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    setIsLoading(true)
    try {
      const base = process.env.NEXT_PUBLIC_API_URL
      const [summaryRes, ...monthlyResponses] = await Promise.all([
        fetchWithAuth(`${base}/api/costs/summary?truckId=${truckId}&year=${year}`),
        ...Array.from({ length: 12 }, (_, i) =>
          fetchWithAuth(`${base}/api/costs/monthly?truckId=${truckId}&month=${i + 1}&year=${year}`)
        ),
      ])

      const summaryData = summaryRes.ok ? await summaryRes.json() : []
      const monthlyJsons = await Promise.all(
        monthlyResponses.map((r) => (r.ok ? r.json() : Promise.resolve([])))
      )

      setSummary(Array.isArray(summaryData) ? summaryData : [])

      const all: AllMonthsData = {}
      monthlyJsons.forEach((data, i) => {
        all[i + 1] = Array.isArray(data) ? data : []
      })
      setMonthsData(all)
    } catch {
      toast.error("Error al cargar costos")
    } finally {
      setIsLoading(false)
      fetchingRef.current = false
    }
  }, [truckId, year])

  useEffect(() => {
    fetchingRef.current = false
    fetchAll()
  }, [fetchAll])

  const markAsPaid = useCallback(
    async (entryId: string, month: number, isPaid: boolean) => {
      setMonthsData((prev) => ({
        ...prev,
        [month]: prev[month]?.map((e) =>
          e.id === entryId ? { ...e, isPaid } : e
        ) ?? [],
      }))
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/costs/entries/${entryId}`,
          { method: "PATCH", body: JSON.stringify({ isPaid }) }
        )
        if (!res.ok) throw new Error()
      } catch {
        setMonthsData((prev) => ({
          ...prev,
          [month]: prev[month]?.map((e) =>
            e.id === entryId ? { ...e, isPaid: !isPaid } : e
          ) ?? [],
        }))
        toast.error("Error al actualizar el pago")
      }
    },
    []
  )

  const updateAmount = useCallback(
    async (entryId: string, month: number, amount: number) => {
      const previous = monthsData[month]?.find((e) => e.id === entryId)?.amount
      setMonthsData((prev) => ({
        ...prev,
        [month]: prev[month]?.map((e) =>
          e.id === entryId ? { ...e, amount } : e
        ) ?? [],
      }))
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/costs/entries/${entryId}`,
          { method: "PATCH", body: JSON.stringify({ amount }) }
        )
        if (!res.ok) throw new Error()
        toast.success("Monto actualizado")
      } catch {
        setMonthsData((prev) => ({
          ...prev,
          [month]: prev[month]?.map((e) =>
            e.id === entryId ? { ...e, amount: previous ?? amount } : e
          ) ?? [],
        }))
        toast.error("Error al actualizar el monto")
      }
    },
    [monthsData]
  )

  const costRows: CostRow[] = (() => {
    const nameMap = new Map<string, CostRow>()

    for (let m = 1; m <= 12; m++) {
      const entries = monthsData[m]
      for (const entry of (Array.isArray(entries) ? entries : [])) {
        const key = `${entry.name}__${entry.type}`
        if (!nameMap.has(key)) {
          nameMap.set(key, {
            name: entry.name,
            type: entry.type,
            scope: entry.scope,
            costTemplateId: entry.costTemplateId,
            installmentPlanId: entry.installmentPlanId,
            months: {},
          })
        }
        nameMap.get(key)!.months[m] = entry
      }
    }

    return Array.from(nameMap.values()).sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name)
      return a.type === "Fixed" ? -1 : 1
    })
  })()

  const getSummaryMonth = (month: number) =>
    summary.find((s) => s.month === month) ?? null

  return {
    summary,
    monthsData,
    costRows,
    isLoading,
    refetch: fetchAll,
    markAsPaid,
    updateAmount,
    getSummaryMonth,
  }
}

export type UseTruckCostsReturn = ReturnType<typeof useTruckCosts>
