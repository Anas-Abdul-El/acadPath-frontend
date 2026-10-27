import { AboutSection } from "@/components/landing/about/about-section";
import { ClosingCta } from "@/components/landing/closingCta/closing-cta";
import { FeaturesSection } from "@/components/landing/features/features-section";
import { Hero } from "@/components/landing/header/hero";
import { HowItWorksSection } from "@/components/landing/howItWorks/how-it-works-section";
import { SiteFooter } from "@/components/landing/footer/site-footer";
import { SiteHeader } from "@/components/landing/nav/site-header";

export function LandingPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-60 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <FeaturesSection />
        <HowItWorksSection />
        <AboutSection />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
