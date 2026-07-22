import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Menu,
  X,
  LogOut,
  Home,
  ShieldCheck,
  CalendarPlus,
  CalendarDays,
  UserRound,
  LayoutDashboard,
  Scissors,
  Tag,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const CLIENT_NAV = [
  { to: "/app/agendar", label: "Agendar", icon: CalendarPlus },
  { to: "/app/meus-agendamentos", label: "Meus agendamentos", icon: CalendarDays },
  { to: "/app/perfil", label: "Perfil", icon: UserRound },
];

const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/barbeiros", label: "Barbeiros", icon: Scissors },
  { to: "/admin/servicos", label: "Serviços", icon: Tag },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

const linkBase =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-gold/5 hover:text-gold";
const linkActive =
  "flex items-center gap-3 rounded-lg bg-gold/10 px-3 py-2.5 text-sm font-medium text-gold";

export function AppShell({ variant, children }) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // A área admin é protegida.
  useEffect(() => {
    if (variant === "admin" && !loading && !isAdmin) navigate({ to: "/" });
  }, [variant, loading, isAdmin, navigate]);

  const nav = variant === "admin" ? ADMIN_NAV : CLIENT_NAV;
  const title = variant === "admin" ? "Administração" : "Minha conta";

  const logout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  if (variant === "admin" && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }
  if (variant === "admin" && !isAdmin) return null;

  const Sidebar = ({ onNavigate }) => (
    <div className="flex h-full flex-col">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-2 px-2 pb-6 pt-1">
        <img src={logo} alt="" className="h-8 w-8" width={32} height={32} />
        <div className="leading-tight">
          <span className="block font-serif text-lg">Central Barbearia</span>
          <span className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {title}
          </span>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={linkBase}
            activeProps={{ className: linkActive }}
          >
            <Icon className="h-4 w-4 shrink-0" /> {label}
          </Link>
        ))}

        <div className="my-3 h-px bg-border/60" />

        {variant === "client" && isAdmin && (
          <Link to="/admin/dashboard" onClick={onNavigate} className={linkBase}>
            <ShieldCheck className="h-4 w-4 shrink-0" /> Painel admin
          </Link>
        )}
        {variant === "admin" && (
          <Link to="/app/agendar" onClick={onNavigate} className={linkBase}>
            <CalendarPlus className="h-4 w-4 shrink-0" /> Área do cliente
          </Link>
        )}
        <Link to="/" onClick={onNavigate} className={linkBase}>
          <Home className="h-4 w-4 shrink-0" /> Ver site
        </Link>
      </nav>

      <div className="mt-4 border-t border-border/60 pt-4">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold text-sm font-semibold text-primary-foreground">
                {user.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:border-destructive hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              to="/app/login"
              onClick={onNavigate}
              className="rounded-lg bg-gradient-gold px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground"
            >
              Entrar
            </Link>
            <Link
              to="/app/cadastro"
              onClick={onNavigate}
              className="rounded-lg border border-gold px-3 py-2 text-center text-xs uppercase tracking-[0.2em] text-gold"
            >
              Cadastrar
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar (mobile) */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="" className="h-7 w-7" width={28} height={28} />
          <span className="font-serif text-lg">Central Barbearia</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="rounded-md border border-border p-2"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border/40 bg-card/30 p-5 md:block">
        <Sidebar />
      </aside>

      {/* Drawer (mobile) */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] border-r border-border/40 bg-card p-5">
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="absolute right-3 top-3 rounded-md border border-border p-1.5"
            >
              <X className="h-4 w-4" />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Conteúdo */}
      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-10 md:py-10">{children}</div>
      </main>
    </div>
  );
}
