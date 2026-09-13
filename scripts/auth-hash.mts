/**
 * Prints an ADMIN_PASSWORD_HASH for .env.local. The password is typed without being shown and is never
 * passed as an argument, so it stays out of shell history. Run with `pnpm auth:hash`.
 */
import { createInterface } from 'node:readline';

import { hashPassword } from '../src/server/password';

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const input = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    // Swallow echoed keystrokes; only the question itself is written.
    const rl = input as unknown as { _writeToOutput: (text: string) => void; output: NodeJS.WriteStream };
    let asked = false;
    rl._writeToOutput = (text: string) => {
      if (!asked) {
        rl.output.write(text);
        asked = true;
      }
    };
    input.question(question, (answer) => {
      input.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

const password = await promptHidden('Password: ');
const confirmation = await promptHidden('Repeat password: ');

if (password.length < 10) {
  console.error('Use at least 10 characters.');
  process.exit(1);
}
if (password !== confirmation) {
  console.error('Passwords do not match.');
  process.exit(1);
}

// Dollar signs are escaped so Next.js does not treat parts of the hash as variable references.
console.log(`\nADMIN_PASSWORD_HASH=${(await hashPassword(password)).replaceAll('$', '\\$')}`);
