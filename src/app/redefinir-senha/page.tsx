import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { verifyPasswordResetToken } from "@/lib/auth/password-reset-token";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function RedefinirSenhaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";

  const userId = token ? await verifyPasswordResetToken(token) : null;

  if (!userId) {
    return (
      <AuthSplitLayout
        title="Link inválido"
        subtitle="Não foi possível redefinir sua senha"
        showMarketing={false}
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-white/70" style={{ fontSize: "0.95em", lineHeight: 1.5 }}>
            Este link de redefinição é inválido, já foi usado ou expirou. Solicite um
            novo link para continuar.
          </p>
          <Link
            href="/esqueci-senha"
            className="font-semibold text-brand hover:underline"
          >
            Solicitar novo link
          </Link>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      title="Criar nova senha"
      subtitle="Defina uma nova senha para sua conta"
      showMarketing={false}
    >
      <ResetPasswordForm token={token} />
    </AuthSplitLayout>
  );
}
