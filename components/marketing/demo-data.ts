// Piezas de la landing que no dependen del idioma. Los textos y los datos de
// demostración de cada país están en content.ts.

export type Tone = "green" | "amber" | "neutral"

export const TONES: Record<Tone, { chipBg: string; chipFg: string; bar: string; fg: string; grad: string }> = {
  green: { chipBg: "rgba(19,134,90,0.12)", chipFg: "#13865A", bar: "#13865A", fg: "#13865A", grad: "#13865A" },
  amber: { chipBg: "rgba(168,106,18,0.12)", chipFg: "#A86A12", bar: "#A86A12", fg: "#A86A12", grad: "#D9A24A" },
  neutral: { chipBg: "rgba(11,12,14,0.06)", chipFg: "#3A3F47", bar: "rgba(19,134,90,0.5)", fg: "#0B0C0E", grad: "rgba(19,134,90,0.42)" },
}

// Día del calendario de octubre 2026 -> color del vencimiento.
export const EVENTS: Record<number, string> = { 7: "#C8352D", 13: "#A86A12", 21: "#5F656E", 27: "#A86A12" }
export const TODAY = 6

export const FLEET_SIZES = ["1–3", "4–10", "11–25", "26+"] as const
export type FleetSize = (typeof FLEET_SIZES)[number]

export const JOIN_CODE = "KM-4F7Q"

export const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

// pt-BR y es-UY escriben los números igual: punto de miles y coma decimal.
export const fmt = (n: number, d = 0) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d })
