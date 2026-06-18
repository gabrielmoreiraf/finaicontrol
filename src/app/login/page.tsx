import { redirect as nextRedirect } from "next/navigation";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getPostAuthPath } from "@/lib/auth/post-auth-redirect";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  // Já autenticado (sessão válida no banco) → vai pro destino certo. Validar
  // aqui (e não no proxy/edge) evita loop quando o cookie existe mas é inválido.
  const user = await getCurrentUser();
  if (user) {
    nextRedirect(
      getPostAuthPath({ plan: user.plan, onboardingComplete: user.onboardingComplete }),
    );
  }

  const { redirect } = await searchParams;

  return (
    <AuthSplitLayout title="Entrar" subtitle="Acesse sua conta FinIA Control">
      <LoginForm redirect={redirect} />
    </AuthSplitLayout>
  );
}
