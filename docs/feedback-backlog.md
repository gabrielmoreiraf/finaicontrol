# Backlog de feedback (bugs + melhorias)

Itens reportados pelo usuário para corrigir/implementar em lote. Status: ⬜ pendente · ✅ feito.

---

# 🗺️ ROADMAP CONSOLIDADO POR CRITICIDADE
> Junta o feedback do usuário [U] + a auditoria de QA [QA]. Ordem sugerida de execução nos blocos no fim.

## 🔴 CRÍTICO (quebra / trava / trancado de fora) — fazer antes de mais testers
- [U#6/#3/#7] **Lentidão e travamento com volume real** (sem paginação; carrega todas as linhas). Já acontece com testers.
- [U#4] **Enxurrada de requisições a cada cadastro** (prefetch de todas as rotas + refresh) → lento.
- [QA C1] **Sem `error.tsx` / `loading.tsx` / `not-found.tsx`** → tela branca/erro genérico em qualquer falha; navegação sem feedback.
- [QA C2] **Sem recuperação de senha** ("Esqueci a senha" é botão morto) → tester trava no login.

## 🟠 ALTO
- [U#1] **Landing quebra em light mode** (deveria ser dark fixo).
- [U#3+#8] **Unificar CRUD na tabela + paginação** em receitas, despesas e metas (aposentar ResourceManager duplicado).
- [U#9] **Metas: validações** — alvo não pode ser < atual; nome não pode repetir; progresso estoura "1000%".
- [U#5 / QA M5] **"Dia do mês" aceita > 31** (validar/clampar 1–31 no front e na action).
- [QA C3] **Gating premium é só blur client-side** (cadeado removível no DevTools); `requirePlanFeature` existe mas nunca é usado.
- [QA A2] **Projeção do dashboard é linear/errada** (ignora rendas/parcelas/dívidas que terminam).
- [QA M1/M9] **Actions sem validação robusta e sem try/catch** (NaN→0; estado parcial em pagamento de empréstimo).

## 🟡 MÉDIO
- [U#8] **Metas: poder concluir meta** ao atingir 100% (estado/ação).
- [U#7] **Paginação nas listas de cards** (próximos vencimentos / por categoria).
- [U#2] **Enxugar conteúdo da landing** (cortar genérico — alinhar quais seções).
- [QA A3] Datas salvas como `text` sem validação (risco de off-by-one por fuso).
- [QA A4] Juros inconsistente entre modos de empréstimo (`countMonthsInclusive` infla ~1 mês no interest_only).
- [QA A1] Sem rate-limiting em login/cadastro/reenvio.
- [QA M8] Sem índices em `user_id` (degrada com volume — agrava o crítico de lentidão).
- [QA M2] TOCTOU nos limites de plano (2 requisições simultâneas furam o limite).
- [QA M6] Troca de senha não invalida sessões antigas.
- [QA M10] Investimentos/Relatórios/IA são placeholders/mock sem aviso "em breve" no menu.
- [QA M3] Admin: sessão = premium, mas painel mostra plano real (métricas inconsistentes).
- [QA M4] Limite do Emprestei conta empréstimos quitados; Plus também limitado a 5.
- [QA A5] Linha de tabela clicável (admin) sem acesso por teclado.
- [QA M11] Sem `prefers-reduced-motion` global. · [QA M13] Erros de form sem `aria-live`/destaque por campo. · [QA M12] Onboarding sem "Salvando...".

## 🟢 BAIXO / polish
- [QA B1] Cor de tendência invertida em Despesas (gasto alto fica verde).
- [QA M7] Endpoint de avatar público. · [QA M15] Enumeração de contas no cadastro. · [QA B8] cookie sem `__Host-`; `SESSION_SECRET` morto. · [QA B9] link de verificação exposto fora de produção.
- [QA B3] Arredondamento de parcelas (lucro fantasma de centavos). · [QA B4] Progresso de parcela avança no dia 1º. · [QA B5] Ordenação "próximos recebimentos" perde o ano na virada.
- [QA B6] Update de id inexistente retorna "sucesso" falso. · [QA B7] Categorias de despesa podem duplicar. · [QA B2] `numberToCents` zera valores ≤ 0.
- [QA B10] Score de saúde satura fácil; copy do limite ("5 lançamentos") não explica que soma receitas+despesas.

## ✅ Decisões de UX (travadas)
- **Edição na tabela unificada (#3/#8): MODAL** (clica na linha → abre modal de edição, igual ao painel admin).
- Landing (#2): enxugar — estrutura a alinhar (ver proposta).

## 🧱 Blocos de execução (resolvem vários de uma vez)
- **Bloco 1 — Resiliência (rápido, alto impacto):** error/loading/not-found [C1] + estado "Salvando" onboarding [M12]. 
- **Bloco 2 — Recuperação de senha [C2].**
- **Bloco 3 — Tabela única paginada (CRUD inline/modal) p/ receitas+despesas+metas:** resolve [U#3,#6,#7,#8-tabela], parte do [#4], índices [M8], paginação server-side. + `prefetch={false}` no nav [#4].
- **Bloco 4 — Validações:** dia do mês 1–31 [#5/M5]; meta alvo≥atual, nome único, cap de progresso [#9]; ranges/maxlength e try/catch nas actions [M1,M9,M5].
- **Bloco 5 — Landing:** dark fixo [#1] + enxugar seções [#2].
- **Bloco 6 — Gating server-side [C3] + projeção correta [A2] + coerência admin [M3].**
- **Bloco 7 — Segurança:** rate-limit [A1], invalidar sessões na troca de senha [M6], avatar/enumeração/cookie [M7,M15,B8,B9].
- **Bloco 8 — a11y + polish:** reduced-motion [M11], aria-live [M13], teclado na tabela [A5], cor de tendência [B1] e demais Baixos.

---

---

## #1 — Landing em light mode quebra (deveria ser sempre dark) ⬜

**Tipo:** Bug
**Reportado:** "Modo light bugado na tela inicial. Quando o usuário está dentro do sistema em light mode e vai pra landing page, ela fica branca — sendo que lá é fixa dark." (print: seção 'O problema' com cards escuros sobre fundo branco e texto quase ilegível)

**Interpretação / causa-raiz:**
- A landing (`src/app/page.tsx`) renderiza `<div className="landing-page">` **sem forçar tema**. Os componentes usam tokens que se adaptam ao tema (`text-foreground`, `text-muted-foreground`, `bg-card`...).
- O `ThemeProvider` (root layout) usa a preferência do usuário. Se o usuário logado está em **light mode**, o `<html>` fica claro e a landing renderiza em light → contraste quebra (cards escuros do design dark sobre fundo branco, texto lavado). Ex.: `pain-points-section.tsx` (`text-foreground`/`text-muted-foreground` + `ThemedSpotlightCard`).
- A landing foi desenhada para ser **sempre dark** (igual auth/escolher-plano, que forçam dark).

**Direção de correção (depois):**
- Forçar a landing a renderizar sempre em dark — ex.: escopo `.dark` em volta da `.landing-page` (`<div className="landing-page dark">` faz os tokens resolverem dark), OU fixar o tema só nessa rota.
- Verificar o `Header` da landing: se tiver toggle de tema, decidir se some na landing (já que é dark fixo).
- Conferir que isso não afeta o tema do app interno (o usuário continua com a preferência dele dentro do sistema).

**Arquivos prováveis:** `src/app/page.tsx`, `src/components/landing/header.tsx`, `globals.css` (`.landing-page`).

---

## #2 — Enxugar conteúdo da landing ⬜

**Tipo:** Melhoria
**Reportado:** "Diminuir a quantidade de conteúdo e deixar somente os mais importantes, sem conteúdo genérico."

**Interpretação:**
- A landing tem **9 seções** hoje (`page.tsx`): Hero, PainPoints, HowItWorks, ProductModules, Dashboard, VariableIncome, AI, Pricing, CTA. É longa/repetitiva.
- Objetivo: manter só as seções de maior valor e cortar conteúdo genérico/redundante, deixando a página mais direta e forte.

**Direção (depois):** revisar seção a seção, definir quais ficam (provável núcleo: Hero → como funciona → módulos/diferencial → planos → CTA) e remover/fundir o resto. **Alinhar com o usuário quais cortar antes de mexer.**

**Arquivos prováveis:** `src/app/page.tsx` (ordem/quais seções) + os componentes de seção em `src/components/landing/`.

---

## #3 — Despesas e Receitas: unificar CRUD na tabela + paginação ⬜

**Tipo:** Melhoria (redesign)
**Reportado:** "Na tela de despesas e receitas, unificar o cadastro, edição e exclusão nessa tabela, coloco tudo aqui e aplicar paginação." (print: tabela de despesas com 2941 linhas, sem paginação)

**Interpretação / estado atual:**
- As páginas (`(app)/despesas/page.tsx`, `(app)/receitas/page.tsx`) renderizam **DUAS** coisas e **duplicam o dado**:
  1. `DespesasView`/`ReceitasView` (`modules/`): tabela premium **só leitura** (StatCards + próximos vencimentos + por categoria + FilterTabs + `DataTable`).
  2. `ResourceManager` (`resource-manager.tsx`): formulário "Adicionar" + lista de **cards** com editar/excluir (o CRUD de verdade).
- Ou seja: o mesmo dado aparece como **tabela** (em cima) e como **cards** (embaixo), e o cadastro/edição/exclusão estão **separados** da tabela.
- A página carrega **TODAS** as linhas de uma vez (`db.select()...` sem limit) → com 2941 linhas trava.

**Desejado:**
- Tudo na **tabela**: criar (botão → modal/linha), editar (ação na linha → modal/inline), excluir (ação na linha). Remover a duplicação de cards.
- **Paginação** (idealmente server-side com LIMIT/OFFSET pra não carregar milhares de linhas; o filtro por tipo e busca também).

**Direção (depois):** redesenhar despesas + receitas em torno de uma tabela única com ações por linha + paginação server-side. Reusar/estender `DataTable`. Aposentar o `ResourceManager` nessas telas (ou adaptar). **Alinhar UX (modal vs inline) antes de implementar.**

**Arquivos prováveis:** `(app)/despesas/page.tsx`, `(app)/receitas/page.tsx`, `modules/despesas-view.tsx`, `modules/receitas-view.tsx`, `resource-manager.tsx`, `premium/data-table.tsx`, actions `expenses.ts`/`incomes.ts` (paginação/contagem).

---

## #4 — Enxurrada de requisições ao cadastrar (fazer só uma) ⬜

**Tipo:** Bug (performance)
**Reportado:** "Bug: Fazer somente uma requisição." (print do Network: ~20 requisições `*_rsc=` ao cadastrar uma receita — receitas, despesas, dashboard, metas, dividas, emprestei, investimentos, relatorios, ia, cada uma repetida)

**Interpretação / causa-raiz provável:**
- Ao cadastrar, dispara um monte de requisições RSC (`?_rsc=`) de **todas as rotas do nav**, não só da atual.
- Causas: (1) `<Link>` do Next **prefetcha** todos os itens da sidebar (9 rotas) → 9+ requisições de RSC; (2) após a mutação, `router.refresh()` (em `resource-manager.tsx` / `emprestei-manager.tsx`) re-renderiza a árvore servidora e re-busca; a duplicação sugere prefetch disparando mais de uma vez (re-render da sidebar).
- Resultado: cada ação de cadastro/edição gera dezenas de requests.

**Desejado:** após cadastrar/editar, fazer **apenas a requisição necessária** (atualizar só o dado da tela atual), sem a tempestade de prefetch.

**Direção (depois):**
- Desligar/limitar o prefetch dos `<Link>` da sidebar/nav (`prefetch={false}`), já que são poucos cliques e o prefetch de todas as rotas é caro.
- Revisar o pós-mutação: `router.refresh()` re-busca a rota inteira; avaliar atualizar só o necessário (ex.: ação retornando o dado, ou revalidação mais cirúrgica) — alinhado com o redesign do #3 (tabela paginada que recarrega só a página atual).

**Arquivos prováveis:** `app-sidebar.tsx`, `mobile-bottom-nav.tsx`, `app-nav-links` (prefetch dos Links), `resource-manager.tsx`, `emprestei-manager.tsx` (`router.refresh`), actions (`revalidatePath`).

---

## #5 — Campo "Dia do mês" aceita valor > 31 (sem validação) ⬜

**Tipo:** Bug (validação) + sugestão de UX
**Reportado:** "Campo aceita mais que 31. Deve colocar o seletor de data no lugar desse." (na tabela de receitas dá pra ver dia "1234", "123" cadastrados)

**Interpretação / causa-raiz:**
- O campo `dayOfMonth` (receitas/despesas) é `type: "number"` sem clamp/validação de range — aceita 0, 50, 1234, negativo. (Confirma o achado **M5** da auditoria.)
- Em `loans.ts` há clamp 1–31; em incomes/expenses **não**. Falta validação no input (front) **e** na action (back).

**Sugestão do usuário:** trocar por um **seletor de data**.
**⚠️ Ponto a alinhar:** "Dia do mês" é um dia recorrente (1–31, repete todo mês — usado em receita/despesa FIXA), não uma data única. Um date picker captura uma data específica, mudando a semântica do recorrente. Decidir juntos:
- (a) manter "dia do mês" mas **validar/clampar 1–31** (input com max + clamp na action) — correção mínima e correta; ou
- (b) trocar por seletor de data de verdade (e aí rever o modelo de "fixa/recorrente").

**Arquivos prováveis:** `(app)/receitas/page.tsx` + `(app)/despesas/page.tsx` (def. do campo), `resource-manager.tsx` (input number → sanitize), `lib/actions/incomes.ts` + `expenses.ts` (validar range).

---

## #6 — Lentidão com +2 mil cadastros ⬜

**Tipo:** Bug (performance)
**Reportado:** "Mais de 2mil cadastros tá causando lentidão."

**Interpretação:** sintoma da mesma raiz do **#3** — as páginas carregam **todas** as linhas de uma vez (`db.select()` sem `limit`) e renderizam tudo no cliente (tabela + cards). Com 2000+ itens, a query, o payload RSC e o render pesam. Também agrava o **#4** (cada refresh re-busca tudo).

**Direção (depois):** resolver junto com o #3 (paginação server-side com `LIMIT/OFFSET` + `count`), e adicionar **índices em `user_id`** (achado **M8** da auditoria) — `(user_id, created_at)` ajuda a ordenação/contagem. Provavelmente também migrar `dayOfMonth`/datas e limpar dados de teste antigos.

**Arquivos prováveis:** `(app)/receitas/page.tsx`, `(app)/despesas/page.tsx` (paginação na query), `lib/db/schema.ts` (índices) + nova migration.

---

## #7 — Paginação nas listas de cards (Próximos vencimentos / Por categoria) ⬜

**Tipo:** Bug/Melhoria (performance + UX)
**Reportado:** "Aplicar paginação nesses cards." (print: cards "Próximos vencimentos" e "Por categoria" da tela de Despesas)

**Interpretação:** as listas de cards em `despesas-view.tsx` (`Próximos vencimentos` ~linha 67, `Por categoria` ~linha 94) renderizam **todos** os itens sem limite. Com muitos dados ficam enormes. Aplicar paginação / "ver mais" / limite (ex.: top 5 + expandir). Vale para o análogo em **receitas-view** também.

**Arquivos prováveis:** `modules/despesas-view.tsx`, `modules/receitas-view.tsx`.

---

## #8 — Metas: padronizar como tabela/paginação (igual receitas/despesas) ⬜

**Tipo:** Melhoria (redesign + consistência)
**Reportado:** "Adicionar uma tabela ou paginação para exibir a lista de metas." + "Manter um padrão entre as tabelas, fazer semelhante à de receitas e despesas." + "Poder concluir meta quando chegar no fim."

**Interpretação / estado atual:**
- Metas (`(app)/metas/page.tsx`) tem o **mesmo problema estrutural do #3**: uma view de **cards com anéis de progresso** (`metas-view.tsx`) **+** o `ResourceManager` (form "Adicionar meta" + cards "Cadastrados (6)" com editar/excluir). Dado duplicado, sem tabela nem paginação.
- Pedido: deixar Metas no **mesmo padrão** das telas de receitas/despesas (tabela + paginação + CRUD unificado — alinhado com o #3).
- **+ Concluir meta:** quando atingir 100% (valor atual ≥ valor alvo), permitir marcar como **concluída** (estado/ação). Hoje não há esse conceito.

**Direção (depois):** unificar com a decisão do #3 (padrão único de tabela para receitas/despesas/metas) + adicionar estado "concluída"/ação de concluir.

**Arquivos prováveis:** `(app)/metas/page.tsx`, `modules/metas-view.tsx`, `resource-manager.tsx`, `lib/actions/goals.ts`, `schema.ts` (talvez flag de concluída).

---

## #9 — Metas: validações e display de progresso ⬜

**Tipo:** Bug (validação + UI)
**Reportado:** "Uma meta não pode ser menor que o valor atual." + "Não pode ter uma meta com o mesmo nome." (prints: progresso "1000%" e "1009%"; duas metas chamadas "2342")

**Interpretação / 3 problemas:**
1. **Valor alvo < valor atual permitido** → progresso passa de 100% (ex.: atual R$234,24 / alvo R$23,42 = "1000%"). Validar na action e no input: `valor alvo >= valor atual` (e/ou `> 0`).
2. **Nomes duplicados permitidos** (duas metas "2342"). Bloquear nome repetido por usuário (validação na action + idealmente unique constraint `(user_id, lower(name))`).
3. **Anel de progresso não limita a 100%** no display — mostra "1000%"/"1009%". Limitar a exibição a 100% (mesmo que o dado seja maior), separado da validação acima.

**Arquivos prováveis:** `(app)/metas/page.tsx` (def. campos), `lib/actions/goals.ts` (validação alvo≥atual, nome único), `modules/metas-view.tsx` (cap do progresso a 100%), `schema.ts` (unique opcional).

---

## #10 — Emprestei: ocultar e virar recurso liberado pelo admin (por usuário) ⬜

**Tipo:** Melhoria (mudança de modelo de acesso)
**Reportado:** "O módulo 'Emprestei' vamos deixar oculto e nem apresentar ele na landing page. Vamos deixar ele pra que o admin decida dar isso pra aquele tal usuário."

**Interpretação / mudança:**
- Hoje `loans` é feature de **plano** (`features.ts`: `FEATURE_MIN_PLAN.loans = "free"`, ilimitado no premium) — aparece pra todo mundo.
- Novo modelo: **oculto por padrão**; só usuários que o **admin liberar individualmente** veem/acessam. É uma **entitlement por usuário**, não por plano.

**O que precisa (depois):**
1. **Flag por usuário** (ex.: coluna `loans_enabled boolean default false` em `users`, ou tabela de entitlements) — migration.
2. **Admin libera/revoga** no detalhe do cliente (`customer-detail-dialog.tsx`) — toggle "Liberar Emprestei", via action protegida (`lib/actions/admin.ts`).
3. **Esconder em TODO lugar por padrão:** nav sidebar + "Mais" mobile (`app-nav-links.ts`, `mobile-bottom-nav.tsx`), dashboard (se referenciar), e **bloquear a rota** `(app)/emprestei/page.tsx` se o usuário não tiver a flag.
4. **Tirar da landing:** remover menções a Emprestei (`landing-data.ts`: feature do plano Gratuito "Módulo Emprestei (até 5 pessoas)", módulos do produto, etc.) — casa com o enxugamento da landing (#2).
5. Revisar o gating: `loans` deixa de ser feature de plano e passa a checar a flag do usuário (ou admin override).

**Ripple:** mexe no admin (toggle), no nav, na landing/planos e no gating. Limite de 5 pessoas/ilimitado provavelmente sai (ou vira config do admin).

**Arquivos prováveis:** `schema.ts` + migration, `lib/actions/admin.ts`, `customer-detail-dialog.tsx`, `app-nav-links.ts`, `mobile-bottom-nav.tsx`, `app-sidebar.tsx`, `(app)/emprestei/page.tsx`, `features.ts`/`loan-limit.ts`, `landing-data.ts`, componentes de landing.
