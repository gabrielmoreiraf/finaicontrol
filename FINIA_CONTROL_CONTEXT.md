# FinIA Control | Documentação Principal do Projeto

> **Arquivo de referência obrigatória.** Consulte este documento antes de implementar qualquer funcionalidade, tela ou regra de negócio. Ele define o propósito, escopo, diferenciais e diretrizes do FinIA Control.

---

## Índice

1. [Visão do Produto](#1-visão-do-produto)
2. [Público-Alvo](#2-público-alvo)
3. [Objetivo do Sistema](#3-objetivo-do-sistema)
4. [Diferenciais](#4-diferenciais)
5. [Escopo: pessoa física](#5-escopo-pessoa-física)
6. [Onboarding Financeiro](#6-onboarding-financeiro)
7. [Módulos do Sistema](#7-módulos-do-sistema)
8. [Assistente de IA](#8-assistente-de-ia)
9. [Regras de Negócio](#9-regras-de-negócio)
10. [Stack Tecnológica](#10-stack-tecnológica)
11. [Identidade Visual](#11-identidade-visual)
12. [Tom de Comunicação](#12-tom-de-comunicação)
13. [Fase Atual do Projeto](#13-fase-atual-do-projeto)

---

## 1. Visão do Produto

**FinIA Control** é uma plataforma web responsiva (desktop e mobile) para controle financeiro de **pessoa física** com inteligência artificial.

> **Escopo atual (definitivo):** apenas **pessoa física**, finanças pessoais ou familiares. Não há modo empresarial, PJ nem gestão para negócios. O cadastro não pergunta “tipo de conta”; todo usuário é tratado como pessoa física (`mode: personal` no banco).

O sistema vai além de anotar gastos: funciona como um **assistente financeiro inteligente** que ajuda o usuário a entender sua vida financeira, prever problemas e tomar melhores decisões com base em dados reais.

**Proposta de valor:**

- Organizar receitas, despesas, contas fixas, parceladas, dívidas e metas.
- Projetar o futuro financeiro com rendas temporárias e variáveis.
- Oferecer análises, alertas e recomendações via IA.

---

## 2. Público-Alvo

| Segmento | Necessidade |
|----------|-------------|
| **Pessoas físicas** | Organizar vida financeira, controlar gastos, quitar dívidas, atingir metas |
| **Usuários com renda mista** | Quem tem salário fixo + renda variável ou extra com prazo definido |
| **Quem busca clareza financeira** | Usuários que querem ir além de planilhas e apps básicos de controle |

---

## 3. Objetivo do Sistema

Ajudar usuários a:

- Organizar a vida financeira de forma clara e centralizada.
- Controlar **receitas**, **despesas**, **contas fixas**, **contas parceladas**, **dívidas** e **metas financeiras**.
- Receber **análises inteligentes com IA** baseadas nos dados reais cadastrados.
- Antecipar problemas financeiros e simular impactos de decisões futuras.
- Tomar decisões mais conscientes sobre gastos, economia e quitação de dívidas.

---

## 4. Diferenciais

### 4.1 Assistente financeiro, não apenas controle de gastos

O FinIA Control não se limita a registrar entradas e saídas. Ele interpreta os dados, gera diagnósticos, alertas e planos de ação.

### 4.2 Rendas variáveis e extras com prazo

Diferencial central: controle de rendas que não são fixas e têm data de término.

**Exemplo de cadastro:**

> "Recebo R$ 500,00 todo dia 10 até dezembro."

**Comportamento esperado:**

- A renda entra nas **projeções futuras** até a data de fim.
- O sistema **avisa quando a renda estiver perto de acabar**.
- A IA pode responder perguntas como: *"O que acontece quando minha renda extra acabar?"*

### 4.3 IA baseada em dados reais

A IA analisa **somente** os dados disponíveis do usuário. **Nunca inventa valores ou informações financeiras.**

### 4.4 Foco em finanças pessoais

O produto é dedicado ao controle financeiro pessoal, com uma experiência enxuta e sem a complexidade de gestão empresarial.

---

## 5. Escopo: pessoa física

| O que é | O que não é |
|---------|-------------|
| Controle de renda e gastos de **pessoa física** | Contabilidade ou fluxo de caixa empresarial |
| Finanças individuais ou do núcleo familiar | Múltiplos modos (pessoal vs. empresa) no cadastro |
| Um único perfil por usuário no banco (`personal`) | CNPJ, nota fiscal, centro de custo, etc. |

**Decisão de produto:** o antigo fluxo com escolha de “modo de uso” e wizard longo no início foi **descontinuado**. A experiência atual é enxuta: cadastro → onboarding curto → app.

---

## 6. Onboarding Financeiro

Fluxo **obrigatório** após o cadastro, em **uma única tela** (não é mais um wizard de vários passos).

### O que mudou em relação ao desenho anterior

| Antes (descontinuado) | Agora (implementado) |
|----------------------|----------------------|
| Wizard com ~6 passos (modo, rendas, categorias, contas fixas, dívidas, metas) | **1 formulário** em `/onboarding` |
| Escolha entre uso pessoal e empresarial | **Somente pessoa física**; sem etapa de “modo” |
| Coleta pesada antes de entrar no app | Só o essencial; o restante nos módulos do app |

### Dados coletados hoje no onboarding

| Campo | Obrigatório | Onde fica no banco |
|-------|-------------|-------------------|
| Profissão / atividade | Não | `profiles.profession` |
| Renda fixa mensal | Não | `profiles.fixed_monthly_income` |

Ao enviar o formulário, o sistema marca `users.onboarding_complete = true` e redireciona para `/dashboard`.

### O que o usuário cadastra depois (nos módulos)

Receitas (incl. variáveis/temporárias), despesas e categorias, dívidas e metas são cadastrados em **Receitas**, **Despesas**, **Dívidas** e **Metas**, não no onboarding inicial.

### Evolução futura (opcional)

Se for necessário enriquecer o primeiro acesso, preferir **passos opcionais** ou checklist no dashboard em vez de bloquear o usuário com um wizard longo. Não reintroduzir modo empresarial sem redefinir escopo do produto.

---

## 7. Módulos do Sistema

| Módulo | Responsabilidade | Status |
|--------|------------------|--------|
| **Autenticação** | Cadastro, login, sessão (e-mail + senha) | ✅ Implementado |
| **Onboarding financeiro** | Uma tela: profissão + renda fixa (sem wizard multi-step) | ✅ `/onboarding` |
| **Dashboard** | Visão geral, saldo, alertas e indicadores | ✅ Dados reais (Neon) |
| **Receitas** | Cadastro e gestão de fontes de renda | ✅ CRUD completo |
| **Despesas** | Registro e acompanhamento de gastos | ✅ CRUD completo |
| **Categorias** | Organização de despesas | 🔜 Campo texto; tabela `expense_categories` sem UI dedicada |
| **Contas fixas** | Despesas mensais recorrentes automáticas | 🔜 Via despesas tipo `fixed`; repetição automática mensal pendente |
| **Contas parceladas** | Geração e acompanhamento de parcelas | 🔜 Fase futura |
| **Dívidas** | Controle de obrigações e planos de quitação | ✅ CRUD completo |
| **Emprestei** | Empréstimos a pessoas, juros, parcelas e pagamentos recebidos | ✅ `/emprestei` |
| **Metas financeiras** | Objetivos e progresso | ✅ CRUD completo |
| **Relatórios** | Análises visuais e exportação | 🔜 Fase futura |
| **Assistente IA** | Chat, diagnósticos e recomendações | 🔜 Placeholder em `/ia` |
| **Configurações** | Perfil e logout | ✅ Implementado |
| **Planos e assinatura** | Monetização e limites por plano | 🔜 Fase futura |

---

## 8. Assistente de IA

### 8.1 Princípio fundamental

> **A IA nunca deve inventar dados financeiros.** Ela analisa somente os dados disponíveis do usuário.

Se não houver dados suficientes, a IA deve informar isso claramente. Nunca preencher lacunas com valores fictícios.

### 8.2 Perguntas que a IA deve responder

- Quanto gastei este mês?
- Onde estou gastando mais?
- Como posso economizar?
- Qual dívida devo pagar primeiro?
- Posso fazer uma compra de R$ 1.000 este mês?
- Quanto consigo guardar por mês?
- O que acontece quando minha renda extra acabar?

### 8.3 Análises e entregáveis gerados pela IA

- Diagnóstico financeiro
- Alertas de gastos
- Sugestões de economia
- Plano para quitar dívidas
- Projeção de saldo futuro
- Análise de categorias
- Simulação de compras futuras

---

## 9. Regras de Negócio

### 9.1 Isolamento de dados

- Cada usuário **só pode acessar seus próprios dados**.

### 9.2 Tipos de receita

Receitas podem ser:

- Fixas
- Variáveis
- Extras
- Temporárias
- Recorrentes
- Com **data de início**
- Com **data de fim**

### 9.3 Tipos de despesa

Despesas podem ser:

- Fixas
- Variáveis
- Parceladas
- Recorrentes
- Pendentes
- Pagas
- Vencidas

### 9.4 Contas fixas

- Devem **se repetir automaticamente** nos próximos meses.
- Representam compromissos financeiros recorrentes conhecidos (ex.: aluguel, internet, assinaturas).

### 9.5 Contas parceladas

- Devem **gerar parcelas mensais** até o fim do parcelamento.
- Cada parcela deve refletir valor, vencimento e status (pendente, paga, vencida).

### 9.6 Projeções com rendas temporárias

- Rendas com data de fim devem aparecer nas projeções **apenas dentro do período válido**.
- O sistema deve emitir **alertas** quando a renda temporária estiver próxima do encerramento.

### 9.7 IA e integridade dos dados

- Respostas e análises devem citar ou derivar exclusivamente dos dados cadastrados.
- Simulações devem deixar explícito que são projeções baseadas nos dados informados.

---

## 10. Stack Tecnológica

O FinIA Control usa uma arquitetura **full-stack em Next.js**: interface, regras de negócio, autenticação e persistência no mesmo projeto, com Postgres gerenciado na nuvem. Não há API Django separada.

```text
Browser → Next.js (App Router + Server Actions) → Neon Postgres
                ↑
           src/proxy.ts (proteção de rotas)
```

### 10.1 Aplicação (Next.js)

| Tecnologia | Uso |
|------------|-----|
| **Next.js 16** | App Router, Server Components, Server Actions, `proxy.ts` |
| **React 19** | Interface de usuário |
| **TypeScript** | Tipagem estática |
| **Tailwind CSS** | Estilização utilitária |
| **Shadcn UI** | Componentes de interface |
| **Framer Motion** | Animações |
| **Lucide React** | Ícones |
| **Recharts** | Gráficos e visualizações |

### 10.2 Dados e persistência

| Tecnologia | Uso |
|------------|-----|
| **Neon** | Postgres gerenciado (projeto `finia-control`, região `aws-sa-east-1`) |
| **PostgreSQL 17** | Banco relacional |
| **Drizzle ORM** | Schema, queries e migrações (`src/lib/db/schema.ts`) |
| **@neondatabase/serverless** | Driver HTTP para ambiente serverless |
| **drizzle-kit** | Geração e aplicação de migrações (`drizzle/`) |

**Tabelas principais:** `users`, `sessions`, `profiles`, `incomes`, `expenses`, `expense_categories`, `debts`, `loans`, `loan_payments`, `goals`.

### 10.3 Autenticação e segurança

| Tecnologia | Uso |
|------------|-----|
| **scrypt** (`node:crypto`) | Hash de senha (`src/lib/auth/password.ts`) |
| **Cookie httpOnly** | Sessão `finia_session`, `sameSite=lax` |
| **Tabela `sessions`** | Token opaco com `expires_at` |
| **Server Actions** | `signUpAction`, `signInAction`, `signOutAction` |
| **`src/proxy.ts`** | Redireciona rotas protegidas sem sessão (convenção Next.js 16; antes `middleware.ts`) |

Cada Server Action valida o usuário via `getCurrentUser()`. Não depender só do proxy para autorização.

### 10.4 Estrutura de código relevante

| Caminho | Responsabilidade |
|---------|------------------|
| `src/lib/db/client.ts` | Conexão Drizzle + Neon |
| `src/lib/db/schema.ts` | Definição das tabelas |
| `src/lib/auth/session.ts` | Criar, ler e destruir sessão |
| `src/lib/actions/*.ts` | Mutations (auth, CRUDs, onboarding, perfil) |
| `src/lib/dashboard.ts` | Agregação de dados para o dashboard |
| `src/components/app/resource-manager.tsx` | UI reutilizável dos CRUDs |
| `drizzle.config.ts` | Configuração do Drizzle Kit |

### 10.5 Variáveis de ambiente

Copie `.env.example` para `.env.local`:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string do Neon (preferir endpoint `-pooler`) |
| `SESSION_SECRET` | Segredo forte para sessões (produção: valor aleatório único) |

### 10.6 Scripts npm

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento (porta 3000) |
| `npm run build` | Build de produção |
| `npm run db:generate` | Gera migrações a partir do schema |
| `npm run db:migrate` | Aplica migrações |
| `npm run db:studio` | UI do Drizzle Studio |

### 10.7 Deploy

| Plataforma | Uso |
|------------|-----|
| **Vercel** | Deploy recomendado do Next.js |
| **Neon** | Banco em produção (mesmo projeto ou branch de produção) |

Configurar `DATABASE_URL` e `SESSION_SECRET` no painel da Vercel.

### 10.8 Decisão arquitetural (Next.js vs Django)

O roadmap original previa **Django + Django REST Framework + JWT** em fase posterior. A implementação atual consolidou o back-end no **próprio Next.js** porque:

- Um único deploy e uma única linguagem (TypeScript) para UI e servidor.
- Neon Postgres já disponível; Drizzle alinha tipos entre app e banco.
- Server Actions cobrem cadastro, login, CRUDs e dashboard sem API REST separada.

Um back-end Django continua possível no futuro se houver necessidade de API compartilhada com outros clientes (app mobile, integrações pesadas). Nesse caso o Next passaria a consumir a API externa.

### 10.9 Ordem de implementação (atualizada)

1. ✅ Landing page e identidade visual
2. ✅ Autenticação real + persistência Neon
3. ✅ Onboarding, dashboard e CRUDs (receitas, despesas, dívidas, metas)
4. 🔜 Assistente de IA com dados reais
5. 🔜 Recuperação de senha, contas parceladas, relatórios, planos

---

## 11. Identidade Visual

### 11.1 Referência

Inspiração visual: **[Meu Planner Financeiro](https://meuplannerfinanceiro.com.br/)**, sem cópia direta.

### 11.2 Características desejadas

- Layout limpo e premium
- Tom financeiro profissional
- Seções bem organizadas
- Uso de cards
- Destaques visuais estratégicos
- Botões fortes e chamadas claras
- Foco em conversão
- Design moderno e responsivo

### 11.3 Paleta e estilo

| Elemento | Diretriz |
|----------|----------|
| **Fundo** | Tons bege, branco ou gelo (claro) |
| **Cor principal** | Verde financeiro **ou** laranja moderno |
| **Textos** | Preto / cinza escuro |
| **Cards** | Bordas suaves, cantos arredondados, sombras leves |
| **Componentes** | Elementos arredondados, hierarquia visual clara |

### 11.4 Landing page

A landing page deve ser:

- Moderna, premium, limpa e responsiva
- Focada em desktop e mobile
- Orientada à conversão (cadastro / trial)
- Comunicando transformação financeira, não apenas lista de features

---

## 12. Tom de Comunicação

### 12.1 Princípios

- Clara, humana e comercial
- Foco em **transformação financeira**, não em funcionalidades isoladas
- Linguagem acessível, sem jargão excessivo
- Empoderamento: o usuário entende e decide melhor

### 12.2 Frases de referência

- *"Pare de apenas anotar gastos. Comece a entender seu dinheiro."*
- *"O FinIA Control mostra para onde seu dinheiro foi e te ajuda a planejar para onde ele deve ir."*
- *"Organize sua renda fixa, variável e extra com previsões inteligentes."*
- *"Saiba o impacto de uma compra antes de fazer."*
- *"Tenha uma IA financeira olhando seus números todos os dias."*

### 12.3 O que evitar

- Tom técnico demais na landing e no produto
- Promessas sem base nos dados do usuário
- Linguagem que reduza o produto a "mais um app de gastos"

---

## 13. Fase Atual do Projeto

| Item | Status |
|------|--------|
| Documentação principal (`FINIA_CONTROL_CONTEXT.md`) | ✅ Atualizada (stack Neon + Next.js) |
| Landing page | ✅ Concluída |
| Cadastro / login (e-mail + senha, Neon) | ✅ `/cadastro`, `/login` |
| Onboarding (1 tela, só PF) | ✅ `/onboarding`, sem wizard de 6 passos nem modo empresa |
| App shell + proteção de rotas | ✅ `src/proxy.ts` + layout server-side |
| Dashboard com dados reais | ✅ `/dashboard` |
| CRUD Receitas, Despesas, Dívidas, Metas | ✅ Server Actions + `ResourceManager` |
| Módulo Emprestei (`/emprestei`) | ✅ Empréstimos, juros, parcelas e pagamentos |
| Configurações (perfil + logout) | ✅ `/configuracoes` |
| Assistente IA (`/ia`) | 🔜 Placeholder |
| Recuperação de senha / verificação de e-mail | 🔜 Fase futura |
| Contas parceladas, relatórios, planos | 🔜 Fase futura |
| Deploy produção (Vercel + env) | 🔜 Configurar quando publicar |

### Diretriz para novas funcionalidades

Ao solicitar novas features:

1. Consultar este arquivo para alinhar com visão, regras e diferenciais.
2. Usar a stack atual: **Server Actions** para mutations, **Server Components** para leitura, **Drizzle** para banco, **`getCurrentUser()`** para autorização.
3. Manter identidade visual e tom de comunicação consistentes.
4. Garantir que regras de negócio (especialmente IA e isolamento de dados) sejam respeitadas.
5. Após mudanças no schema, rodar `npm run db:generate` e aplicar migração no Neon.

---

*Última atualização: junho/2026. Stack full-stack Next.js 16 + Neon Postgres + Drizzle.*
