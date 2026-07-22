// Serviço de barbeiros — consome apenas a API REST.
import { api } from "./api";

export async function getBarbers() {
  return api.get("/barbers");
}

/** Apenas barbeiros ativos — usado no formulário de agendamento. */
export async function getActiveBarbers() {
  return api.get("/barbers?active=true");
}

export async function getBarber(id) {
  return api.get(`/barbers/${id}`);
}

export async function createBarber(input) {
  return api.post("/barbers", input);
}

export async function updateBarber(id, input) {
  return api.put(`/barbers/${id}`, input);
}

export async function deleteBarber(id) {
  await api.delete(`/barbers/${id}`);
}
