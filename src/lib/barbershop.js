// Valores usados apenas como fallback caso os dados da empresa não carreguem da API.
export const WHATSAPP_NUMBER = "5548999999999";
export const PROFESSIONAL_NAME = "Carlos Gomes";

export const SERVICES = [
  {
    id: "corte",
    name: "Corte Masculino",
    price: "R$ 50",
    duration: "40 min",
    desc: "Corte sob medida, com acabamento preciso.",
  },
  {
    id: "barba",
    name: "Barba",
    price: "R$ 40",
    duration: "30 min",
    desc: "Modelagem com toalha quente e produtos premium.",
  },
  {
    id: "combo",
    name: "Corte + Barba",
    price: "R$ 80",
    duration: "1h10",
    desc: "Experiência completa em uma única sessão.",
  },
  {
    id: "sobrancelha",
    name: "Sobrancelha",
    price: "R$ 25",
    duration: "15 min",
    desc: "Design masculino discreto e marcante.",
  },
  {
    id: "pigmentacao",
    name: "Pigmentação",
    price: "R$ 60",
    duration: "45 min",
    desc: "Preenchimento e definição com naturalidade.",
  },
];

export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];

const TIME_FORMAT_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;

/** Horários configurados em Configurações, ignorando entradas que não sejam "HH:MM" (ex.: dias da semana digitados por engano). */
export function getTimeSlots(settings) {
  const configured = (settings?.timeSlots ?? []).filter((t) => TIME_FORMAT_RE.test(t));
  return configured.length ? configured : TIME_SLOTS;
}

export function isSundayClosed(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + "T00:00:00").getDay() === 0;
}

export function buildWhatsAppUrl(payload) {
  const whatsapp = (payload.whatsapp || WHATSAPP_NUMBER).replace(/\D/g, "");
  const companyName = payload.companyName || "Barbearia Espezim";
  const text =
    `Olá, gostaria de confirmar meu agendamento na ${companyName}.%0A%0A` +
    `Nome: ${payload.nome}%0A` +
    `Telefone: ${payload.telefone}%0A` +
    `Serviço: ${payload.servico}%0A` +
    `Data: ${payload.data}%0A` +
    `Horário: ${payload.horario}`;
  return `https://wa.me/${whatsapp}?text=${text}`;
}

export function maskPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatDateBR(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR");
}
