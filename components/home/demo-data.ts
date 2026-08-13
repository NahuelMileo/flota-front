// Datos de demostración centralizados — se reutilizan en hero, marquee,
// rentabilidad y operación para que los números coincidan en toda la página.
// No son resultados reales de ningún cliente.

export const DEMO_LABEL = "Datos de demostración"

export const FLEET_SUMMARY = {
  activeTrucks: 4,
  revenue: 198_420,
  costs: 147_880,
  profit: 50_540,
  costPerKm: 4.21,
  profitPerKm: 1.44,
  totalKm: 35_210,
  currency: "R$",
}

export const TRUCK_PROFITABILITY = [
  {
    plate: "IKG",
    km: 9_194,
    incomePerKm: 5.7,
    costPerKm: 3.68,
    profitPerKm: 2.02,
    status: "Rentable" as const,
  },
  {
    plate: "IWV",
    km: 8_730,
    incomePerKm: 5.05,
    costPerKm: 4.78,
    profitPerKm: 0.27,
    status: "Margen bajo" as const,
  },
  {
    plate: "JRT",
    km: 8_960,
    incomePerKm: 5.42,
    costPerKm: 4.1,
    profitPerKm: 1.32,
    status: "Estable" as const,
  },
  {
    plate: "HXR",
    km: 8_326,
    incomePerKm: 5.18,
    costPerKm: 3.95,
    profitPerKm: 1.23,
    status: "Estable" as const,
  },
]

export const STATUS_TONE: Record<string, "accent" | "amber" | "neutral"> = {
  Rentable: "accent",
  "Margen bajo": "amber",
  Estable: "neutral",
}

export const ACTIVE_TRIPS = [
  {
    origin: "Montevideo",
    destination: "São Paulo",
    truck: "IKG",
    progress: 64,
    km: 890,
    balance: "R$ 4.200 pendiente",
    currency: "BRL" as const,
  },
  {
    origin: "São Paulo",
    destination: "Montevideo",
    truck: "IWV",
    progress: 22,
    km: 210,
    balance: "Conciliado",
    currency: "BRL" as const,
  },
  {
    origin: "Chuy",
    destination: "Porto Alegre",
    truck: "JRT",
    progress: 88,
    km: 540,
    balance: "USD 180 pendiente",
    currency: "USD" as const,
  },
]

export const MARQUEE_ITEMS = [
  "RENTABILIDAD POR CAMIÓN",
  "COSTO POR KM",
  "UYU / BRL / USD",
  "VIAJES ACTIVOS",
  "CONSUMO",
  "COSTOS FIJOS",
  "MANTENIMIENTOS",
  "INGRESOS Y EGRESOS",
]

export const FLEET_SIZE_BUCKETS = [
  { id: "small", label: "1–3 camiones" },
  { id: "medium", label: "4–10 camiones" },
  { id: "large", label: "11 o más" },
] as const

export type FleetSizeBucket = (typeof FLEET_SIZE_BUCKETS)[number]["id"]
