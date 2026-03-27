import { Skeleton } from "@workspace/ui/components/skeleton";

const HeaderActionsSkeleton = () => {
  return (
    <div className="flex items-center gap-3">
      {/* Notification */}
      <Skeleton className="h-10 w-10 rounded-md" />

      {/* Theme switch */}
      <Skeleton className="h-10 w-10 rounded-md" />

      {/* Avatar */}
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>
  );
};

export default HeaderActionsSkeleton;
