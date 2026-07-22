import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { FormField } from "@/components/AuthCard";
import { maskPhone } from "@/lib/barbershop";
import { getClientProfile } from "@/services/clients";
import { updatePassword } from "@/services/auth";
import { User, KeyRound, LogOut } from "lucide-react";

export const Route = createFileRoute("/app/perfil")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Perfil — Barbearia Espezim" }] }),
});

function ProfilePage() {
  const { user, loading, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [newPass, setNewPass] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/app/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    getClientProfile(user.id).then((data) => {
      if (data) {
        setName(data.name || "");
        setPhone(data.phone || "");
        setEmail(data.email || user.email || "");
      } else {
        setName(user.name || "");
        setEmail(user.email || "");
      }
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    await updateProfile({ name, phone });
    setSaving(false);
    toast.success("Perfil atualizado.");
  };

  const changePassword = async () => {
    if (!user) return;
    if (newPass.length < 6) return toast.error("Mínimo de 6 caracteres.");
    const { error } = await updatePassword(user.id, newPass);
    if (error) return toast.error(error);
    setNewPass("");
    toast.success("Senha alterada.");
  };

  if (!user) return null;

  return (
    <AppShell variant="client">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-gold text-primary-foreground">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-serif text-3xl">{name || "Seu perfil"}</h1>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <section className="mt-10 rounded-2xl border border-border bg-card/40 p-6">
          <h2 className="font-serif text-lg">Dados pessoais</h2>
          <div className="divider-gold my-4 w-12" />
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Nome">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-premium"
              />
            </FormField>
            <FormField label="Telefone">
              <input
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                className="input-premium"
              />
            </FormField>
            <FormField label="E-mail">
              <input value={email} disabled className="input-premium opacity-60" />
            </FormField>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="mt-6 rounded-md bg-gradient-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground hover:brightness-110 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card/40 p-6">
          <h2 className="flex items-center gap-2 font-serif text-lg">
            <KeyRound className="h-4 w-4 text-gold" /> Alterar senha
          </h2>
          <div className="divider-gold my-4 w-12" />
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Nova senha"
              className="input-premium flex-1"
            />
            <button
              onClick={changePassword}
              className="rounded-md border border-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold transition hover:bg-gold hover:text-primary-foreground"
            >
              Alterar
            </button>
          </div>
        </section>

        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-border px-6 py-3 text-sm text-muted-foreground transition hover:border-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Sair da conta
        </button>
      </div>
    </AppShell>
  );
}
