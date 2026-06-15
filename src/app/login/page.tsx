import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <AuthSplitLayout title="Entrar" subtitle="Acesse sua conta FinIA Control">
      <LoginForm redirect={redirect} />
    </AuthSplitLayout>
  );
}
