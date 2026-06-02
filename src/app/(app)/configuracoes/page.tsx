import { LogOut, Settings } from "lucide-react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ProfileAvatarUpload } from "@/components/app/profile-avatar-upload";
import { ChangePasswordForm } from "@/components/app/change-password-form";
import { ProfileForm } from "@/components/app/profile-form";
import { SettingsPlanCard } from "@/components/app/settings-plan-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signOutAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";

export default async function ConfiguracoesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");

  const plan = user.plan;
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 xl:max-w-4xl 2xl:max-w-5xl">
      <h1 className="text-3xl font-bold xl:text-4xl">Configurações</h1>

      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-4">
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl border border-brand/25 bg-brand/10">
            <Settings className="size-5 text-brand" aria-hidden />
          </div>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Gerencie suas informações pessoais.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProfileAvatarUpload userName={user.name} avatarUrl={user.avatarUrl} />
          <ProfileForm
            email={user.email}
            emailVerified={user.emailVerified}
            defaultName={user.name}
            defaultProfession={profile?.profession ?? ""}
            defaultIncome={Number(profile?.fixedMonthlyIncome ?? 0)}
          />
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <SettingsPlanCard planId={plan} />

      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Sessão</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signOutAction}>
            <Button type="submit" variant="outline">
              <LogOut className="h-4 w-4" />
              Sair da conta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
