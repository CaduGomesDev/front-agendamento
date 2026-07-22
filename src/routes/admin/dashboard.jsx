import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Users, Scissors, CalendarDays } from "lucide-react";
import { getAppointments } from "@/services/appointments";
import { getClients } from "@/services/clients";
import { getBarbers } from "@/services/barbers";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [appts, setAppts] = useState([]);
  const [clientsCount, setClientsCount] = useState(0);
  const [barbersCount, setBarbersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    Promise.all([getAppointments(), getClients(), getBarbers()]).then(([a, c, b]) => {
      setAppts(a);
      setClientsCount(c.length);
      setBarbersCount(b.filter((x) => x.active).length);
      setLoading(false);
    });
  }, []);

  const todayList = appts.filter((a) => a.date === today && a.status !== "cancelado");
  const upcoming = appts.filter((a) => a.date > today && a.status !== "cancelado");

  return (
    <div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Hoje"
          value={todayList.length}
          icon={<Calendar className="h-4 w-4 text-gold" />}
        />
        <Stat
          label="Próximos"
          value={upcoming.length}
          icon={<CalendarDays className="h-4 w-4 text-gold" />}
        />
        <Stat
          label="Clientes"
          value={clientsCount}
          icon={<Users className="h-4 w-4 text-gold" />}
        />
        <Stat
          label="Barbeiros ativos"
          value={barbersCount}
          icon={<Scissors className="h-4 w-4 text-gold" />}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">Agendamentos de hoje</h2>
        <Link
          to="/admin/agendamentos"
          className="text-xs uppercase tracking-[0.2em] text-gold hover:underline"
        >
          Ver todos
        </Link>
      </div>
      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : todayList.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum agendamento para hoje.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card/40">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-card/60 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Barbeiro</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayList.map((a) => (
                  <tr key={a.id} className="border-t border-border/60">
                    <td className="px-4 py-3">
                      {a.clientName}
                      <div className="text-xs text-muted-foreground">{a.clientPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.barberName}</td>
                    <td className="px-4 py-3">{a.serviceName}</td>
                    <td className="px-4 py-3">{a.time}</td>
                    <td className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-gold">
                      {a.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
        {icon} {label}
      </p>
      <p className="mt-3 font-serif text-3xl">{value}</p>
    </div>
  );
}
