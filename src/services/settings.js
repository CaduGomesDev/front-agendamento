// Serviço de configurações e dados da empresa — consome apenas a API REST.
import { api } from "./api";

export async function getSettings() {
  return api.get("/settings");
}

export async function updateSettings(input) {
  return api.put("/settings", input);
}

export async function getCompany() {
  return api.get("/company");
}

export async function updateCompany(input) {
  return api.put("/company", input);
}
