'use client';

import { type ComponentProps, useState } from 'react';

import { Textarea } from '@/components/ui/textarea';

type Mode = 'lines' | 'paragraphs';

const parse = (text: string, mode: Mode) =>
  text
    .split(mode === 'lines' ? /\n/ : /\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const join = (items: string[], mode: Mode) => items.join(mode === 'lines' ? '\n' : '\n\n');

const sameItems = (a: string[], b: string[]) => a.length === b.length && a.every((item, index) => item === b[index]);

interface LinesTextareaProps extends Omit<ComponentProps<typeof Textarea>, 'value' | 'onChange'> {
  value: string[] | undefined;
  onChange: (items: string[]) => void;
  /** `lines`: one item per line. `paragraphs`: items separated by a blank line. */
  mode?: Mode;
}

const NO_ITEMS: string[] = [];

/** Edits a list of strings as plain text. The raw text is kept while typing so blank lines do not jump away. */
export function LinesTextarea({ value = NO_ITEMS, onChange, mode = 'lines', ...props }: LinesTextareaProps) {
  const [text, setText] = useState(() => join(value, mode));
  const [previousValue, setPreviousValue] = useState(value);

  // When the value changes from outside (form reset, discard), show it, unless it is what the text already says.
  // Compared by content: a new array with the same items must not trigger another render.
  if (!sameItems(value, previousValue)) {
    setPreviousValue(value);
    if (!sameItems(parse(text, mode), value)) setText(join(value, mode));
  }

  return (
    <Textarea
      {...props}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        onChange(parse(event.target.value, mode));
      }}
    />
  );
}
