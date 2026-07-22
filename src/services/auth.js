// Serviço de autenticação — consome apenas a API REST (JWT).
// A sessão (identidade do usuário) é persistida em localStorage; os tokens JWT
// ficam no tokenStore (ver ./api).

import { api, tokenStore, ApiError } from "./api";

export const ADMIN_EMAIL = "admin@barbearia.com.br";

const SESSION_KEY = "barbearia_auth_session_v1";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

function fromApiUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    avatarUrl: u.avatarUrl ?? undefined,
    provider: u.provider === "google" ? "google" : "email",
    role: u.role === "admin" ? "admin" : "client",
  };
}

function writeSession(user, token) {
  const session = { user, token, expiresAt: Date.now() + SESSION_TTL_MS };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return session;
}

/** Lê a sessão persistida (síncrono — usado na hidratação do AuthContext). */
export function getStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session.expiresAt < Date.now()) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function loginWithEmail({ email, password }) {
  try {
    const data = await api.post("/auth/login", { email: email.trim(), password });
    tokenStore.set(data.accessToken, data.refreshToken);
    return { session: writeSession(fromApiUser(data.user), data.accessToken), error: null };
  } catch (e) {
    return { session: null, error: e instanceof ApiError ? e.message : "Não foi possível entrar." };
  }
}

export async function loginWithGoogle() {
  // Requer o Google Identity SDK no front (idToken) — a implementar.
  return { session: null, error: "Login com Google ainda não está disponível." };
}

export async function signUp(data) {
  try {
    const res = await api.post("/auth/register", {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone,
      password: data.password,
    });
    tokenStore.set(res.accessToken, res.refreshToken);
    return { session: writeSession(fromApiUser(res.user), res.accessToken), error: null };
  } catch (e) {
    return {
      session: null,
      error: e instanceof ApiError ? e.message : "Não foi possível criar a conta.",
    };
  }
}

export async function logout() {
  if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
  tokenStore.clear();
  try {
    await api.post("/auth/logout");
  } catch {
    /* best-effort */
  }
}

export async function resetPassword(email) {
  // Recuperação por e-mail depende de servidor de e-mail (não implementado no back-end).
  return { error: email.trim() ? null : "Informe um e-mail válido." };
}

export async function updatePassword(_userId, newPassword) {
  try {
    await api.patch("/users/me/password", { newPassword });
    return { error: null };
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : "Não foi possível alterar a senha." };
  }
}

/** Atualiza os dados básicos do usuário logado e a sessão persistida. */
export async function updateCurrentUser(patch) {
  const current = getStoredSession();
  if (!current) return null;
  const updated = await api.patch("/users/me", patch);
  return writeSession({ ...current.user, ...fromApiUser(updated) }, current.token);
}
