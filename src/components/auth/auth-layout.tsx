import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

/** Layout compacto para onboarding (sem painel de marketing). */
export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <AuthSplitLayout title={title} subtitle={subtitle} showMarketing={false}>
      {children}
    </AuthSplitLayout>
  );
}
