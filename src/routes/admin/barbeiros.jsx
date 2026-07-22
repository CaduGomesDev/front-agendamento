import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { getBarbers, createBarber, updateBarber, deleteBarber } from "@/services/barbers";
import { SERVICES, maskPhone } from "@/lib/barbershop";

export const Route = createFileRoute("/admin/barbeiros")({
  component: BarbeirosPage,
});

const emptyDraft = {
  id: null,
  name: "",
  email: "",
  phone: "",
  specialties: [],
  active: true,
  bio: "",
};

function BarbeirosPage() {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setBarbers(await getBarbers());
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const startEdit = (b) =>
    setDraft({
      id: b.id,
      name: b.name,
      email: b.email,
      phone: b.phone,
      specialties: b.specialties,
      active: b.active,
      bio: b.bio ?? "",
    });
  const reset = () => setDraft(emptyDraft);

  const toggleSpecialty = (id) =>
    setDraft((d) => ({
      ...d,
      specialties: d.specialties.includes(id)
        ? d.specialties.filter((s) => s !== id)
        : [...d.specialties, id],
    }));

  const save = async () => {
    if (draft.name.trim().length < 2) return toast.error("Informe o nome do barbeiro.");
    setSaving(true);
    const payload = {
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone,
      specialties: draft.specialties,
      active: draft.active,
      bio: draft.bio.trim(),
    };
    if (draft.id) await updateBarber(draft.id, payload);
    else await createBarber(payload);
    setSaving(false);
    toast.success(draft.id ? "Barbeiro atualizado." : "Barbeiro cadastrado.");
    reset();
    load();
  };

  const toggleActive = async (b) => {
    await updateBarber(b.id, { active: !b.active });
    load();
  };

  const remove = async (id) => {
    await deleteBarber(id);
    toast.success("Barbeiro removido.");
    if (draft.id === id) reset();
    load();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <h2 className="font-serif text-xl">Barbeiros</h2>
        <p className="text-sm text-muted-foreground">Gerencie a equipe da barbearia.</p>
        <div className="mt-5 space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {!loading && barbers.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum barbeiro cadastrado.</p>
          )}
          {barbers.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/40 p-4"
            >
              <div>
                <p className="font-medium">
                  {b.name}{" "}
                  {!b.active && (
                    <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-destructive">
                      inativo
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {b.phone || "—"} ·{" "}
                  {b.specialties
                    .map((s) => SERVICES.find((x) => x.id === s)?.name ?? s)
                    .join(", ") || "sem especialidades"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleActive(b)}
                  title={b.active ? "Desativar" : "Ativar"}
                  className="rounded-md border border-border p-2 text-muted-foreground hover:text-gold"
                >
                  {b.active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => startEdit(b)}
                  title="Editar"
                  className="rounded-md border border-border p-2 text-muted-foreground hover:text-gold"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(b.id)}
                  title="Remover"
                  className="rounded-md border border-border p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/40 p-5 h-fit">
        <h3 className="flex items-center gap-2 font-serif text-lg">
          <Plus className="h-4 w-4 text-gold" /> {draft.id ? "Editar barbeiro" : "Novo barbeiro"}
        </h3>
        <div className="mt-4 space-y-3">
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Nome"
            className="input-premium w-full"
          />
          <input
            value={draft.email}
            onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            placeholder="E-mail"
            className="input-premium w-full"
          />
          <input
            value={draft.phone}
            onChange={(e) => setDraft({ ...draft, phone: maskPhone(e.target.value) })}
            placeholder="Telefone"
            className="input-premium w-full"
          />
          <textarea
            value={draft.bio}
            onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
            placeholder="Bio (opcional)"
            rows={2}
            className="input-premium w-full"
          />
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Especialidades
            </p>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleSpecialty(s.id)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${draft.specialties.includes(s.id) ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:border-gold"}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
            />{" "}
            Ativo
          </label>
          <div className="flex gap-2 pt-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 rounded-md bg-gradient-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Salvando..." : draft.id ? "Salvar" : "Cadastrar"}
            </button>
            {draft.id && (
              <button
                onClick={reset}
                className="rounded-md border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
