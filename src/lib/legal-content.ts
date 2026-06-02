export type LegalDocumentId = "privacy" | "terms" | "security";

export type LegalDocument = {
  title: string;
  intro: string;
  points: string[];
};

export const legalDocuments: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: "Política de Privacidade",
    intro: "Seus dados são seus. Tratamos tudo com cuidado e transparência.",
    points: [
      "Coletamos nome, e-mail e as informações financeiras que você cadastra no app.",
      "Usamos esses dados apenas para organizar sua conta, projeções e análises com IA.",
      "Não vendemos nem compartilhamos seus dados com terceiros para marketing.",
      "Você pode pedir correção ou exclusão da conta quando quiser: contato@finia.com.br",
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
