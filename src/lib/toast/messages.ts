export const TOAST_URL_KEYS = {
  login: "login",
  logout: "logout",
  signup: "signup",
  emailVerified: "email-verified",
  onboarding: "onboarding",
  planSelected: "plan-selected",
  passwordReset: "password-reset",
} as const;

export type ToastUrlKey = (typeof TOAST_URL_KEYS)[keyof typeof TOAST_URL_KEYS];

export const TOAST_URL_MESSAGES: Record<
  ToastUrlKey,
  { title: string; description?: string }
> = {
  [TOAST_URL_KEYS.login]: {
    title: "Login realizado!",
    description: "Bem-vindo de volta ao FinIA Control.",
  },
  [TOAST_URL_KEYS.logout]: {
    title: "Sessão encerrada",
    description: "Até logo! Volte quando quiser.",
  },
  [TOAST_URL_KEYS.signup]: {
    title: "Conta criada!",
    description: "Confirme seu e-mail para acessar o sistema.",
  },
  [TOAST_URL_KEYS.emailVerified]: {
    title: "E-mail confirmado!",
    description: "Sua conta está ativa. Bons controles por aqui.",
  },
  [TOAST_URL_KEYS.onboarding]: {
    title: "Perfil configurado!",
    description: "Seu dashboard já está pronto para usar.",
  },
  [TOAST_URL_KEYS.planSelected]: {
    title: "Plano selecionado!",
    description: "Continue a configuração da sua conta.",
  },
  [TOAST_URL_KEYS.passwordReset]: {
    title: "Senha redefinida!",
    description: "Use a nova senha para entrar na sua conta.",
  },
};

export const TOAST_MESSAGES = {
  income: {
    created: "Receita cadastrada com sucesso.",
    updated: "Receita atualizada com sucesso.",
    deleted: "Receita removida com sucesso.",
    validation: "Informe a descrição da receita.",
  },
  expense: {
    created: "Despesa cadastrada com sucesso.",
    updated: "Despesa atualizada com sucesso.",
    deleted: "Despesa removida com sucesso.",
    validation: "Informe a descrição da despesa.",
  },
  debt: {
    created: "Dívida cadastrada com sucesso.",
    updated: "Dívida atualizada com sucesso.",
    deleted: "Dívida removida com sucesso.",
    validation: "Informe o nome da dívida.",
  },
  goal: {
    created: "Meta cadastrada com sucesso.",
    updated: "Meta atualizada com sucesso.",
    deleted: "Meta removida com sucesso.",
    validation: "Informe o nome da meta.",
    completed: "Meta concluída! Parabéns 🎉",
    reopened: "Meta reaberta.",
  },
  loan: {
    created: "Empréstimo cadastrado com sucesso.",
    updated: "Empréstimo atualizado com sucesso.",
    deleted: "Empréstimo removido com sucesso.",
    validation: "Informe o nome de quem pegou emprestado.",
    validationAmount: "Informe um valor emprestado válido.",
    validationDate: "Informe a data do empréstimo.",
    validationInstallment: "Informe o valor da parcela.",
    validationInstallmentCount: "Informe o número de parcelas.",
    validationDueDate: "Informe a data prevista de quitação.",
    validationDay: "Informe o dia do vencimento mensal (1 a 31).",
    validationDayRange: "O dia do vencimento deve ser entre 1 e 31.",
    paymentRegistered: "Pagamento registrado com sucesso.",
    paymentValidation: "Informe a data do pagamento.",
    paymentAmount: "Informe um valor de pagamento válido.",
    limitReached:
      "Limite de 5 pessoas no plano Gratuito atingido. No Premium IA, o cadastro é ilimitado.",
  },
  profile: {
    updated: "Perfil atualizado com sucesso.",
    avatarUpdated: "Foto de perfil atualizada.",
    avatarRemoved: "Foto de perfil removida.",
    passwordUpdated: "Senha alterada com sucesso.",
  },
  verifyEmail: {
    resent: "Novo link de confirmação enviado.",
    alreadyVerified: "Este e-mail já foi confirmado.",
  },
  plan: {
    unavailable: "Este plano ainda não está disponível.",
  },
  generic: {
    error: "Algo deu errado. Tente novamente.",
    saved: "Alterações salvas com sucesso.",
  },
} as const;
