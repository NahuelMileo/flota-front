export function apiUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
}

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
    headers: { "Content-Type": "application/json" },
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

/*
  Un solo refresh a la vez, compartido por todos los pedidos que se encuentren con un 401.

  El backend rota el refresh token y revoca el anterior en cada uso
  (AuthService.RefreshTokenAsync), que es lo correcto por seguridad. Pero cualquier pantalla
  del dashboard dispara media docena de pedidos al montar: cuando el access token vence, los
  seis reciben 401 y cada uno pedía su propio refresh con la misma cookie vieja. El primero
  ganaba y revocaba el token; los otros cinco llegaban con un token ya revocado, fallaban, y
  cerraban de prepo una sesión que estaba perfectamente bien — el usuario terminaba en el
  login sin motivo. Peor en desarrollo, donde StrictMode duplica los pedidos.

  Compartiendo la promesa, se refresca una vez y todos reintentan con la cookie nueva.
*/
let refreshInFlight: Promise<void> | null = null;

function refreshSessionOnce(): Promise<void> {
  refreshInFlight ??= refreshSession().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
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
    await refreshSessionOnce();

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
