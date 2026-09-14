'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormField } from '@/components/dashboard/form-field';
import { SaveBar } from '@/components/dashboard/save-bar';
import { useSaveAction } from '@/components/dashboard/use-save-action';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type Area, areasSchema } from '@/lib/schemas';
import { uniqueSlug } from '@/lib/slug';
import { saveAreas } from '@/server/actions/content';

const formSchema = z.object({ areas: areasSchema });
type FormValues = z.infer<typeof formSchema>;

export function AreasEditor({ areas, counts }: { areas: Area[]; counts: Record<string, number> }) {
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { areas } });
  // keyName keeps react-hook-form from overwriting each area's own `id`.
  const fields = useFieldArray({ control: form.control, name: 'areas', keyName: 'fieldKey' });
  const { save, saving } = useSaveAction(saveAreas, (data) => form.reset({ areas: data }));
  const { errors, isDirty } = form.formState;
  const watched = useWatch({ control: form.control, name: 'areas' });

  return (
    <form onSubmit={form.handleSubmit((values) => save(values.areas))} className="space-y-4">
      {fields.fields.map((area, index) => {
        const count = counts[area.id] ?? 0;
        return (
          <Card key={area.fieldKey}>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{watched[index]?.title || 'Untitled area'}</CardTitle>
                <CardDescription>
                  {count} {count === 1 ? 'project' : 'projects'}. Removing an area also removes it from those projects.
                </CardDescription>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => fields.move(index, index - 1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Move down"
                  disabled={index === fields.fields.length - 1}
                  onClick={() => fields.move(index, index + 1)}
                >
                  <ArrowDown />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove area" onClick={() => fields.remove(index)}>
                  <Trash2 />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-[1fr_14rem]">
              <FormField label="Title" htmlFor={`areas.${index}.title`} error={errors.areas?.[index]?.title?.message}>
                <Input id={`areas.${index}.title`} {...form.register(`areas.${index}.title`)} />
              </FormField>
              <FormField
                label="Id"
                htmlFor={`areas.${index}.id`}
                description="Projects refer to this."
                error={errors.areas?.[index]?.id?.message}
              >
                <Input id={`areas.${index}.id`} {...form.register(`areas.${index}.id`)} />
              </FormField>
              <FormField label="Summary" htmlFor={`areas.${index}.summary`} className="sm:col-span-2">
                <Textarea id={`areas.${index}.summary`} rows={2} {...form.register(`areas.${index}.summary`)} />
              </FormField>
            </CardContent>
          </Card>
        );
      })}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          fields.append({
            id: uniqueSlug('new-area', form.getValues('areas').map((existing) => existing.id)),
            title: '',
            summary: '',
          })
        }
      >
        <Plus />
        Add area
      </Button>

      <SaveBar dirty={isDirty} saving={saving} onDiscard={() => form.reset()} />
    </form>
  );
}
