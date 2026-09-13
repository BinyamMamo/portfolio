export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** A slug for `base` that is not in `taken`, adding -2, -3 and so on when needed. */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const existing = new Set(taken);
  const root = slugify(base) || 'item';
  let candidate = root;
  for (let suffix = 2; existing.has(candidate); suffix++) candidate = `${root}-${suffix}`;
  return candidate;
}
