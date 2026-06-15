/**
 * ============================================================================
 *  IDENTIDADE VISUAL DOS E-MAILS  —  ÚNICA FONTE DA VERDADE
 * ============================================================================
 *  Tudo o que é visual (cores, fonte, logo, nome, links) mora AQUI.
 *  Para reestilizar TODOS os e-mails, basta editar os valores abaixo.
 *
 *  👉 Os e-mails NÃO suportam CSS externo de forma confiável, por isso a logo
 *     precisa de uma URL ABSOLUTA (https://...) e as cores são hexadecimais.
 * ============================================================================
 */

export const EMAIL_THEME = {
  /* ---------------------------------------------------------------------- */
  /* 🎨 CORES — troque pelos hexadecimais da sua marca                       */
  /* ---------------------------------------------------------------------- */
  colors: {
    /** Cor de FUNDO do e-mail (dark mode) */
    background: "#0A0A0A",
    /** Fundo das CAIXAS internas (caixa de destaque, bloco de código) */
    surface: "#111214",
    /** Bordas e DIVISORES sutis (linhas do header/footer) */
    border: "#232427",
    /** Texto PRINCIPAL (títulos e corpo) */
    textPrimary: "#F5F5F6",
    /** Texto SECUNDÁRIO (rodapé, labels, observações) */
    textSecondary: "#9A9CA3",
    /** Cor de DESTAQUE da marca (botões, links, bordas em destaque) */
    brand: "#00E676",
    /** Texto que fica SOBRE a cor de destaque (ex.: texto do botão) */
    brandText: "#041208",
  },

  /* ---------------------------------------------------------------------- */
  /* 🔤 TIPOGRAFIA — fonte do projeto (Inter) + fallbacks seguros            */
  /* ---------------------------------------------------------------------- */
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",

  /* ---------------------------------------------------------------------- */
  /* 🖼️ LOGO DO HEADER — ÍCONE (quadrado) + nome em texto ao lado.          */
  /*    Usamos o ÍCONE quadrado + o nome como TEXTO (nítido em qualquer      */
  /*    tamanho e sem distorção). 👉 TROQUE `iconUrl` pela URL pública do    */
  /*    seu ícone quadrado (PNG transparente). `iconSize` = lado em px.      */
  /* ---------------------------------------------------------------------- */
  iconUrl: "https://finiacontrol.com.br/fin_favicon.png",
  iconSize: 40,

  /* ---------------------------------------------------------------------- */
  /* 🏢 MARCA — nome (header/assinatura/rodapé). Para o destaque em duas     */
  /*    cores no header, ajuste `brandNameStart` (claro) e `brandNameEnd`    */
  /*    (cor de destaque). Ex.: "FinIA" + "Control".                         */
  /* ---------------------------------------------------------------------- */
  brandName: "FinIA Control",
  brandNameStart: "FinIA",
  brandNameEnd: "Control",
  siteUrl: "https://finiacontrol.com.br",
  siteLabel: "finiacontrol.com.br",
} as const;

/**
 * Config do Tailwind usado pelos e-mails (React Email inlina as classes).
 * Mantém as cores/fonte do tema acima como classes utilitárias:
 *   bg-background, text-textPrimary, text-textSecondary, bg-brand, border-border...
 */
export const emailTailwindConfig = {
  theme: {
    extend: {
      colors: {
        background: EMAIL_THEME.colors.background,
        surface: EMAIL_THEME.colors.surface,
        border: EMAIL_THEME.colors.border,
        textPrimary: EMAIL_THEME.colors.textPrimary,
        textSecondary: EMAIL_THEME.colors.textSecondary,
        brand: EMAIL_THEME.colors.brand,
        brandText: EMAIL_THEME.colors.brandText,
      },
      fontFamily: {
        sans: EMAIL_THEME.fontFamily.split(",").map((f) => f.trim()),
      },
    },
  },
};
