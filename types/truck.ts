export type Truck = {
  id: string
  licensePlate: string
  model?: string
  year?: number
  currentKm?: number
  estimatedMonthlyKm?: number
  lastKmUpdatedAt?: string
  /** Hex #RRGGBB con el que se identifica el camión en las grillas. */
  color?: string | null
}
