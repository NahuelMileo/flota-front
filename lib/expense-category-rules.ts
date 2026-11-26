// La categoría sembrada es "Manutenção", pero cada empresa puede renombrarla o crear
// la suya ("Mantenimiento", "Manutencao"...): se compara normalizada, sin acentos.
function normalize(name: string): string {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function isMaintenanceCategory(name: string | null | undefined): boolean {
  if (!name) return false;
  const n = normalize(name);
  return n.includes("manuten") || n.includes("mantenim");
}
