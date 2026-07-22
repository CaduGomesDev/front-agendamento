import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { formatDateBR } from "@/lib/barbershop";
import { getAppointmentsByUser, cancelAppointment } from "@/services/appointments";
import { CalendarX2, Clock, Scissors, Plus, User } from "lucide-react";

export const Route = createFileRoute("/app/meus-agendamentos")({
  component: MyAppointments,
  head: () => ({ meta: [{ title: "Meus agendamentos — Barbearia Espezim" }] }),
});

const statusStyle = {
  confirmado: "border-gold/50 bg-gold/10 text-gold",
  pendente: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
  cancelado: "border-destructive/40 bg-destructive/10 text-destructive",
  concluido: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
};

function MyAppointments() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/app/login" });
  }, [user, loading, navigate]);

  const load = async () => {
    if (!user) return;
    setBusy(true);
    const data = await getAppointmentsByUser(user.id);
    setItems(data);
    setBusy(false);
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [user]);

  const cancel = async (id) => {
    await cancelAppointment(id);
    toast.success("Agendamento cancelado.");
    load();
  };

  if (!user) return null;

  return (
    <AppShell variant="client">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl">Meus agendamentos</h1>
            <p className="text-sm text-muted-foreground">Histórico e próximos horários.</p>
          </div>
          <Link
            to="/app/agendar"
            className="hidden items-center gap-2 rounded-md bg-gradient-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground sm:flex"
          >
            <Plus className="h-4 w-4" /> Novo
          </Link>
        </div>
        <div className="divider-gold my-6 w-16" />

        {busy ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/40 p-10 text-center">
            <CalendarX2 className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Você ainda não tem agendamentos.</p>
            <Link
              to="/app/agendar"
              className="mt-6 inline-block rounded-md bg-gradient-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground"
            >
              Agendar agora
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((a) => {
              const isPast = new Date(a.date + "T" + a.time) < new Date();
              const canCancel = !isPast && (a.status === "confirmado" || a.status === "pendente");
              return (
                <li key={a.id} className="rounded-xl border border-border bg-card/40 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 font-serif text-lg">
                        <Scissors className="h-4 w-4 text-gold" /> {a.serviceName}
                      </h3>
                      <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>{formatDateBR(a.date)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {a.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" /> {a.barberName}
                        </span>
                        <span className="text-gold">{a.servicePrice}</span>
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${statusStyle[a.status]}`}
                    >
                      {a.status}
                    </span>
                  </div>
                  {canCancel && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => cancel(a.id)}
                        className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-destructive hover:text-destructive"
                      >
                        Cancelar
                      </button>
                      <Link
                        to="/app/agendar"
                        className="rounded-md border border-gold/60 px-3 py-1.5 text-xs text-gold hover:bg-gold/10"
                      >
                        Remarcar
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
