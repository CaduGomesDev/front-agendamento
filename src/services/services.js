// Serviço do catálogo de serviços — consome apenas a API REST.
import { api } from "./api";

export async function getServices() {
  return api.get("/services");
}

/** Apenas serviços ativos — usado no formulário de agendamento. */
export async function getActiveServices() {
  return api.get("/services?active=true");
}

export async function getService(id) {
  return api.get(`/services/${id}`);
}

export async function createService(input) {
  return api.post("/services", input);
}

export async function updateService(id, input) {
  return api.put(`/services/${id}`, input);
}

export async function deleteService(id) {
  await api.delete(`/services/${id}`);
}
