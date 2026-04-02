import SectionHeader from "@/components/SectionHeader";
import { Button } from "@workspace/ui/components/button";
import Image from "next/image";
import Link from "next/link";

export const featuredTeam = [
  {
    name: "Dr. Sarah Mitchell",
    role: "BCBA-D, Clinical Director",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "James Reeves",
    role: "BCBA, Lead Therapist",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "Dr. Angela Torres",
    role: "BCBA-D, Founder",
    image:
      "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=900&q=80",
    featured: true,
  },
  {
    name: "Kevin Park",
    role: "BCBA, Early Intervention",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "Nina Cole",
    role: "RBT, Family Specialist",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
];

export default function DoctorsSection() {
  return (
    <section className="bg-secondary py-20">
      <div className="section space-y-10">
        <SectionHeader
          title="Our Team of Certified ABA Specialists"
          description="Meet our dedicated BCBAs and RBTs — experienced professionals committed to every child's growth and success."
        />

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5">
          {featuredTeam.map((member, index) => (
            <div
              key={`${member.name}-${index}`}
              className="group relative overflow-hidden rounded-[1.75rem] border-2 border-white bg-card shadow-card"
            >
              <div className="relative aspect-[0.82] overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="size-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                />
              </div>

              <div className="pointer-events-none absolute inset-x-4 bottom-4 translate-y-6 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="rounded-[1.4rem] border border-white/80 bg-white/90 p-4 shadow-(--soft-shadow) backdrop-blur-md">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {member.role}
                  </p>
                  <Button className="mt-4 w-full" asChild>
                    <Link href="/doctors">View Profile</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/doctors">Meet the Full Team</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
