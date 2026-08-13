// TODO: reemplazar por los datos de contacto reales antes de publicar.
export const SITE_CONFIG = {
  contactEmail: "hola@kilometria.com",
  whatsappNumber: "59800000000", // TODO: número de WhatsApp real, formato internacional sin "+"
}

export function whatsappHref(message: string): string {
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`
}
