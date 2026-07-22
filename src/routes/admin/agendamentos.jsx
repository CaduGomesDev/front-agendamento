import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Lock, Trash2, ShieldOff, Plus, X, CalendarPlus } from "lucide-react";
import {
  getAppointments,
  updateAppointmentStatus,
  createAppointment,
  deleteAppointment,
  getBlockedSlots,
  blockSlot,
  removeBlockedSlot,
} from "@/services/appointments";
import { getClients } from "@/services/clients";
import { getActiveBarbers } from "@/services/barbers";
import { getActiveServices } from "@/services/services";
import { getSettings } from "@/services/settings";
import { TIME_SLOTS, formatDateBR } from "@/lib/barbershop";
import { DatePicker } from "@/components/DatePicker";
import { APPOINTMENT_STATUSES } from "@/types";

export const Route = createFileRoute("/admin/agendamentos")({
  component: AgendamentosPage,
});

function AgendamentosPage() {
  const [appts, setAppts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const today = new Date().toISOString().slice(0, 10);
  const [blockDate, setBlockDate] = useState(today);
  const [blockTime, setBlockTime] = useState("");

  // Dados de apoio para marcar cliente na agenda.
  const [clients, setClients] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const emptyForm = { clientId: "", barberId: "", serviceId: "", date: today, time: "" };
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [savingAppt, setSavingAppt] = useState(false);

  const workingDays = settings?.workingDays ?? null;

  const load = async () => {
    setLoading(true);
    const [a, b] = await Promise.all([getAppointments(), getBlockedSlots()]);
    setAppts(a);
    setBlocks(b);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  // Listas de apoio (carregadas uma vez).
  useEffect(() => {
    getClients()
      .then(setClients)
      .catch(() => {});
    getActiveBarbers()
      .then(setBarbers)
      .catch(() => {});
    getActiveServices()
      .then(setServices)
      .catch(() => {});
    getSettings()
      .then(setSettings)
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    switch (filter) {
      case "todos":
        return appts;
      case "hoje":
        return appts.filter((a) => a.date === today);
      case "proximos":
        return appts.filter((a) => a.date > today);
      default:
        return appts.filter((a) => a.status === filter);
    }
  }, [appts, filter, today]);

  const updateStatus = async (id, status) => {
    await updateAppointmentStatus(id, status);
    toast.success("Status atualizado.");
    load();
  };

  const createAppt = async () => {
    if (!form.clientId) return toast.error("Selecione o cliente.");
    if (!form.barberId) return toast.error("Selecione o barbeiro.");
    if (!form.serviceId) return toast.error("Selecione o serviço.");
    if (!form.date) return toast.error("Selecione a data.");
    setSavingAppt(true);
    try {
      await createAppointment({
        userId: form.clientId,
        barberId: form.barberId,
        serviceId: form.serviceId,
        date: form.date,
        time: form.time || undefined,
      });
      toast.success("Agendamento criado.");
      setForm({ ...emptyForm, date: today });
      setShowForm(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível agendar.");
    } finally {
      setSavingAppt(false);
    }
  };

  const removeAppt = async (a) => {
    if (
      !window.confirm(
        `Excluir o agendamento de "${a.clientName}" em ${formatDateBR(a.date)}? Esta ação não pode ser desfeita.`,
      )
    )
      return;
    try {
      await deleteAppointment(a.id);
      toast.success("Agendamento excluído.");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível excluir.");
    }
  };

  const addBlock = async () => {
    if (!blockDate || !blockTime) return toast.error("Selecione data e horário.");
    await blockSlot(blockDate, blockTime);
    setBlockTime("");
    toast.success("Horário bloqueado.");
    load();
  };

  const removeBlock = async (id) => {
    await removeBlockedSlot(id);
    load();
  };

  const FILTERS = [
    { key: "todos", label: "Todos" },
    { key: "hoje", label: "Hoje" },
    { key: "proximos", label: "Próximos" },
    { key: "pendente", label: "Pendentes" },
    { key: "confirmado", label: "Confirmados" },
    { key: "concluido", label: "Concluídos" },
    { key: "cancelado", label: "Cancelados" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl">Agendamentos</h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-gradient-gold px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:brightness-110"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Fechar" : "Novo agendamento"}
          </button>
        </div>

        {showForm && (
          <div className="mt-5 rounded-xl border border-border bg-card/40 p-5">
            <h3 className="mb-4 flex items-center gap-2 font-serif text-lg">
              <CalendarPlus className="h-4 w-4 text-gold" /> Marcar cliente na agenda
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Cliente
                </span>
                <select
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  className="input-premium"
                >
                  <option value="">
                    {clients.length === 0 ? "Carregando..." : "Selecione..."}
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.phone ? ` — ${c.phone}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Barbeiro
                </span>
                <select
                  value={form.barberId}
                  onChange={(e) => setForm({ ...form, barberId: e.target.value })}
                  className="input-premium"
                >
                  <option value="">
                    {barbers.length === 0 ? "Carregando..." : "Selecione..."}
                  </option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Serviço
                </span>
                <select
                  value={form.serviceId}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  className="input-premium"
                >
                  <option value="">
                    {services.length === 0 ? "Carregando..." : "Selecione..."}
                  </option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — R$ {s.price}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Data
                </span>
                <DatePicker
                  value={form.date}
                  onChange={(d) => setForm({ ...form, date: d })}
                  workingDays={workingDays}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Horário (opcional)
                </span>
                <select
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="input-premium"
                >
                  <option value="">A combinar</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={createAppt}
                disabled={savingAppt}
                className="rounded-md bg-gradient-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-60"
              >
                {savingAppt ? "Salvando..." : "Agendar"}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm({ ...emptyForm, date: today });
                }}
                className="rounded-md border border-border px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-muted-foreground"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="mb-4 mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] transition ${filter === f.key ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:border-gold"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum agendamento.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card/40">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-card/60 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Barbeiro</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-t border-border/60">
                    <td className="px-4 py-3">
                      {a.clientName}
                      <div className="text-xs text-muted-foreground">{a.clientPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.barberName}</td>
                    <td className="px-4 py-3">{a.serviceName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateBR(a.date)}</td>
                    <td className="px-4 py-3">{a.time || "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={a.status}
                        onChange={(e) => updateStatus(a.id, e.target.value)}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                      >
                        {APPOINTMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removeAppt(a)}
                        title="Excluir agendamento"
                        className="inline-flex rounded-md border border-border p-2 text-muted-foreground transition hover:border-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <h3 className="flex items-center gap-2 font-serif text-lg">
            <Lock className="h-4 w-4 text-gold" /> Bloquear horário
          </h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="w-full sm:max-w-[180px]">
              <DatePicker value={blockDate} onChange={setBlockDate} workingDays={workingDays} />
            </div>
            <select
              value={blockTime}
              onChange={(e) => setBlockTime(e.target.value)}
              className="input-premium w-full sm:max-w-[140px]"
            >
              <option value="">Horário...</option>
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              onClick={addBlock}
              className="w-full rounded-md bg-gradient-gold px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground sm:w-auto"
            >
              Bloquear
            </button>
          </div>
        </div>
        <ul className="mt-6 space-y-2">
          {blocks.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card/30 px-4 py-3 text-sm"
            >
              <span>
                <ShieldOff className="mr-2 inline h-4 w-4 text-gold" />
                {formatDateBR(b.date)} às {b.time}
                {b.reason ? ` · ${b.reason}` : ""}
              </span>
              <button
                onClick={() => removeBlock(b.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {blocks.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum horário bloqueado.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
