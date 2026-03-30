import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

interface TableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
}

const TableSkeleton = ({
  columnCount = 5,
  rowCount = 10,
}: TableSkeletonProps) => {
  const mobileRowCount = Math.min(rowCount, 4);
  const mobileDetailCount = Math.max(Math.min(columnCount - 1, 4), 2);

  return (
    <section className="space-y-4 animate-pulse">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-full sm:w-37.5" />
          <Skeleton className="h-10 w-full sm:max-w-75" />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Skeleton className="h-10 w-full sm:w-25" />
          <Skeleton className="h-10 w-full sm:w-30" />
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {Array.from({ length: mobileRowCount }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="rounded-lg border bg-background p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-40 max-w-full" />
                <Skeleton className="h-4 w-28 max-w-full" />
              </div>
              <Skeleton className="size-8 shrink-0 rounded-md" />
            </div>

            <div className="mt-4 space-y-3 border-t pt-4">
              {Array.from({ length: mobileDetailCount }).map(
                (_, detailIndex) => (
                  <div key={detailIndex} className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-full max-w-40" />
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border md:block">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
              <TableHead className="w-20">
                <Skeleton className="h-4 w-12" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </section>
  );
};

export default TableSkeleton;
