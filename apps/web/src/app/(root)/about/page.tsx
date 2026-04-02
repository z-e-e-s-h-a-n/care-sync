import {
  Award,
  BookOpen,
  CheckCircle,
  Heart,
  Lightbulb,
  Shield,
} from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import Image from "next/image";
import Link from "next/link";
import CTASection from "@/components/sections/CTASection";
import { featuredTeam } from "@/components/sections/DoctorsSection";

const values = [
  {
    icon: Heart,
    title: "Compassion First",
    description:
      "We treat every child and family with empathy, respect, and genuine care — every single session.",
  },
  {
    icon: Shield,
    title: "Evidence-Based Practice",
    description:
      "Every intervention is grounded in the science of Applied Behavior Analysis, ensuring the most effective outcomes.",
  },
  {
    icon: Lightbulb,
    title: "Individualized Care",
    description:
      "No two children are the same. We tailor every treatment plan to the unique strengths and goals of each child.",
  },
  {
    icon: BookOpen,
    title: "Family Collaboration",
    description:
      "We partner closely with parents and caregivers, equipping them with the tools to support progress at home.",
  },
  {
    icon: Award,
    title: "Clinical Excellence",
    description:
      "Our team of BCBAs and RBTs hold the highest certifications and are committed to ongoing professional development.",
  },
  {
    icon: CheckCircle,
    title: "Transparency & Trust",
    description:
      "We share detailed progress reports and data so families always know exactly how their child is advancing.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-6 sm:pt-8">
        <div className="section">
          <div className="relative overflow-hidden rounded-tl-4xl rounded-tr-4xl bg-secondary px-6 py-16 sm:px-10 sm:py-20 lg:px-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(var(--primary-rgb),0.08),transparent_60%)]" />
            <div className="relative mx-auto max-w-3xl text-center">
              <Badge variant="secondary" appearance="solid" className="px-4 py-2 mb-4">
                About Us
              </Badge>
              <h1 className="text-5xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
                We Help Children Thrive Through ABA
              </h1>
              <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg max-w-2xl mx-auto">
                Ready Set and Go ABA was founded with one mission: to deliver the highest
                quality Applied Behavior Analysis therapy to children and families who need it most.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link href="/contact">Book a Consultation</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/services">Our Services</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="py-20 section">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge variant="secondary" appearance="soft" className="mb-4">
              Our Mission
            </Badge>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Empowering Every Child to Reach Their Potential
            </h2>
            <p className="mt-5 text-sm leading-8 text-muted-foreground sm:text-base">
              Applied Behavior Analysis is one of the most effective, research-backed
              approaches for children with autism and developmental differences. At
              Ready Set and Go ABA, we combine clinical expertise with genuine care
              to create lasting change in children's lives.
            </p>
            <p className="mt-4 text-sm leading-8 text-muted-foreground sm:text-base">
              We work closely with each family to understand their child's unique needs,
              craft an individualized treatment plan, and measure progress every step of
              the way — because data-driven therapy means better outcomes.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Board Certified Behavior Analysts (BCBAs) on every case",
                "In-home, clinic, and school-based services",
                "Insurance accepted — we handle the paperwork",
                "Regular family training and progress updates",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-secondary lg:aspect-auto lg:h-[480px]">
            <Image
              src="https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=900&q=80"
              alt="ABA Therapy Session"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-secondary">
        <div className="section space-y-10">
          <SectionHeader
            title="The Values Behind Everything We Do"
            description="Our clinical approach and our culture are shaped by principles that put children and families at the center."
            align="center"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <value.icon className="size-6" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team preview */}
      <section className="py-20 section space-y-10">
        <SectionHeader
          title="Meet the People Behind the Practice"
          description="Our team of certified specialists brings years of clinical experience and a shared passion for helping children succeed."
        />
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {featuredTeam.map((member, index) => (
            <div
              key={`${member.name}-${index}`}
              className="group relative overflow-hidden rounded-[1.75rem] border-2 border-border bg-card shadow-card"
            >
              <div className="relative aspect-[0.82] overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="size-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                />
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {member.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/doctors">View Full Team</Link>
          </Button>
        </div>
      </section>

      <CTASection
        eyebrow="Join Us"
        title="Let's Start Your Child's Journey Together"
        primaryLabel="Book a Free Consultation"
        primaryHref="/contact"
        secondaryLabel="View Our Services"
        secondaryHref="/services"
      />
    </>
  );
}
