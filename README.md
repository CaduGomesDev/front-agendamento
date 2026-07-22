# Central de Agendamento — Front-end

Aplicação web (site público + área do cliente + painel administrativo) da barbearia, construída em **React 19 + TanStack Start/Router**, com **Tailwind CSS v4** e componentes **shadcn/ui** (estilo "new-york") sobre **Radix UI**.

> Esta é a versão em **JavaScript (ESM)** do projeto — todo o código-fonte usa `.js`/`.jsx`, sem TypeScript. O único arquivo `.ts` é o `src/routeTree.gen.ts`, gerado automaticamente pelo TanStack Router (não deve ser editado à mão).

O front consome **apenas a API REST** do back-end (Node/Express).

## Stack

- **TanStack Start** + **TanStack Router** — roteamento baseado em arquivos (`src/routes`), com SSR.
- **React 19** + **JavaScript (ESM)**
- **Tailwind CSS v4** (tema em `src/styles.css`, tokens em OKLCH) + **shadcn/ui** (`src/components/ui`) + **Radix UI**
- **Vite 7** como bundler; `vite.config.js` monta TanStack Start + **Nitro** (`nitro/vite`), React, Tailwind v4 e o alias `@` -> `src/`
- **@tanstack/react-query** já provisionado (`QueryClientProvider` em `router.jsx`/`__root.jsx`), mas as páginas hoje buscam dados com `useEffect` + funções de `src/services` diretamente, sem `useQuery`/`useMutation` ainda.
- **Deploy: Vercel** — o build via Nitro detecta a Vercel automaticamente e gera Vercel Functions (SSR). Preset fixado em `vercel.json` (`framework: tanstack-start`). Ver seção **Deploy** abaixo.

## Como rodar

```bash
npm install
npm run dev      # servidor de desenvolvimento (Vite)
npm run build    # build de produção
npm run preview  # pré-visualiza o build
npm run lint     # ESLint
npm run format   # Prettier
```

Antes de subir, crie um `.env` na raiz com a variável `VITE_API_URL` (ver abaixo).

## Deploy

Arquitetura de produção: **front-end na Vercel** + **back-end (API Node/Express) no Render**.

### Front-end (Vercel)

1. Faça push deste repositório para o GitHub.
2. No painel da Vercel: **Add New → Project** e importe o repositório.
3. A Vercel detecta **TanStack Start** automaticamente (preset já fixado em `vercel.json`) — não é preciso definir *Build Command* nem *Output Directory*.
4. Em **Settings → Environment Variables**, adicione:
   - `VITE_API_URL` = `https://SEU-BACKEND.onrender.com/api` (a URL pública da API no Render, terminando em `/api`)
5. **Deploy**. A cada `git push` a Vercel refaz o build.

> `VITE_API_URL` é embutida no build. Variáveis definidas na Vercel têm precedência sobre o `.env` do repositório, então o `.env` local (localhost) não interfere na produção. Se mudar a URL da API, é preciso **refazer o deploy**.

### Back-end (Render)

O back-end está em outro repositório ([backcentralagendamento](https://github.com/CaduGomesDev/backcentralagendamento)). No Render, crie um **Web Service** apontando para ele:

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`
- **Variáveis de ambiente:** `NODE_ENV=production`, `MONGODB_URI` (MongoDB Atlas), `JWT_SECRET`, `JWT_REFRESH_SECRET` e `CORS_ORIGIN` = a URL do front na Vercel (ex.: `https://seu-front.vercel.app`).

## Estrutura de pastas

```
src/
├── routes/              # Rotas (file-based routing do TanStack Router)
│   ├── index.jsx        # Landing page pública
│   ├── app/              # Área do cliente autenticado (/app/...)
│   └── admin/            # Painel administrativo (/admin/...), protegido por isAdmin
├── components/
│   ├── AppShell.jsx      # Layout com sidebar (variant="admin" | "client") — usado por AdminShell e pelas páginas /app/*
│   ├── AdminShell.jsx    # Wrapper fino: AppShell variant="admin"
│   ├── Navbar.jsx        # Navbar da landing page pública (com menu mobile)
│   ├── AuthCard.jsx      # Layout das telas de login/cadastro/recuperar senha
│   ├── BookingForm.jsx   # Formulário de agendamento (usado em /app/agendar)
│   ├── PageShell.jsx     # Layout alternativo (Navbar + main)
│   └── ui/               # Primitivos shadcn/ui (button, dialog, table, sidebar, etc.)
├── services/             # Um módulo por domínio, todos falando com a API REST via services/api.js
│   ├── api.js            # Cliente HTTP central: base URL, tokens JWT, refresh automático, ApiError
│   ├── auth.js           # Login, cadastro, sessão (localStorage), troca de senha
│   ├── appointments.js / barbers.js / clients.js / services.js / settings.js
│   └── index.js          # Barrel (namespaces authService, barbersService, etc.)
├── contexts/
│   └── AuthContext.jsx   # Estado global de sessão (user, isAdmin, login/logout/updateProfile)
├── lib/
│   ├── barbershop.js     # Constantes de negócio: TIME_SLOTS, SERVICES, helpers de WhatsApp/telefone/data
│   ├── utils.js          # cn() (clsx + tailwind-merge)
│   └── error-page.js     # Página de erro 500 (usada pelo middleware de erro em start.js)
├── types/                # Barris de tipos (vazios em runtime; mantidos para organização/documentação)
├── router.jsx            # createRouter() + QueryClient
├── start.js              # createStart() — middleware de erro do SSR (página 500 amigável)
├── routeTree.gen.ts      # Árvore de rotas gerada automaticamente pelo TanStack Router (NÃO editar)
└── styles.css            # Tema Tailwind v4 (tokens de cor OKLCH, utilitários .input-premium, .gold-text-gradient etc.)
```

## Rotas

**Site público**
| Rota | Descrição |
|---|---|
| `/` | Landing page (hero, serviços — vindos da API, agendamento, contato) |

**Área do cliente** (`/app`, requer login)
| Rota | Descrição |
|---|---|
| `/app/login`, `/app/cadastro` | Autenticação (e-mail/senha; botão Google ainda não funcional) |
| `/app/recuperar-senha`, `/app/redefinir-senha` | Fluxo de redefinição de senha |
| `/app/agendar` | Formulário de agendamento |
| `/app/meus-agendamentos` | Histórico e cancelamento de agendamentos |
| `/app/perfil` | Dados pessoais e troca de senha |

**Painel administrativo** (`/admin`, requer `role: admin`)
| Rota | Descrição |
|---|---|
| `/admin/dashboard` | Estatísticas do dia + agendamentos de hoje |
| `/admin/barbeiros` | CRUD de barbeiros e especialidades |
| `/admin/servicos` | CRUD do catálogo de serviços |
| `/admin/clientes` | Lista/busca de clientes, cadastro manual |
| `/admin/agendamentos` | Lista com filtros, troca de status, bloqueio de horários |
| `/admin/relatorios` | Faturamento e ranking por barbeiro/serviço |
| `/admin/configuracoes` | Horários de funcionamento, intervalo entre slots, dados da empresa |

A proteção de `/admin/*` é feita em `AppShell` (redireciona para `/` se `!isAdmin`), não em nível de rota do TanStack Router.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_API_URL` | Sim | Base URL da API REST do back-end (ex.: `http://localhost:3333/api` em dev) |
| `VITE_GOOGLE_CLIENT_ID` | Não | Client ID do Google para login social — hoje **não tem efeito**, pois `loginWithGoogle()` (`services/auth.js`) é um stub |

## Autenticação

JWT (access + refresh), emitido pelo back-end:
- Tokens ficam em `localStorage` (`tokenStore` em `services/api.js`); o access token expirado é renovado automaticamente uma vez por requisição (`rawRequest` tenta refresh em qualquer 401).
- A sessão do usuário (dados exibidos na UI) fica separada, em `localStorage` sob a chave `barbearia_auth_session_v1`, com TTL de 7 dias (`services/auth.js`).
- `isAdmin` é calculado por `role === "admin"` OU e-mail igual a `ADMIN_EMAIL` (`admin@barbearia.com.br`, hardcoded em `services/auth.js` — mantenha em sincronia com o back-end se for alterar).
