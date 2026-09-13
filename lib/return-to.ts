// Adónde volver después del login. Solo se acepta la pantalla de autorización de
// asistentes de IA: un returnTo libre sería un open redirect (un link de phishing que pasa
// por nuestro login y termina en un sitio ajeno).
const ALLOWED_PATH = "/oauth/authorize";

export function safeReturnTo(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin || url.pathname !== ALLOWED_PATH) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

export function returnToFromLocation(): string | null {
  return safeReturnTo(new URLSearchParams(window.location.search).get("returnTo"));
}

export function loginUrlReturningHere(): string {
  return `/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
}
