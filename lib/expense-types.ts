export const expenseTypeLabels: Record<number, string> = {
  1: "Gasoil",
  2: "Arla 32",
  3: "Mantenimiento",
  4: "Gomería",
  5: "Aceite",
  6: "Estacionamiento",
  7: "Peaje",
  8: "Salario",
  9: "Contador",
  10: "Financiamiento",
  11: "Otro",
  12: "Administrativo",
  13: "IPVA",
  14: "Rastreador",
  15: "Cooperativa",
  16: "Seguro",
  17: "Equipo Operacional",
}

export const expenseTypeStringLabels: Record<string, string> = {
  Gasoil: "Gasoil",
  Arla32: "Arla 32",
  Maintenance: "Mantenimiento",
  TireCenter: "Gomería",
  Oil: "Aceite",
  Parking: "Estacionamiento",
  Toll: "Peaje",
  Salary: "Salario",
  Accountant: "Contador",
  Financing: "Financiamiento",
  Other: "Otro",
  Administrative: "Administrativo",
  Ipva: "IPVA",
  Tracker: "Rastreador",
  Cooperative: "Cooperativa",
  Insurance: "Seguro",
  OperationalEquipment: "Equipo Operacional",
}

export function getExpenseTypeLabel(type: number | string): string {
  if (typeof type === "string") return expenseTypeStringLabels[type] ?? "Otro"
  return expenseTypeLabels[type] ?? "Otro"
}

export const expenseTypeStringToNumber: Record<string, number> = {
  Gasoil: 1,
  Arla32: 2,
  Maintenance: 3,
  TireCenter: 4,
  Oil: 5,
  Parking: 6,
  Toll: 7,
  Salary: 8,
  Accountant: 9,
  Financing: 10,
  Other: 11,
  Administrative: 12,
  Ipva: 13,
  Tracker: 14,
  Cooperative: 15,
  Insurance: 16,
  OperationalEquipment: 17,
}

export function normalizeExpenseType(type: string | number): string {
  const str = String(type)
  const num = expenseTypeStringToNumber[str]
  return num ? String(num) : str
}

export const FIXED_EXPENSE_TYPES = [
  { label: "Administrativo",           value: "12" },
  { label: "IPVA",                     value: "13" },
  { label: "Rastreador",               value: "14" },
  { label: "Cooperativa",              value: "15" },
  { label: "Consorcio/Financiamiento", value: "10" },
  { label: "Gomería",                  value: "4"  },
  { label: "Mantenimiento",            value: "3"  },
  { label: "Salario",                  value: "8"  },
  { label: "Contador",                 value: "9"  },
  { label: "Seguro",                   value: "16" },
  { label: "Equipo Operacional",        value: "17" },
  { label: "Otro",                     value: "11" },
]
