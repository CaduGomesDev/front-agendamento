import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Link to="/" className="mx-auto mb-8 flex items-center gap-2">
          <img src={logo} alt="" className="h-10 w-10" />
          <span className="font-serif text-2xl">Central Barbearia</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card/50 p-8 backdrop-blur">
          <h1 className="font-serif text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="divider-gold my-6 w-12" />
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
