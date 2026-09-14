import Image from 'next/image';

import { Logo } from '@/components/logo';
import { ProjectVideo } from '@/components/project-video';
import type { Project, ProjectMedia } from '@/lib/schemas';
import { cn } from '@/lib/cn';
import { getTech } from '@/lib/tech';

interface ProjectMediaViewProps {
  media: ProjectMedia | undefined;
  /**
   * `card` crops into a fixed 16:9 frame and plays on hover. `full` keeps the natural ratio and plays in view.
   * `slide` fits into a fixed 16:10 frame, so carousel slides of different sizes keep one height.
   */
  variant: 'card' | 'full' | 'slide';
  sizes: string;
  /** Shown when there is no media. */
  project?: Pick<Project, 'name' | 'stack'>;
  preload?: boolean;
  className?: string;
}

export function ProjectMediaView({ media, variant, sizes, project, preload, className }: ProjectMediaViewProps) {
  const isCard = variant === 'card';

  if (!media) {
    return (
      <div
        className={cn(
          'flex aspect-video items-center justify-center bg-surface-muted bg-[radial-gradient(var(--border-strong)_1px,transparent_1px)] [background-size:18px_18px]',
          className,
        )}
      >
        {project && (
          <div className="card flex items-center gap-3 rounded-control px-4 py-3">
            {project.stack.map((id) => {
              const { logo, name } = getTech(id);
              return logo ? <Logo key={id} logo={logo} size={22} /> : <span key={id} className="sr-only">{name}</span>;
            })}
          </div>
        )}
      </div>
    );
  }

  const isSlide = variant === 'slide';
  const ratio = media.width / media.height;
  const isPortrait = ratio < 1;
  const fit = isCard && !isPortrait ? 'object-cover object-top' : 'object-contain';
  const mediaClass = cn('absolute inset-0 size-full', fit);

  return (
    <div
      className={cn(
        'relative mx-auto w-full overflow-hidden bg-surface-muted',
        // Showcase captures are framed at 16:10, so cards use the same ratio and nothing is cropped.
        isCard && 'aspect-[16/10]',
        isSlide && 'aspect-[16/10]',
        className,
      )}
      style={
        isCard || isSlide
          ? undefined
          : {
              aspectRatio: `${media.width} / ${media.height}`,
              // Tall captures would otherwise fill several screens.
              maxWidth: isPortrait ? `calc(75vh * ${ratio.toFixed(3)})` : undefined,
            }
      }
    >
      {media.kind === 'video' ? (
        <ProjectVideo
          src={media.src}
          poster={media.poster}
          label={media.alt}
          trigger={isCard ? 'hover' : 'in-view'}
          className={mediaClass}
        />
      ) : (
        <Image src={media.src} alt={media.alt} fill sizes={sizes} preload={preload} className={mediaClass} />
      )}
    </div>
  );
}
