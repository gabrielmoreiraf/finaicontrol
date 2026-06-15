import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignupForm } from "@/components/auth/signup-form";
import { getValidInvitation } from "@/lib/auth/invitation";
import { getPlanLabel } from "@/lib/plans";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite: inviteParam } = await searchParams;
  const invite = inviteParam ? await getValidInvitation(inviteParam) : null;

  const subtitle = invite
    ? invite.plan
      ? `Você foi convidado com o plano ${getPlanLabel(invite.plan)}. Complete seu cadastro.`
      : "Você foi convidado. Complete seu cadastro e escolha seu plano."
    : "Comece a organizar suas finanças em poucos minutos";

  return (
    <AuthSplitLayout title="Criar conta" subtitle={subtitle}>
      <SignupForm
        invite={
          invite ? { token: invite.token, email: invite.email, plan: invite.plan } : null
        }
      />
    </AuthSplitLayout>
  );
}
