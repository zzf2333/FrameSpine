#!/usr/bin/env node
/**
 * Backward-compatible entry for storyboard-gates.mjs
 * Prefer: node evals/graders/deterministic/storyboard-gates.mjs
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(__dirname, 'storyboard-gates.mjs');
const args = process.argv.slice(2);
const res = spawnSync(process.execPath, [target, ...args], {
  stdio: 'inherit',
});
process.exit(res.status ?? 1);
