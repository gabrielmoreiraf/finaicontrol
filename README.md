# FinIA Control

Plataforma web de controle financeiro para **pessoa física**, com inteligência artificial.

- **Escopo:** apenas finanças pessoais/familiares, sem modo empresarial ou PJ.
- **Onboarding:** uma tela após o cadastro (profissão e renda fixa opcionais); receitas, despesas, dívidas e metas entram nos módulos do app.

Documentação de produto e regras de negócio: [`FINIA_CONTROL_CONTEXT.md`](./FINIA_CONTROL_CONTEXT.md).

## Stack

| Camada | Tecnologias |
|--------|-------------|
| **App** | Next.js 16, React 19, TypeScript, Tailwind, Shadcn UI |
| **Servidor** | Server Components, Server Actions (`"use server"`), `src/proxy.ts` |
| **Banco** | Neon Postgres 17, Drizzle ORM, `@neondatabase/serverless` |
| **Auth** | E-mail + senha (scrypt), sessão em cookie httpOnly + tabela `sessions` |
| **Deploy** | Vercel (recomendado) |

Não há back-end Django separado. Persistência e regras rodam no próprio Next.js.

## Pré-requisitos

- Node.js 20+
- Conta [Neon](https://neon.tech) com projeto Postgres (ex.: `finia-control`)

## Configuração local

```bash
npm install
cp .env.example .env.local
# Edite .env.local com DATABASE_URL e SESSION_SECRET
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

> Reinicie o `npm run dev` após criar ou alterar `.env.local`.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run db:generate` | Gera migrações Drizzle |
| `npm run db:migrate` | Aplica migrações |
| `npm run db:studio` | Drizzle Studio |

## Estrutura principal

```text
src/
  app/              # Rotas (landing, auth, app autenticado)
  components/       # UI (landing, app, auth)
  lib/
    db/             # client.ts, schema.ts
    auth/           # password.ts, session.ts
    actions/        # Server Actions (auth, CRUDs, onboarding)
    dashboard.ts    # Agregação do dashboard
  proxy.ts          # Proteção de rotas (Next.js 16)
drizzle/            # Migrações SQL
```

## Rotas do app autenticado

| Rota | Descrição |
|------|-----------|
| `/dashboard` | Visão geral |
| `/receitas` | CRUD de receitas |
| `/despesas` | CRUD de despesas |
| `/dividas` | CRUD de dívidas |
| `/metas` | CRUD de metas |
| `/configuracoes` | Perfil e logout |
| `/ia` | Assistente IA (placeholder) |

## Variáveis de ambiente

Veja [`.env.example`](./.env.example).
