import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignupForm } from "@/components/auth/signup-form";

export default function CadastroPage() {
  return (
    <AuthSplitLayout title="Criar conta" subtitle="Comece a organizar suas finanças em poucos minutos">
      <SignupForm />
    </AuthSplitLayout>
  );
}
