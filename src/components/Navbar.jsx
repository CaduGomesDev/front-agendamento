import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const SECTIONS = [
  { href: "#top", label: "Início" },
  { href: "#servicos", label: "Serviços" },
  { href: "#agendar", label: "Agendar" },
  { href: "#contato", label: "Contato" },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const linkCls = "hover:text-gold transition";

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2">
          <img src={logo} alt="" className="h-7 w-7" width={28} height={28} />
          <span className="font-serif text-lg tracking-wide">Central Barbearia</span>
        </a>

        {/* Nomes das seções — rolam suavemente até a seção */}
        <div className="hidden items-center gap-8 text-xs uppercase tracking-[0.25em] text-muted-foreground md:flex">
          {SECTIONS.map((s) => (
            <a key={s.href} href={s.href} className={linkCls}>
              {s.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to="/app/agendar"
                className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-gold"
              >
                <UserRound className="h-3.5 w-3.5" /> Minha conta
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:border-gold hover:text-gold"
              >
                <LogOut className="h-3.5 w-3.5" /> Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/app/login"
                className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-gold"
              >
                Entrar
              </Link>
              <Link
                to="/app/cadastro"
                className="rounded-md border border-gold px-4 py-2 text-xs uppercase tracking-[0.25em] text-gold transition hover:bg-gold hover:text-primary-foreground"
              >
                Cadastrar
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden rounded-md border border-border p-2 text-foreground"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/30 bg-background/95 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-5 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            {SECTIONS.map((s) => (
              <a key={s.href} href={s.href} onClick={() => setOpen(false)} className={linkCls}>
                {s.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2 border-t border-border/30 pt-3">
              {user ? (
                <>
                  <Link
                    to="/app/agendar"
                    onClick={() => setOpen(false)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gold bg-gold/10 px-3 py-2 text-center text-gold"
                  >
                    <UserRound className="h-4 w-4" /> Minha conta
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-3 py-2"
                  >
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/app/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-md border border-border px-3 py-2 text-center"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/app/cadastro"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-md border border-gold bg-gold/10 px-3 py-2 text-center text-gold"
                  >
                    Cadastrar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
