import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { getCompany } from "@/services/settings";
import { getActiveServices } from "@/services/services";
import { MapPin, Phone, Instagram, Clock, Mail } from "lucide-react";
import heroImg from "@/assets/hero-barbershop.jpg";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Barbearia Espezim — Por Carlos Gomes" },
      {
        name: "description",
        content:
          "Atendimento personalizado, conforto e estilo em cada detalhe. Agende seu horário online.",
      },
      { property: "og:title", content: "Barbearia Espezim" },
      { property: "og:description", content: "Por Carlos Gomes. Agendamento online." },
      { property: "og:type", content: "website" },
    ],
  }),
});

// Valores padrão exibidos antes de a API responder (ou se estiver indisponível).
const DEFAULT_COMPANY = {
  name: "Barbearia Espezim",
  phone: "(48) 99999-9999",
  whatsapp: "5548999999999",
  email: "",
  address: "Rua das Palmeiras, 123 — Florianópolis/SC",
  instagram: "https://instagram.com",
  openingHours: "Seg–Sex: 09h–19h · Sáb: 09h–14h",
};

/** Mantém só os campos-texto não vazios, para o default preencher o resto. */
function pruneEmpty(obj) {
  const out = {};
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) out[k] = v;
  });
  return out;
}

function waHref(whatsapp) {
  const digits = (whatsapp || "").replace(/\D/g, "");
  return `https://wa.me/${digits || "5548999999999"}`;
}

function instaHref(instagram) {
  const s = (instagram || "").trim();
  if (!s) return "https://instagram.com";
  if (s.startsWith("http")) return s;
  return `https://instagram.com/${s.replace(/^@/, "")}`;
}

/** Renderiza o nome com a última palavra em dourado (mantém a identidade visual). */
function BrandName({ name }) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return <span className="gold-text-gradient">{name}</span>;
  const last = parts.pop();
  return (
    <>
      {parts.join(" ")} <span className="gold-text-gradient">{last}</span>
    </>
  );
}

function Index() {
  const { user } = useAuth();
  const [company, setCompany] = useState(DEFAULT_COMPANY);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  useEffect(() => {
    getCompany()
      .then((c) => setCompany({ ...DEFAULT_COMPANY, ...pruneEmpty(c) }))
      .catch(() => {
        /* landing continua com os valores padrão se a API falhar */
      });
    getActiveServices()
      .then(setServices)
      .catch(() => {
        /* landing continua sem serviços se a API falhar */
      })
      .finally(() => setServicesLoading(false));
  }, []);

  const c = company;
  const wa = waHref(c.whatsapp);
  const insta = instaHref(c.instagram);
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(c.address || "Florianopolis")}&output=embed`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <header
        id="top"
        className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
      >
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/65 to-background" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center fade-up">
          <img
            src={logo}
            alt=""
            className="mx-auto mb-8 h-16 w-16 float-slow"
            width={64}
            height={64}
          />
          <h1 className="font-serif text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
            <BrandName name={c.name} />
          </h1>
          <div className="divider-gold mx-auto my-6 w-32" />
          <p className="text-xs uppercase tracking-[0.4em] text-gold">Por Carlos Gomes</p>
          <p className="mx-auto mt-8 max-w-md text-base text-muted-foreground md:text-lg">
            Atendimento personalizado, conforto e estilo em cada detalhe.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/app/agendar"
              className="inline-block rounded-md bg-gradient-gold px-10 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-primary-foreground transition hover:brightness-110"
            >
              Agendar Horário
            </Link>
            {!user && (
              <Link
                to="/app/login"
                className="inline-block rounded-md border border-border px-10 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground transition hover:border-gold hover:text-gold"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* SERVIÇOS */}
      <section id="servicos" className="border-y border-border/40 bg-gradient-dark py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-gold">Serviços</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">Tabela de preços</h2>
            <div className="divider-gold mx-auto my-6 w-20" />
          </div>
          {servicesLoading && (
            <p className="mt-14 text-center text-sm text-muted-foreground">Carregando...</p>
          )}
          {!servicesLoading && services.length === 0 && (
            <p className="mt-14 text-center text-sm text-muted-foreground">
              Nenhum serviço cadastrado no momento.
            </p>
          )}
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div
                key={s.id}
                className="group rounded-xl border border-border bg-card/40 p-7 transition hover:border-gold/60"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-2xl">{s.name}</h3>
                  <span className="gold-text-gradient font-serif text-xl">R$ {s.price}</span>
                </div>
                {s.description && (
                  <p className="mt-3 text-sm text-muted-foreground">{s.description}</p>
                )}
                <p className="mt-5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  {s.durationMinutes} min
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AGENDAMENTO */}
      <section id="agendar" className="mx-auto max-w-6xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-gold">Agendamento</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Reserve seu horário</h2>
          <div className="divider-gold mx-auto my-6 w-20" />
          <p className="text-muted-foreground">
            Escolha o barbeiro, o serviço e o horário ideal. Rápido e sem conflito.
          </p>
          <Link
            to="/app/agendar"
            className="mt-10 inline-block rounded-md bg-gradient-gold px-10 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-primary-foreground transition hover:brightness-110"
          >
            {user ? "Agendar agora" : "Entrar e agendar"}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contato" className="border-t border-border bg-card/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <img src={logo} alt="" className="h-8 w-8" width={32} height={32} />
              <span className="font-serif text-xl">{c.name}</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Por Carlos Gomes.</p>
            <div className="mt-6 flex gap-3">
              <a
                href={insta}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border p-2 text-muted-foreground transition hover:border-gold hover:text-gold"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border p-2 text-muted-foreground transition hover:border-gold hover:text-gold"
                aria-label="WhatsApp"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <h3 className="font-serif text-lg text-gold">Contato</h3>
            {c.address && (
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 text-gold" /> {c.address}
              </p>
            )}
            {c.phone && (
              <p className="flex items-start gap-2 text-muted-foreground">
                <Phone className="mt-0.5 h-4 w-4 text-gold" /> {c.phone}
              </p>
            )}
            {c.email && (
              <p className="flex items-start gap-2 text-muted-foreground">
                <Mail className="mt-0.5 h-4 w-4 text-gold" /> {c.email}
              </p>
            )}
            {c.openingHours && (
              <p className="flex items-start gap-2 text-muted-foreground">
                <Clock className="mt-0.5 h-4 w-4 text-gold" /> {c.openingHours}
              </p>
            )}
          </div>
          <div>
            <h3 className="font-serif text-lg text-gold">Localização</h3>
            <div className="mt-3 overflow-hidden rounded-lg border border-border">
              <iframe
                title={`Mapa ${c.name}`}
                src={mapSrc}
                className="h-44 w-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
        <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {c.name}. Todos os direitos reservados.
        </div>
      </footer>

      <a
        href={wa}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold text-primary-foreground transition hover:scale-110"
        aria-label="WhatsApp"
      >
        <Phone className="h-5 w-5" />
      </a>
    </div>
  );
}
