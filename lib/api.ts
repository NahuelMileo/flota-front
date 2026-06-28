export function apiUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken');

  const res = await fetch(apiUrl('/api/auth/refresh'), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    // Handle rate limiting on refresh
    if (res.status === 429) {
      localStorage.clear();
      window.location.href = '/login';
      throw new Error("Demasiados intentos de refresh. Por favor, intenta más tarde.");
    }
    localStorage.clear();
    window.location.href = '/';
    throw new Error("Sesión expirada");
  }

  const data = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  return data.accessToken;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  // Acepta rutas relativas ("/api/trucks") y las resuelve contra la API
  if (url.startsWith('/')) url = apiUrl(url);
  const accessToken = localStorage.getItem('accessToken');

  let res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        "Authorization": `Bearer ${newToken}`,
      },
    });
  }

  return res;
}