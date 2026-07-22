import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthCard, FormField } from "@/components/AuthCard";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/app/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar — Barbearia Espezim" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loginWithEmail, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: isAdmin ? "/admin/dashboard" : "/app/agendar" });
  }, [user, isAdmin, navigate]);

  const handleEmail = async (e) => {
    e.preventDefault();
    if (!email || !pass) return toast.error("Preencha todos os campos.");
    setLoading(true);
    const { session, error } = await loginWithEmail({ email, password: pass });
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Bem-vindo(a)!");
    navigate({ to: session?.user.role === "admin" ? "/admin/dashboard" : "/app/agendar" });
  };

  const handleGoogle = async () => {
    const { error } = await loginWithGoogle();
    if (error) return toast.error("Não foi possível entrar com o Google.");
    toast.success("Bem-vindo(a)!");
    navigate({ to: "/app/agendar" });
  };

  return (
    <AuthCard
      title="Entrar"
      subtitle="Acesse sua conta para agendar."
      footer={
        <>
          Não tem conta?{" "}
          <Link to="/app/cadastro" className="text-gold hover:underline">
            Cadastre-se
          </Link>
        </>
      }
    >
      <form onSubmit={handleEmail} className="space-y-4">
        <FormField label="E-mail">
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-premium"
            placeholder="voce@email.com"
          />
        </FormField>
        <FormField label="Senha">
          <input
            type="password"
            autoComplete="current-password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="input-premium"
            placeholder="••••••••"
          />
        </FormField>
        <div className="text-right">
          <Link to="/app/recuperar-senha" className="text-xs text-muted-foreground hover:text-gold">
            Esqueci minha senha
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-gradient-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>
      <button
        onClick={handleGoogle}
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-background/40 px-4 py-3 text-sm transition hover:border-gold"
      >
        <GoogleIcon /> Continuar com Google
      </button>
    </AuthCard>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.79 2.72v2.26h2.9c1.7-1.57 2.69-3.88 2.69-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}
