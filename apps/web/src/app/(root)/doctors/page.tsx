import { Award, BookOpen, Mail } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import Image from "next/image";
import Link from "next/link";
import CTASection from "@/components/sections/CTASection";
import PageHeader from "@/components/PageHeader";

const team = [
  {
    name: "Dr. Angela Torres",
    role: "BCBA-D, Founder & Clinical Director",
    image:
      "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=900&q=80",
    bio: "Dr. Torres founded Ready Set and Go ABA with a vision of accessible, high-quality ABA therapy. With over 15 years of clinical experience, she oversees all treatment programs and mentors the clinical team.",
    credentials: ["BCBA-D", "Ph.D. Applied Behavior Analysis"],
    specialties: ["Early Intervention", "Verbal Behavior", "Staff Training"],
  },
  {
    name: "Dr. Sarah Mitchell",
    role: "BCBA-D, Senior Clinician",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80",
    bio: "Dr. Mitchell specializes in early childhood intervention and has helped hundreds of families navigate autism diagnoses. She is passionate about parent coaching and family-centered care.",
    credentials: ["BCBA-D", "M.S. Special Education"],
    specialties: ["Parent Training", "Social Skills", "School Consultation"],
  },
  {
    name: "James Reeves",
    role: "BCBA, Lead Therapist",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=80",
    bio: "James brings energy and creativity to every session. He specializes in working with school-age children on social skills and adaptive behavior, with a focus on natural environment teaching.",
    credentials: ["BCBA", "M.A. ABA"],
    specialties: ["Social Skills Training", "Adaptive Behavior", "Telehealth"],
  },
  {
    name: "Kevin Park",
    role: "BCBA, Early Intervention Specialist",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=80",
    bio: "Kevin has extensive experience working with toddlers and preschoolers in the early intervention space. His naturalistic approach helps young children build skills through play and everyday routines.",
    credentials: ["BCBA", "B.S. Psychology"],
    specialties: ["Early Intervention", "Play-Based Therapy", "ABA Assessment"],
  },
  {
    name: "Nina Cole",
    role: "RBT, Family Specialist",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80",
    bio: "Nina is a dedicated Registered Behavior Technician who works directly with clients during therapy sessions. Her warm approach and attention to family dynamics make her a trusted member of our team.",
    credentials: ["RBT", "B.A. Child Development"],
    specialties: ["Direct Therapy", "Family Liaison", "Home-Based Services"],
  },
  {
    name: "Marcus Chen",
    role: "BCBA, School Consultation",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=900&q=80",
    bio: "Marcus bridges the gap between clinic and classroom. He works directly with schools to implement behavior support plans and help children generalize their skills across all environments.",
    credentials: ["BCBA", "M.Ed. Special Education"],
    specialties: ["School Consultation", "IEP Support", "Behavior Plans"],
  },
];

export default function DoctorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Team"
        title="Certified Specialists Who Care"
        description="Every member of our clinical team is board-certified, highly trained, and deeply committed to making a real difference in children's lives."
        align="center"
      />

      {/* Team grid */}
      <section className="py-20 section space-y-10">
        <SectionHeader
          title="Meet Our Clinical Team"
          description="BCBAs, BCBA-Ds, and RBTs dedicated to evidence-based ABA therapy."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <Card key={member.name} className="overflow-hidden">
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover object-top grayscale transition duration-500 hover:grayscale-0"
                />
              </div>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary font-medium mt-0.5">
                    {member.role}
                  </p>
                </div>

                <p className="text-sm leading-7 text-muted-foreground line-clamp-3">
                  {member.bio}
                </p>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                      <Award className="size-3" /> Credentials
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {member.credentials.map((c) => (
                        <Badge key={c} variant="secondary" appearance="soft" className="text-xs">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                      <BookOpen className="size-3" /> Specialties
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {member.specialties.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contact">
                    <Mail className="size-4" /> Book with {member.name.split(" ")[0]}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <CTASection
        eyebrow="Our Team"
        title="Ready to Meet Your Child's Therapist?"
        primaryLabel="Book a Free Consultation"
        primaryHref="/contact"
        secondaryLabel="Learn About Our Services"
        secondaryHref="/services"
      />
    </>
  );
}
