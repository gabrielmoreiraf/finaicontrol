# FinIA Control — Documento de Objetivos e Requisitos

> Documento de **produto** (objetivos, público, escopo e requisitos funcionais e
> não-funcionais), atualizado para o estado atual do sistema. Complementa o
> `FINIA_CONTROL_CONTEXT.md` (visão/diretrizes) e o `ESTADO_ATUAL.md` (estado técnico).
> **Última atualização:** junho/2026.

---

## 1. Visão do produto

O **FinIA Control** é uma plataforma web responsiva (desktop, tablet e mobile) de
**controle financeiro pessoal com inteligência artificial**. Vai além de anotar gastos:
funciona como um **assistente financeiro** que organiza a vida financeira do usuário,
projeta o futuro e ajuda a tomar decisões com base em **dados reais**.

> **Escopo definitivo:** apenas **pessoa física** (finanças pessoais ou familiares).
> Sem modo empresarial/PJ. Todo usuário é tratado como `mode: personal`.

---

## 2. Objetivos

| # | Objetivo |
|---|----------|
| O1 | Centralizar receitas, despesas, dívidas e metas em um só lugar |
| O2 | Tratar rendas **fixas, variáveis, extras e temporárias** (com data de início/fim) |
| O3 | Projetar o futuro financeiro respeitando o que **começa e termina** ao longo do tempo |
| O4 | Emitir **alertas** (ex.: renda temporária acabando, saldo negativo previsto) |
| O5 | Oferecer análises por **IA baseada apenas nos dados do usuário** (nunca inventar valores) |
| O6 | Entregar uma experiência **clara, premium e responsiva** em qualquer dispositivo |
| O7 | Operar com **segurança e isolamento** dos dados de cada usuário |

---

## 3. Público-alvo

| Persona | Necessidade | Como o produto atende |
|---------|-------------|------------------------|
| **Pessoa física organizada** | Clareza sobre para onde o dinheiro vai | Receitas/Despesas/Dashboard com projeção |
| **Renda mista** (salário + variável/extra) | Planejar com entradas irregulares | Tipos de renda + rendas temporárias com fim |
| **Quem quer quitar dívidas** | Priorizar e acompanhar quitação | Módulo Dívidas + projeção de saldo |
| **Quem busca metas** | Definir objetivos e medir progresso | Módulo Metas (com conclusão) |
| **Quem quer ir além de planilhas** | Análises e previsões automáticas | Assistente IA + alertas (planos pagos) |

---

## 4. Escopo

| Está no escopo | Fora do escopo |
|----------------|----------------|
| Finanças de pessoa física / núcleo familiar | Contabilidade ou fluxo de caixa empresarial |
| Receitas, despesas, dívidas, metas | CNPJ, nota fiscal, centro de custo |
| Empréstimos a pessoas (**Emprestei**, liberado caso a caso) | Modo empresa / múltiplos perfis no cadastro |
| Análises e alertas com IA (planos pagos) | Corretagem/execução de investimentos |
| Web responsiva (desktop/tablet/mobile) | App nativo (iOS/Android) — fase futura |

---

## 5. Diferenciais

1. **Assistente, não só registro:** interpreta dados, gera diagnósticos e alertas.
2. **Rendas variáveis e temporárias com prazo:** entram nas projeções só enquanto válidas e
   avisam quando estão perto de acabar.
3. **IA ancorada em dados reais:** nunca inventa números; se faltam dados, diz claramente.
4. **Projeção realista:** considera o que termina (rendas temporárias, parcelas, dívidas quitadas).
5. **Foco em pessoa física:** experiência enxuta, sem complexidade empresarial.

---

## 6. Requisitos funcionais (RF)

Status: ✅ implementado · 🔜 planejado.

### 6.1 Conta e acesso
| ID | Requisito | Status |
|----|-----------|--------|
| RF-01 | Cadastro com nome, e-mail e senha | ✅ |
| RF-02 | Verificação de e-mail (link com validade de 24h, com reenvio) | ✅ |
| RF-03 | Login com e-mail e senha | ✅ |
| RF-04 | **Recuperação de senha** (link por e-mail, validade 1h, uso único) | ✅ |
| RF-05 | Troca de senha autenticada (encerra as demais sessões) | ✅ |
| RF-06 | Logout | ✅ |
| RF-07 | Onboarding curto (profissão + renda fixa) em 1 tela | ✅ |

### 6.2 Núcleo financeiro
| ID | Requisito | Status |
|----|-----------|--------|
| RF-10 | CRUD de **Receitas** (fixa/variável/extra/temporária; dia do mês; data de fim) | ✅ |
| RF-11 | CRUD de **Despesas** (fixa/variável/parcelada; categoria; vencimento) | ✅ |
| RF-12 | CRUD de **Dívidas** (saldo, parcela mensal, priorização) | ✅ |
| RF-13 | CRUD de **Metas** (alvo, atual) + **concluir/reabrir** ao atingir 100% | ✅ |
| RF-14 | Listagens em **tabela paginada** com criar/editar/excluir por modal | ✅ |
| RF-15 | Categorias de despesa | ✅ (campo + padrão) |
| RF-16 | **Contas fixas com repetição automática** mensal | 🔜 |
| RF-17 | **Parcelamento**: geração de parcelas com status (pendente/paga/vencida) | 🔜 (modelo parcial) |

### 6.3 Dashboard e análises
| ID | Requisito | Status |
|----|-----------|--------|
| RF-20 | Visão geral: receitas, despesas, saldo, metas | ✅ |
| RF-21 | Próximos vencimentos e próximos recebimentos | ✅ |
| RF-22 | **Projeção de saldo** (6 meses) considerando o que termina | ✅ |
| RF-23 | Alertas inteligentes e índice de saúde financeira | ✅ |
| RF-24 | Relatórios visuais e exportação | 🔜 placeholder |
| RF-25 | Investimentos (acompanhamento) | 🔜 placeholder |

### 6.4 Assistente de IA
| ID | Requisito | Status |
|----|-----------|--------|
| RF-30 | Chat de IA respondendo com base nos dados do usuário | 🔜 placeholder |
| RF-31 | Diagnósticos, sugestões de economia, plano de quitação, simulação de compra | 🔜 |
| RF-32 | IA **nunca** inventa valores; sinaliza falta de dados | ✅ (regra firmada) |

### 6.5 Emprestei (acesso controlado)
| ID | Requisito | Status |
|----|-----------|--------|
| RF-40 | Registrar empréstimos a pessoas (juros, parcelas, pagamentos recebidos) | ✅ |
| RF-41 | Módulo **oculto por padrão**; liberado **por usuário** pelo admin (entitlement) | ✅ |
| RF-42 | Sem limite de pessoas; rota bloqueada e ausente do menu sem liberação | ✅ |

### 6.6 Configurações e Admin
| ID | Requisito | Status |
|----|-----------|--------|
| RF-50 | Editar perfil (nome, profissão, renda fixa) e avatar | ✅ |
| RF-51 | Painel admin: listar clientes, métricas, gerir plano/role | ✅ |
| RF-52 | Admin libera/revoga o módulo Emprestei por usuário | ✅ |

### 6.7 Site público
| ID | Requisito | Status |
|----|-----------|--------|
| RF-60 | Landing de conversão (tema escuro fixo), enxuta | ✅ |
| RF-61 | Página de planos | ✅ |

---

## 7. Requisitos não-funcionais (RNF)

| ID | Categoria | Requisito |
|----|-----------|-----------|
| RNF-01 | **Segurança** | Senhas com scrypt; sessão em cookie httpOnly assinado (HMAC) com prefixo `__Host-` em produção |
| RNF-02 | **Segurança** | Isolamento total de dados por usuário em toda leitura/escrita |
| RNF-03 | **Segurança** | Rate-limit em login, cadastro, reenvio e recuperação de senha |
| RNF-04 | **Segurança** | Gating de planos **no servidor** (conteúdo bloqueado não é enviado ao cliente) |
| RNF-05 | **Privacidade** | Anti-enumeração de contas no fluxo de recuperação; avatares exigem sessão |
| RNF-06 | **Performance** | Paginação server-side e agregados em SQL; índices por `user_id` |
| RNF-07 | **Responsividade** | Layout adaptado a mobile, tablet, notebook e monitores grandes |
| RNF-08 | **UX/Consistência** | Scroll padronizado em todo o sistema; modais com scroll interno |
| RNF-09 | **Acessibilidade** | Suporte a `prefers-reduced-motion`, `role="alert"` em erros, navegação por teclado nas tabelas |
| RNF-10 | **Resiliência** | Telas de erro/carregamento/404 em todas as rotas |
| RNF-11 | **Disponibilidade** | Deploy gerenciado (Vercel) + Postgres gerenciado (Neon) |
| RNF-12 | **Manutenibilidade** | TypeScript fim-a-fim; schema versionado com migrações Drizzle |
| RNF-13 | **Ambientes** | Separação **produção** (`finiacontrol.com.br`) e **teste** (`finaicontrol.vercel.app`) |

---

## 8. Regras de negócio (RN)

| ID | Regra |
|----|-------|
| RN-01 | Cada usuário acessa **somente** seus próprios dados |
| RN-02 | Rendas temporárias só entram nas projeções **dentro do período válido** |
| RN-03 | O sistema alerta quando uma renda temporária está perto do fim |
| RN-04 | A IA deriva análises **exclusivamente** dos dados cadastrados; simulações são explicitamente projeções |
| RN-05 | "Dia do mês" deve estar entre **1 e 31** (validado no front e no servidor) |
| RN-06 | Meta: valor alvo **>= valor atual** e **> 0**; **nome único** por usuário |
| RN-07 | Meta só pode ser **concluída** ao atingir 100% (atual >= alvo) |
| RN-08 | **Emprestei** é liberado individualmente pelo admin (entitlement), não por plano |
| RN-09 | Admin tem acesso premium efetivo (por papel), contabilizado como "Equipe" nas métricas |
| RN-10 | Projeção de saldo desconsidera rendas/parcelas/dívidas já encerradas no mês projetado |

---

## 9. Planos e monetização

Três planos (`free < plus < premium`). Gating verificado no servidor.

| Recurso | Gratuito | Plus | Premium IA |
|---------|:--------:|:----:|:----------:|
| Dashboard básico, Receitas, Despesas | ✅ | ✅ | ✅ |
| Metas, Dívidas, Investimentos, Relatórios | — | ✅ | ✅ |
| Projeções e próximos vencimentos | — | ✅ | ✅ |
| Assistente IA e alertas inteligentes | — | — | ✅ |
| **Emprestei** | Entitlement (liberado pelo admin, independe do plano) | | |
| Limite de lançamentos/mês (Gratuito) | 5 | ilimitado | ilimitado |

> Cobrança/assinatura recorrente (Stripe) é **fase futura**.

---

## 10. Premissas e restrições

- **Plataforma:** web responsiva; sem app nativo nesta fase.
- **Banco:** Postgres único gerenciado (Neon). Banco separado para staging é recomendado (pendente).
- **E-mail:** envio via Resend (verificação e recuperação de senha).
- **IA:** módulo de IA ainda é placeholder; a regra "não inventar dados" já está firmada para a implementação.
- **Idioma:** português (pt-BR).

---

## 11. Fase atual e roadmap

| Item | Status |
|------|--------|
| Autenticação, recuperação de senha, onboarding | ✅ |
| Dashboard, Receitas, Despesas, Dívidas, Metas (tabelas paginadas) | ✅ |
| Emprestei como entitlement do admin | ✅ |
| Segurança (rate-limit, sessão assinada, gating server-side) | ✅ |
| Responsividade e padronização de scroll | ✅ |
| Assistente IA com dados reais | 🔜 |
| Contas fixas recorrentes, parcelamento completo, relatórios | 🔜 |
| Planos/assinatura (Stripe), banco de staging isolado | 🔜 |
| App mobile nativo | 🔜 (avaliar) |

---

### Diretrizes para novas funcionalidades
1. Consultar este documento + `FINIA_CONTROL_CONTEXT.md` para alinhar visão e regras.
2. Usar a stack atual: Server Actions (escrita), Server Components (leitura), Drizzle (banco),
   `getCurrentUser()` (autorização).
3. Respeitar as regras de negócio — especialmente **isolamento de dados** e **IA só com dados reais**.
4. Manter identidade visual, responsividade e padrões de scroll/a11y.
5. Após mudança de schema: `npm run db:generate` e aplicar a migração no Neon.
