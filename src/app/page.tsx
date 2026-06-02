import dynamic from "next/dynamic";
import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { Footer } from "@/components/landing/footer";

const PainPointsSection = dynamic(
  () =>
    import("@/components/landing/pain-points-section").then((m) => m.PainPointsSection),
  { loading: () => null },
);
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
const DashboardSection = dynamic(
  () =>
    import("@/components/landing/dashboard-section").then((m) => m.DashboardSection),
  { loading: () => null },
);
const VariableIncomeSection = dynamic(
  () =>
    import("@/components/landing/variable-income-section").then(
      (m) => m.VariableIncomeSection,
    ),
  { loading: () => null },
);
const AiSection = dynamic(
  () => import("@/components/landing/ai-section").then((m) => m.AiSection),
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
    <div className="landing-page">
      <Header />
      <main>
        <HeroSection />
        <PainPointsSection />
        <HowItWorksSection />
        <ProductModulesSection />
        <DashboardSection />
        <VariableIncomeSection />
        <AiSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
