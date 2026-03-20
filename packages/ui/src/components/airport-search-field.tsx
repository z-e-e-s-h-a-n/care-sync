import airports from "airports-data/airports.json";
import { useMemo, useState } from "react";
import { FormField, type BaseFieldProps } from "./form";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { cn } from "../lib/utils";
import { Badge } from "./badge";

export interface AirportOption {
  code: string;
  city: string;
  country: string;
  airport: string;
  tz?: string;
}

interface AirportSearchFieldProps<TFormData> extends BaseFieldProps<TFormData> {
  notMatch?: string;
}

const suggestionCodes = new Set([
  "LHE",
  "KHI",
  "ISB",
  "MUX",
  "PEW",
  "MCT",
  "SLL",
  "JED",
  "MED",
  "DXB",
]);

export const AirportSearchField = <TFormData,>({
  notMatch,
  ...props
}: AirportSearchFieldProps<TFormData>) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const options = useMemo<AirportOption[]>(() => {
    return airports
      .filter(
        (a) =>
          a.type === "airport" &&
          a.iata &&
          a.city &&
          a.country &&
          a.iata !== notMatch,
      )
      .map((a) => ({
        code: a.iata,
        city: a.city,
        country: a.country,
        airport: a.name,
        tz: a.tz,
      }));
  }, [notMatch]);

  const airportMap = useMemo(() => {
    const map = new Map<string, AirportOption>();
    options.forEach((o) => map.set(o.code, o));
    return map;
  }, [options]);

  const filteredOptions = useMemo(() => {
    const base = !query
      ? options.filter((a) => suggestionCodes.has(a.code))
      : options;

    const q = query.toLowerCase();
    const matched = base.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q) ||
        a.airport.toLowerCase().includes(q),
    );

    const suggestions = matched.filter((a) => suggestionCodes.has(a.code));
    const others = matched.filter((a) => !suggestionCodes.has(a.code));

    return [...suggestions, ...others].slice(0, 5);
  }, [options, query]);

  return (
    <FormField {...props}>
      {(field) => {
        const fieldValue = field.value;
        const selected = fieldValue ? airportMap.get(fieldValue) : undefined;

        return (
          <Popover
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) setQuery("");
            }}
          >
            <PopoverTrigger asChild>
              <Button
                aria-expanded={open}
                role="combobox"
                variant="secondary"
                disabled={field.disabled}
                aria-controls="airport-command-list"
                className={cn(
                  "truncate flex justify-between bg-transparent dark:bg-input/30 border border-input",
                  !fieldValue && "text-muted-foreground",
                  open && "border-ring ring-ring/50 ring-[3px]",
                )}
              >
                <span
                  className={cn(
                    "truncate min-w-0",
                    !selected && "text-muted-foreground",
                  )}
                >
                  {selected
                    ? `${selected.code} - ${selected.airport}`
                    : field.placeholder}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
              <Command
                filter={(value, search) => {
                  if (!search) return 1;

                  const airport = airportMap.get(value);
                  if (!airport) return 0;

                  const q = search.toLowerCase();

                  if (airport.code.toLowerCase().startsWith(q)) return 1;
                  if (airport.city.toLowerCase().startsWith(q)) return 0.8;
                  if (airport.airport.toLowerCase().includes(q)) return 0.6;
                  if (airport.country.toLowerCase().includes(q)) return 0.4;
                  return 0;
                }}
              >
                <CommandInput
                  placeholder={field.placeholder}
                  value={query}
                  onValueChange={setQuery}
                  autoFocus
                />
                <CommandList
                  className="scrollbar-hidden"
                  id="airport-command-list"
                >
                  <CommandEmpty>Item Not Found</CommandEmpty>
                  <CommandGroup>
                    {filteredOptions.map((o) => (
                      <CommandItem
                        key={o.code}
                        value={o.code}
                        onSelect={() => {
                          field.onChange(o.code);
                          setOpen(false);
                          setQuery("");
                        }}
                      >
                        <Badge
                          variant="secondary"
                          className="px-1.5 py-0 text-xs"
                        >
                          {o.code}
                        </Badge>
                        <div className="flex flex-col w-full min-w-0">
                          <span className="text-sm font-medium truncate">
                            {o.city}, {o.country}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {o.airport}
                          </span>
                        </div>
                        {fieldValue === o.code && (
                          <Check className="ml-auto size-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      }}
    </FormField>
  );
};
