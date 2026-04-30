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
