'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';

import { FormField } from '@/components/dashboard/form-field';
import { SaveBar } from '@/components/dashboard/save-bar';
import { useSaveAction } from '@/components/dashboard/use-save-action';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { linkIcons, type LinkIcon, type Profile, profileSchema } from '@/lib/schemas';
import { saveProfile } from '@/server/actions/content';

const iconLabels: Record<LinkIcon, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  website: 'Website',
};

const MAX_FACTS = 4;

export function ProfileEditor({ profile }: { profile: Profile }) {
  const form = useForm<Profile>({ resolver: zodResolver(profileSchema), defaultValues: profile });
  const facts = useFieldArray({ control: form.control, name: 'facts' });
  const links = useFieldArray({ control: form.control, name: 'links' });
  const { save, saving } = useSaveAction(saveProfile, (data) => form.reset(data));
  const { errors, isDirty } = form.formState;
  const [avatar, name] = useWatch({ control: form.control, name: ['avatar', 'name'] });

  return (
    <form onSubmit={form.handleSubmit(save)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
          <CardDescription>Shown in the hero, the footer and at the top of your CV.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" {...form.register('name')} />
          </FormField>
          <FormField label="Role" htmlFor="role" error={errors.role?.message}>
            <Input id="role" placeholder="Backend Developer" {...form.register('role')} />
          </FormField>
          <FormField label="Location" htmlFor="location" error={errors.location?.message}>
            <Input id="location" placeholder="Dubai, UAE" {...form.register('location')} />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" {...form.register('email')} />
          </FormField>
          <FormField
            label="Phone"
            htmlFor="phone"
            description="Optional. Printed on the CV only."
            error={errors.phone?.message}
          >
            <Input id="phone" type="tel" {...form.register('phone')} />
          </FormField>
          <FormField
            label="Website"
            htmlFor="siteUrl"
            description="Used for links, the sitemap and search previews."
            error={errors.siteUrl?.message}
          >
            <Input id="siteUrl" type="url" {...form.register('siteUrl')} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Your introduction on the site and the summary on your CV.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <FormField
            label="Intro"
            htmlFor="intro"
            description="Shown under your name on the home page. Write [label](https://link) to add a link."
            error={errors.intro?.message}
          >
            <Textarea id="intro" rows={4} {...form.register('intro')} />
          </FormField>
          <FormField
            label="Summary"
            htmlFor="summary"
            description="One or two sentences for search results and the top of your CV."
            error={errors.summary?.message}
          >
            <Textarea id="summary" rows={3} {...form.register('summary')} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photo</CardTitle>
          <CardDescription>A portrait used in the hero. Leave empty to hide it.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="size-20 rounded-lg">
            {avatar && <AvatarImage src={avatar} alt="" className="object-cover" />}
            <AvatarFallback className="rounded-lg">{name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <FormField
            label="Image path"
            htmlFor="avatar"
            description="A file inside public/, for example /media/portrait.webp"
            error={errors.avatar?.message}
            className="flex-1"
          >
            <Input id="avatar" {...form.register('avatar')} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Highlights</CardTitle>
          <CardDescription>Up to {MAX_FACTS} short facts shown under the hero, such as a GPA or an award.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {facts.fields.map((fact, index) => (
            <div key={fact.id} className="grid items-start gap-3 sm:grid-cols-[10rem_1fr_auto]">
              <FormField label="Value" htmlFor={`facts.${index}.value`} error={errors.facts?.[index]?.value?.message}>
                <Input id={`facts.${index}.value`} placeholder="3.99" {...form.register(`facts.${index}.value`)} />
              </FormField>
              <FormField label="Label" htmlFor={`facts.${index}.label`} error={errors.facts?.[index]?.label?.message}>
                <Input
                  id={`facts.${index}.label`}
                  placeholder="GPA in Computer Engineering"
                  {...form.register(`facts.${index}.label`)}
                />
              </FormField>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove highlight"
                className="sm:mt-6"
                onClick={() => facts.remove(index)}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={facts.fields.length >= MAX_FACTS}
            onClick={() => facts.append({ value: '', label: '' })}
          >
            <Plus />
            Add highlight
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
          <CardDescription>Profiles shown in the hero, contact section, footer and on your CV.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {links.fields.map((link, index) => {
            const linkErrors = errors.links?.[index];
            return (
              <div key={link.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
                <FormField label="Label" htmlFor={`links.${index}.label`} error={linkErrors?.label?.message}>
                  <Input id={`links.${index}.label`} {...form.register(`links.${index}.label`)} />
                </FormField>
                <FormField label="Icon" error={linkErrors?.icon?.message}>
                  <Controller
                    control={form.control}
                    name={`links.${index}.icon`}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full" aria-label="Icon">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {linkIcons.map((icon) => (
                            <SelectItem key={icon} value={icon}>
                              {iconLabels[icon]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField label="URL" htmlFor={`links.${index}.url`} error={linkErrors?.url?.message}>
                  <Input id={`links.${index}.url`} type="url" {...form.register(`links.${index}.url`)} />
                </FormField>
                <FormField
                  label="Display text"
                  htmlFor={`links.${index}.handle`}
                  description="For example github.com/you"
                  error={linkErrors?.handle?.message}
                >
                  <Input id={`links.${index}.handle`} {...form.register(`links.${index}.handle`)} />
                </FormField>
                <div className="flex gap-1 sm:col-span-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => links.move(index, index - 1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Move down"
                    disabled={index === links.fields.length - 1}
                    onClick={() => links.move(index, index + 1)}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove link"
                    onClick={() => links.remove(index)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => links.append({ label: '', handle: '', url: '', icon: 'website' })}
          >
            <Plus />
            Add link
          </Button>
        </CardContent>
      </Card>

      <SaveBar dirty={isDirty} saving={saving} onDiscard={() => form.reset()} />
    </form>
  );
}
