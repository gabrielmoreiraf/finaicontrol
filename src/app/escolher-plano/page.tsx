import { redirect } from "next/navigation";
import { PlanSelectionForm } from "@/components/auth/plan-selection-form";
import { PlanSelectionLayout } from "@/components/auth/plan-selection-layout";
import { getPostAuthPath } from "@/lib/auth/post-auth-redirect";
import { getCurrentUser } from "@/lib/auth/session";

export default async function EscolherPlanoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.plan) {
    redirect(getPostAuthPath(user));
  }

  return (
    <PlanSelectionLayout
      title="Escolha seu plano"
      subtitle="Comece grátis e evolua quando quiser. Por enquanto, só o plano Gratuito está ativo."
    >
      <PlanSelectionForm />
    </PlanSelectionLayout>
  );
}
