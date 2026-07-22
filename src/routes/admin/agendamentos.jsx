import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Lock, Trash2, ShieldOff } from "lucide-react";
import {
  getAppointments,
  updateAppointmentStatus,
  getBlockedSlots,
  blockSlot,
  removeBlockedSlot,
} from "@/services/appointments";
import { TIME_SLOTS, formatDateBR } from "@/lib/barbershop";
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
        <h2 className="font-serif text-xl">Agendamentos</h2>
        <div className="mt-4 mb-4 flex flex-wrap gap-2">
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
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-card/60 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Barbeiro</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Status</th>
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
            <input
              type="date"
              min={today}
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
              className="input-premium w-full sm:max-w-[180px]"
            />
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
