'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormField } from '@/components/dashboard/form-field';
import { SaveBar } from '@/components/dashboard/save-bar';
import { TechPicker } from '@/components/dashboard/tech-picker';
import { useSaveAction } from '@/components/dashboard/use-save-action';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { type SkillGroup, skillGroupsSchema } from '@/lib/schemas';
import { uniqueSlug } from '@/lib/slug';
import { saveSkills } from '@/server/actions/content';

const formSchema = z.object({ groups: skillGroupsSchema });
type FormValues = z.infer<typeof formSchema>;

export function SkillsEditor({ groups }: { groups: SkillGroup[] }) {
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { groups } });
  // keyName keeps react-hook-form from overwriting each group's own `id`.
  const fields = useFieldArray({ control: form.control, name: 'groups', keyName: 'fieldKey' });
  const { save, saving } = useSaveAction(saveSkills, (data) => form.reset({ groups: data }));
  const { errors, isDirty } = form.formState;
  const watchedGroups = useWatch({ control: form.control, name: 'groups' });

  return (
    <form onSubmit={form.handleSubmit((values) => save(values.groups))} className="space-y-4">
      {fields.fields.map((group, index) => (
        <Card key={group.fieldKey}>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">{watchedGroups[index]?.title || 'Untitled group'}</CardTitle>
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
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove group"
                onClick={() => fields.remove(index)}
              >
                <Trash2 />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5">
            <FormField label="Group name" htmlFor={`groups.${index}.title`} error={errors.groups?.[index]?.title?.message}>
              <Input id={`groups.${index}.title`} {...form.register(`groups.${index}.title`)} />
            </FormField>
            <FormField
              label="Skills"
              htmlFor={`groups.${index}.items`}
              description="Pick from the logo library, or type any other name."
            >
              <Controller
                control={form.control}
                name={`groups.${index}.items`}
                render={({ field }) => (
                  <TechPicker id={`groups.${index}.items`} value={field.value} onChange={field.onChange} />
                )}
              />
            </FormField>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          fields.append({
            id: uniqueSlug('new-group', form.getValues('groups').map((existing) => existing.id)),
            title: '',
            items: [],
          })
        }
      >
        <Plus />
        Add group
      </Button>

      <SaveBar dirty={isDirty} saving={saving} onDiscard={() => form.reset()} />
    </form>
  );
}
