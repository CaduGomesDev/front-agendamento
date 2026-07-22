import { Navbar } from "./Navbar";

export function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-20">{children}</main>
    </div>
  );
}
