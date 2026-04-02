import React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Building,
  CalendarDays,
  Flame,
  HeartPulse,
  Instagram,
  Linkedin,
  Mic,
  Phone,
  Shield,
  Star,
  Stethoscope,
  Twitter,
  User,
  Users,
  Video,
} from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import Image from "next/image";
import { Badge } from "@workspace/ui/components/badge";

const services = [
  {
    id: "001",
    title: "Individual Therapy",
    subtitle: "Personalized care for your mental well-being",
    desc: "Work one-on-one with licensed therapists to address anxiety, depression, stress, or personal challenges - all in a safe, confidential space.",
    icon: User,
  },
  {
    id: "002",
    title: "Couples & Family Counseling",
    subtitle: "Stronger relationships through guided conversations",
    desc: "Navigate relationship struggles, parenting challenges, or family conflicts with structured, supportive sessions.",
    icon: Users,
  },
  {
    id: "003",
    title: "Corporate Wellness Programs",
    subtitle: "Mental health solutions for modern teams",
    desc: "We design and deliver therapy access, workshops, and emotional resilience programs tailored to your company's workforce.",
    icon: Building,
  },
  {
    id: "004",
    title: "Psychiatric Evaluation",
    subtitle: "Professional diagnosis and treatment plans",
    desc: "Our certified psychiatrists provide assessments, prescribe medication (if needed), and offer ongoing supervision and care.",
    icon: Stethoscope,
  },
  {
    id: "005",
    title: "Online Therapy (Telehealth)",
    subtitle: "Support that fits your schedule",
    desc: "Book virtual appointments with your preferred therapist from anywhere, on any device. Flexible, private, and secure.",
    icon: Video,
  },
  {
    id: "006",
    title: "Stress & Burnout Management",
    subtitle: "Reclaim energy and emotional balance",
    desc: "Specialized programs for high-pressure lifestyles - ideal for professionals, students, and caregivers facing burnout.",
    icon: Flame,
  },
];

const doctors = [
  {
    name: "Kauva Qader",
    role: "Cardiologist",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "Elena Morris",
    role: "Psychiatrist",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "Kauva Qader",
    role: "Cardiologist",
    image:
      "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=900&q=80",
    featured: true,
  },
  {
    name: "Ariana Blake",
    role: "Therapist",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "Nina Cole",
    role: "Neurologist",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
];

const steps = [
  {
    id: "1",
    title: "Find a Specialist",
    description: "Use filters to choose the best match for your needs.",
  },
  {
    id: "2",
    title: "Book an Appointment",
    description: "Pick a time that works for you — online or in person.",
  },
  {
    id: "3",
    title: "Start Your Healing Journey",
    description:
      "Take your doctor’s guidance and begin your personalized care.",
  },
];

const testimonials = [
  {
    name: "Robert Mills",
    role: "Founder at NeoCare",
    text: "The support feels thoughtful, calm, and deeply professional. Booking and follow-up became effortless.",
  },
  {
    name: "Elya Madison",
    role: "CEO at Future HealthCo",
    text: "Our family found the right specialist quickly, and the whole care journey felt modern and reassuring.",
  },
  {
    name: "Natalie Johnson",
    role: "Head of Wellness",
    text: "The virtual experience was smooth and private. It gave us confidence from the first appointment.",
  },
  {
    name: "Cody Fisher",
    role: "COO at ArrowCorp",
    text: "The interface feels premium, but more importantly the care journey is clear, accessible, and human.",
  },
  {
    name: "Albert Flores",
    role: "CFO at ArrowCorp",
    text: "Everything from appointment flow to reminders was intuitive. It feels designed for real patients.",
  },
  {
    name: "Ralph Edwards",
    role: "Product Lead",
    text: "The experience reduces friction at every step. That matters a lot in healthcare where trust is everything.",
  },
  {
    name: "Sarah Mitchell",
    role: "Operations Manager",
    text: "Finding the right therapist has never been easier. The platform matches you thoughtfully and respects your privacy completely.",
  },
  {
    name: "Marcus Chen",
    role: "Director at Wellness Plus",
    text: "We recommend this to all our employees. The care quality and user experience set a new standard in telehealth.",
  },
];

function HeroIconBox({
  icon: Icon,
  className = "",
}: {
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <div
      className={`flex-center size-11 rounded-2xl border border-white/35 bg-white/15 text-white backdrop-blur-md ${className}`}
    >
      <Icon className="size-4.5" />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="pt-6 sm:pt-8">
      <div className="section">
        <div className="relative overflow-hidden rounded-tl-4xl rounded-tr-4xl bg-linear-to-b from-primary to-secondary sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          {/* main grid */}
          <div className="absolute inset-0 opacity-50 bg-[linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-size-[72px_72px]" />

          {/* intersection pluses made from small lines */}
          <div className="pointer-events-none absolute inset-0 z-1">
            {[
              { left: "20%", top: "20%" },
              { left: "34%", top: "42%" },
              { left: "58%", top: "24%" },
              { left: "74%", top: "38%" },
              { left: "84%", top: "62%" },
            ].map((item, i) => (
              <div
                key={i}
                className="absolute size-8 -translate-x-1/2 -translate-y-1/2"
                style={{ left: item.left, top: item.top }}
              >
                <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/55" />
                <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-white/55" />
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-2 h-[20%] bg-linear-to-b from-transparent via-secondary/70 to-secondary" />

          <div className="relative z-10">
            <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1fr]">
              <div className="flex-1 lg:justify-self-end">
                <Badge
                  variant="secondary"
                  appearance="solid"
                  className="px-4 py-2 mb-2"
                >
                  #1 Best Medical Center in the World
                </Badge>

                <h1 className="max-w-xl text-5xl! font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                  We bring professional mental health support.
                </h1>

                <p className="mt-5 max-w-lg text-base leading-8 text-white/80 sm:text-lg">
                  Delivering comprehensive mental health support through an
                  innovative platform that seamlessly connects you to care.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Button variant="secondary">Get Started Now</Button>
                  <Button size="lg">Book Appointment</Button>
                </div>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                  <div className="w-full max-w-60 rounded-3xl border border-white/60 bg-white/80 p-4 shadow-(--card-shadow) backdrop-blur-md">
                    <div className="mb-4 flex -space-x-2">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <div
                          key={item}
                          className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-[linear-gradient(135deg,var(--hero-from),var(--hero-to))]"
                        />
                      ))}
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-primary text-xs font-semibold text-white">
                        +
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      More than 150 experienced doctors around the world
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-(--card-shadow) backdrop-blur-md xl:hidden">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        24 hour service
                      </p>
                      <p className="text-base font-semibold tracking-tight text-foreground">
                        (302) 555-0107
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-end">
                <div className="hidden items-center gap-2 md:flex border rounded-full p-1 w-max ml-auto absolute top-0 right-0">
                  {[Linkedin, Instagram, Twitter].map((Icon, i) => (
                    <HeroIconBox key={i} icon={Icon} className="rounded-full" />
                  ))}
                </div>

                {/* doctor image fade at bottom */}
                <div className="relative">
                  <Image
                    src="/images/hero-image.png"
                    width={500}
                    height={500}
                    alt="Doctor"
                    className="-mt-20 mask-[linear-gradient(to_bottom,black_0%,black_78%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_78%,transparent_100%)]"
                  />

                  {/* image bottom mist matching hero bottom */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-secondary via-secondary/70 to-transparent blur-xl" />
                </div>

                <div className="absolute top-[70%] -left-8 z-10 hidden -translate-y-1/2 xl:flex">
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-white/60 bg-white/85 px-4 py-3 shadow-(--card-shadow) backdrop-blur-md">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        24 hour service
                      </p>
                      <p className="text-base font-semibold tracking-tight text-foreground">
                        (302) 555-0107
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* lower content */}
            <div className="relative mt-4 xl:-mt-20 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              {/* top mist on this lower block */}
              <div className="pointer-events-none absolute inset-x-[10%] -top-8 h-16 rounded-full bg-white/10 blur-2xl" />

              <div className="flex items-center gap-4">
                <div className="relative flex-center size-16 rounded-full border border-white/55 bg-white/18 backdrop-blur-md">
                  <div className="absolute inset-0 rounded-full border border-white/35 animate-ping" />
                  <div className="absolute -inset-2.5 rounded-full border border-white/20" />
                  <Video className="size-6 text-white" />
                </div>

                <div className="rounded-full border border-white/55 bg-white/82 px-5 py-3 text-sm font-medium text-foreground shadow-(--card-shadow) backdrop-blur-md">
                  How We Work
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                <div className="relative flex items-center gap-4 rounded-[1.4rem] rounded-tr-4xl border border-white/60 bg-white/85 px-4 py-3 shadow-(--card-shadow) backdrop-blur-md">
                  <Image
                    src="https://img.freepik.com/free-photo/close-up-portrait-curly-handsome-european-male_176532-8133.jpg?&w=200"
                    alt="Profile Pic"
                    width={48}
                    height={48}
                    className="size-10 rounded-full object-cover"
                  />
                  <p className="text-sm font-medium text-foreground">
                    Calling.........
                  </p>
                  <div className="flex-center absolute -top-3 -right-3 size-10 rounded-full bg-white text-foreground shadow-(--card-shadow)">
                    <ArrowUpRight className="size-5" />
                  </div>
                </div>

                <div className="flex items-center gap-5 rounded-2xl border border-white/60 bg-white/85 px-4 py-2 shadow-(--card-shadow) backdrop-blur-md">
                  <Button
                    size="icon"
                    appearance="soft"
                    className="size-10 rounded-full"
                  >
                    <Video className="size-5" />
                  </Button>

                  <div className="flex-center size-10 rounded-full bg-destructive text-destructive-foreground shadow-sm">
                    <Phone className="rotate-135" />
                  </div>

                  <Button
                    size="icon"
                    appearance="soft"
                    className="size-10 rounded-full"
                  >
                    <Mic className="size-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* final layer that hides border/radius at the very bottom edge */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-4 h-10 bg-secondary" />
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section className="py-20 section">
      <SectionHeader
        title="Medical Services You Can Rely On"
        description="Comprehensive healthcare solutions designed to keep you and your family healthy at every stage of life."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader className="flex-row justify-between">
              <Button size="icon" appearance="soft" className="size-12">
                {<service.icon className="size-6" />}
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                {service.id}
              </span>
            </CardHeader>
            <CardContent>
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                {service.title}
              </h3>
              <p className="text-muted-foreground font-medium mt-2 mb-3">
                {service.subtitle}
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                {service.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function DoctorsSection() {
  return (
    <section className="bg-secondary py-20">
      <div className="section space-y-10">
        <SectionHeader
          title="Doctors Who Listen. Experts You Can Trust."
          description="Meet our dedicated team of healthcare professionals committed to providing exceptional care tailored to your needs."
        />

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5">
          {doctors.map((doctor, index) => (
            <div
              key={`${doctor.name}-${index}`}
              className="group relative overflow-hidden rounded-[1.75rem] border-2 border-white bg-card shadow-card"
            >
              <div className="relative aspect-[0.82] overflow-hidden">
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  fill
                  className="size-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                />
              </div>

              <div className="pointer-events-none absolute inset-x-4 bottom-4 translate-y-6 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="rounded-[1.4rem] border border-white/80 bg-white/90 p-4 shadow-(--soft-shadow) backdrop-blur-md">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {doctor.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {doctor.role}
                  </p>
                  <Button className="mt-4 w-full">Book Appointment</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepsSection() {
  return (
    <section className="relative py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_bottom,rgba(214,190,255,0.35),transparent_28%),radial-gradient(circle_at_center_top,rgba(235,213,255,0.3),transparent_24%),radial-gradient(circle_at_right_bottom,rgba(222,201,255,0.26),transparent_22%),linear-gradient(135deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.98)_20%,rgba(250,243,255,0.96)_50%,rgba(255,255,255,0.98)_78%,rgba(255,255,255,1)_100%)]" />

      <div className="section space-y-10 relative">
        <SectionHeader
          title="Doctors Who Listen. Experts You Can Trust."
          description="Meet our dedicated team of healthcare professionals committed to providing exceptional care tailored to your needs."
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.id} className="relative">
              <CardContent>
                <Button size="icon" appearance="soft" className="size-12">
                  {step.id === "1" ? (
                    <Shield className="size-5" />
                  ) : step.id === "2" ? (
                    <CalendarDays className="size-5" />
                  ) : (
                    <HeartPulse className="size-5" />
                  )}
                </Button>
                <span className="absolute right-6 top-4 text-6xl font-semibold leading-none text-primary/10">
                  {step.id}
                </span>
                <h3 className="mt-8 text-2xl font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {step.description}
                </p>
                <Button
                  href="#"
                  variant="link"
                  className="mt-6 text-sm font-medium"
                >
                  Learn More <ArrowRight />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button className="min-w-40">Get Started</Button>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="section space-y-10">
        <SectionHeader
          title="You’re Not Alone, Hear From Our Community"
          align="center"
        />

        <div className="relative">
          <div className="pointer-events-none absolute inset-x-10 -top-10 h-24 rounded-full bg-white/90 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-10 -bottom-10 h-24 rounded-full bg-white/90 blur-3xl" />

          <div className="relative grid gap-5 md:grid-cols-3 xl:grid-cols-4">
            {testimonials.map((item, index) => (
              <Card key={`${item.name}-${index}`} className="rounded-3xl">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                      {item.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {item.role}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {item.text}
                  </p>
                  <div className="mt-4 flex gap-1 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} className="fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MedMeLandingPage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <DoctorsSection />
      <StepsSection />
      <TestimonialsSection />
    </>
  );
}
