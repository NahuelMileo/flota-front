// Las pantallas mensuales (egresos, ingresos, cuentas a recibir) traen solo el mes elegido
// del back. Al crear o editar algo se actualiza la lista en memoria sin volver a pedirla, así
// que hay que respetar el mismo filtro: si no, un egreso de julio cargado mientras se mira
// septiembre aparece en la lista y suma al total hasta recargar la página.

// Compara año y mes de una fecha "YYYY-MM-DD" (o ISO) con el mes elegido. null = sin filtro.
export function isInSelectedMonth(date: string, selectedDate: Date | null): boolean {
  if (!selectedDate) return true;
  const [year, month] = date.slice(0, 10).split("-").map(Number);
  return year === selectedDate.getFullYear() && month === selectedDate.getMonth() + 1;
}
