import { ArrowRight, CheckCircle } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";
import CTASection from "@/components/sections/CTASection";
import StepsSection from "@/components/sections/StepsSection";
import { abaServices } from "@/components/sections/ServicesSection";

const serviceDetails: Record<
  string,
  { highlights: string[]; who: string }
> = {
  "001": {
    highlights: [
      "One-on-one sessions with a certified BCBA or RBT",
      "Skill acquisition and behavior reduction programs",
      "Regular data collection and progress analysis",
      "Parent updates after every session",
    ],
    who: "Children ages 2–18 with autism or developmental differences",
  },
  "002": {
    highlights: [
      "Designed for children ages 2–6",
      "Focus on communication, play, and daily living skills",
      "Intensive, naturalistic teaching methods",
      "Research shows the greatest gains happen early",
    ],
    who: "Toddlers and preschoolers recently diagnosed with ASD",
  },
  "003": {
    highlights: [
      "Small group and individual formats available",
      "Structured peer interaction activities",
      "Emotional regulation and conversational skills",
      "Taught in natural, real-world settings",
    ],
    who: "Children and teens who want to improve peer relationships",
  },
  "004": {
    highlights: [
      "Hands-on training in ABA strategies",
      "Learn to use reinforcement systems at home",
      "Reduce challenging behaviors outside of sessions",
      "Bi-weekly or monthly coaching sessions",
    ],
    who: "Parents, grandparents, siblings, and other caregivers",
  },
  "005": {
    highlights: [
      "Direct collaboration with teachers and school staff",
      "Individualized behavior support plans (BSP)",
      "Classroom observation and feedback",
      "IEP goal development support",
    ],
    who: "School-age children needing behavioral support in class",
  },
  "006": {
    highlights: [
      "Comprehensive intake and skills assessment",
      "Standardized assessment tools (VB-MAPP, ABLLS-R)",
      "Identifies strengths, deficits, and priority goals",
      "Forms the foundation of the treatment plan",
    ],
    who: "New clients beginning their ABA therapy journey",
  },
};

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-6 sm:pt-8">
        <div className="section">
          <div className="relative overflow-hidden rounded-tl-4xl rounded-tr-4xl bg-secondary px-6 py-16 sm:px-10 sm:py-20 lg:px-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(var(--primary-rgb),0.08),transparent_60%)]" />
            <div className="relative max-w-2xl">
              <Badge variant="secondary" appearance="solid" className="px-4 py-2 mb-4">
                Our Services
              </Badge>
              <h1 className="text-5xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
                Comprehensive ABA Therapy Programs
              </h1>
              <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
                From early intervention to school-based support, we offer a full range
                of evidence-based services designed to meet your child where they are
                and take them further.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild>
                  <Link href="/contact">Get Started</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/doctors">Meet Our Team</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services detail */}
      <section className="py-20 section space-y-12">
        <SectionHeader
          title="What We Offer"
          description="Every program is delivered by certified professionals and customized to each child's unique needs."
        />

        <div className="space-y-6">
          {abaServices.map((service) => {
            const detail = serviceDetails[service.id];
            return (
              <Card key={service.id} className="overflow-hidden">
                <CardContent className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <service.icon className="size-6" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {service.id}
                      </span>
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-primary">
                      {service.subtitle}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                      {service.desc}
                    </p>
                    <Button
                      variant="link"
                      className="mt-4 px-0 text-sm"
                      asChild
                    >
                      <Link href="/contact">
                        Inquire About This Service <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>

                  {detail && (
                    <div className="rounded-2xl bg-secondary p-6 space-y-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                          What's Included
                        </p>
                        <ul className="space-y-2">
                          {detail.highlights.map((h) => (
                            <li
                              key={h}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="border-t border-border pt-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                          Best For
                        </p>
                        <p className="text-sm text-muted-foreground">{detail.who}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <StepsSection />

      <CTASection
        eyebrow="Services"
        title="Not Sure Which Service Is Right for Your Child?"
        primaryLabel="Talk to Our Team"
        primaryHref="/contact"
        secondaryLabel="View Our Doctors"
        secondaryHref="/doctors"
      />
    </>
  );
}
