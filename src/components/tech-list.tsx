import { Logo } from '@/components/logo';
import { cn } from '@/lib/cn';
import { getTech, type TechId } from '@/lib/tech';

interface TechListProps {
  ids: TechId[];
  className?: string;
}

export function TechList({ ids, className }: TechListProps) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-2', className)}>
      {ids.map((id) => {
        const { name, logo } = getTech(id);
        return (
          <li key={id} className="flex items-center gap-1.5 text-xs text-fg-muted">
            {logo && <Logo logo={logo} size={14} />}
            {name}
          </li>
        );
      })}
    </ul>
  );
}
