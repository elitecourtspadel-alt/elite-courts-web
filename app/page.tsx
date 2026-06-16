import Link from "next/link";
import { ArrowRight, ShieldCheck, ShoppingBag, Star, Trophy, Users } from "lucide-react";
import { HeroSlider } from "@/components/hero-slider";
import { AmenitiesGrid } from "@/components/amenities-grid";
import { Container } from "@/components/layout/container";
import { LocationPreview } from "@/components/location-preview";
import { MembershipCard } from "@/components/membership-grid";
import { PricingPackageCard } from "@/components/pricing/package-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { SportCard } from "@/components/sport-card";
import { CtaBanner } from "@/components/cta-banner";
import { NewPackagesSection } from "@/components/home/new-packages-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { pageContent, reasonsToChoose, siteConfig, sports } from "@/data/siteContent";
import { featuredHomePackages, memberships, packagePriceRange, quickPricingHighlights, visiblePackages } from "@/data/packages";

const schema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "SportsActivityLocation"],
  name: siteConfig.name,
  url: siteConfig.siteUrl,
  description: siteConfig.locationSummary,
  telephone: "+92 308 4708858",
  email: siteConfig.email,
  priceRange: packagePriceRange,
  address: {
    "@type": "PostalAddress",
    streetAddress: "23-A, P&D Cooperative Housing Society, Main Canal Road",
    addressLocality: "Lahore",
    addressCountry: "PK",
  },
  areaServed: "Lahore",
  sameAs: siteConfig.socialLinks.map((item) => item.href),
  makesOffer: visiblePackages.slice(0, 12).map((item) => ({
    "@type": "Offer",
    name: item.title,
    price: item.discountedPrice,
    priceCurrency: "PKR",
    availability: "https://schema.org/InStock",
  })),
};

export default function HomePage() {
  const home = pageContent.home;

  return (
    <>
      <JsonLd data={schema} />
      <HeroSlider />

      {/* ── ELITE STORE HERO BANNER ── prominent, first thing after slider */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12 sm:py-16">
        {/* decorative glow */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

        <Container className="relative z-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Now Open</p>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Elite Courts Store
            </h2>
            <p className="max-w-md text-sm leading-6 text-slate-300">
              Premium sports gear, apparel, and accessories — everything you need to play your best game.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:items-end">
            <Button
              asChild
              size="lg"
              className="group min-w-[200px] rounded-xl bg-amber-500 px-8 py-6 text-base font-bold text-slate-900 shadow-[0_0_40px_-8px_rgba(245,158,11,0.7)] transition-all duration-300 hover:scale-105 hover:bg-amber-400 hover:shadow-[0_0_56px_-6px_rgba(245,158,11,0.9)]"
            >
              <Link href="/store">
                <ShoppingBag className="mr-2 h-5 w-5 transition-transform duration-200 group-hover:-rotate-6" />
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
            <p className="text-xs text-slate-400">Free delivery on orders over Rs 5,000</p>
          </div>
        </Container>
      </section>

      <NewPackagesSection />

      <section className="py-16 sm:py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow={home.sports.eyebrow}
            title={home.sports.title}
            description={home.sports.description}
            maxWidth="wide"
            actions={
              <Button asChild variant="secondary">
                <Link href="/sports">
                  {home.sports.actionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {sports.map((sport, index) => (
              <Reveal key={sport.slug} delay={index * 0.05}>
                <SportCard sport={sport} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-[color:var(--border)] bg-[color:var(--surface-soft)] py-16 sm:py-20">
        <Container className="space-y-10">
          <SectionHeading eyebrow={home.why.eyebrow} title={home.why.title} description={home.why.description} maxWidth="wide" />
          <div className="grid gap-6 lg:grid-cols-3">
            {reasonsToChoose.map((reason, index) => {
              const icons = [ShieldCheck, Users, Star] as const;
              const Icon = icons[index] || Star;
              return (
                <Reveal key={reason.title} delay={index * 0.05}>
                  <Card className="group h-full hover:-translate-y-1 hover:shadow-[0_28px_70px_-40px_rgba(8,145,178,0.22)]">
                    <CardContent className="space-y-4">
                      <div className="inline-flex rounded-2xl bg-[color:var(--accent-soft)] p-3 text-[color:var(--accent-strong)] transition-transform duration-200 group-hover:-translate-y-0.5">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-display text-2xl font-semibold text-[color:var(--text)]">{reason.title}</h3>
                        <p className="text-sm leading-7 text-[color:var(--muted)]">{reason.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-6">
            <SectionHeading eyebrow={home.pricing.eyebrow} title={home.pricing.title} description={home.pricing.description} />
            <div className="space-y-4">
              {quickPricingHighlights.map((item) => (
                <Card key={item} className="hover:-translate-y-0.5 hover:border-cyan-400/20">
                  <CardContent className="p-5 text-sm leading-7 text-[color:var(--text)]">{item}</CardContent>
                </Card>
              ))}
            </div>
            <Button asChild variant="secondary">
              <Link href="/pricing">
                {home.pricing.actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {featuredHomePackages.map((item) => (
              <PricingPackageCard key={item.id} item={item} compact />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-[color:var(--border)] bg-[color:var(--surface-soft)] py-16 sm:py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow={home.memberships.eyebrow}
            title={home.memberships.title}
            description={home.memberships.description}
            actions={
              <Button asChild variant="secondary">
                <Link href="/memberships">
                  {home.memberships.actionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {memberships.map((membership, index) => (
              <Reveal key={membership.slug} delay={index * 0.05}>
                <MembershipCard membership={membership} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {siteConfig.showCustomerReviews && <TestimonialsSection />}

      <section className="py-16 sm:py-20">
        <Container className="space-y-10">
          <SectionHeading eyebrow={home.amenities.eyebrow} title={home.amenities.title} description={home.amenities.description} maxWidth="wide" />
          <AmenitiesGrid />
        </Container>
      </section>

      <section className="border-y border-[color:var(--border)] bg-[color:var(--surface-soft)] py-16 sm:py-20">
        <Container className="space-y-10">
          <SectionHeading eyebrow={home.location.eyebrow} title={home.location.title} description={home.location.description} maxWidth="wide" />
          <LocationPreview />
        </Container>
      </section>

      {/* ── TOURNAMENT PILL ── subtle, near the footer */}
      <div className="border-b border-[color:var(--border)] bg-[color:var(--surface-soft)] py-4">
        <Container className="flex justify-center">
          <Link
            href="/pickleball-tournament"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-xs font-medium text-[color:var(--muted)] transition-colors hover:border-emerald-400/40 hover:text-emerald-600"
          >
            <Trophy className="h-3.5 w-3.5" />
            Live Tournament Bracket
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Container>
      </div>

      <CtaBanner title={home.cta.title} description={home.cta.description} />
    </>
  );
}
