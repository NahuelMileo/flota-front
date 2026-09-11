/**
 * Texto legible sobre un fondo de color arbitrario. El color del camión lo elige el
 * usuario con el picker, así que no se puede fijar el color del texto a mano: un gris
 * oscuro necesita texto blanco y un amarillo, negro.
 *
 * Usa la luminancia relativa de WCAG y el umbral 0.179, que es el punto donde el
 * contraste contra blanco y contra negro se iguala.
 */
export function readableTextColor(backgroundHex: string): string {
  const hex = backgroundHex.replace("#", "")
  if (hex.length !== 6) return "#000000"

  const channels = [0, 2, 4].map((i) => {
    const value = parseInt(hex.slice(i, i + 2), 16) / 255
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
  })

  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  return luminance > 0.179 ? "#000000" : "#ffffff"
}
