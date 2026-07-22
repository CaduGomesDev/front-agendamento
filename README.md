# Central de Agendamento

Sistema web de agendamento para barbearia, com site público, área do cliente e painel administrativo. Projeto acadêmico (TCC), dividido em dois repositórios: **frontend** e **backend**.

> ⚠️ **PREENCHER antes da entrega:** nomes dos integrantes (seção *Integrantes do grupo*) e as URLs públicas de deploy (seção *URLs públicas do deploy*).

## Descrição do problema

O agendamento em barbearias costuma ser feito de forma manual — por telefone, WhatsApp ou caderno de anotações. Esse processo gera problemas recorrentes: horários marcados em duplicidade, dificuldade dos barbeiros em controlar a própria agenda, ausência de histórico dos atendimentos e falta de dados para o dono acompanhar faturamento e desempenho do negócio.

## Descrição da solução

Uma aplicação web que centraliza todo o fluxo de agendamento:

- O **cliente** se cadastra, faz login e agenda online, escolhendo serviço, barbeiro, data e um horário disponível — evitando conflitos de horário.
- A **barbearia** (administrador) gerencia barbeiros, serviços, clientes e agendamentos por um painel, podendo bloquear horários, alterar o status dos atendimentos e acompanhar relatórios de faturamento.
- A **autenticação** com JWT (access + refresh) separa o acesso de clientes e administradores.

O sistema é dividido em um **frontend** (React/TanStack Start) e um **backend** (API REST em Node/Express + MongoDB), que se comunicam apenas via HTTP.

## Integrantes do grupo

> ⚠️ **PREENCHER** com os nomes reais do grupo.

| Nome | RA / Matrícula (se aplicável) |
|---|---|
| _(integrante 1)_ | _(RA)_ |
| _(integrante 2)_ | _(RA)_ |
| _(integrante 3)_ | _(RA)_ |

## Tecnologias utilizadas

**Frontend**
- React 19 + JavaScript (ESM)
- TanStack Start + TanStack Router (roteamento baseado em arquivos, com SSR)
- TanStack Query (React Query)
- Tailwind CSS v4 + shadcn/ui + Radix UI
- React Hook Form + Zod (formulários e validação)
- Vite 7 (bundler) + Nitro (build/deploy)
- date-fns, recharts, lucide-react, sonner

**Backend**
- Node.js + Express 4 (JavaScript, CommonJS)
- MongoDB + Mongoose 8
- JWT (`jsonwebtoken`) — access + refresh token
- bcryptjs (hash de senhas)
- Zod (validação de entrada)
- google-auth-library, cors, morgan, dotenv

## Links dos repositórios

- **Frontend:** https://github.com/CaduGomesDev/frontcentralagendamento
- **Backend:** https://github.com/CaduGomesDev/backcentralagendamento

## URLs públicas do deploy

> ⚠️ **PREENCHER** após publicar (frontend na Vercel, backend no Render).

- **Frontend (Vercel):** `https://<preencher>.vercel.app`
- **Backend (Render):** `https://<preencher>.onrender.com`  ·  health-check: `/api/health`

## Instruções para instalação

Pré-requisitos: **Node.js 22.x** e **npm**. Para o backend, uma instância do **MongoDB** (local ou MongoDB Atlas).

Clone os dois repositórios e instale as dependências de cada um:

```bash
# Frontend
git clone https://github.com/CaduGomesDev/frontcentralagendamento.git
cd frontcentralagendamento
npm install
cp .env.example .env      # ajuste as variáveis (ver abaixo)

# Backend (em outra pasta)
git clone https://github.com/CaduGomesDev/backcentralagendamento.git
cd backcentralagendamento
npm install
cp .env.example .env      # configure MONGODB_URI, segredos JWT etc.
```

## Instruções para execução do backend

Rode o backend **primeiro** (o frontend depende dele):

```bash
cd backcentralagendamento
npm run seed     # (opcional, 1ª vez) cria a conta admin — ATENÇÃO: apaga os dados existentes
npm run dev      # sobe a API em http://localhost:3333 (nodemon)
# ou: npm start  # sem hot-reload
```

- A API sobe em `http://localhost:3333` (porta definida por `PORT`).
- Health-check: `http://localhost:3333/api/health`.
- Sem `MONGODB_URI` válido, o servidor sobe mas **não persiste dados**.

## Instruções para execução do frontend

Com o backend no ar:

```bash
cd frontcentralagendamento
npm run dev      # o Vite mostra a URL no terminal (ex.: http://localhost:3000)
```

Outros comandos: `npm run build` (build de produção), `npm run preview` (pré-visualiza o build), `npm run lint`.

> A variável `VITE_API_URL` do `.env` precisa apontar para a API do backend (por padrão `http://localhost:3333/api`).

## Variáveis de ambiente

**Frontend** (arquivo `.env` na raiz do repositório do front)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_API_URL` | Sim | URL base da API REST do backend (ex.: `http://localhost:3333/api`). Em produção, a URL do Render. |
| `VITE_GOOGLE_CLIENT_ID` | Não | Client ID do Google para login social — hoje sem efeito (recurso é um stub). |

**Backend** (arquivo `.env` na raiz do repositório do back)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NODE_ENV` | Não | `development` \| `production` \| `test` (padrão: `development`). |
| `PORT` | Não | Porta do servidor HTTP (padrão: `3000`; recomendado `3333` em dev). |
| `MONGODB_URI` | Sim (persistência) | String de conexão do MongoDB / Atlas. |
| `JWT_SECRET` | Sim | Segredo do access token. |
| `JWT_REFRESH_SECRET` | Sim | Segredo do refresh token. |
| `JWT_ACCESS_EXPIRES` | Não | Validade do access token (padrão `15m`). |
| `JWT_REFRESH_EXPIRES` | Não | Validade do refresh token (padrão `7d`). |
| `CORS_ORIGIN` | Não | Origens permitidas em produção (a URL do front). `*` libera todas. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Não | Login social com Google (opcional). |
| `ADMIN_EMAIL` | Não | E-mail que recebe papel de admin (padrão `admin@barbearia.com.br`). |

> Nunca commite o arquivo `.env`. Use o `.env.example` de cada repositório como modelo.

## Principais funcionalidades

**Site público**
- Landing page com apresentação, catálogo de serviços (vindo da API) e chamada para agendamento.

**Área do cliente** (requer login)
- Cadastro e login (e-mail/senha).
- Agendamento online (serviço, barbeiro, data e horário disponível).
- "Meus agendamentos": histórico e cancelamento.
- Edição de perfil e troca de senha (quando logado).

**Painel administrativo** (requer papel `admin`)
- Dashboard com estatísticas e agendamentos do dia.
- CRUD de barbeiros e de serviços.
- Gestão de clientes (listar, buscar, cadastrar manualmente).
- Gestão de agendamentos: filtros, troca de status e **bloqueio de horários**.
- Relatórios de faturamento e ranking por barbeiro/serviço.
- Configurações: horários de funcionamento, intervalo entre slots e dados da empresa.

**Transversais**
- Autenticação JWT (access + refresh) com renovação automática do token.

> **Observações (limitações conhecidas):** o login social com Google e a recuperação de senha por e-mail têm as telas no front, mas ainda **não estão implementados de ponta a ponta** — o back-end não faz envio de e-mail, e o Google exige configurar `GOOGLE_CLIENT_ID` (servidor) e o SDK no front. A troca de senha do usuário logado (pelo perfil) funciona normalmente.

## Rotas da API

Base local: `http://localhost:3333` · Prefixo: `/api`
Acesso: 🌐 público · 🔑 autenticado · 👑 admin.

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/health` | 🌐 | Health-check (status do serviço e do banco). |
| POST | `/api/auth/register` | 🌐 | Cadastro de cliente. |
| POST | `/api/auth/login` | 🌐 | Login (e-mail/senha) → tokens JWT. |
| POST | `/api/auth/google` | 🌐 | Login social com Google. |
| POST | `/api/auth/refresh` | 🌐 | Renova o access token. |
| POST | `/api/auth/logout` | 🌐 | Logout. |
| GET | `/api/auth/me` | 🔑 | Dados do usuário logado. |
| GET / PATCH | `/api/users/me` | 🔑 | Ver / atualizar o próprio perfil. |
| PATCH | `/api/users/me/password` | 🔑 | Trocar a própria senha. |
| GET | `/api/clients` · `/api/clients/:id` | 👑 | Listar / detalhar clientes. |
| POST / DELETE | `/api/clients` · `/api/clients/:id` | 👑 | Cadastrar / remover cliente. |
| GET | `/api/barbers` · `/api/barbers/:id` | 🌐 | Listar / detalhar barbeiros. |
| POST / PUT / DELETE | `/api/barbers` · `/api/barbers/:id` | 👑 | CRUD de barbeiros. |
| GET | `/api/services` · `/api/services/:id` | 🌐 | Listar / detalhar serviços. |
| POST / PUT / DELETE | `/api/services` · `/api/services/:id` | 👑 | CRUD de serviços. |
| GET | `/api/appointments/taken` | 🌐 | Horários já ocupados (grade de agendamento). |
| GET | `/api/appointments/blocked` | 🌐 | Horários bloqueados. |
| GET | `/api/appointments/mine` | 🔑 | Agendamentos do cliente logado. |
| POST | `/api/appointments` | 🔑 | Criar agendamento. |
| PATCH | `/api/appointments/:id/cancel` | 🔑 | Cancelar o próprio agendamento. |
| GET | `/api/appointments` | 👑 | Listar todos os agendamentos (com filtros). |
| PATCH | `/api/appointments/:id/status` | 👑 | Alterar status do agendamento. |
| POST / DELETE | `/api/appointments/blocked[/:id]` | 👑 | Bloquear / desbloquear horários. |
| GET | `/api/settings` · `/api/company` | 🌐 | Configurações e dados da empresa. |
| PUT | `/api/settings` · `/api/company` | 👑 | Atualizar configurações / empresa. |

## Credenciais de teste

Após rodar `npm run seed` no backend, é criada a conta administradora:

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@barbearia.com.br` | `espezim123` |

Para criar/atualizar um admin **sem apagar os dados**, use `npm run create-admin` (padrão: `admin@barbearia.com.br` / `admin123`, personalizável por variáveis de ambiente). Contas de **cliente** podem ser criadas normalmente pela tela de cadastro.

## Deploy

Arquitetura de produção: **frontend na Vercel** + **backend (API) no Render**.

1. **Backend (Render):** Web Service apontando para o repo do back · Build `npm install` · Start `npm start` · Health check `/api/health` · variáveis: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET` e `CORS_ORIGIN` (a URL do front).
2. **Frontend (Vercel):** importe o repo do front (detecção automática de TanStack Start via `vercel.json`) · variável `VITE_API_URL` = `https://SEU-BACK.onrender.com/api`.
3. Ajuste o `CORS_ORIGIN` no Render para a URL da Vercel e refaça o deploy do backend.
