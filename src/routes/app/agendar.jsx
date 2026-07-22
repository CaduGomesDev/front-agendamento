import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BookingForm } from "@/components/BookingForm";

export const Route = createFileRoute("/app/agendar")({
  component: AgendarPage,
  head: () => ({ meta: [{ title: "Agendar — Barbearia Espezim" }] }),
});

function AgendarPage() {
  return (
    <AppShell variant="client">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Agendamento</p>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl">Reserve seu horário</h1>
        <div className="divider-gold mx-auto my-6 w-20" />
        <p className="text-muted-foreground">Escolha o barbeiro, o serviço e o melhor horário.</p>
      </div>
      <div className="mt-10">
        <BookingForm />
      </div>
    </AppShell>
  );
}
