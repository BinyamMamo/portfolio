import type { DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

import type { ResolvedCv } from '@/cv/resolve';
import { ClassicTemplate } from '@/cv/templates/classic';
import { ModernTemplate } from '@/cv/templates/modern';
import { SidebarTemplate } from '@/cv/templates/sidebar';
import { SpaciousTemplate } from '@/cv/templates/spacious';
import { VibrantTemplate } from '@/cv/templates/vibrant';
import type { CvTemplateId } from '@/lib/schemas';

export type CvTemplate = (props: { cv: ResolvedCv }) => ReactElement<DocumentProps>;

/** PDF templates. Labels for pickers live in src/cv/template-info.ts so client code never loads react-pdf. */
export const cvTemplates: Record<CvTemplateId, CvTemplate> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  sidebar: SidebarTemplate,
  vibrant: VibrantTemplate,
  spacious: SpaciousTemplate,
};
