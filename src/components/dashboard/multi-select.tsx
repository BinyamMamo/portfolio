'use client';

import { Check, Plus, X } from 'lucide-react';
import { useState } from 'react';

import { Logo } from '@/components/logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { LogoSource } from '@/lib/tech';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
  logo?: LogoSource;
}

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  id?: string;
  addLabel?: string;
  searchPlaceholder?: string;
  /** Lets the user add a value that is not in `options` by typing it. */
  allowCustom?: boolean;
}

/** Selected values as removable badges (in order), plus a searchable picker to add more. */
export function MultiSelect({
  value,
  onChange,
  options,
  id,
  addLabel = 'Add',
  searchPlaceholder = 'Search',
  allowCustom = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const byValue = new Map(options.map((option) => [option.value, option]));

  const toggle = (item: string) =>
    onChange(value.includes(item) ? value.filter((existing) => existing !== item) : [...value, item]);

  const custom = search.trim();
  const canAddCustom =
    allowCustom &&
    custom.length > 0 &&
    !value.includes(custom) &&
    !options.some((option) => option.label.toLowerCase() === custom.toLowerCase());

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => {
            const option = byValue.get(item);
            const label = option?.label ?? item;
            return (
              <Badge key={item} variant="outline" className="gap-1.5 pr-1">
                {option?.logo && <Logo logo={option.logo} size={12} />}
                {label}
                <button
                  type="button"
                  aria-label={`Remove ${label}`}
                  onClick={() => toggle(item)}
                  className="rounded-sm text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSearch('');
        }}
      >
        <PopoverTrigger asChild>
          <Button id={id} type="button" variant="outline" size="sm">
            <Plus />
            {addLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>No matches.</CommandEmpty>
              {canAddCustom && (
                <CommandGroup>
                  <CommandItem
                    value={`custom:${custom}`}
                    keywords={[custom]}
                    onSelect={() => {
                      onChange([...value, custom]);
                      setSearch('');
                    }}
                  >
                    <Plus />
                    Add &quot;{custom}&quot;
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label]}
                    onSelect={() => toggle(option.value)}
                  >
                    {option.logo ? <Logo logo={option.logo} size={14} /> : <span className="size-3.5" />}
                    <span className="flex-1">{option.label}</span>
                    <Check className={cn('size-4', value.includes(option.value) ? 'opacity-100' : 'opacity-0')} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
