export type LegalDocumentId = "privacy" | "terms" | "security";

export type LegalDocument = {
  title: string;
  intro: string;
  points: string[];
};

export const legalDocuments: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: "Política de Privacidade",
    intro: "Seus dados são seus. Tratamos tudo com cuidado e transparência, conforme a LGPD.",
    points: [
      "Coletamos nome, e-mail e as informações financeiras que você cadastra no app.",
      "Usamos esses dados apenas para organizar sua conta, projeções e análises com IA (finalidade específica).",
      "Não vendemos nem compartilhamos seus dados com terceiros para marketing.",
      "Operadores que processam dados em nosso nome: Neon (banco de dados), Vercel (hospedagem) e Resend (envio de e-mails) — alguns com servidores fora do Brasil (transferência internacional com salvaguardas).",
      "Seus direitos (LGPD Art. 18): você pode exportar seus dados e excluir sua conta definitivamente em Configurações › Privacidade e dados, a qualquer momento.",
      "Registramos a data e a versão do seu aceite e mantemos logs de acesso administrativo para auditoria.",
      "Dúvidas ou solicitações ao Encarregado (DPO): contato@finia.com.br",
    ],
  },
  terms: {
    title: "Termos de Uso",
    intro: "Ao usar o FinIA Control, você concorda com as regras abaixo.",
    points: [
      "O serviço é para controle financeiro pessoal, suas finanças ou da família.",
      "Mantenha sua senha em segurança e cadastre informações corretas.",
      "Planos gratuitos e pagos têm recursos diferentes; confira os detalhes na página de planos.",
      "Sugestões da IA são orientativas e não substituem um profissional financeiro.",
    ],
  },
  security: {
    title: "Segurança",
    intro: "Protegemos sua conta e pedimos que você também cuide disso.",
    points: [
      "Sua senha é protegida e nunca fica visível para ninguém da equipe.",
      "Acesse sempre pelo site oficial e desconfie de links estranhos.",
      "Não compartilhe senha nem deixe a sessão aberta em computador de outras pessoas.",
      "Achou algo estranho? Troque a senha e fale conosco: contato@finia.com.br",
    ],
  },
};

export const legalLinkLabels: { id: LegalDocumentId; label: string }[] = [
  { id: "privacy", label: "Política de privacidade" },
  { id: "terms", label: "Termos de uso" },
  { id: "security", label: "Segurança" },
];
