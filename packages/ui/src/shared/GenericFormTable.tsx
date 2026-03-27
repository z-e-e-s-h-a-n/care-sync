/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

import { cn, getStatusVariant } from "@workspace/ui/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import type { BaseResponse } from "@workspace/contracts";

export interface ColumnConfig<TData> {
  header: string;
  accessor: keyof TData | ((item: TData) => React.ReactNode);
  className?: string;
  mobileLabel?: string;
}

interface GenericFormTableProps<TData> {
  items: TData[];
  columns: ColumnConfig<TData>[];
  compact?: boolean;
  entityTitle: string;
  onEdit?: (index: number, row: TData) => Promise<void> | void;
  onRemove?: (index: number) => Promise<void> | void;
}

const GenericFormTable = <TData extends BaseResponse>({
  items,
  columns,
  compact,
  entityTitle,
  onEdit,
  onRemove,
}: GenericFormTableProps<TData>) => {
  return !items.length ? (
    <div className="p-8 text-center">
      <p className="text-muted-foreground">No {entityTitle} added yet</p>
    </div>
  ) : compact ? (
    // Mobile-friendly card view
    <div className="divide-y">
      {items.map((item, index: number) => {
        const isDraft = !(item as any).id;
        return (
          <div key={index} className="p-4 hover:bg-muted/50">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">
                    #{index + 1}
                  </span>
                  {isDraft ? (
                    <Badge variant={getStatusVariant("draft")} className="bg-yellow-50">
                      Draft
                    </Badge>
                  ) : (
                    <Badge variant={getStatusVariant("completed")} className="bg-green-50">
                      Saved
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {columns.map((col) => (
                    <div key={col.header} className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        {col.mobileLabel || col.header}
                      </p>
                      <p className="text-sm">
                        {typeof col.accessor === "function"
                          ? col.accessor(item)
                          : String((item as any)[col.accessor] || "—")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {isDraft && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onRemove?.(index)}
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    // Desktop table view
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            {columns.map((col) => (
              <TableHead key={col.header} className={col.className}>
                {col.header}
              </TableHead>
            ))}
            <TableHead className="w-24">Status</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index: number) => {
            const isDraft = !(item as any).id;
            return (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell className="font-medium">{index + 1}</TableCell>
                {columns.map((col) => (
                  <TableCell
                    key={col.header}
                    className={cn("max-w-30 truncate", col.className)}
                  >
                    {typeof col.accessor === "function"
                      ? col.accessor(item)
                      : String((item as any)[col.accessor] || "—")}
                  </TableCell>
                ))}
                <TableCell>
                  {isDraft ? (
                    <Badge
                      variant={getStatusVariant("draft")}
                      className="bg-yellow-700/10 text-yellow-700"
                    >
                      Draft
                    </Badge>
                  ) : (
                    <Badge
                      variant={getStatusVariant("completed")}
                      className="bg-green-700/10 text-green-700"
                    >
                      Saved
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit?.(index, item)}>
                        <Edit /> Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onRemove?.(index)}
                        className="text-destructive"
                      >
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default GenericFormTable;
