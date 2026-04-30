export type CostEntry = {
  id: string
  name: string
  amount: number
  type: "Fixed" | "Variable"
  scope?: "PerTruck" | "CompanyWide" | null
  isPaid: boolean
  costTemplateId?: string | null
  installmentPlanId?: string | null
  installmentPlanName?: string | null
}

export type SummaryMonth = {
  month: number
  year: number
  total: number
  costPerKm: number | null
}

export type AllMonthsData = {
  [month: number]: CostEntry[]
}

export type CostRow = {
  name: string
  type: "Fixed" | "Variable"
  scope?: "PerTruck" | "CompanyWide" | null
  costTemplateId?: string | null
  installmentPlanId?: string | null
  months: { [m: number]: CostEntry | null }
}
