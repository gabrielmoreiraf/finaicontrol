/**
 * Base de conhecimento ESTÁTICA do FinIA Control para a IA.
 * Descreve módulos, funcionalidades, planos e limites — para a assistente
 * saber explicar TODO o sistema, não só os dados do usuário.
 * Mantenha sincronizado com o produto (planos em lib/landing-data.ts,
 * regras em lib/plans/features.ts).
 */
export const SYSTEM_KNOWLEDGE = `CONHECIMENTO DO SISTEMA FinIA Control (use para explicar funcionalidades e navegação):

SOBRE: FinIA Control é um app de controle financeiro pessoal. O menu lateral dá acesso aos
módulos abaixo. Em cada tela de lista há o botão "Adicionar"; clicar numa linha abre os
detalhes; os ícones de olho (ver) e lápis (editar) ficam na linha, e a exclusão fica dentro
do modal de edição. As tabelas têm paginação (avançar/voltar e escolher itens por página).

MÓDULOS:
- Dashboard: visão geral — saldo do mês, resumos, saúde financeira (verde/amarelo/vermelho),
  e contas a pagar / recebimentos próximos.
- Receitas: 4 tipos — Fixa (recorrente, com dia do mês), Variável (valor que muda),
  Extra (entrada pontual) e Temporária (recorrente com data de término). Há também a
  renda/salário fixo configurado no perfil.
- Despesas: 3 tipos — Fixa (recorrente, com dia de vencimento), Variável (com data do gasto)
  e Parcelada (nº de parcelas + data de início; o app mostra "Parcela X de Y · faltam Z").
  Cada despesa pode ter categoria.
- Dívidas: saldo devedor e parcela mensal de cada dívida.
- Metas: valor alvo e valor atual, com % de progresso; dá para marcar como concluída/reabrir.
- Emprestei: controla dinheiro emprestado a pessoas (valor, juros, parcelas, pagamentos e
  quanto falta receber). É um módulo opcional, liberado pelo administrador.
- Investimentos: em breve.
- Relatórios: em breve.
- Assistente IA: este chat, que responde com base nos dados do usuário.
- Configurações: editar perfil e foto, renda fixa, trocar senha, exportar seus dados e
  excluir a conta (direitos da LGPD).

RECURSOS DA INTERFACE: botão de "ocultar valores" (ícone de olho no topo) que esconde todos os
valores; notificações (sino); alternância de tema claro/escuro.

LIMITE DO PLANO GRATUITO: até 5 lançamentos (receitas + despesas somados) por mês. Ao atingir,
o usuário pode fazer upgrade ou usar créditos extras liberados pelo administrador. As telas de
Metas, Dívidas, Investimentos, Relatórios e o Assistente IA exigem plano superior.

PLANOS:
- Gratuito (R$ 0): Dashboard básico, Receitas e Despesas, até 5 lançamentos/mês. Inclui o
  módulo Emprestei para até 5 pessoas.
- Plus (R$ 19,90/mês): tudo do Gratuito SEM limite de lançamentos, + Metas, Dívidas,
  Investimentos, Relatórios, Projeções mensais e Contas e recebimentos.
- Premium IA (R$ 39,90/mês): tudo do Plus, + Assistente com IA, Alertas inteligentes,
  Simulação de compras, Plano para quitar dívidas, Emprestei ilimitado e suporte prioritário
  via WhatsApp. Há opção anual com desconto (equivale a 2 meses grátis).
O administrador também pode liberar um período de teste (trial) com acesso completo.`;
