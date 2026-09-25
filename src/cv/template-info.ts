import type { CvTemplateId } from '@/lib/schemas';

/** Names and descriptions for the template picker. Safe to import in client components. */
export const cvTemplateInfo: Record<CvTemplateId, { label: string; description: string }> = {
  classic: {
    label: 'Classic',
    description: 'Single column with ruled sections. The safest choice for applicant tracking systems.',
  },
  modern: {
    label: 'Modern',
    description: 'Single column with dates in a margin and green accents. Still easy for ATS to read.',
  },
  sidebar: {
    label: 'Sidebar',
    description: 'Two columns with contact, skills and education on the side. Best for people reading it directly.',
  },
};
