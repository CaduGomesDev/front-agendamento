import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthCard, FormField } from "@/components/AuthCard";
import { requestPasswordReset } from "@/services/auth";

export const Route = createFileRoute("/app/recuperar-senha")({
  component: ForgotPage,
  head: () => ({ meta: [{ title: "Recuperar senha — Barbearia Espezim" }] }),
});

function ForgotPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { token, error } = await requestPasswordReset(email);
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Conta encontrada! Defina a sua nova senha.");
    navigate({ to: "/app/redefinir-senha", search: { token } });
  };

  return (
    <AuthCard
      title="Recuperar senha"
      subtitle="Confirme seu e-mail para redefinir a senha."
      footer={
        <Link to="/app/login" className="text-gold hover:underline">
          Voltar para entrar
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormField label="E-mail">
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-premium"
          />
        </FormField>
        <button
          disabled={loading}
          className="w-full rounded-md bg-gradient-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Verificando..." : "Continuar"}
        </button>
      </form>
    </AuthCard>
  );
}
