"use client";
import { Plus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import type { BaseQueryType, SortOrderType } from "@workspace/contracts";

export interface ListFilterConfig<TQuery> {
  key: keyof TQuery;
  label: string;
  options: string[];
  default?: string;
}

export interface SearchByOption<TQuery extends BaseQueryType> {
  value: TQuery["searchBy"];
  label: string;
}

export interface SearchToolbarProps<TQuery extends BaseQueryType> {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;

  searchBy?: TQuery["searchBy"];
  setSearchBy: Dispatch<SetStateAction<TQuery["searchBy"]>>;

  setPage: Dispatch<SetStateAction<number>>;

  sortBy?: TQuery["sortBy"];
  setSortBy?: Dispatch<SetStateAction<TQuery["sortBy"]>>;

  sortOrder?: SortOrderType;
  setSortOrder?: Dispatch<SetStateAction<SortOrderType>>;

  sortOptions?: Record<string, string>;

  filter?: string;
  setFilter?: Dispatch<SetStateAction<string | undefined>>;
  filterConfig?: ListFilterConfig<TQuery>;

  searchByOptions: SearchByOption<TQuery>[];

  canAdd?: boolean;
  entityType?: string;
}

function SearchToolbar<TQuery extends BaseQueryType>({
  search,
  setPage,
  setSearch,
  searchBy,
  setSearchBy,
  searchByOptions,
  filter,
  setFilter,
  filterConfig,
  entityType,
  canAdd = true,
}: SearchToolbarProps<TQuery>) {
  return (
    <div className="flex items-center flex-wrap gap-3 justify-between">
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-full md:w-64"
        />

        <Select
          value={searchBy as string}
          onValueChange={(v) => {
            setPage(1);
            setSearch("");
            setSearchBy(v);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {searchByOptions.map((o) => (
              <SelectItem key={o.value} value={o.value as string}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {entityType && (
        <div className="flex items-center gap-4">
          {filterConfig && setFilter && (
            <Select
              value={filter ?? filterConfig.default ?? "all"}
              onValueChange={(v) => {
                setPage(1);
                setFilter(v === "all" ? undefined : v);
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder={filterConfig.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {filterConfig.options.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {canAdd && entityType && (
            <Button href={`${entityType}/new`} className="capitalize">
              <Plus /> New {entityType.split("/").pop()?.replace(/s$/, "")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchToolbar;
