import {
  AlertTriangle,
  BarChart3,
  BellRing,
  Bot,
  Calendar,
  CreditCard,
  HandCoins,
  Layers3,
  LineChart,
  MessageCircle,
  PiggyBank,
  Repeat,
  Smartphone,
  Sparkles,
  SunMoon,
  Target,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { SUPPORT_WHATSAPP_URL } from "@/lib/brand";

export const navLinks = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Recursos", href: "#recursos" },
  { label: "IA Financeira", href: "#ia-financeira" },
  { label: "Planos", href: "#planos" },
];

/** Links extras no menu mobile (hamburger) */
export const navAuthLinks = [
  { label: "Entrar", href: "/login" },
  { label: "Criar conta", href: "/cadastro" },
];

export const painPoints = [
  {
    icon: CreditCard,
    title: "Cartão estourado",
    description: "O limite some antes do fim do mês e você só percebe quando já é tarde.",
  },
  {
    icon: Calendar,
    title: "Contas esquecidas",
    description: "Boletos e assinaturas se acumulam porque ninguém avisou que estavam vencendo.",
  },
  {
    icon: TrendingDown,
    title: "Renda variável desorganizada",
    description: "Comissões, freelances e extras entram sem planejamento e saem ainda mais rápido.",
  },
  {
    icon: AlertTriangle,
    title: "Dívidas sem prioridade",
    description: "Você paga o que lembra, não o que faz mais sentido financeiramente.",
  },
  {
    icon: BarChart3,
    title: "Falta de visão do futuro",
    description: "Sem projeção, cada mês é uma surpresa, boa ou ruim.",
  },
  {
    icon: Wallet,
    title: "Dinheiro emprestado",
    description:
      "Você empresta para conhecidos e perde a conta de quem deve, quanto entra de juros e quando vence.",
  },
];

export const howItWorksSteps = [
  {
    step: 1,
    shortLabel: "Conta",
    icon: UserPlus,
    title: "Crie sua conta",
    description: "Cadastro rápido para pessoa física. Sem modo empresarial, sem burocracia.",
    spotlightColor: "rgba(16, 185, 129, 0.2)" as const,
  },
  {
    step: 2,
    shortLabel: "Perfil",
    icon: Sparkles,
    title: "Onboarding em 1 minuto",
    description:
      "Informe profissão e renda fixa em uma única tela. Você entra direto no app, sem wizard longo.",
    spotlightColor: "rgba(124, 58, 237, 0.18)" as const,
  },
  {
    step: 3,
    shortLabel: "Organizar",
    icon: Layers3,
    title: "Organize seu mês",
    description:
      "Cadastre receitas, despesas, dívidas, metas e empréstimos feitos a outras pessoas no módulo Emprestei.",
    spotlightColor: "rgba(16, 185, 129, 0.15)" as const,
  },
  {
    step: 4,
    shortLabel: "IA",
    icon: Bot,
    title: "A IA analisa seus dados",
    description:
      "Com base no que você cadastrou, o FinIA Control gera diagnósticos reais, sem inventar números.",
    spotlightColor: "rgba(139, 92, 246, 0.2)" as const,
  },
  {
    step: 5,
    shortLabel: "Alertas",
    icon: BellRing,
    title: "Receba previsões e alertas",
    description:
      "Saiba o que vem pela frente, simule impactos e tome decisões antes que o problema apareça.",
    spotlightColor: "rgba(16, 185, 129, 0.22)" as const,
  },
];

export const dashboardFeatures = [
  { icon: TrendingUp, label: "Receitas" },
  { icon: CreditCard, label: "Despesas" },
  { icon: AlertTriangle, label: "Dívidas" },
  { icon: Target, label: "Metas" },
  { icon: HandCoins, label: "Emprestei" },
  { icon: LineChart, label: "Investimentos" },
  { icon: PiggyBank, label: "Saldo previsto" },
  { icon: BarChart3, label: "Relatórios" },
  { icon: Bot, label: "Assistente IA" },
  { icon: Repeat, label: "Rendas temporárias" },
];

export type ProductModule = {
  icon: LucideIcon;
  title: string;
  description: string;
  plan: string;
};

export const productModules: ProductModule[] = [
  {
    icon: TrendingUp,
    title: "Receitas",
    description:
      "Renda fixa, variável, extra ou temporária, com data de início, fim e projeção no orçamento.",
    plan: "Gratuito",
  },
  {
    icon: CreditCard,
    title: "Despesas",
    description:
      "Registre gastos fixos, variáveis e parcelados. Veja para onde seu dinheiro está indo.",
    plan: "Gratuito",
  },
  {
    icon: HandCoins,
    title: "Emprestei",
    description:
      "Controle empréstimos a pessoas com juros mensais, parcelas fixas ou pagamento único. Registre pagamentos recebidos.",
    plan: "Gratuito · Premium ilimitado",
  },
  {
    icon: AlertTriangle,
    title: "Dívidas",
    description:
      "Organize obrigações, priorize quitação e acompanhe o progresso mês a mês.",
    plan: "Plus",
  },
  {
    icon: Target,
    title: "Metas",
    description:
      "Defina objetivos financeiros e acompanhe quanto falta para alcançá-los.",
    plan: "Plus",
  },
  {
    icon: LineChart,
    title: "Investimentos",
    description:
      "Centralize aplicações e acompanhe a evolução do que você já construiu.",
    plan: "Plus",
  },
];

export type PlatformHighlight = {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
};

export const platformHighlights: PlatformHighlight[] = [
  {
    icon: Smartphone,
    title: "Feito para mobile",
    description:
      "Navegação inferior, menu Mais com todos os módulos e experiência otimizada para celular.",
  },
  {
    icon: SunMoon,
    title: "Claro e escuro",
    description:
      "Tema claro e escuro com identidade visual consistente em todo o app.",
  },
  {
    icon: MessageCircle,
    title: "Suporte no WhatsApp",
    description: "Precisando de ajuda? Fale conosco direto pelo WhatsApp, sem sair do fluxo.",
    href: SUPPORT_WHATSAPP_URL,
  },
];

export const variableIncomeFields = [
  "Valor",
  "Data de recebimento",
  "Frequência",
  "Data de início",
  "Data de fim",
  "Observação",
  "Categoria da renda",
];

export const variableIncomeBenefits = [
  {
    title: "Considera nas projeções",
    description: "A renda entra no orçamento futuro apenas enquanto estiver ativa.",
  },
  {
    title: "Alerta antes de acabar",
    description: "Você é avisado quando a renda temporária estiver perto do fim.",
  },
  {
    title: "Simula sem a renda",
    description: "Veja como fica seu mês quando essa entrada extra deixar de existir.",
  },
  {
    title: "Evita dependência",
    description: "Planeje com antecedência para não ser pego de surpresa.",
  },
];

export const aiQuestions = [
  "Quanto gastei este mês?",
  "Onde estou gastando mais?",
  "Posso comprar algo de R$ 1.000 agora?",
  "Qual dívida devo pagar primeiro?",
  "Quanto consigo guardar por mês?",
  "O que acontece quando minha renda extra acabar?",
];

export const aiChatDemo = [
  {
    role: "user" as const,
    message: "Posso comprar algo de R$ 1.000 agora?",
  },
  {
    role: "assistant" as const,
    message:
      "Com base nos seus dados, você tem R$ 1.240 de margem prevista este mês. Uma compra de R$ 1.000 reduziria sua reserva para R$ 240, abaixo do mínimo que você definiu (R$ 500). Recomendo aguardar ou parcelar.",
  },
  {
    role: "user" as const,
    message: "O que acontece quando minha renda extra acabar?",
  },
  {
    role: "assistant" as const,
    message:
      "Sua renda extra de R$ 500/mês termina em dezembro. A partir de janeiro, seu saldo previsto cai cerca de R$ 480. Sugiro reservar R$ 150/mês agora para criar uma transição mais suave.",
  },
];

export type PlanFeature = string;

export type PlanId = "free" | "plus" | "premium";

export interface PricingPlan {
  id: PlanId;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: PlanFeature[];
  highlighted?: boolean;
  badge?: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Gratuito",
    price: "R$ 0",
    description: "Para começar a organizar suas finanças pessoais.",
    features: [
      "Dashboard básico",
      "Receitas e despesas",
      "Módulo Emprestei (até 5 pessoas)",
      "Até 50 lançamentos por mês",
      "App mobile responsivo",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: "R$ 19,90",
    period: "/mês",
    description: "Controle completo do seu mês a mês.",
    features: [
      "Tudo do Gratuito, sem limite de lançamentos",
      "Metas financeiras",
      "Dívidas",
      "Investimentos",
      "Relatórios",
      "Projeções mensais",
      "Contas e recebimentos",
    ],
  },
  {
    id: "premium",
    name: "Premium IA",
    price: "R$ 39,90",
    period: "/mês",
    description: "Inteligência artificial olhando seus números todos os dias.",
    highlighted: true,
    badge: "Mais escolhido",
    features: [
      "Tudo do Plus",
      "Assistente com IA",
      "Alertas inteligentes",
      "Emprestei ilimitado",
      "Simulação de compras",
      "Plano para quitar dívidas",
      "Suporte prioritário via WhatsApp",
    ],
  },
];

export const footerLinks: Array<
  { label: string; href: string } | { label: string; href: string; external: true }
> = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Recursos", href: "#recursos" },
  { label: "IA Financeira", href: "#ia-financeira" },
  { label: "Planos", href: "#planos" },
  { label: "Suporte WhatsApp", href: SUPPORT_WHATSAPP_URL, external: true },
  { label: "Começar agora", href: "/cadastro" },
];

export const heroFinancialCards = [
  {
    title: "Saldo previsto do mês",
    value: "R$ 2.847,00",
    trend: "+12%",
    trendUp: true,
    accent: "bg-emerald-500/10 text-emerald-700",
  },
  {
    title: "Gastos por categoria",
    items: [
      { label: "Moradia", value: 42 },
      { label: "Alimentação", value: 28 },
      { label: "Transporte", value: 18 },
    ],
  },
  {
    title: "Alerta de orçamento",
    value: "Alimentação em 87%",
    description: "Faltam R$ 78 para estourar o limite.",
    accent: "bg-amber-500/10 text-amber-700",
  },
  {
    title: "Projeção próximos meses",
    values: [3200, 2980, 2650, 3100],
  },
];

export const categoryChartData = [
  { name: "Moradia", value: 42, color: "#059669" },
  { name: "Alimentação", value: 28, color: "#f97316" },
  { name: "Transporte", value: 18, color: "#0ea5e9" },
  { name: "Outros", value: 12, color: "#a3a3a3" },
];

export const projectionChartData = [
  { month: "Jun", saldo: 2847 },
  { month: "Jul", saldo: 2650 },
  { month: "Ago", saldo: 2410 },
  { month: "Set", saldo: 2980 },
  { month: "Out", saldo: 3120 },
  { month: "Nov", saldo: 2890 },
];

export const dashboardMockStats = [
  { label: "Receitas", value: "R$ 6.200", change: "+8%", icon: TrendingUp },
  { label: "Despesas", value: "R$ 4.353", change: "-3%", icon: TrendingDown },
  { label: "Saldo previsto", value: "R$ 1.847", change: "+15%", icon: PiggyBank },
  { label: "Emprestei ativo", value: "R$ 2.400", change: "3 pessoas", icon: HandCoins },
];

export interface IncomeField {
  label: string;
  value: string;
  icon: LucideIcon;
}

export const mockIncomeEntry: IncomeField[] = [
  { label: "Valor", value: "R$ 500,00", icon: Wallet },
  { label: "Recebimento", value: "Todo dia 10", icon: Calendar },
  { label: "Frequência", value: "Mensal", icon: Repeat },
  { label: "Início", value: "Março/2026", icon: Calendar },
  { label: "Fim", value: "Dezembro/2026", icon: Calendar },
  { label: "Categoria", value: "Bolsa / Extra", icon: Bot },
];
