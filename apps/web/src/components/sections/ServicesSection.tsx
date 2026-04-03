import {
  Brain,
  CalendarCheck,
  GraduationCap,
  HeartHandshake,
  School,
  Users,
} from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

export const abaServices = [
  {
    id: "001",
    title: "ABA Therapy",
    subtitle: "Evidence-based behavioral intervention",
    desc: "Our one-on-one Applied Behavior Analysis sessions are designed to reduce challenging behaviors and build essential life skills through positive reinforcement and data-driven methods.",
    icon: Brain,
  },
  {
    id: "002",
    title: "Early Intervention",
    subtitle: "Critical support in the early years",
    desc: "Early therapy for children ages 2–6 focuses on communication, social skills, and daily living abilities during the most critical developmental window.",
    icon: HeartHandshake,
  },
  {
    id: "003",
    title: "Social Skills Training",
    subtitle: "Building meaningful peer connections",
    desc: "Structured group and individual sessions help children develop conversational skills, emotional awareness, and the tools to form lasting friendships.",
    icon: Users,
  },
  {
    id: "004",
    title: "Parent & Caregiver Training",
    subtitle: "Empowering families at home",
    desc: "We equip parents and caregivers with ABA strategies to reinforce progress outside of sessions — turning everyday routines into learning opportunities.",
    icon: GraduationCap,
  },
  {
    id: "005",
    title: "School Consultation",
    subtitle: "Supporting learning in the classroom",
    desc: "Our BCBAs collaborate with teachers and school staff to create individualized support plans that help children succeed in academic and social environments.",
    icon: School,
  },
  {
    id: "006",
    title: "Behavioral Assessment",
    subtitle: "Comprehensive evaluations and treatment plans",
    desc: "Every client begins with a thorough behavioral assessment to identify strengths, challenges, and goals — forming the foundation of a personalized treatment plan.",
    icon: CalendarCheck,
  },
];

export default function ServicesSection() {
  return (
    <section className="py-20 section">
      <SectionHeader
        title="ABA Services Designed for Every Child"
        description="Comprehensive, evidence-based therapy programs tailored to help children with autism and developmental differences reach their full potential."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {abaServices.map((service) => (
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
