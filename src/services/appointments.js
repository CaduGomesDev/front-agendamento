// Serviço de agendamentos — consome apenas a API REST.
import { api } from "./api";

/** Todos os agendamentos (uso administrativo). */
export async function getAppointments() {
  return api.get("/appointments");
}

/** Agendamentos do usuário logado (o back-end deriva do token). */
export async function getAppointmentsByUser(_userId) {
  return api.get("/appointments/mine");
}

export async function createAppointment(input) {
  return api.post("/appointments", {
    // userId só é usado pelo back-end quando quem cria é admin (agendar p/ cliente).
    userId: input.userId,
    barberId: input.barberId,
    serviceId: input.serviceId,
    date: input.date,
    time: input.time,
    notes: input.notes,
  });
}

export async function updateAppointmentStatus(id, status) {
  return api.patch(`/appointments/${id}/status`, { status });
}

/** Exclusão definitiva de um agendamento (admin). */
export async function deleteAppointment(id) {
  await api.delete(`/appointments/${id}`);
}

export async function cancelAppointment(id) {
  await api.patch(`/appointments/${id}/cancel`);
}

/** Horários já ocupados numa data — opcionalmente por barbeiro. */
export async function getTakenSlots(date, barberId) {
  const qs = new URLSearchParams({ date });
  if (barberId) qs.set("barberId", barberId);
  return api.get(`/appointments/taken?${qs.toString()}`);
}

export async function getBlockedSlots(date) {
  return api.get(`/appointments/blocked${date ? `?date=${date}` : ""}`);
}

export async function blockSlot(date, time, reason) {
  return api.post("/appointments/blocked", { date, time, reason });
}

export async function removeBlockedSlot(id) {
  await api.delete(`/appointments/blocked/${id}`);
}
