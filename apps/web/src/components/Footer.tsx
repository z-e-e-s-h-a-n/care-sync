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
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="section bg-footer py-16 text-footer-foreground">
      <div>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-footer">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Ready Set and Go ABA
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
              Evidence-based ABA therapy for children and families. We are
              committed to helping every child reach their full potential
              through compassionate, data-driven care.
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
                <Link href="/about">Who We Are</Link>
              </li>
              <li>
                <Link href="/doctors">Our Team</Link>
              </li>
              <li>
                <Link href="/about#mission">Our Mission</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold">Resources</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/65">
              <li>
                <Link href="/resources">ABA Resources</Link>
              </li>
              <li>
                <Link href="/resources#faq">FAQ</Link>
              </li>
              <li>
                <Link href="/resources#blog">Blog</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold">Services</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/65">
              <li>
                <Link href="/services">ABA Therapy</Link>
              </li>
              <li>
                <Link href="/services">Early Intervention</Link>
              </li>
              <li>
                <Link href="/services">Social Skills Training</Link>
              </li>
              <li>
                <Link href="/services">Parent Training</Link>
              </li>
              <li>
                <Link href="/services">School Consultation</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold">Contact Us</h3>
            <ul className="mt-5 space-y-4 text-sm text-white/65">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <span>(302) 555-0107</span>
              </li>
              <li className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
                <span>info@readysetgoaba.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>123 Therapy Lane, Suite 200, Your City, State</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Ready Set and Go ABA. All rights
            reserved.
          </p>
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
