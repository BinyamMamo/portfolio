'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormField } from '@/components/dashboard/form-field';
import { MultiSelect } from '@/components/dashboard/multi-select';
import { SaveBar } from '@/components/dashboard/save-bar';
import { useSaveAction } from '@/components/dashboard/use-save-action';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { NavigationContent } from '@/lib/schemas';
import { saveNavigation } from '@/server/actions/content';

const NO_FEATURED = '__none';

const formSchema = z.object({
  projectGroups: z.array(
    z.object({
      title: z.string().trim().min(1, 'Title is required'),
      slugs: z.array(z.string()),
    }),
  ),
  featuredSlug: z.string(),
  featuredEyebrow: z.string().trim(),
});
type FormValues = z.infer<typeof formSchema>;

const toForm = (navigation: NavigationContent): FormValues => ({
  projectGroups: navigation.projectGroups,
  featuredSlug: navigation.featured?.slug ?? NO_FEATURED,
  featuredEyebrow: navigation.featured?.eyebrow ?? '',
});

const fromForm = (values: FormValues): NavigationContent => ({
  projectGroups: values.projectGroups,
  featured:
    values.featuredSlug === NO_FEATURED ? undefined : { slug: values.featuredSlug, eyebrow: values.featuredEyebrow },
});

interface ProjectsMenuEditorProps {
  navigation: NavigationContent;
  projects: { slug: string; name: string }[];
}

/** Groups and the featured card in the Projects mega menu. */
export function ProjectsMenuEditor({ navigation, projects }: ProjectsMenuEditorProps) {
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: toForm(navigation) });
  const groups = useFieldArray({ control: form.control, name: 'projectGroups' });
  const { save, saving } = useSaveAction(saveNavigation, (data) => form.reset(toForm(data)));
  const { errors, isDirty } = form.formState;
  const options = projects.map((project) => ({ value: project.slug, label: project.name }));

  return (
    <form onSubmit={form.handleSubmit((values) => save(fromForm(values)))}>
      <Card>
        <CardHeader>
          <CardTitle>Projects menu</CardTitle>
          <CardDescription>
            How projects are grouped in the site header. Projects not in any group appear under More projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {groups.fields.map((group, index) => (
            <div key={group.id} className="grid gap-3 rounded-lg border p-3">
              <div className="flex items-end gap-2">
                <FormField
                  label="Group title"
                  htmlFor={`projectGroups.${index}.title`}
                  error={errors.projectGroups?.[index]?.title?.message}
                  className="flex-1"
                >
                  <Input id={`projectGroups.${index}.title`} {...form.register(`projectGroups.${index}.title`)} />
                </FormField>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => groups.move(index, index - 1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Move down"
                  disabled={index === groups.fields.length - 1}
                  onClick={() => groups.move(index, index + 1)}
                >
                  <ArrowDown />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove group"
                  onClick={() => groups.remove(index)}
                >
                  <Trash2 />
                </Button>
              </div>
              <Controller
                control={form.control}
                name={`projectGroups.${index}.slugs`}
                render={({ field }) => (
                  <MultiSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={options}
                    addLabel="Add project"
                    searchPlaceholder="Search projects"
                  />
                )}
              />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => groups.append({ title: '', slugs: [] })}>
            <Plus />
            Add group
          </Button>

          <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
            <FormField label="Featured project" description="Shown with its cover image beside the groups.">
              <Controller
                control={form.control}
                name="featuredSlug"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-label="Featured project">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_FEATURED}>None</SelectItem>
                      {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Featured label" htmlFor="featuredEyebrow" description="A short tag, like Top 5 at ALX.">
              <Input id="featuredEyebrow" {...form.register('featuredEyebrow')} />
            </FormField>
          </div>
        </CardContent>
      </Card>
      <SaveBar dirty={isDirty} saving={saving} onDiscard={() => form.reset()} />
    </form>
  );
}
