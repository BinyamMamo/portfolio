import 'server-only';

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/** The only paths the dashboard ever commits. */
export const CONTENT_PATHS = ['content', 'public/media'];

export async function git(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync('git', args, { cwd: process.cwd(), maxBuffer: 8 * 1024 * 1024 });
  return stdout.trim();
}

/** Changed, added or deleted files under the content paths that are not yet committed. */
export async function contentChanges(): Promise<string[]> {
  const output = await git(['status', '--porcelain', '--untracked-files=all', '--', ...CONTENT_PATHS]);
  return output
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3));
}

export async function currentBranch(): Promise<string> {
  return git(['rev-parse', '--abbrev-ref', 'HEAD']);
}

/** A readable message from a failed git command (its last lines of stderr). */
export function gitErrorMessage(error: unknown): string {
  const stderr = (error as { stderr?: string }).stderr?.trim();
  return stderr ? stderr.split('\n').slice(-3).join('\n') : (error as Error).message;
}
