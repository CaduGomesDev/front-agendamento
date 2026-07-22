import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthCard, FormField } from "@/components/AuthCard";
import { useAuth } from "@/contexts/AuthContext";
import { updatePassword } from "@/services/auth";

export const Route = createFileRoute("/app/redefinir-senha")({
  component: ResetPage,
  head: () => ({ meta: [{ title: "Nova senha — Barbearia Espezim" }] }),
});

function ResetPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (pass.length < 6) return toast.error("Mínimo de 6 caracteres.");
    setLoading(true);
    // Fluxo real usa o token do e-mail; no mock, atualiza se houver usuário logado.
    if (user) {
      const { error } = await updatePassword(user.id, pass);
      if (error) {
        setLoading(false);
        return toast.error(error);
      }
    }
    setLoading(false);
    toast.success("Senha atualizada!");
    navigate({ to: "/app/login" });
  };

  return (
    <AuthCard title="Nova senha" subtitle="Defina uma nova senha de acesso.">
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Nova senha">
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="input-premium"
            autoComplete="new-password"
          />
        </FormField>
        <button
          disabled={loading}
          className="w-full rounded-md bg-gradient-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </AuthCard>
  );
}
