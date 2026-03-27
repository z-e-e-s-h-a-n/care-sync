import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import type { SectionConfig } from "@workspace/ui/shared/GenericDetailsPage";

interface DetailsPageSkeletonProps<TData> {
  sections: SectionConfig<TData>[];
}

// Skeleton Component
function DetailsPageSkeleton<TData>({
  sections,
}: DetailsPageSkeletonProps<TData>) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>

      {/* Sections Skeleton */}
      <div className="grid gap-6">
        {sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "grid gap-4",
                  section.columns === 1
                    ? "grid-cols-1"
                    : section.columns === 3
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1 md:grid-cols-2",
                )}
              >
                {section.fields.map((_: unknown, i: number) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DetailsPageSkeleton;
