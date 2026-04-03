import React from "react";
import {
  ArrowUpRight,
  Instagram,
  Linkedin,
  Mic,
  Phone,
  Twitter,
  Video,
} from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import Image from "next/image";

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

export default function HeroSection() {
  return (
    <section className="pt-6 sm:pt-8">
      <div className="section">
        <div className="relative overflow-hidden rounded-tl-4xl rounded-tr-4xl max-sm:rounded-2xl bg-linear-to-b from-primary to-secondary px-6 py-14 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          {/* main grid */}
          <div className="absolute inset-0 opacity-50 bg-[linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-size-[72px_72px]" />

          {/* intersection pluses */}
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

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-2 h-[20%] bg-linear-to-b from-transparent via-secondary/70 to-secondary lg:block" />

          <div className="relative z-10">
            <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1fr]">
              <div className="flex-1 lg:justify-self-end">
                <Badge
                  variant="secondary"
                  appearance="solid"
                  className="px-4 py-2 mb-2"
                >
                  Trusted ABA Therapy Provider
                </Badge>

                <h1 className="max-w-xl text-4xl! font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Expert ABA Therapy for Children & Families.
                </h1>

                <p className="mt-5 max-w-lg text-base leading-8 text-white/80 sm:text-lg">
                  Ready Set and Go ABA delivers evidence-based Applied Behavior
                  Analysis therapy that helps children thrive — at home, at
                  school, and in the community.
                </p>

                <div className="mt-8 flex items-center gap-4">
                  <Button variant="secondary">Learn More</Button>
                  <Button size="lg">Book Appointment</Button>
                </div>

                <div className="mt-10 hidden flex-col gap-4 sm:flex sm:flex-row sm:items-end sm:gap-6">
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
                      Certified BCBAs and RBTs dedicated to your child&apos;s
                      growth
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-(--card-shadow) backdrop-blur-md xl:hidden">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Call us today
                      </p>
                      <p className="text-base font-semibold tracking-tight text-foreground">
                        (302) 555-0107
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative hidden items-center justify-end lg:flex">
                <div className="hidden items-center gap-2 md:flex border rounded-full p-1 w-max ml-auto absolute top-0 right-0">
                  {[Linkedin, Instagram, Twitter].map((Icon, i) => (
                    <HeroIconBox key={i} icon={Icon} className="rounded-full" />
                  ))}
                </div>

                <div className="relative">
                  <Image
                    src="/images/hero-image.png"
                    width={500}
                    height={500}
                    alt="ABA Therapist"
                    className="-mt-20 mask-[linear-gradient(to_bottom,black_0%,black_78%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_78%,transparent_100%)]"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-secondary via-secondary/70 to-transparent blur-xl" />
                </div>

                <div className="absolute top-[70%] -left-8 z-10 hidden -translate-y-1/2 xl:flex">
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-white/60 bg-white/85 px-4 py-3 shadow-(--card-shadow) backdrop-blur-md">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Call us today
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
            <div className="relative mt-4 hidden flex-col gap-5 lg:flex lg:flex-row lg:items-center lg:justify-between xl:-mt-20">
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
                    alt="Therapist"
                    width={48}
                    height={48}
                    className="size-10 rounded-full object-cover"
                  />
                  <p className="text-sm font-medium text-foreground">
                    Session in progress...
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

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-4 hidden h-10 bg-secondary lg:block" />
        </div>
      </div>
    </section>
  );
}
