'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ExternalLink, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { FormField } from '@/components/dashboard/form-field';
import { LinesTextarea } from '@/components/dashboard/lines-textarea';
import { MediaEditor } from '@/components/dashboard/media-editor';
import { MultiSelect } from '@/components/dashboard/multi-select';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { type Project, projectSchema } from '@/lib/schemas';
import { slugify } from '@/lib/slug';
import { deleteProject, saveProject } from '@/server/actions/content';

const emptyProject: Project = {
  slug: '',
  name: '',
  tagline: '',
  summary: '',
  category: '',
  stack: [],
  topics: [],
  highlight: '',
  liveUrl: '',
  repoUrl: '',
  featured: false,
  gallery: [],
  overview: [],
  features: [],
  challenges: [],
};

interface ProjectEditorProps {
  /** Undefined when creating a new project. */
  project?: Project;
  categories: string[];
  topics: string[];
}

export function ProjectEditor({ project, categories, topics }: ProjectEditorProps) {
  const router = useRouter();
  const originalSlug = project?.slug;
  // Optional fields missing from the stored JSON start as empty values, so the form is not dirty on load.
  const form = useForm<Project>({ resolver: zodResolver(projectSchema), defaultValues: { ...emptyProject, ...project } });
  const [deleting, startDelete] = useTransition();
  const { errors, isDirty } = form.formState;
  const [savedSlug, cover, gallery] = useWatch({ control: form.control, name: ['slug', 'cover', 'gallery'] });

  const { save, saving } = useSaveAction(
    (data: Project) => saveProject(data, originalSlug),
    (data) => {
      form.reset(data);
      if (data.slug !== originalSlug) router.replace(`/dashboard/projects/${data.slug}`);
    },
  );

  // Uploads need a folder named after a saved slug.
  const mediaFolder = originalSlug && savedSlug === originalSlug ? `media/projects/${originalSlug}` : null;

  const remove = () =>
    startDelete(async () => {
      if (!originalSlug) return;
      const result = await deleteProject(originalSlug);
      if (result.ok) {
        toast.success('Project deleted');
        router.push('/dashboard/projects');
      } else {
        toast.error('Could not delete', { description: result.error });
      }
    });

  return (
    <form onSubmit={form.handleSubmit(save, () => toast.error('Some fields need attention'))} className="space-y-6">
      {originalSlug && (
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={`/projects/${originalSlug}`} target="_blank" rel="noreferrer">
              <ExternalLink />
              View on site
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" size="sm" disabled={deleting}>
                <Trash2 />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {project?.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  It is removed from the site, menus and CV. Its media files stay in public/media.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={remove}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
          <CardDescription>Name, one-line pitch and where it appears.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <FormField label="Name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              {...form.register('name', {
                onChange: (event: { target: { value: string } }) => {
                  if (!originalSlug && !form.getFieldState('slug').isDirty) {
                    form.setValue('slug', slugify(event.target.value), { shouldValidate: false });
                  }
                },
              })}
            />
          </FormField>
          <FormField
            label="Slug"
            htmlFor="slug"
            description="Used in the URL: /projects/your-slug"
            error={errors.slug?.message}
          >
            <Input id="slug" {...form.register('slug')} />
          </FormField>
          <FormField label="Category" htmlFor="category" error={errors.category?.message}>
            <Input id="category" list="project-categories" {...form.register('category')} />
            <datalist id="project-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </FormField>
          <Field orientation="horizontal" className="sm:mt-6">
            <Controller
              control={form.control}
              name="featured"
              render={({ field }) => (
                <Switch id="featured" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <div>
              <FieldLabel htmlFor="featured">Featured</FieldLabel>
              <FieldDescription>Shown large on the home page.</FieldDescription>
            </div>
          </Field>
          <FormField label="Tagline" htmlFor="tagline" error={errors.tagline?.message} className="sm:col-span-2">
            <Input id="tagline" {...form.register('tagline')} />
          </FormField>
          <FormField
            label="Summary"
            htmlFor="summary"
            description="Two or three sentences for the home page and the top of the project page."
            error={errors.summary?.message}
            className="sm:col-span-2"
          >
            <Textarea id="summary" rows={3} {...form.register('summary')} />
          </FormField>
          <FormField
            label="Highlight"
            htmlFor="highlight"
            description="Optional. An award or notable result, shown with an accent line."
            className="sm:col-span-2"
          >
            <Input id="highlight" {...form.register('highlight')} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links and stack</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <FormField label="Live site" htmlFor="liveUrl">
            <Input id="liveUrl" type="url" placeholder="https://" {...form.register('liveUrl')} />
          </FormField>
          <FormField label="Source code" htmlFor="repoUrl">
            <Input id="repoUrl" type="url" placeholder="https://github.com/" {...form.register('repoUrl')} />
          </FormField>
          <FormField label="Technologies" htmlFor="stack" className="sm:col-span-2">
            <Controller
              control={form.control}
              name="stack"
              render={({ field }) => <TechPicker id="stack" value={field.value} onChange={field.onChange} />}
            />
          </FormField>
          <FormField label="Topics" htmlFor="topics" description="Keywords used by the project search." className="sm:col-span-2">
            <Controller
              control={form.control}
              name="topics"
              render={({ field }) => (
                <MultiSelect
                  id="topics"
                  value={field.value ?? []}
                  onChange={field.onChange}
                  options={topics.map((topic) => ({ value: topic, label: topic }))}
                  addLabel="Add topic"
                  searchPlaceholder="Search or type a new topic"
                  allowCustom
                />
              )}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project page</CardTitle>
          <CardDescription>The long-form content on the project detail page.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <FormField label="Overview" htmlFor="overview" description="Separate paragraphs with a blank line.">
            <Controller
              control={form.control}
              name="overview"
              render={({ field }) => (
                <LinesTextarea id="overview" mode="paragraphs" rows={8} value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
          <FormField label="Features" htmlFor="features" description="One per line.">
            <Controller
              control={form.control}
              name="features"
              render={({ field }) => (
                <LinesTextarea id="features" rows={6} value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
          <FormField label="Challenges" htmlFor="challenges" description="One per line.">
            <Controller
              control={form.control}
              name="challenges"
              render={({ field }) => (
                <LinesTextarea id="challenges" rows={5} value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
          <CardDescription>The cover appears on cards and at the top of the page; the gallery follows the content.</CardDescription>
        </CardHeader>
        <CardContent>
          <MediaEditor
            folder={mediaFolder}
            cover={cover}
            gallery={gallery}
            onCoverChange={(media) => form.setValue('cover', media, { shouldDirty: true })}
            onGalleryChange={(media) => form.setValue('gallery', media, { shouldDirty: true })}
          />
        </CardContent>
      </Card>

      <SaveBar dirty={isDirty} saving={saving} onDiscard={() => form.reset()} />
    </form>
  );
}
