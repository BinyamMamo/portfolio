'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import type { ActionResult } from '@/server/actions/content';

/** Runs a save action with a pending state, a toast for the result, and a refresh of server data. */
export function useSaveAction<Data>(action: (data: Data) => Promise<ActionResult>, onSaved?: (data: Data) => void) {
  const router = useRouter();
  const [saving, startTransition] = useTransition();

  const save = (data: Data) =>
    startTransition(async () => {
      const result = await action(data);
      if (result.ok) {
        toast.success('Saved');
        onSaved?.(data);
        router.refresh();
      } else {
        toast.error('Could not save', { description: result.error });
      }
    });

  return { save, saving };
}
