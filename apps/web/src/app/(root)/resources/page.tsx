import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  HelpCircle,
  Newspaper,
} from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";
import CTASection from "@/components/sections/CTASection";
import PageHeader from "@/components/shared/PageHeader";

const articles = [
  {
    category: "What is ABA?",
    title: "A Parent's Guide to Applied Behavior Analysis",
    description:
      "Learn the basics of ABA therapy — what it is, how it works, and why it's considered the gold standard for autism treatment.",
    readTime: "5 min read",
  },
  {
    category: "Early Intervention",
    title: "Why Early ABA Therapy Matters More Than You Think",
    description:
      "Research shows that starting ABA therapy before age 5 can dramatically improve outcomes for children with autism. Here's what the science says.",
    readTime: "6 min read",
  },
  {
    category: "Parent Tips",
    title: "10 Ways to Reinforce ABA Skills at Home",
    description:
      "Simple, practical strategies parents can use every day to support their child's progress between therapy sessions.",
    readTime: "7 min read",
  },
  {
    category: "Understanding Autism",
    title: "ASD Diagnosis: What Happens Next?",
    description:
      "A compassionate walkthrough of what to expect after your child receives an autism spectrum disorder diagnosis — and how ABA therapy fits in.",
    readTime: "8 min read",
  },
  {
    category: "School Support",
    title: "How ABA Supports Children in the Classroom",
    description:
      "From IEPs to behavior support plans, this guide explains how ABA-trained specialists work with schools to help children succeed academically.",
    readTime: "5 min read",
  },
  {
    category: "Social Skills",
    title: "Building Friendships: Social Skills Training in ABA",
    description:
      "Many children with autism struggle with peer interaction. Discover how structured social skills training helps them form meaningful connections.",
    readTime: "6 min read",
  },
];

const faqs = [
  {
    question: "What is ABA therapy?",
    answer:
      "Applied Behavior Analysis (ABA) is a scientifically validated therapy that uses principles of learning and behavior to increase helpful behaviors and decrease harmful or challenging ones. It is widely recognized as the most effective treatment for autism spectrum disorder.",
  },
  {
    question: "How do I know if my child needs ABA therapy?",
    answer:
      "If your child has received an autism diagnosis, or if you're noticing challenges with communication, social skills, daily living, or challenging behaviors, ABA therapy may be beneficial. We recommend scheduling a free consultation so our BCBAs can assess your child's needs.",
  },
  {
    question: "What is a BCBA?",
    answer:
      "A Board Certified Behavior Analyst (BCBA) is a graduate-level certified clinician who specializes in behavior analysis. All treatment plans at Ready Set and Go ABA are developed and supervised by BCBAs.",
  },
  {
    question: "How long does ABA therapy take?",
    answer:
      "The duration of therapy varies by child. Some children participate for one to two years, while others benefit from longer programs. Our BCBAs conduct regular assessments to measure progress and update treatment goals accordingly.",
  },
  {
    question: "Does insurance cover ABA therapy?",
    answer:
      "Many insurance plans cover ABA therapy for children with an autism diagnosis. We work with most major insurance providers and our team will help verify your benefits before services begin.",
  },
  {
    question: "Do you offer in-home therapy?",
    answer:
      "Yes. We offer in-home, clinic-based, and school-based services depending on your child's needs. Many families find that in-home therapy helps children generalize skills in their natural environment.",
  },
  {
    question: "How do I get started?",
    answer:
      "Simply reach out to our team via our contact page or call us directly. We'll schedule a free consultation, conduct a behavioral assessment, and work with you to design a personalized treatment plan.",
  },
];

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="ABA Resources for Families"
        description="Whether you're new to ABA or looking to deepen your understanding, our resource library has guides, articles, and answers to help you support your child's growth."
      />

      {/* Articles */}
      <section id="blog" className="py-20 section space-y-10">
        <SectionHeader
          title="Guides & Articles"
          description="Educational content written by our clinical team to help families understand ABA therapy and support their children at home."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card key={article.title} className="group cursor-pointer">
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    appearance="soft"
                    className="text-xs"
                  >
                    {article.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <BookOpen className="size-3" />
                    {article.readTime}
                  </span>
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-foreground leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm leading-7 text-muted-foreground">
                  {article.description}
                </p>
                <Button variant="link" className="px-0 text-sm">
                  Read Article <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-secondary">
        <div className="section space-y-10">
          <SectionHeader
            title="Frequently Asked Questions"
            description="Answers to the questions families ask us most often."
            align="center"
          />

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i}>
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="mt-0.5 size-5 shrink-0 text-primary" />
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          {faq.question}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Have a question we haven't answered?
            </p>
            <Button asChild>
              <Link href="/contact">Ask Our Team</Link>
            </Button>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Resources"
        title="Ready to Start Your Child's ABA Journey?"
        primaryLabel="Book a Free Consultation"
        primaryHref="/contact"
        secondaryLabel="Explore Our Services"
        secondaryHref="/services"
      />
    </>
  );
}
