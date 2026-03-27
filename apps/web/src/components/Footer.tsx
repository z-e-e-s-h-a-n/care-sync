import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="space-y-3">
          <p className="text-lg font-semibold tracking-tight">CareSync</p>
          <p className="max-w-md text-sm text-muted-foreground">
            A patient-first healthcare platform for finding providers, booking appointments, shopping healthcare products, and staying connected before and after care.
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium">Explore</p>
          <Link href="/doctors" className="block text-muted-foreground hover:text-foreground">
            Browse doctors
          </Link>
          <Link href="/store" className="block text-muted-foreground hover:text-foreground">
            Store
          </Link>
          <Link href="/auth/sign-up" className="block text-muted-foreground hover:text-foreground">
            Create account
          </Link>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium">Patient portal</p>
          <Link href="/appointments" className="block text-muted-foreground hover:text-foreground">
            Appointments
          </Link>
          <Link href="/orders" className="block text-muted-foreground hover:text-foreground">
            Orders
          </Link>
          <Link href="/profile" className="block text-muted-foreground hover:text-foreground">
            Profile
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

