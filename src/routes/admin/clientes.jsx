import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Trash2, X } from "lucide-react";
import { getClients, createClient, deleteClient } from "@/services/clients";
import { maskPhone } from "@/lib/barbershop";

export const Route = createFileRoute("/admin/clientes")({
  component: ClientesPage,
});

const emptyForm = { name: "", email: "", phone: "", password: "" };

function ClientesPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setClients(await getClients());
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q),
    );
  }, [clients, query]);

  const submit = async () => {
    if (form.name.trim().length < 2) return toast.error("Informe o nome.");
    if (!/\S+@\S+\.\S+/.test(form.email)) return toast.error("E-mail inválido.");
    if (form.password.length < 6) return toast.error("A senha precisa ter ao menos 6 caracteres.");
    setSaving(true);
    try {
      await createClient({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        password: form.password,
      });
      toast.success("Cliente cadastrado.");
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível cadastrar.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Excluir o cliente "${c.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteClient(c.id);
      toast.success("Cliente removido.");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível excluir.");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            {clients.length} cliente(s) cadastrado(s).
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              style={{ paddingLeft: "2.5rem" }}
              className="input-premium w-full sm:max-w-[240px]"
            />
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-gradient-gold px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:brightness-110 sm:flex-none"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Fechar" : "Novo cliente"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-5 rounded-xl border border-border bg-card/40 p-5">
          <h3 className="mb-4 font-serif text-lg">Novo cliente</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nome"
              className="input-premium"
            />
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="E-mail"
              type="email"
              className="input-premium"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
              placeholder="Telefone"
              className="input-premium"
            />
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Senha (mín. 6)"
              type="password"
              className="input-premium"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={submit}
              disabled={saving}
              className="rounded-md bg-gradient-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Cadastrar"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
              }}
              className="rounded-md border border-border px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-card/40">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-card/60 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Agendamentos</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="px-4 py-3">{c.name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-gold">{c.appointmentsCount ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(c)}
                      title="Excluir"
                      className="inline-flex rounded-md border border-border p-2 text-muted-foreground transition hover:border-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
