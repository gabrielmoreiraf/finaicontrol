import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function EsqueciSenhaPage() {
  return (
    <AuthSplitLayout
      title="Recuperar senha"
      subtitle="Enviaremos um link para você criar uma nova senha"
      showMarketing={false}
    >
      <ForgotPasswordForm />
    </AuthSplitLayout>
  );
}
