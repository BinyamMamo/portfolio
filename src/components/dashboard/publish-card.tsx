'use client';

import { UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { FormField } from '@/components/dashboard/form-field';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { publishContent } from '@/server/actions/publish';

interface PublishCardProps {
  changes: string[];
  branch: string;
}

export function PublishCard({ changes, branch }: PublishCardProps) {
  const router = useRouter();
  const [message, setMessage] = useState('Update content');
  const [publishing, startPublish] = useTransition();

  const publish = () =>
    startPublish(async () => {
      const result = await publishContent(message);
      if (result.ok) {
        toast.success('Published', { description: result.summary });
        router.refresh();
      } else {
        toast.error('Could not publish', { description: result.error });
      }
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish</CardTitle>
        <CardDescription>
          {changes.length === 0
            ? 'Everything is committed. Saved changes will show up here.'
            : `${changes.length} unpublished ${changes.length === 1 ? 'file' : 'files'} in content/ and public/media/.`}
        </CardDescription>
      </CardHeader>
      {changes.length > 0 && (
        <>
          <CardContent className="space-y-4">
            <ul className="max-h-40 overflow-auto rounded-md border p-3 font-mono text-xs text-muted-foreground">
              {changes.map((file) => (
                <li key={file} className="truncate">
                  {file}
                </li>
              ))}
            </ul>
            <FormField
              label="Commit message"
              htmlFor="publish-message"
              description={`One line. Pushing ${branch}${branch === 'main' ? ' deploys the live site.' : ' updates that branch.'}`}
            >
              <Input
                id="publish-message"
                value={message}
                maxLength={72}
                onChange={(event) => setMessage(event.target.value)}
              />
            </FormField>
          </CardContent>
          <CardFooter className="justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={publishing || !message.trim()}>
                  <UploadCloud />
                  {publishing ? 'Publishing' : 'Publish'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Publish to {branch}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Commits {changes.length} {changes.length === 1 ? 'file' : 'files'} as &quot;{message.trim()}&quot; and
                    pushes to GitHub.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={publish}>Publish</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
