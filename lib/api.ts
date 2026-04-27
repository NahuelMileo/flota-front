async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    localStorage.clear();
    window.location.href = '/';
    throw new Error("Sesión expirada");
  }

  const data = await res.json();
localStorage.setItem('accessToken', data.accessToken);
return data.accessToken;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
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