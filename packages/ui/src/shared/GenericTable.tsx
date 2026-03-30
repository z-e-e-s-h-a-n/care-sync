"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, ArrowUpDown, Trash2, Eye, Edit } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
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
import Pagination from "@workspace/ui/shared/Pagination";
import SearchToolbar from "@workspace/ui/shared/SearchToolbar";
import TableSkeleton from "@workspace/ui/skeleton/TableSkeleton";
import type { PaginationProps } from "@workspace/ui/shared/Pagination";
import type { SearchToolbarProps } from "@workspace/ui/shared/SearchToolbar";
import type { BaseQueryType, BaseResponse } from "@workspace/contracts";
import { IconSortAscending2, IconSortDescending2 } from "@tabler/icons-react";

export interface ColumnConfig<TData, TQuery extends BaseQueryType = never> {
  header: string;
  accessor: keyof TData | ((row: TData) => React.ReactNode);
  sortKey?: TQuery["sortBy"];
  className?: string;
}

interface GenericTableProps<
  TData extends BaseResponse,
  TQuery extends BaseQueryType,
>
  extends Omit<SearchToolbarProps<TQuery>, "setPage">, PaginationProps {
  data: TData[];
  entityId?: (d: TData) => string;
  isLoading?: boolean;
  columns: ColumnConfig<TData, TQuery>[];
  onDelete?: (row: TData) => Promise<void> | void;
  canEdit?: boolean;
  canAdd?: boolean;
}

function GenericTable<
  TData extends BaseResponse,
  TQuery extends BaseQueryType,
>({
  data,
  total,
  limit,
  entityId = (row) => row.id,
  entityType,
  currentPage,
  totalPages,
  columns,
  search,
  setSearch,
  searchBy,
  setSearchBy,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  setPage,
  setLimit,
  canEdit = true,
  canAdd = true,
  onDelete,
  filter,
  setFilter,
  filterConfig,
  searchByOptions,
  isLoading = false,
}: GenericTableProps<TData, TQuery>) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const pathname = usePathname();

  const actionsColumn = columns.find((c) => c.header === "Actions");
  const hasActions = Boolean(actionsColumn);
  const contentColumns = columns.filter((c) => c.header !== "Actions");
  const primaryColumn = contentColumns[0];
  const secondaryColumns = contentColumns.slice(1);
  const sortableColumns = contentColumns.filter((c) => c.sortKey);

  const handleSort = (col: ColumnConfig<TData, TQuery>) => {
    if (!col.sortKey) return;

    if (sortBy === col.sortKey) {
      setSortOrder?.(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy?.(col.sortKey);
      setSortOrder?.("desc");
    }
  };

  const handleDelete = async (row: TData) => {
    if (!onDelete) return;
    try {
      setDeletingId(row.id);
      await onDelete(row);
    } finally {
      setDeletingId(null);
    }
  };

  const renderCellValue = (row: TData, column: ColumnConfig<TData, TQuery>) =>
    typeof column.accessor === "function"
      ? column.accessor(row)
      : ((row as any)[column.accessor] ?? "N/A");

  const renderActionsMenu = (row: TData) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`${pathname}/${entityId(row)}`}>
            <Eye className="mr-2 size-4" /> View
          </Link>
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem asChild>
            <Link href={`${pathname}/${entityId(row)}/edit`}>
              <Edit className="mr-2 size-4" /> Edit
            </Link>
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            onClick={() => handleDelete(row)}
            disabled={deletingId === row.id}
            className="text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            {deletingId === row.id ? "Deleting..." : "Delete"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isLoading) {
    return <TableSkeleton columnCount={columns.length} rowCount={limit} />;
  }

  return (
    <section className="space-y-4">
      {/* FILTER BAR */}
      <SearchToolbar
        canAdd={canAdd}
        entityType={entityType}
        search={search}
        setSearch={setSearch}
        searchBy={searchBy}
        setSearchBy={setSearchBy}
        setPage={setPage}
        searchByOptions={searchByOptions}
        filter={filter}
        setFilter={setFilter}
        filterConfig={filterConfig}
      />

      {sortableColumns.length > 0 && (
        <div className="flex items-center gap-2 md:hidden">
          <Select
            value={
              sortableColumns.includes({ sortKey: sortBy } as any) ? sortBy : ""
            }
            onValueChange={(value) => {
              setPage(1);
              setSortBy?.(value);
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortableColumns.map((column) => (
                <SelectItem key={column.sortKey} value={column.sortKey!}>
                  {column.header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setPage(1);
              setSortOrder?.(sortOrder === "asc" ? "desc" : "asc");
            }}
          >
            {sortOrder === "asc" ? (
              <IconSortAscending2 />
            ) : (
              <IconSortDescending2 />
            )}
          </Button>
        </div>
      )}

      <div className="space-y-8 md:hidden">
        {data.length ? (
          data.map((row) => (
            <article
              key={row.id}
              className="rounded-lg border bg-background p-4 shadow-sm space-y-6"
            >
              <div className="flex items-start justify-between gap-3 border-b pb-2">
                <div className="min-w-0 flex-1">
                  {primaryColumn ? renderCellValue(row, primaryColumn) : null}
                </div>
                {!hasActions && renderActionsMenu(row)}
              </div>

              {secondaryColumns.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {secondaryColumns.map((column, index) => (
                    <div key={`${row.id}-${index}`} className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {column.header}
                      </p>
                      <div className="min-w-0 wrap-break-word text-sm">
                        {renderCellValue(row, column)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hasActions && actionsColumn && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {actionsColumn.header}
                  </p>
                  <div>{renderCellValue(row, actionsColumn)}</div>
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="rounded-lg border px-4 py-10 text-center text-sm text-muted-foreground">
            No results.
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="hidden overflow-hidden rounded-lg border md:block">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {columns.map((c, i) => (
                <TableHead key={i} className={c.className}>
                  {c.sortKey ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(c)}
                      className="px-0"
                    >
                      {c.header}
                      <ArrowUpDown className="ml-1 size-4" />
                    </Button>
                  ) : (
                    c.header
                  )}
                </TableHead>
              ))}
              {!hasActions && (
                <TableHead className="w-20 sticky right-0 bg-muted z-20">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {data.length ? (
              data.map((row, idx) => (
                <TableRow key={row.id}>
                  {columns.map((c, i) => (
                    <TableCell
                      key={i}
                      className={cn(
                        c.className,
                        hasActions &&
                          idx === data.length - 1 &&
                          "sticky right-0 bg-background z-20",
                      )}
                    >
                      {renderCellValue(row, c)}
                    </TableCell>
                  ))}

                  {!hasActions && (
                    <TableCell className="sticky right-0 bg-background z-20">
                      {renderActionsMenu(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* PAGINATION */}
      <Pagination
        total={total}
        limit={limit}
        currentPage={currentPage}
        totalPages={totalPages}
        setPage={setPage}
        setLimit={setLimit}
      />
    </section>
  );
}

export default GenericTable;
