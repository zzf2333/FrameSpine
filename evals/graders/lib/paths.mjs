import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** FrameSpine repository root */
export const REPO_ROOT = path.resolve(__dirname, '../../..');

/** evals/ directory */
export const EVALS_ROOT = path.resolve(__dirname, '../..');

export function resolveRepo(relOrAbs) {
  if (!relOrAbs) return null;
  return path.isAbsolute(relOrAbs) ? relOrAbs : path.join(REPO_ROOT, relOrAbs);
}

export function resolveEvals(relOrAbs) {
  if (!relOrAbs) return null;
  if (path.isAbsolute(relOrAbs)) return relOrAbs;
  if (relOrAbs.startsWith('evals/')) return path.join(REPO_ROOT, relOrAbs);
  return path.join(EVALS_ROOT, relOrAbs);
}
