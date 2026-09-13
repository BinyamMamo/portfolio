'use client';

import { ArrowLeft, ArrowRight, ImageUp, Star, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { type DragEvent, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProjectMedia } from '@/lib/schemas';
import { cn } from '@/lib/utils';

interface MediaEditorProps {
  /** Upload destination relative to public/. Null disables uploads (for example before a slug exists). */
  folder: string | null;
  cover: ProjectMedia | undefined;
  gallery: ProjectMedia[];
  onCoverChange: (media: ProjectMedia | undefined) => void;
  onGalleryChange: (media: ProjectMedia[]) => void;
}

async function uploadFile(file: File, folder: string): Promise<ProjectMedia> {
  const body = new FormData();
  body.append('file', file);
  body.append('folder', folder);
  const response = await fetch('/api/dashboard/media', { method: 'POST', body });
  const payload = (await response.json().catch(() => ({}))) as ProjectMedia & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? `Upload failed (${response.status})`);
  return payload;
}

function Thumbnail({ media }: { media: ProjectMedia }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-md border bg-muted">
      <Image
        src={media.kind === 'video' ? media.poster : media.src}
        alt={media.alt}
        fill
        unoptimized
        sizes="320px"
        className="object-cover object-top"
      />
      {media.kind === 'video' && (
        <Badge variant="secondary" className="absolute top-2 left-2">
          Video
        </Badge>
      )}
    </div>
  );
}

export function MediaEditor({ folder, cover, gallery, onCoverChange, onGalleryChange }: MediaEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);

  const upload = async (files: FileList | File[]) => {
    if (!folder) return;
    const list = [...files];
    setUploading((count) => count + list.length);

    // Uploads run one at a time so large videos do not compete for ffmpeg.
    let nextCover = cover;
    const added: ProjectMedia[] = [];
    for (const file of list) {
      const task = uploadFile(file, folder);
      toast.promise(task, {
        loading: `Uploading ${file.name}`,
        success: `${file.name} added`,
        error: (error: Error) => `${file.name}: ${error.message}`,
      });
      try {
        const media = await task;
        if (!nextCover) {
          nextCover = media;
          onCoverChange(media);
        } else {
          added.push(media);
          onGalleryChange([...gallery, ...added]);
        }
      } catch {
        // Reported by the toast.
      } finally {
        setUploading((count) => count - 1);
      }
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) void upload(event.dataTransfer.files);
  };

  const updateGallery = (index: number, media: ProjectMedia) =>
    onGalleryChange(gallery.map((item, position) => (position === index ? media : item)));

  const moveGallery = (index: number, offset: number) => {
    const next = [...gallery];
    const [item] = next.splice(index, 1);
    if (item) next.splice(index + offset, 0, item);
    onGalleryChange(next);
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (folder) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center transition-colors',
          dragging && 'border-foreground/40 bg-muted/50',
          !folder && 'opacity-60',
        )}
      >
        <Upload className="size-5 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Drop screenshots, GIFs or videos here</p>
          <p className="text-xs text-muted-foreground">
            {folder
              ? 'Images are converted to WebP. GIFs and videos become compressed clips with a poster frame.'
              : 'Set a slug and save the project before uploading media.'}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files) void upload(event.target.files);
            event.target.value = '';
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!folder || uploading > 0}
          onClick={() => inputRef.current?.click()}
        >
          <ImageUp />
          {uploading > 0 ? `Uploading ${uploading}` : 'Choose files'}
        </Button>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Cover</p>
        {cover ? (
          <div className="grid gap-3 sm:grid-cols-[16rem_1fr] sm:items-start">
            <Thumbnail media={cover} />
            <div className="space-y-2">
              <Input
                aria-label="Cover description"
                placeholder="Describe what the cover shows"
                value={cover.alt}
                onChange={(event) => onCoverChange({ ...cover, alt: event.target.value })}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => onCoverChange(undefined)}>
                <Trash2 />
                Remove cover
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No cover yet. The first upload becomes the cover.</p>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Gallery</p>
        {gallery.length === 0 && <p className="text-sm text-muted-foreground">No gallery items yet.</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {gallery.map((media, index) => (
            <div key={media.src} className="space-y-2 rounded-lg border p-3">
              <Thumbnail media={media} />
              <Input
                aria-label={`Description for gallery item ${index + 1}`}
                placeholder="Caption"
                value={media.alt}
                onChange={(event) => updateGallery(index, { ...media, alt: event.target.value })}
              />
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onGalleryChange([...gallery.slice(0, index), ...(cover ? [cover] : []), ...gallery.slice(index + 1)]);
                    onCoverChange(media);
                  }}
                >
                  <Star />
                  Make cover
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Move earlier"
                  disabled={index === 0}
                  onClick={() => moveGallery(index, -1)}
                >
                  <ArrowLeft />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Move later"
                  disabled={index === gallery.length - 1}
                  onClick={() => moveGallery(index, 1)}
                >
                  <ArrowRight />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove from gallery"
                  className="ml-auto"
                  onClick={() => onGalleryChange(gallery.filter((_, position) => position !== index))}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
