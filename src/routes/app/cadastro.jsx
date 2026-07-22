import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AuthCard, FormField } from "@/components/AuthCard";
import { maskPhone } from "@/lib/barbershop";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/app/cadastro")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Cadastro — Barbearia Espezim" }] }),
});

function SignupPage() {
  const navigate = useNavigate();
  const { user, signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/app/agendar" });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Informe seu nome.");
    if (!/\S+@\S+\.\S+/.test(email)) return toast.error("E-mail inválido.");
    if (phone.replace(/\D/g, "").length < 10) return toast.error("Telefone inválido.");
    if (pass.length < 6) return toast.error("A senha precisa ter ao menos 6 caracteres.");

    setLoading(true);
    const { error } = await signUp({
      name: name.trim(),
      email: email.trim(),
      phone,
      password: pass,
    });
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Conta criada! Você já está logado(a).");
    navigate({ to: "/app/agendar" });
  };

  return (
    <AuthCard
      title="Criar conta"
      subtitle="Leva menos de um minuto."
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/app/login" className="text-gold hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Nome">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-premium"
            maxLength={80}
          />
        </FormField>
        <FormField label="E-mail">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-premium"
            autoComplete="email"
          />
        </FormField>
        <FormField label="Telefone">
          <input
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            className="input-premium"
            placeholder="(48) 99999-9999"
            inputMode="tel"
          />
        </FormField>
        <FormField label="Senha">
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="input-premium"
            autoComplete="new-password"
          />
        </FormField>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-gradient-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </AuthCard>
  );
}
