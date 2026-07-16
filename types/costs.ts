export type CostEntry = {
  id: string
  name: string
  amount: number
  valueUSD?: number | null
  valueBRL?: number | null
  valueUYU?: number | null
  type: "Fixed" | "Installment"
  scope?: "PerTruck" | "CompanyWide" | null
  isPaid: boolean
  fixedCostId?: string | null
  fixedCostName?: string | null
  installmentPlanId?: string | null
  installmentPlanName?: string | null
  truckId?: string | null
  truckLicensePlate?: string | null
  month?: number
  year?: number
}

export type SummaryMonth = {
  month: number
  year: number
  totalAmount: number
  costPerKm: number | null
  realKm?: number | null
  estimatedKm?: number | null
  costPerKmReal?: number | null
  costPerKmEstimated?: number | null
}

export type AllMonthsData = {
  [month: number]: CostEntry[]
}

export type CostRow = {
  name: string
  type: "Fixed" | "Installment"
  scope?: "PerTruck" | "CompanyWide" | null
  fixedCostId?: string | null
  installmentPlanId?: string | null
  months: { [m: number]: CostEntry | null }
}
