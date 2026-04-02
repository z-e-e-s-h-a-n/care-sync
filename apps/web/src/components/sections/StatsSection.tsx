import { Award, Clock, Smile, Users } from "lucide-react";

const stats = [
  {
    value: "500+",
    label: "Children Supported",
    icon: Smile,
  },
  {
    value: "15+",
    label: "Certified BCBAs & RBTs",
    icon: Award,
  },
  {
    value: "10+",
    label: "Years of Experience",
    icon: Clock,
  },
  {
    value: "98%",
    label: "Family Satisfaction Rate",
    icon: Users,
  },
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-secondary">
      <div className="section">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <stat.icon className="size-6" />
              </div>
              <p className="text-4xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
