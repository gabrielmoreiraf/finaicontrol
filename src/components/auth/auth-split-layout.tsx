import { AuthBrandMark } from "@/components/auth/auth-brand-mark";
import { AuthCardShell } from "@/components/auth/auth-card-shell";
import { AuthFooterLinks } from "@/components/auth/auth-footer-links";
import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel";
import { AuthRainAnimation } from "@/components/auth/auth-rain-animation";
import { FooterCopyright } from "@/components/brand/footer-copyright";
import { cn } from "@/lib/utils";

export function AuthSplitLayout({
  children,
  title,
  subtitle,
  showMarketing = true,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showMarketing?: boolean;
}) {
  return (
    <div className="auth-page fixed inset-0 z-20 bg-black text-white">
      {/* Camada de fundo */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-black">
        <div className="auth-dot-grid absolute inset-0 opacity-20" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(0,192,139,0.06) 0%, transparent 70%)",
          }}
        />
        <AuthRainAnimation />
      </div>

      <main className="auth-main relative z-10">
        <div
          className={cn(
            "auth-fit mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-6 lg:gap-10",
            showMarketing && "lg:flex-row lg:items-center lg:justify-between",
          )}
        >
          {showMarketing && (
            <div className="hidden min-h-0 lg:flex lg:min-w-0 lg:flex-1 lg:items-center">
              <AuthMarketingPanel />
            </div>
          )}

          <div className="auth-brand-column w-full max-w-[min(100%,520px)] shrink-0">
            <AuthBrandMark />
            <AuthCardShell title={title} subtitle={subtitle}>
              {children}
            </AuthCardShell>
          </div>
        </div>
      </main>

      <footer className="auth-footer relative z-50 flex shrink-0 flex-col items-center justify-center gap-3 px-4 pb-6 text-center opacity-70 md:flex-row md:items-end md:justify-between">
        <FooterCopyright
          variant="auth"
          className="items-center md:items-start md:text-left"
        />
        <AuthFooterLinks />
      </footer>
    </div>
  );
}
