'use client';

import { Button } from '@/components/ui/button';

interface SaveBarProps {
  dirty: boolean;
  saving: boolean;
  onDiscard?: () => void;
}

/** Sticky footer for dashboard forms. Place it inside the <form> so its button submits. */
export function SaveBar({ dirty, saving, onDiscard }: SaveBarProps) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex items-center justify-end gap-2 border-t bg-background/90 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
      <span className="mr-auto text-sm text-muted-foreground">
        {saving ? 'Saving' : dirty ? 'Unsaved changes' : 'All changes saved'}
      </span>
      {onDiscard && (
        <Button type="button" variant="ghost" disabled={!dirty || saving} onClick={onDiscard}>
          Discard
        </Button>
      )}
      <Button type="submit" disabled={!dirty || saving}>
        {saving ? 'Saving' : 'Save changes'}
      </Button>
    </div>
  );
}
