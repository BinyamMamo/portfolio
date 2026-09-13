'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormField } from '@/components/dashboard/form-field';
import { LinesTextarea } from '@/components/dashboard/lines-textarea';
import { SaveBar } from '@/components/dashboard/save-bar';
import { TechPicker } from '@/components/dashboard/tech-picker';
import { useSaveAction } from '@/components/dashboard/use-save-action';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { type TimelineEntry, timelineSchema } from '@/lib/schemas';
import { uniqueSlug } from '@/lib/slug';
import type { ActionResult } from '@/server/actions/content';

const formSchema = z.object({ entries: timelineSchema });
type FormValues = z.infer<typeof formSchema>;

/** Placeholder id for entries created here; replaced with a readable id from the org and title on save. */
const DRAFT_PREFIX = 'draft-';

/** Fills optional fields so inputs start with the same values the form compares against (no false dirty state). */
const withDefaults = (entry: TimelineEntry): TimelineEntry => ({
  orgUrl: '',
  end: '',
  details: { label: '', items: [] },
  stack: [],
  ...entry,
});

interface TimelineEditorProps {
  entries: TimelineEntry[];
  onSave: (entries: TimelineEntry[]) => Promise<ActionResult>;
  /** Singular noun used in labels, for example "experience" or "education entry". */
  noun: string;
}

export function TimelineEditor({ entries, onSave, noun }: TimelineEditorProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { entries: entries.map(withDefaults) },
  });
  const fields = useFieldArray({ control: form.control, name: 'entries', keyName: 'fieldKey' });
  const [editing, setEditing] = useState<number | null>(null);
  const { save, saving } = useSaveAction(onSave, (data) => form.reset({ entries: data }));
  const { errors, isDirty } = form.formState;
  const watchedEntries = useWatch({ control: form.control, name: 'entries' });

  const submit = form.handleSubmit(
    (values) => {
      const taken = values.entries.filter((entry) => !entry.id.startsWith(DRAFT_PREFIX)).map((entry) => entry.id);
      const withIds = values.entries.map((entry) => {
        if (!entry.id.startsWith(DRAFT_PREFIX)) return entry;
        const id = uniqueSlug(`${entry.org}-${entry.title}`, taken);
        taken.push(id);
        return { ...entry, id };
      });
      save(withIds);
    },
    (formErrors) => {
      const firstInvalid = formErrors.entries?.findIndex?.((entryErrors) => Boolean(entryErrors));
      if (firstInvalid !== undefined && firstInvalid >= 0) setEditing(firstInvalid);
      toast.error('Some fields need attention');
    },
  );

  const addEntry = () => {
    fields.append({
      id: `${DRAFT_PREFIX}${Date.now()}`,
      title: '',
      org: '',
      orgUrl: '',
      start: '',
      end: '',
      points: [],
      details: { label: '', items: [] },
      stack: [],
    });
    setEditing(fields.fields.length);
  };

  const current = editing === null ? undefined : `entries.${editing}` as const;
  const currentErrors = editing === null ? undefined : errors.entries?.[editing];

  return (
    <form onSubmit={submit} className="space-y-3">
      {fields.fields.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">No entries yet.</CardContent>
        </Card>
      )}

      {fields.fields.map((entry, index) => {
        const values = watchedEntries[index] ?? entry;
        return (
          <Card key={entry.fieldKey}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{values.title || 'Untitled'}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {[values.org, [values.start, values.end].filter(Boolean).join(' to ')].filter(Boolean).join(' · ')}
                </p>
              </div>
              {errors.entries?.[index] && <Badge variant="destructive">Needs attention</Badge>}
              <div className="flex gap-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditing(index)}>
                  <Pencil />
                  Edit
                </Button>
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${noun}`}>
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this {noun}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {values.title || 'This entry'} will be removed when you save.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" onClick={() => fields.remove(index)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button type="button" variant="outline" onClick={addEntry}>
        <Plus />
        Add {noun}
      </Button>

      <Sheet open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Edit {noun}</SheetTitle>
            <SheetDescription>Changes are kept here until you save the page.</SheetDescription>
          </SheetHeader>
          {current && (
            <div className="grid gap-5 px-4 pb-4">
              <FormField label="Title" htmlFor={`${current}.title`} error={currentErrors?.title?.message}>
                <Input id={`${current}.title`} {...form.register(`${current}.title`)} />
              </FormField>
              <FormField label="Organization" htmlFor={`${current}.org`} error={currentErrors?.org?.message}>
                <Input id={`${current}.org`} {...form.register(`${current}.org`)} />
              </FormField>
              <FormField label="Organization website" htmlFor={`${current}.orgUrl`} error={currentErrors?.orgUrl?.message}>
                <Input id={`${current}.orgUrl`} type="url" {...form.register(`${current}.orgUrl`)} />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Start" htmlFor={`${current}.start`} error={currentErrors?.start?.message}>
                  <Input id={`${current}.start`} placeholder="Jan 2025" {...form.register(`${current}.start`)} />
                </FormField>
                <FormField label="End" htmlFor={`${current}.end`} description="For example Present">
                  <Input id={`${current}.end`} placeholder="Present" {...form.register(`${current}.end`)} />
                </FormField>
              </div>
              <FormField label="Highlights" htmlFor={`${current}.points`} description="One per line.">
                <Controller
                  control={form.control}
                  name={`${current}.points`}
                  render={({ field }) => (
                    <LinesTextarea id={`${current}.points`} rows={5} value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
                <FormField label="List label" htmlFor={`${current}.details.label`} description="For example Coursework">
                  <Input id={`${current}.details.label`} {...form.register(`${current}.details.label`)} />
                </FormField>
                <FormField label="List items" htmlFor={`${current}.details.items`} description="One per line.">
                  <Controller
                    control={form.control}
                    name={`${current}.details.items`}
                    render={({ field }) => (
                      <LinesTextarea
                        id={`${current}.details.items`}
                        rows={4}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </FormField>
              </div>
              <FormField label="Technologies" htmlFor={`${current}.stack`}>
                <Controller
                  control={form.control}
                  name={`${current}.stack`}
                  render={({ field }) => (
                    <TechPicker id={`${current}.stack`} value={field.value ?? []} onChange={field.onChange} />
                  )}
                />
              </FormField>
            </div>
          )}
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button">Done</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <SaveBar dirty={isDirty} saving={saving} onDiscard={() => form.reset()} />
    </form>
  );
}
