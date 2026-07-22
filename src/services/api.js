// Cliente HTTP central do front-end.
//
// É o ÚNICO ponto que fala com a API REST (back-end Express/MongoDB).
// Todos os serviços de domínio (auth, barbers, appointments, clients, services,
// settings) usam este módulo. Base URL vem de VITE_API_URL.

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

const ACCESS_KEY = "barbearia_access_token";
const REFRESH_KEY = "barbearia_refresh_token";

/** Armazenamento dos tokens JWT (localStorage, apenas no cliente). */
export const tokenStore = {
  getAccess() {
    return typeof window === "undefined" ? null : window.localStorage.getItem(ACCESS_KEY);
  },
  getRefresh() {
    return typeof window === "undefined" ? null : window.localStorage.getItem(REFRESH_KEY);
  },
  set(accessToken, refreshToken) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) window.localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};

/** Erro de API com status HTTP, para o front tratar (toast, etc.). */
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function rawRequest(method, path, body, retry = true) {
  const access = tokenStore.getAccess();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Access token expirado → tenta refresh uma única vez e repete.
  if (res.status === 401 && retry && tokenStore.getRefresh()) {
    const refreshed = await tryRefresh();
    if (refreshed) return rawRequest(method, path, body, false);
    tokenStore.clear();
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* resposta sem corpo JSON */
  }

  if (!res.ok || (payload && payload.success === false)) {
    const message = payload?.message ?? `Erro HTTP ${res.status}`;
    throw new ApiError(res.status, message, payload?.errors);
  }

  return payload?.data ?? payload;
}

/** Renova o access token usando o refresh token. */
async function tryRefresh() {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const payload = await res.json();
    if (!payload?.data?.accessToken) return false;
    tokenStore.set(payload.data.accessToken, payload.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  get: (path) => rawRequest("GET", path),
  post: (path, body) => rawRequest("POST", path, body),
  put: (path, body) => rawRequest("PUT", path, body),
  patch: (path, body) => rawRequest("PATCH", path, body),
  delete: (path) => rawRequest("DELETE", path),
};
