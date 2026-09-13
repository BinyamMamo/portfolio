'use client';

import { MultiSelect, type MultiSelectOption } from '@/components/dashboard/multi-select';
import { getTech, techIds } from '@/lib/tech';

const techOptions: MultiSelectOption[] = techIds
  .map((id) => {
    const { name, logo } = getTech(id);
    return { value: id, label: name, logo };
  })
  .sort((a, b) => a.label.localeCompare(b.label));

interface TechPickerProps {
  value: string[];
  onChange: (value: string[]) => void;
  id?: string;
}

/** Picks technologies from the logo registry (src/lib/tech.ts). Anything else can be typed in as a custom name. */
export function TechPicker({ value, onChange, id }: TechPickerProps) {
  return (
    <MultiSelect
      id={id}
      value={value}
      onChange={onChange}
      options={techOptions}
      addLabel="Add technology"
      searchPlaceholder="Search or type a custom name"
      allowCustom
    />
  );
}
