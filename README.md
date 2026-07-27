# Central de Agendamento

TCC desenvolvido por Carlos Gomes, Wesley Lima e Dion Rai.

O projeto é um sistema de agendamento online para barbearias. A ideia surgiu de um problema bem comum: a marcação de horário em barbearias costuma ser feita por telefone, WhatsApp ou caderno, o que gera horários duplicados, dificuldade dos barbeiros em controlar a própria agenda e nenhum histórico ou relatório pro dono acompanhar o negócio.

A aplicação resolve isso centralizando tudo: o cliente se cadastra e agenda online escolhendo serviço, barbeiro e data, e a barbearia gerencia barbeiros, serviços, clientes e agendamentos por um painel administrativo.

O sistema está dividido em dois repositórios, que só funcionam em conjunto:

- **Frontend** (este repositório): https://github.com/CaduGomesDev/frontcentralagendamento
- **Backend**: https://github.com/CaduGomesDev/backcentralagendamento

## Tecnologias

Este repositório (frontend) usa React 19 com TanStack Start e TanStack Router (rotas por arquivo, com SSR) e TanStack Query para os dados vindos da API. A interface é montada com Tailwind CSS v4, shadcn/ui e Radix UI, os formulários usam React Hook Form + Zod, e o bundler é o Vite. Também aparecem date-fns, recharts (gráficos do painel), lucide-react (ícones) e sonner (toasts).

O backend (outro repositório) é uma API em Node/Express com MongoDB via Mongoose, autenticação por JWT (access + refresh token) e Zod para validar as entradas.

## Variáveis de ambiente

- `VITE_API_URL` — obrigatória, URL da API do backend.
- `VITE_GOOGLE_CLIENT_ID` — opcional, só necessária se quiser testar o login com Google. Precisa ser o mesmo Client ID configurado no backend (`GOOGLE_CLIENT_ID`), e o domínio usado (produção ou `localhost`) precisa estar nas "Authorized JavaScript origins" do OAuth Client no Google Cloud.

Nunca commitar o `.env` — o `.env.example` serve de modelo.

## Funcionalidades

**Site público** — landing page com apresentação da barbearia e catálogo de serviços vindo da API.

**Área do cliente** (login necessário) — cadastro e login (e-mail/senha ou Google), agendamento online escolhendo serviço, barbeiro e data (o calendário já bloqueia os dias em que a barbearia não funciona, e o horário exato fica combinado depois), histórico de agendamentos com opção de cancelar, edição de perfil e troca de senha, recuperação de senha por token.

**Painel administrativo** (perfil admin) — dashboard com estatísticas e agendamentos do dia, CRUD de barbeiros e serviços, gestão de clientes, gestão de agendamentos com filtros, troca de status, bloqueio de horários e exclusão definitiva, cadastro manual de cliente direto na agenda (para atendimentos combinados por fora), relatórios de faturamento por barbeiro/serviço e configurações gerais da empresa (dias de funcionamento, intervalo entre agendamentos).

Uma coisa que ficou incompleta de propósito, vale registrar: a recuperação de senha funciona, mas como o projeto não tem servidor de e-mail, o token de redefinição é gerado pelo próprio sistema e leva direto para a tela de nova senha — em produção esse token seria enviado por e-mail.

## Deploy

Frontend na Vercel, backend no Render. O `vercel.json` já configura o build do TanStack Start — basta importar o repositório e definir `VITE_API_URL` apontando para a URL do backend no Render.
