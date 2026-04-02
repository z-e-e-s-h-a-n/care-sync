import { Button } from "@workspace/ui/components/button";
import {
  CalendarDays,
  Facebook,
  HeartPulse,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

function CTASection() {
  return (
    <section className="pb-20">
      <div className="section">
        <div className="relative overflow-hidden rounded-4xl bg-dark-section px-6 py-12 text-dark-section-foreground shadow-(--soft-shadow) sm:px-10 lg:px-14">
          <div className="absolute -right-12 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="absolute right-10 top-1/2 hidden h-40 w-40 -translate-y-1/2 rotate-45 border border-white/8 md:block" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-sm text-white/60">[Appointment]</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Seeking Professional Help Is Not a Weakness
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button variant="outline">Get Started Now</Button>
              <Button variant="secondary">Book Appointment</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const Footer = () => {
  return (
    <footer className="section bg-footer py-16 text-footer-foreground">
      <CTASection />
      <div>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-footer">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                MedMe
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
              We are mental health experienced therapists that are passionate
              about our goal on empowering humanity with our well-being journey.
            </p>
            <div className="mt-6 flex items-center gap-3 text-white/70">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold">About Us</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/65">
              <li>
                <a href="#">Who we are</a>
              </li>
              <li>
                <a href="#">Our impact</a>
              </li>
              <li>
                <a href="#">For Businesses</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold">Resources</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/65">
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Event</a>
              </li>
              <li>
                <a href="#">Case Studies</a>
              </li>
              <li>
                <a href="#">For Businesses</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold">Services</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/65">
              <li>
                <a href="#">Children Therapy</a>
              </li>
              <li>
                <a href="#">Couple Therapy</a>
              </li>
              <li>
                <a href="#">Family Counseling</a>
              </li>
              <li>
                <a href="#">Anxiety Disorder</a>
              </li>
              <li>
                <a href="#">Career Counseling</a>
              </li>
              <li>
                <a href="#">Individual Therapy</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold">Contact Us</h3>
            <ul className="mt-5 space-y-4 text-sm text-white/65">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4" />
                <span>1234567890</span>
              </li>
              <li className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4" />
                <span>contact@medme.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4" />
                <span>Toronto Ontario, Canada</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© 2025 MedMe. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
