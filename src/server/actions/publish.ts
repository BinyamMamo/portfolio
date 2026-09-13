'use server';

import { requireDashboard } from '@/server/auth';
import { CONTENT_PATHS, contentChanges, currentBranch, git, gitErrorMessage } from '@/server/publish';

export type PublishResult = { ok: true; summary: string } | { ok: false; error: string };

const MAX_SUBJECT_LENGTH = 72;

/** Commits only content/ and public/media/ with a one-line message, then pushes the current branch. */
export async function publishContent(message: string): Promise<PublishResult> {
  await requireDashboard();

  const subject = message.trim();
  if (!subject || /\r|\n/.test(subject) || subject.length > MAX_SUBJECT_LENGTH) {
    return { ok: false, error: `Use a single line of up to ${MAX_SUBJECT_LENGTH} characters.` };
  }

  try {
    const changes = await contentChanges();
    if (changes.length === 0) return { ok: false, error: 'There is nothing to publish.' };

    const branch = await currentBranch();
    await git(['add', '--all', '--', ...CONTENT_PATHS]);
    // The pathspec limits the commit to content, even if other files happen to be staged.
    await git(['commit', '-m', subject, '--', ...CONTENT_PATHS]);
    await git(['push', '-u', 'origin', 'HEAD']);

    return { ok: true, summary: `${changes.length} ${changes.length === 1 ? 'file' : 'files'} pushed to ${branch}` };
  } catch (error) {
    return { ok: false, error: gitErrorMessage(error) };
  }
}
