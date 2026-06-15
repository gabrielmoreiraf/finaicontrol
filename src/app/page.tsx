import dynamic from "next/dynamic";
import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { Footer } from "@/components/landing/footer";

const HowItWorksSection = dynamic(
  () =>
    import("@/components/landing/how-it-works-section").then((m) => m.HowItWorksSection),
  { loading: () => null },
);
const ProductModulesSection = dynamic(
  () =>
    import("@/components/landing/product-modules-section").then(
      (m) => m.ProductModulesSection,
    ),
  { loading: () => null },
);
const VariableIncomeSection = dynamic(
  () =>
    import("@/components/landing/variable-income-section").then(
      (m) => m.VariableIncomeSection,
    ),
  { loading: () => null },
);
const PricingSection = dynamic(
  () => import("@/components/landing/pricing-section").then((m) => m.PricingSection),
  { loading: () => null },
);
const CtaSection = dynamic(
  () => import("@/components/landing/cta-section").then((m) => m.CtaSection),
  { loading: () => null },
);

export default function HomePage() {
  return (
    // `dark` força o tema escuro fixo na landing, independente da preferência
    // do usuário logado (a landing foi desenhada para ser sempre dark).
    <div className="landing-page dark">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <ProductModulesSection />
        <VariableIncomeSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
