import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Scissors, Calendar as CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { buildWhatsAppUrl, formatDateBR } from "@/lib/barbershop";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveBarbers } from "@/services/barbers";
import { getActiveServices } from "@/services/services";
import { getSettings } from "@/services/settings";
import { createAppointment } from "@/services/appointments";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

/** Date -> "YYYY-MM-DD" no fuso local (evita deslocamento de um dia). */
function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function BookingForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [barberId, setBarberId] = useState("");
  const [servico, setServico] = useState("");
  const [data, setData] = useState("");
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    getActiveBarbers().then((list) => {
      setBarbers(list);
      if (list.length) setBarberId((prev) => prev || list[0].id);
    });
    getActiveServices().then(setServices);
    getSettings()
      .then(setSettings)
      .catch(() => {});
  }, []);

  const workingDays = settings?.workingDays ?? null;
  const bookingDisabled = settings ? settings.allowOnlineBooking === false : false;

  // Início de hoje — usado para bloquear datas passadas no calendário.
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Dias desabilitados no calendário: datas passadas + dias da semana
  // que não estão nos dias de funcionamento configurados.
  const disabledMatchers = useMemo(() => {
    const matchers = [{ before: startOfToday }];
    if (workingDays) {
      const closedDows = ALL_DAYS.filter((d) => !workingDays.includes(d));
      if (closedDows.length) matchers.push({ dayOfWeek: closedDows });
    }
    return matchers;
  }, [workingDays, startOfToday]);

  const selectedDate = data ? new Date(data + "T00:00:00") : undefined;

  const submit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info("Faça login para agendar.");
      return navigate({ to: "/app/login" });
    }
    if (!barberId) return toast.error("Selecione um barbeiro.");
    if (!servico) return toast.error("Selecione um serviço.");
    if (!data) return toast.error("Selecione a data.");
    if (bookingDisabled) return toast.error("Agendamento online indisponível no momento.");

    const svc = services.find((s) => s.id === servico);
    setBusy(true);
    try {
      await createAppointment({
        userId: user.id,
        clientName: user.name || user.email,
        clientPhone: user.phone,
        barberId,
        serviceId: svc.id,
        date: data,
      });
      toast.success("Agendamento confirmado! Abrindo WhatsApp...");
      const url = buildWhatsAppUrl({
        nome: user.name || user.email || "",
        telefone: user.phone || "",
        servico: svc.name,
        data: formatDateBR(data),
        horario: "a combinar",
      });
      setTimeout(() => window.open(url, "_blank"), 500);
      setTimeout(() => navigate({ to: "/app/meus-agendamentos" }), 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível agendar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-2xl rounded-2xl border border-border bg-card/50 p-6 backdrop-blur md:p-10"
    >
      {!user && (
        <p className="mb-6 rounded-md border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-gold">
          Você precisa estar logado para agendar.
        </p>
      )}

      {bookingDisabled && (
        <p className="mb-6 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          O agendamento online está temporariamente indisponível.
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Barbeiro
          </span>
          <select
            value={barberId}
            onChange={(e) => setBarberId(e.target.value)}
            className="input-premium"
          >
            {barbers.length === 0 && <option value="">Carregando...</option>}
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Serviço
          </span>
          <select
            value={servico}
            onChange={(e) => setServico(e.target.value)}
            className="input-premium"
          >
            <option value="">{services.length === 0 ? "Carregando..." : "Selecione..."}</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — R$ {s.price}
              </option>
            ))}
          </select>
        </label>
        <div className="block md:col-span-2">
          <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Data
          </span>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="input-premium flex w-full items-center justify-between text-left"
              >
                <span className={data ? "" : "text-muted-foreground"}>
                  {data ? formatDateBR(data) : "Selecione a data"}
                </span>
                <CalendarIcon className="h-4 w-4 text-gold" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                locale={ptBR}
                selected={selectedDate}
                onSelect={(d) => {
                  if (d) {
                    setData(toISODate(d));
                    setCalendarOpen(false);
                  }
                }}
                disabled={disabledMatchers}
                startMonth={startOfToday}
                defaultMonth={selectedDate ?? startOfToday}
              />
            </PopoverContent>
          </Popover>
          <p className="mt-2 text-xs text-muted-foreground">
            Dias sem atendimento aparecem bloqueados no calendário.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={busy || bookingDisabled}
        className="group mt-8 flex w-full items-center justify-center gap-2 rounded-md bg-gradient-gold px-6 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
      >
        <Scissors className="h-4 w-4 transition group-hover:rotate-12" />
        {busy ? "Confirmando..." : "Confirmar Agendamento"}
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Após confirmar, você é direcionado(a) ao WhatsApp.
      </p>
    </form>
  );
}
