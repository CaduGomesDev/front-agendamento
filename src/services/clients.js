// Serviço de clientes — consome apenas a API REST.
import { api } from "./api";

export async function getClients() {
  return api.get("/clients");
}

export async function getClient(id) {
  return api.get(`/clients/${id}`);
}

/** Perfil do próprio usuário logado. */
export async function getClientProfile(_userId) {
  return api.get("/users/me");
}

export async function updateClientProfile(_userId, input) {
  return api.patch("/users/me", input);
}

export async function createClient(input) {
  return api.post("/clients", input);
}

export async function deleteClient(id) {
  await api.delete(`/clients/${id}`);
}
