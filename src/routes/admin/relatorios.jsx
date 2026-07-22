import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DollarSign, CalendarCheck, TrendingUp } from "lucide-react";
import { getAppointments } from "@/services/appointments";

export const Route = createFileRoute("/admin/relatorios")({
  component: RelatoriosPage,
});

function parsePrice(price) {
  const n = Number(price.replace(/[^\d,]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

const BRL = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusLabel = {
  pendente: "Pendentes",
  confirmado: "Confirmados",
  concluido: "Concluídos",
  cancelado: "Cancelados",
};

function RelatoriosPage() {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppointments().then((a) => {
      setAppts(a);
      setLoading(false);
    });
  }, []);

  const report = useMemo(() => {
    const byStatus = { pendente: 0, confirmado: 0, concluido: 0, cancelado: 0 };
    const byBarber = new Map();
    const byService = new Map();
    let realized = 0;
    let expected = 0;

    for (const a of appts) {
      byStatus[a.status]++;
      if (a.status !== "cancelado") {
        byBarber.set(a.barberName, (byBarber.get(a.barberName) ?? 0) + 1);
        byService.set(a.serviceName, (byService.get(a.serviceName) ?? 0) + 1);
        expected += parsePrice(a.servicePrice);
        if (a.status === "concluido") realized += parsePrice(a.servicePrice);
      }
    }
    const rank = (m) => [...m.entries()].sort((x, y) => y[1] - x[1]);
    return {
      byStatus,
      byBarber: rank(byBarber),
      byService: rank(byService),
      realized,
      expected,
      total: appts.length,
    };
  }, [appts]);

  if (loading) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  const maxBarber = report.byBarber[0]?.[1] ?? 1;
  const maxService = report.byService[0]?.[1] ?? 1;

  return (
    <div className="space-y-8">
      <h2 className="font-serif text-xl">Relatórios</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Faturamento realizado"
          value={BRL(report.realized)}
          hint="Agendamentos concluídos"
          icon={<DollarSign className="h-4 w-4 text-gold" />}
        />
        <Stat
          label="Receita prevista"
          value={BRL(report.expected)}
          hint="Exceto cancelados"
          icon={<TrendingUp className="h-4 w-4 text-gold" />}
        />
        <Stat
          label="Total de agendamentos"
          value={String(report.total)}
          hint="Todos os status"
          icon={<CalendarCheck className="h-4 w-4 text-gold" />}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {Object.keys(report.byStatus).map((s) => (
          <div key={s} className="rounded-xl border border-border bg-card/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {statusLabel[s]}
            </p>
            <p className="mt-2 font-serif text-2xl">{report.byStatus[s]}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RankCard title="Agendamentos por barbeiro" rows={report.byBarber} max={maxBarber} />
        <RankCard title="Serviços mais procurados" rows={report.byService} max={maxService} />
      </div>
    </div>
  );
}

function Stat({ label, value, hint, icon }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
        {icon} {label}
      </p>
      <p className="mt-3 font-serif text-2xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function RankCard({ title, rows, max }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <h3 className="font-serif text-lg">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Sem dados.</p>}
        {rows.map(([label, count]) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>{label}</span>
              <span className="text-muted-foreground">{count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted/40">
              <div
                className="h-full rounded-full bg-gradient-gold"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
