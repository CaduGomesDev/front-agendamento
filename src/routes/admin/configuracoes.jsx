import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock, Building2 } from "lucide-react";
import { getSettings, updateSettings, getCompany, updateCompany } from "@/services/settings";

export const Route = createFileRoute("/admin/configuracoes")({
  component: ConfiguracoesPage,
});

const DAYS = [
  { n: 0, label: "Dom" },
  { n: 1, label: "Seg" },
  { n: 2, label: "Ter" },
  { n: 3, label: "Qua" },
  { n: 4, label: "Qui" },
  { n: 5, label: "Sex" },
  { n: 6, label: "Sáb" },
];

function ConfiguracoesPage() {
  const [settings, setSettings] = useState(null);
  const [company, setCompany] = useState(null);
  const [slotsText, setSlotsText] = useState("");
  const [savingS, setSavingS] = useState(false);
  const [savingC, setSavingC] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setSlotsText((s.timeSlots ?? []).join(", "));
    });
    getCompany().then(setCompany);
  }, []);

  const toggleDay = (n) => {
    if (!settings) return;
    const has = settings.workingDays.includes(n);
    setSettings({
      ...settings,
      workingDays: has
        ? settings.workingDays.filter((d) => d !== n)
        : [...settings.workingDays, n].sort(),
    });
  };

  const saveSettings = async () => {
    if (!settings) return;
    // Aceita vírgula, ponto, ponto e vírgula ou quebra de linha como separador,
    // evitando que itens como "Qua. Qui" fiquem grudados em um único horário.
    const timeSlots = slotsText
      .split(/[,.;\n]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    setSavingS(true);
    const updated = await updateSettings({ ...settings, timeSlots });
    setSettings(updated);
    setSlotsText((updated.timeSlots ?? []).join(", "));
    setSavingS(false);
    toast.success("Configurações salvas.");
  };

  const saveCompany = async () => {
    if (!company) return;
    setSavingC(true);
    const updated = await updateCompany(company);
    setCompany(updated);
    setSavingC(false);
    toast.success("Dados da empresa salvos.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card/40 p-6">
        <h2 className="flex items-center gap-2 font-serif text-lg">
          <Clock className="h-4 w-4 text-gold" /> Operação
        </h2>
        <div className="divider-gold my-4 w-12" />
        {!settings ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Horários (separados por vírgula)
              </span>
              <textarea
                value={slotsText}
                onChange={(e) => setSlotsText(e.target.value)}
                rows={3}
                className="input-premium w-full"
              />
            </label>
            <div>
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Dias de funcionamento
              </span>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <button
                    key={d.n}
                    type="button"
                    onClick={() => toggleDay(d.n)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${settings.workingDays.includes(d.n) ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:border-gold"}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="block max-w-[220px]">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Intervalo entre horários (min)
              </span>
              <input
                type="number"
                min={0}
                step={1}
                value={settings.bookingIntervalMinutes}
                onChange={(e) => {
                  const n = Math.floor(Number(e.target.value));
                  setSettings({
                    ...settings,
                    bookingIntervalMinutes: Number.isFinite(n) ? Math.max(0, n) : 0,
                  });
                }}
                onKeyDown={(e) => {
                  // Bloqueia o sinal de menos / expoente já na digitação.
                  if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault();
                }}
                className="input-premium w-full"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={settings.allowOnlineBooking}
                onChange={(e) => setSettings({ ...settings, allowOnlineBooking: e.target.checked })}
              />
              Permitir agendamento online
            </label>
            <button
              onClick={saveSettings}
              disabled={savingS}
              className="rounded-md bg-gradient-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground disabled:opacity-60"
            >
              {savingS ? "Salvando..." : "Salvar configurações"}
            </button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card/40 p-6">
        <h2 className="flex items-center gap-2 font-serif text-lg">
          <Building2 className="h-4 w-4 text-gold" /> Empresa
        </h2>
        <div className="divider-gold my-4 w-12" />
        {!company ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <div className="space-y-3">
            {[
              ["name", "Nome"],
              ["phone", "Telefone"],
              ["whatsapp", "WhatsApp (só números, ex.: 5548999999999)"],
              ["email", "E-mail"],
              ["address", "Endereço"],
              ["instagram", "Instagram (@usuario ou link)"],
              ["openingHours", "Horário de funcionamento"],
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {label}
                </span>
                <input
                  value={company[key] ?? ""}
                  onChange={(e) => setCompany({ ...company, [key]: e.target.value })}
                  className="input-premium w-full"
                />
              </label>
            ))}
            <button
              onClick={saveCompany}
              disabled={savingC}
              className="mt-2 rounded-md bg-gradient-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground disabled:opacity-60"
            >
              {savingC ? "Salvando..." : "Salvar empresa"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
