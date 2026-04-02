import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

interface CTASectionProps {
  eyebrow?: string;
  title?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function CTASection({
  eyebrow = "Get Started",
  title = "Ready to Take the First Step for Your Child?",
  primaryLabel = "Book a Free Consultation",
  primaryHref = "/contact",
  secondaryLabel = "Learn About Our Services",
  secondaryHref = "/services",
}: CTASectionProps) {
  return (
    <section className="pb-20">
      <div className="section">
        <div className="relative overflow-hidden rounded-4xl bg-dark-section px-6 py-12 text-dark-section-foreground shadow-(--soft-shadow) sm:px-10 lg:px-14">
          <div className="absolute -right-12 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="absolute right-10 top-1/2 hidden h-40 w-40 -translate-y-1/2 rotate-45 border border-white/8 md:block" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-sm text-white/60">[{eyebrow}]</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {title}
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href={primaryHref}>{primaryLabel}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
