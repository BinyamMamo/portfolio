'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormField } from '@/components/dashboard/form-field';
import { MultiSelect } from '@/components/dashboard/multi-select';
import { useSaveAction } from '@/components/dashboard/use-save-action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SheetFooter } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { cvTemplateInfo } from '@/cv/template-info';
import { cvTemplateIds, type CvVariant } from '@/lib/schemas';
import { slugify } from '@/lib/slug';
import { saveCvVariant } from '@/server/actions/content';

const INHERIT = 'default';

const formSchema = z.object({
  label: z.string().trim().min(1, 'Label is required'),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single dashes'),
  company: z.string().trim(),
  role: z.string().trim(),
  template: z.enum([INHERIT, ...cvTemplateIds]),
  headline: z.string().trim(),
  summary: z.string().trim(),
  projectSlugs: z.array(z.string()),
  experienceIds: z.array(z.string()),
  skills: z.array(z.string()),
  notes: z.string().trim(),
});
type FormValues = z.infer<typeof formSchema>;

const toForm = (variant?: CvVariant): FormValues => ({
  label: variant?.label ?? '',
  slug: variant?.slug ?? '',
  company: variant?.company ?? '',
  role: variant?.role ?? '',
  template: variant?.template ?? INHERIT,
  headline: variant?.headline ?? '',
  summary: variant?.summary ?? '',
  projectSlugs: variant?.projectSlugs ?? [],
  experienceIds: variant?.experienceIds ?? [],
  skills: variant?.skills ?? [],
  notes: variant?.notes ?? '',
});

const text = (value: string) => value || undefined;
const list = (value: string[]) => (value.length > 0 ? value : undefined);

/** Empty fields fall back to the default CV. Extra bullet points (not editable here) are preserved. */
const fromForm = (values: FormValues, existing?: CvVariant): CvVariant => ({
  slug: values.slug,
  label: values.label,
  company: text(values.company),
  role: text(values.role),
  template: values.template === INHERIT ? undefined : values.template,
  headline: text(values.headline),
  summary: text(values.summary),
  projectSlugs: list(values.projectSlugs),
  experienceIds: list(values.experienceIds),
  skills: list(values.skills),
  extraPoints: existing?.extraPoints,
  notes: text(values.notes),
});

interface CvVariantFormProps {
  variant?: CvVariant;
  projects: { value: string; label: string }[];
  experience: { value: string; label: string }[];
  skills: string[];
  onSaved: (variant: CvVariant) => void;
}

export function CvVariantForm({ variant, projects, experience, skills, onSaved }: CvVariantFormProps) {
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: toForm(variant) });
  const { save, saving } = useSaveAction((data: CvVariant) => saveCvVariant(data, variant?.slug), onSaved);
  const { errors } = form.formState;
  const slugValue = useWatch({ control: form.control, name: 'slug' });

  return (
    <form onSubmit={form.handleSubmit((values) => save(fromForm(values, variant)))} className="flex flex-1 flex-col">
      <div className="grid gap-5 px-4 pb-4">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Label" htmlFor="variant-label" error={errors.label?.message}>
            <Input
              id="variant-label"
              placeholder="Acme backend role"
              {...form.register('label', {
                onChange: (event: { target: { value: string } }) => {
                  if (!variant && !form.getFieldState('slug').isDirty) form.setValue('slug', slugify(event.target.value));
                },
              })}
            />
          </FormField>
          <FormField label="Slug" htmlFor="variant-slug" description="File and download name." error={errors.slug?.message}>
            <Input id="variant-slug" {...form.register('slug')} />
          </FormField>
          <FormField label="Company" htmlFor="variant-company">
            <Input id="variant-company" {...form.register('company')} />
          </FormField>
          <FormField label="Role" htmlFor="variant-role">
            <Input id="variant-role" {...form.register('role')} />
          </FormField>
        </div>

        <FormField label="Template">
          <Controller
            control={form.control}
            name="template"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-label="Template">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={INHERIT}>Same as default CV</SelectItem>
                  {cvTemplateIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {cvTemplateInfo[id].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField label="Headline" htmlFor="variant-headline" description="Leave empty to use your role.">
          <Input id="variant-headline" {...form.register('headline')} />
        </FormField>
        <FormField label="Summary" htmlFor="variant-summary" description="Leave empty to use your profile summary.">
          <Textarea id="variant-summary" rows={4} {...form.register('summary')} />
        </FormField>

        <FormField label="Projects" htmlFor="variant-projects" description="In order. Leave empty to use the default selection.">
          <Controller
            control={form.control}
            name="projectSlugs"
            render={({ field }) => (
              <MultiSelect
                id="variant-projects"
                value={field.value}
                onChange={field.onChange}
                options={projects}
                addLabel="Add project"
                searchPlaceholder="Search projects"
              />
            )}
          />
        </FormField>
        <FormField label="Experience" htmlFor="variant-experience" description="In order. Leave empty to include all.">
          <Controller
            control={form.control}
            name="experienceIds"
            render={({ field }) => (
              <MultiSelect
                id="variant-experience"
                value={field.value}
                onChange={field.onChange}
                options={experience}
                addLabel="Add experience"
                searchPlaceholder="Search experience"
              />
            )}
          />
        </FormField>
        <FormField
          label="Skills to put first"
          htmlFor="variant-skills"
          description="Listed first within their group, in this order."
        >
          <Controller
            control={form.control}
            name="skills"
            render={({ field }) => (
              <MultiSelect
                id="variant-skills"
                value={field.value}
                onChange={field.onChange}
                options={skills.map((skill) => ({ value: skill, label: skill }))}
                addLabel="Add skill"
                searchPlaceholder="Search skills"
              />
            )}
          />
        </FormField>
        <FormField
          label="Notes"
          htmlFor="variant-notes"
          description="Private. For example the job link or what the role emphasizes."
        >
          <Textarea id="variant-notes" rows={3} {...form.register('notes')} />
        </FormField>
        <p className="text-xs text-muted-foreground">
          Extra bullet points for specific entries can be added by Claude or in content/cv/variants/
          {slugValue || 'slug'}.json and are kept when you save here.
        </p>
      </div>
      <SheetFooter className="mt-auto border-t">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving' : variant ? 'Save version' : 'Create version'}
        </Button>
      </SheetFooter>
    </form>
  );
}
