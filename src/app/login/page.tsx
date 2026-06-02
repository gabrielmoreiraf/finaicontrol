import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthSplitLayout title="Entrar" subtitle="Acesse sua conta FinIA Control">
      <LoginForm />
    </AuthSplitLayout>
  );
}
