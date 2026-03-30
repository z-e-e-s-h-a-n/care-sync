import { Skeleton } from "@workspace/ui/components/skeleton";

const CUFormSkeleton = () => {
  return (
    <section className="space-y-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-40 w-full rounded-md sm:h-48" />
      </div>
      <div className="flex justify-stretch sm:justify-end">
        <Skeleton className="h-10 w-full sm:w-28" />
      </div>
    </section>
  );
};

export default CUFormSkeleton;
