import type { ReactNode } from 'react';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  description?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}

/** Label, control, hint and error in the standard shadcn Field layout. */
export function FormField({ label, htmlFor, description, error, className, children }: FormFieldProps) {
  return (
    <Field data-invalid={error ? true : undefined} className={className}>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
