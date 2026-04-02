"use client";

import { useState } from "react";
import { CalendarDays, CheckCircle, Clock, MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { toast } from "sonner";
import { createContactMessage } from "@workspace/sdk/contact";

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "(302) 555-0107",
    sub: "Mon–Fri, 8am–6pm",
  },
  {
    icon: CalendarDays,
    label: "Email",
    value: "info@readysetgoaba.com",
    sub: "We reply within 1 business day",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "123 Therapy Lane, Suite 200",
    sub: "Your City, State 00000",
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "Monday – Friday",
    sub: "8:00 AM – 6:00 PM",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      const form = e.currentTarget;
      const data = new FormData(form);

      setLoading(true);
      await createContactMessage({
        firstName: data.get("firstName") as string,
        lastName: (data.get("lastName") as string) || undefined,
        email: data.get("email") as string,
        phone: data.get("phone") as string,
        subject: (data.get("subject") as string) || undefined,
        message: data.get("message") as string,
      });
      setLoading(false);
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
      return;
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-6 sm:pt-8">
        <div className="section">
          <div className="relative overflow-hidden rounded-tl-4xl rounded-tr-4xl bg-secondary px-6 py-16 sm:px-10 sm:py-20 lg:px-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(var(--primary-rgb),0.07),transparent_55%)]" />
            <div className="relative mx-auto max-w-2xl text-center">
              <Badge
                variant="secondary"
                appearance="solid"
                className="px-4 py-2 mb-4"
              >
                Contact Us
              </Badge>
              <h1 className="text-5xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
                Let&apos;s Talk About Your Child
              </h1>
              <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
                Whether you have questions about our services, want to schedule
                a free consultation, or just need guidance — our team is here to
                help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 section">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          {/* Info cards */}
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Get in Touch
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Fill out the form and a member of our team will reach out within
                one business day to answer your questions and help you get
                started.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {contactInfo.map((info) => (
                <Card key={info.label}>
                  <CardContent className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <info.icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {info.label}
                      </p>
                      <p className="mt-0.5 text-base font-semibold text-foreground">
                        {info.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {info.sub}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardContent>
              {submitted ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle className="size-8" />
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                    Message Sent!
                  </h3>
                  <p className="max-w-sm text-sm leading-7 text-muted-foreground">
                    Thank you for reaching out. A member of our team will
                    contact you within one business day.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                    className="mt-2"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Jane"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jane@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(555) 000-0000"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="e.g. ABA Therapy for my 4-year-old"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us a little about your child and what you're looking for..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Message"}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    By submitting this form, you agree to our{" "}
                    <a href="#" className="underline">
                      Privacy Policy
                    </a>
                    .
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
