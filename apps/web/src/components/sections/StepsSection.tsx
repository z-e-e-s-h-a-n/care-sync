import { ArrowRight, CalendarDays, ClipboardList, HeartPulse, Shield } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

const steps = [
  {
    id: "1",
    title: "Schedule a Free Consultation",
    description:
      "Reach out to our team and we'll set up a no-obligation consultation to learn about your child's needs and answer your questions.",
    icon: CalendarDays,
  },
  {
    id: "2",
    title: "Receive a Personalized Assessment",
    description:
      "Our BCBAs conduct a comprehensive behavioral evaluation to identify goals and design a customized treatment plan for your child.",
    icon: ClipboardList,
  },
  {
    id: "3",
    title: "Begin Your Child's Journey",
    description:
      "Therapy begins with a dedicated therapist. We track progress continuously and adjust the plan to ensure the best outcomes.",
    icon: HeartPulse,
  },
];

const stepIcons = [Shield, CalendarDays, HeartPulse];

export default function StepsSection() {
  return (
    <section className="relative py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_bottom,rgba(214,190,255,0.35),transparent_28%),radial-gradient(circle_at_center_top,rgba(235,213,255,0.3),transparent_24%),radial-gradient(circle_at_right_bottom,rgba(222,201,255,0.26),transparent_22%),linear-gradient(135deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.98)_20%,rgba(250,243,255,0.96)_50%,rgba(255,255,255,0.98)_78%,rgba(255,255,255,1)_100%)]" />

      <div className="section space-y-10 relative">
        <SectionHeader
          title="How We Get Started With Your Family"
          description="A simple, supportive three-step process to connect your child with the right therapy and the right team."
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = stepIcons[i] ?? HeartPulse;
            return (
              <Card key={step.id} className="relative">
                <CardContent>
                  <Button size="icon" appearance="soft" className="size-12">
                    <Icon className="size-5" />
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
                    href="/contact"
                    variant="link"
                    className="mt-6 text-sm font-medium"
                  >
                    Learn More <ArrowRight />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Button href="/contact" className="min-w-40">
            Get Started Today
          </Button>
        </div>
      </div>
    </section>
  );
}
