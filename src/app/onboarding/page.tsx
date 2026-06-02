import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getPostAuthPath } from "@/lib/auth/post-auth-redirect";
import { getCurrentUser } from "@/lib/auth/session";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");
  if (user.onboardingComplete) redirect("/dashboard");

  return (
    <AuthLayout
      title="Onboarding financeiro"
      subtitle="Só o essencial para começar. Receitas, despesas, dívidas e metas você cadastra depois no app."
    >
      <OnboardingWizard />
    </AuthLayout>
  );
}
