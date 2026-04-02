import { ShoppingBag } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import SectionCard from "@workspace/ui/shared/SectionCard";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            My Orders
          </span>
        }
        description="Track your product orders and purchase history."
        contentClassName=""
      >
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="size-8" />
          </div>
          <div>
            <p className="font-medium">Shop Coming Soon</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              Our product shop — supplements, learning materials, and therapy
              tools — is on its way. Check back soon.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
