import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { VerifyEmailPending } from "@/components/auth/verify-email-pending";
import { getDevVerificationLink } from "@/lib/actions/verify-email";
import { getEmailValidationError, normalizeEmail } from "@/lib/auth/validate-email";

const ERROR_MESSAGES: Record<string, string> = {
  "token-invalido": "Link de confirmação inválido. Solicite um novo e-mail.",
  "token-expirado": "Este link expirou. Solicite um novo e-mail de confirmação.",
};

type PageProps = {
  searchParams: Promise<{ email?: string; error?: string; nao_enviado?: string }>;
};

export default async function VerificarEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const email = normalizeEmail(params.email ?? "");
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] : null;

  if (!email || getEmailValidationError(email)) {
    return (
      <AuthSplitLayout
        title="Verificar e-mail"
        subtitle="Confirme seu endereço para continuar"
        showMarketing={false}
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-white/70" style={{ fontSize: "0.95em" }}>
            Informe um e-mail válido para receber o link de confirmação.
          </p>
          <Link href="/cadastro" className="font-semibold text-brand hover:underline">
            Voltar ao cadastro
          </Link>
        </div>
      </AuthSplitLayout>
    );
  }

  const devVerificationUrl = await getDevVerificationLink(email);
  const emailSent = params.nao_enviado !== "1";

  return (
    <AuthSplitLayout
      title="Verifique seu e-mail"
      subtitle="Falta só confirmar seu endereço"
      showMarketing={false}
    >
      <VerifyEmailPending
        email={email}
        emailSent={emailSent}
        devVerificationUrl={devVerificationUrl}
        errorMessage={errorMessage}
      />
    </AuthSplitLayout>
  );
}
