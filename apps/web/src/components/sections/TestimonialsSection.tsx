import { Star } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import { Card, CardContent } from "@workspace/ui/components/card";

export const testimonials = [
  {
    name: "Maria Lopez",
    role: "Parent of a 5-year-old client",
    text: "The team at Ready Set and Go genuinely cares about our son. His communication has improved so much in just a few months. We feel supported every step of the way.",
  },
  {
    name: "David Chen",
    role: "Parent of a 7-year-old client",
    text: "We tried other programs before, but this team is different. They listen, they adapt, and the progress our daughter has made is incredible.",
  },
  {
    name: "Aisha Williams",
    role: "Parent of a 4-year-old client",
    text: "From the very first consultation, we felt at ease. The BCBA explained everything clearly and our son actually looks forward to his sessions.",
  },
  {
    name: "James Nguyen",
    role: "Parent of a 6-year-old client",
    text: "The parent training sessions have been life-changing for us. We now know how to support our child at home using the same techniques as the therapists.",
  },
  {
    name: "Sara Mitchell",
    role: "Parent of a 3-year-old client",
    text: "Early intervention was the best decision we made. The progress reports keep us informed and the therapists are warm, patient, and incredibly skilled.",
  },
  {
    name: "Robert Banks",
    role: "Parent of a 9-year-old client",
    text: "The school consultation service helped our son's teacher understand how to work with him better. The difference in his school day has been amazing.",
  },
  {
    name: "Fatima Hassan",
    role: "Parent of a 5-year-old client",
    text: "Booking appointments is easy and the portal is very simple to use. Most importantly, our daughter is thriving in ways we never expected.",
  },
  {
    name: "Carlos Rivera",
    role: "Parent of an 8-year-old client",
    text: "We were nervous starting ABA therapy, but the team made us feel confident. The transparency and data-driven approach gave us real peace of mind.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="section space-y-10">
        <SectionHeader
          title="Families Trust Ready Set and Go ABA"
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
                      <Star key={starIndex} className="fill-current size-4" />
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
