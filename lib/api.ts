export function apiUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
}

<<<<<<< HEAD
function clearSessionAndRedirect(path: string) {
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("username");
  localStorage.removeItem("email");
  localStorage.removeItem("userId");
  localStorage.removeItem("tenantId");
  localStorage.removeItem("tenantName");
  localStorage.removeItem("displayCurrency");
  window.location.href = path;
}

async function refreshSession(): Promise<void> {
  const res = await fetch(apiUrl("/api/auth/refresh"), {
    method: "POST",
=======
async function refreshAccessToken(): Promise<void> {
  const res = await fetch(apiUrl('/api/auth/refresh'), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
>>>>>>> 7d28b39 (some fixes: cookies, charts)
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 429) {
      clearSessionAndRedirect("/login");
      throw new Error("Demasiados intentos de refresh. Por favor, intenta más tarde.");
    }
    clearSessionAndRedirect("/login");
    throw new Error("Sesión expirada");
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  // Acepta rutas relativas ("/api/trucks") y las resuelve contra la API
  if (url.startsWith('/')) url = apiUrl(url);

  let res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401) {
<<<<<<< HEAD
    await refreshSession();
=======
    await refreshAccessToken();
>>>>>>> 7d28b39 (some fixes: cookies, charts)

    res = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }

  return res;
}
