import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthCard, FormField } from "@/components/AuthCard";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
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

  // Recebe o idToken do botão oficial do Google e conclui o login pela API.
  const handleGoogleCredential = async (idToken) => {
    const { session, error } = await loginWithGoogle(idToken);
    if (error) return toast.error(error);
    toast.success("Bem-vindo(a)!");
    navigate({ to: session?.user.role === "admin" ? "/admin/dashboard" : "/app/agendar" });
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
      <GoogleSignInButton onCredential={handleGoogleCredential} />
    </AuthCard>
  );
}
