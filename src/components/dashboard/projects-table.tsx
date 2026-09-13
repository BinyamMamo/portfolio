'use client';

import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Logo } from '@/components/logo';
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
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Project } from '@/lib/schemas';
import { getTech } from '@/lib/tech';
import { deleteProject, saveProjects } from '@/server/actions/content';

/** Project list with order and featured flags that save immediately. */
export function ProjectsTable({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [items, setItems] = useState(projects);
  const [previousProjects, setPreviousProjects] = useState(projects);
  const [pending, startTransition] = useTransition();

  // Show fresh server data after a refresh.
  if (projects !== previousProjects) {
    setPreviousProjects(projects);
    setItems(projects);
  }

  const persist = (next: Project[]) => {
    const previous = items;
    setItems(next);
    startTransition(async () => {
      const result = await saveProjects(next);
      if (result.ok) {
        router.refresh();
      } else {
        setItems(previous);
        toast.error('Could not save', { description: result.error });
      }
    });
  };

  const move = (index: number, offset: number) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    if (item) next.splice(index + offset, 0, item);
    persist(next);
  };

  const remove = (slug: string) =>
    startTransition(async () => {
      const result = await deleteProject(slug);
      if (result.ok) {
        toast.success('Project deleted');
        router.refresh();
      } else {
        toast.error('Could not delete', { description: result.error });
      }
    });

  return (
    <Card className="py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="hidden lg:table-cell">Stack</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((project, index) => (
            <TableRow key={project.slug}>
              <TableCell className="max-w-64">
                <Link href={`/dashboard/projects/${project.slug}`} className="font-medium hover:underline">
                  {project.name}
                </Link>
                <p className="truncate text-xs text-muted-foreground">{project.tagline}</p>
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{project.category}</TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-2">
                  {project.stack.slice(0, 5).map((id) => {
                    const { name, logo } = getTech(id);
                    return logo ? (
                      <Logo key={id} logo={logo} size={16} />
                    ) : (
                      <span key={id} className="text-xs text-muted-foreground">
                        {name}
                      </span>
                    );
                  })}
                </div>
              </TableCell>
              <TableCell>
                <Switch
                  aria-label={`Feature ${project.name}`}
                  checked={project.featured}
                  disabled={pending}
                  onCheckedChange={(featured) =>
                    persist(items.map((item, position) => (position === index ? { ...item, featured } : item)))
                  }
                />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label={`Edit ${project.name}`} asChild>
                    <Link href={`/dashboard/projects/${project.slug}`}>
                      <Pencil />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Move up"
                    disabled={pending || index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Move down"
                    disabled={pending || index === items.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label={`Delete ${project.name}`} disabled={pending}>
                        <Trash2 />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {project.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          It is removed from the site, menus and CV. Its media files stay in public/media.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={() => remove(project.slug)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
