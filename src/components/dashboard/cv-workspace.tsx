'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Download, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { CvVariantForm } from '@/components/dashboard/cv-variant-form';
import { FormField } from '@/components/dashboard/form-field';
import { MultiSelect } from '@/components/dashboard/multi-select';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cvTemplateInfo } from '@/cv/template-info';
import { type CvSettings, cvSettingsSchema, type CvTemplateId, cvTemplateIds, type CvVariant } from '@/lib/schemas';
import { deleteCvVariant, saveCvSettings } from '@/server/actions/content';

const DEFAULT_VERSION = '__default';

interface Option {
  value: string;
  label: string;
}

interface CvWorkspaceProps {
  settings: CvSettings;
  variants: CvVariant[];
  projects: Option[];
  experience: Option[];
  skills: string[];
}

export function CvWorkspace({ settings, variants, projects, experience, skills }: CvWorkspaceProps) {
  const router = useRouter();
  const [version, setVersion] = useState(DEFAULT_VERSION);
  const [template, setTemplate] = useState<CvTemplateId>(settings.template);
  const [previewKey, setPreviewKey] = useState(0);
  const [editing, setEditing] = useState<CvVariant | 'new' | null>(null);
  const [deleting, startDelete] = useTransition();

  const settingsForm = useForm<CvSettings>({ resolver: zodResolver(cvSettingsSchema), defaultValues: settings });
  const { save: saveSettings, saving: savingSettings } = useSaveAction(saveCvSettings, (data) => {
    settingsForm.reset(data);
    setPreviewKey((key) => key + 1);
  });

  const activeVariant = variants.find((variant) => variant.slug === version);
  // A variant chosen in the picker may no longer exist after a delete; fall back to the default CV.
  const variantParam = activeVariant ? activeVariant.slug : '';
  const query = new URLSearchParams({ template, ...(variantParam ? { variant: variantParam } : {}) });
  const previewUrl = `/api/dashboard/cv?${query}&v=${previewKey}`;

  const selectVersion = (slug: string) => {
    setVersion(slug);
    const variant = variants.find((item) => item.slug === slug);
    setTemplate(variant?.template ?? settings.template);
  };

  const removeVariant = (slug: string) =>
    startDelete(async () => {
      const result = await deleteCvVariant(slug);
      if (result.ok) {
        toast.success('Version deleted');
        if (version === slug) selectVersion(DEFAULT_VERSION);
        router.refresh();
      } else {
        toast.error('Could not delete', { description: result.error });
      }
    });

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="xl:row-span-2">
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Preview</CardTitle>
            <CardDescription>{cvTemplateInfo[template].description}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={activeVariant ? version : DEFAULT_VERSION} onValueChange={selectVersion}>
              <SelectTrigger className="sm:w-56" aria-label="CV version">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DEFAULT_VERSION}>Default CV</SelectItem>
                {variants.map((variant) => (
                  <SelectItem key={variant.slug} value={variant.slug}>
                    {variant.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={template} onValueChange={(value) => setTemplate(value as CvTemplateId)}>
              <TabsList>
                {cvTemplateIds.map((id) => (
                  <TabsTrigger key={id} value={id}>
                    {cvTemplateInfo[id].label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={previewUrl} target="_blank" rel="noreferrer">
                  <ExternalLink />
                  Open
                </a>
              </Button>
              <Button size="sm" asChild>
                <a href={`${previewUrl}&download`}>
                  <Download />
                  Download
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <iframe
            key={previewUrl}
            src={previewUrl}
            title="CV preview"
            className="h-[75vh] min-h-[32rem] w-full rounded-lg border bg-white"
          />
        </CardContent>
      </Card>

      <Card>
        <form onSubmit={settingsForm.handleSubmit(saveSettings)} className="flex flex-col gap-6">
          <CardHeader>
            <CardTitle>Default CV</CardTitle>
            <CardDescription>Used for the public resume.pdf and as the base for tailored versions.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <FormField label="Template">
              <Controller
                control={settingsForm.control}
                name="template"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-label="Default template">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
            <FormField
              label="File name"
              htmlFor="fileName"
              description="Without .pdf"
              error={settingsForm.formState.errors.fileName?.message}
            >
              <Input id="fileName" {...settingsForm.register('fileName')} />
            </FormField>
            <FormField label="Projects" htmlFor="cv-projects" description="Shown on the CV in this order.">
              <Controller
                control={settingsForm.control}
                name="projectSlugs"
                render={({ field }) => (
                  <MultiSelect
                    id="cv-projects"
                    value={field.value}
                    onChange={field.onChange}
                    options={projects}
                    addLabel="Add project"
                    searchPlaceholder="Search projects"
                  />
                )}
              />
            </FormField>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={!settingsForm.formState.isDirty || savingSettings}>
              {savingSettings ? 'Saving' : 'Save defaults'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tailored versions</CardTitle>
          <CardDescription>Variations for specific applications. Ask Claude to draft one from a job post.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {variants.length === 0 && <p className="text-sm text-muted-foreground">No tailored versions yet.</p>}
          {variants.map((variant) => (
            <div key={variant.slug} className="flex items-center gap-2 rounded-lg border p-3">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => selectVersion(variant.slug)}>
                <p className="truncate text-sm font-medium">{variant.label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[variant.company, variant.role].filter(Boolean).join(', ') || variant.slug}
                </p>
              </button>
              {variant.template && <Badge variant="outline">{cvTemplateInfo[variant.template].label}</Badge>}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${variant.label}`}
                onClick={() => setEditing(variant)}
              >
                <Pencil />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${variant.label}`} disabled={deleting}>
                    <Trash2 />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {variant.label}?</AlertDialogTitle>
                    <AlertDialogDescription>This removes content/cv/variants/{variant.slug}.json.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={() => removeVariant(variant.slug)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button type="button" variant="outline" onClick={() => setEditing('new')}>
            <Plus />
            New version
          </Button>
        </CardFooter>
      </Card>

      <Sheet open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{editing === 'new' ? 'New tailored version' : 'Edit tailored version'}</SheetTitle>
            <SheetDescription>Anything left empty uses the default CV.</SheetDescription>
          </SheetHeader>
          {editing !== null && (
            <CvVariantForm
              key={editing === 'new' ? 'new' : editing.slug}
              variant={editing === 'new' ? undefined : editing}
              projects={projects}
              experience={experience}
              skills={skills}
              onSaved={(saved) => {
                setEditing(null);
                setVersion(saved.slug);
                setTemplate(saved.template ?? settings.template);
                setPreviewKey((key) => key + 1);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
