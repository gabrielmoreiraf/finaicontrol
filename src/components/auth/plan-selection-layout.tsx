import { AuthFooterLinks } from "@/components/auth/auth-footer-links";
import { AuthRainAnimation } from "@/components/auth/auth-rain-animation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { FooterCopyright } from "@/components/brand/footer-copyright";

export function PlanSelectionLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="auth-page fixed inset-0 z-20 overflow-y-auto bg-black text-white">
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

      <div className="pointer-events-none absolute left-5 top-5 z-50 sm:left-8 sm:top-6">
        <BrandLogo
          variant="full"
          size="lg"
          href={null}
          priority
          className="pointer-events-auto"
          imageClassName="h-[4.5rem] w-auto max-w-[340px] sm:h-20 sm:max-w-[420px] lg:h-24 lg:max-w-[500px] xl:h-28 xl:max-w-[580px]"
        />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-white/60 sm:text-base">{subtitle}</p>
        </div>
        {children}
      </main>

      <footer className="auth-footer relative z-50 flex shrink-0 flex-col items-center justify-center gap-3 px-4 pb-6 text-center opacity-70 md:flex-row md:items-end md:justify-between">
        <FooterCopyright variant="auth" className="items-center md:items-start md:text-left" />
        <AuthFooterLinks />
      </footer>
    </div>
  );
}
