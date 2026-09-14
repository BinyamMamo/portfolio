import { Logo } from '@/components/logo';
import { cn } from '@/lib/cn';
import { getTech } from '@/lib/tech';

interface TechListProps {
  /** Tech ids from the registry, or custom names (shown without a logo). */
  ids: string[];
  /** Shows only the first few, followed by a count of the rest. */
  limit?: number;
  className?: string;
}

export function TechList({ ids, limit, className }: TechListProps) {
  const shown = limit ? ids.slice(0, limit) : ids;
  const hidden = ids.length - shown.length;

  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-2', className)}>
      {shown.map((id) => {
        const { name, logo } = getTech(id);
        return (
          <li key={id} className="flex items-center gap-1.5 text-xs text-fg-muted">
            {logo && <Logo logo={logo} size={14} />}
            {name}
          </li>
        );
      })}
      {hidden > 0 && <li className="text-xs text-fg-subtle">+{hidden} more</li>}
    </ul>
  );
}
