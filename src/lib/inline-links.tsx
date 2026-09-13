import type { ReactNode } from 'react';

const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

/** Renders text containing [label](https://url) markers, turning them into links. Only http(s) URLs are linked. */
export function renderInlineLinks(text: string, className: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const [whole, label, href] = match;
    const start = match.index;
    if (start > cursor) nodes.push(text.slice(cursor, start));
    nodes.push(
      <a key={start} href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
      </a>,
    );
    cursor = start + whole.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}
