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
  return (
    <section className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <Skeleton className="h-10 w-37.5" />
          <Skeleton className="h-10 w-full max-w-75" />{" "}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-25" />
          <Skeleton className="h-10 w-30" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
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
                  <Skeleton className="h-8 w-8 rounded-md" />{" "}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
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
