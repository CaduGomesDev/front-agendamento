import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Scissors } from "lucide-react";
import { TIME_SLOTS, buildWhatsAppUrl, formatDateBR } from "@/lib/barbershop";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveBarbers } from "@/services/barbers";
import { getActiveServices } from "@/services/services";
import { getSettings } from "@/services/settings";
import { createAppointment, getTakenSlots, getBlockedSlots } from "@/services/appointments";

/** Dia da semana (0=Dom ... 6=Sáb) da data selecionada. */
function weekdayOf(dateStr) {
  return new Date(dateStr + "T00:00:00").getDay();
}

export function BookingForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [barberId, setBarberId] = useState("");
  const [servico, setServico] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [busy, setBusy] = useState(false);
  const [taken, setTaken] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [settings, setSettings] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

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

  useEffect(() => {
    if (!data || !barberId) {
      setTaken([]);
      setBlocked([]);
      return;
    }
    let active = true;
    Promise.all([getTakenSlots(data, barberId), getBlockedSlots(data)]).then(([t, b]) => {
      if (!active) return;
      setTaken(t);
      setBlocked(b.map((x) => x.time));
    });
    return () => {
      active = false;
    };
  }, [data, barberId]);

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
    if (closed) return toast.error("A barbearia não funciona neste dia. Escolha outro.");
    if (!horario) return toast.error("Selecione o horário.");

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
        time: horario,
      });
      toast.success("Agendamento confirmado! Abrindo WhatsApp...");
      const url = buildWhatsAppUrl({
        nome: user.name || user.email || "",
        telefone: user.phone || "",
        servico: svc.name,
        data: formatDateBR(data),
        horario,
      });
      setTimeout(() => window.open(url, "_blank"), 500);
      setHorario("");
      setTimeout(() => navigate({ to: "/app/meus-agendamentos" }), 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível agendar.");
    } finally {
      setBusy(false);
    }
  };

  // Enquanto as configurações não carregam, mantém a grade padrão como fallback.
  const slots = settings?.timeSlots?.length ? settings.timeSlots : TIME_SLOTS;
  const workingDays = settings?.workingDays ?? null;
  const bookingDisabled = settings ? settings.allowOnlineBooking === false : false;
  // Dia fechado: só bloqueia quando há data e as configurações já indicam que o
  // dia não está entre os dias de funcionamento.
  const closed = Boolean(data && workingDays && !workingDays.includes(weekdayOf(data)));

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
            onChange={(e) => {
              setBarberId(e.target.value);
              setHorario("");
            }}
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
        <label className="block md:col-span-2">
          <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Data
          </span>
          <input
            type="date"
            min={today}
            value={data}
            onChange={(e) => {
              setData(e.target.value);
              setHorario("");
            }}
            className="input-premium"
          />
        </label>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">Horário</p>
        {closed ? (
          <p className="text-sm text-destructive">
            A barbearia não funciona neste dia. Escolha outro.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {slots.map((t) => {
              const isTaken = taken.includes(t) || blocked.includes(t);
              const disabled = isTaken || !data || bookingDisabled;
              const active = horario === t;
              return (
                <button
                  type="button"
                  key={t}
                  disabled={disabled}
                  onClick={() => setHorario(t)}
                  className={[
                    "rounded-md border px-2 py-2 text-sm transition",
                    active
                      ? "border-gold bg-gold text-primary-foreground"
                      : disabled
                        ? "cursor-not-allowed border-border/40 bg-muted/30 text-muted-foreground line-through opacity-50"
                        : "border-border bg-background/40 hover:border-gold hover:text-gold",
                  ].join(" ")}
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}
        {!data && (
          <p className="mt-3 text-xs text-muted-foreground">
            Selecione uma data para ver os horários disponíveis.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={busy || closed || bookingDisabled}
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
