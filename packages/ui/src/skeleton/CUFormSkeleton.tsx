import { Skeleton } from "@workspace/ui/components/skeleton";

const CUFormSkeleton = () => {
  return (
    <section className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 space-y-2">
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
        <Skeleton className="h-48 w-full rounded-md" />{" "}
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-28" />
      </div>
    </section>
  );
};

export default CUFormSkeleton;
