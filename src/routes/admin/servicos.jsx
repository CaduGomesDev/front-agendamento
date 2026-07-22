import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { getServices, createService, updateService, deleteService } from "@/services/services";

export const Route = createFileRoute("/admin/servicos")({
  component: ServicosPage,
});

const emptyDraft = {
  id: null,
  name: "",
  price: "",
  durationMinutes: "",
  description: "",
  active: true,
};

function ServicosPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setServices(await getServices());
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const startEdit = (s) =>
    setDraft({
      id: s.id,
      name: s.name,
      price: String(s.price),
      durationMinutes: String(s.durationMinutes),
      description: s.description ?? "",
      active: s.active,
    });
  const reset = () => setDraft(emptyDraft);

  const save = async () => {
    if (draft.name.trim().length < 2) return toast.error("Informe o nome do serviço.");
    const price = Number(draft.price);
    const durationMinutes = Number(draft.durationMinutes);
    if (!Number.isFinite(price) || price < 0) return toast.error("Preço inválido.");
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0)
      return toast.error("Duração inválida.");

    setSaving(true);
    const payload = {
      name: draft.name.trim(),
      price,
      durationMinutes,
      description: draft.description.trim(),
      active: draft.active,
    };
    if (draft.id) await updateService(draft.id, payload);
    else await createService(payload);
    setSaving(false);
    toast.success(draft.id ? "Serviço atualizado." : "Serviço cadastrado.");
    reset();
    load();
  };

  const toggleActive = async (s) => {
    await updateService(s.id, { active: !s.active });
    load();
  };

  const remove = async (id) => {
    await deleteService(id);
    toast.success("Serviço removido.");
    if (draft.id === id) reset();
    load();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <h2 className="font-serif text-xl">Serviços</h2>
        <p className="text-sm text-muted-foreground">Catálogo de serviços oferecidos.</p>
        <div className="mt-5 space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {!loading && services.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado.</p>
          )}
          {services.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/40 p-4"
            >
              <div>
                <p className="font-medium">
                  {s.name}{" "}
                  {!s.active && (
                    <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-destructive">
                      inativo
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-gold">R$ {s.price}</span> · {s.durationMinutes} min
                  {s.description ? ` · ${s.description}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleActive(s)}
                  title={s.active ? "Desativar" : "Ativar"}
                  className="rounded-md border border-border p-2 text-muted-foreground hover:text-gold"
                >
                  {s.active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => startEdit(s)}
                  title="Editar"
                  className="rounded-md border border-border p-2 text-muted-foreground hover:text-gold"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(s.id)}
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

      <div className="h-fit rounded-xl border border-border bg-card/40 p-5">
        <h3 className="flex items-center gap-2 font-serif text-lg">
          <Plus className="h-4 w-4 text-gold" /> {draft.id ? "Editar serviço" : "Novo serviço"}
        </h3>
        <div className="mt-4 space-y-3">
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Nome"
            className="input-premium w-full"
          />
          <div className="flex gap-3">
            <label className="flex-1 block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Preço (R$)
              </span>
              <input
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                inputMode="numeric"
                className="input-premium w-full"
              />
            </label>
            <label className="flex-1 block">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Duração (min)
              </span>
              <input
                value={draft.durationMinutes}
                onChange={(e) => setDraft({ ...draft, durationMinutes: e.target.value })}
                inputMode="numeric"
                className="input-premium w-full"
              />
            </label>
          </div>
          <textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Descrição (opcional)"
            rows={2}
            className="input-premium w-full"
          />
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
