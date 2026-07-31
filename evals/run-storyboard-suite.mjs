#!/usr/bin/env node
/**
 * v1 Storyboard suite entry.
 *
 * Runs:
 * 1) E0 static contracts on the Skill repo
 * 2) case file validation
 * 3) case inventory + recommended human/vision work
 *
 * Full agent trials require an external harness that writes workspaces under evals/runs/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');

function run(label, command, args) {
  console.error(`\n==> ${label}`);
  const res = spawnSync(command, args, { cwd: REPO, encoding: 'utf8' });
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);
  return { label, code: res.status ?? 1, stdout: res.stdout, stderr: res.stderr };
}

function main() {
  const results = [];
  results.push(
    run('E0 static contracts', process.execPath, [
      'evals/graders/deterministic/e0-static-contracts.mjs',
    ]),
  );
  results.push(
    run('Validate cases', process.execPath, [
      'evals/graders/deterministic/validate-cases.mjs',
    ]),
  );

  const casesDir = path.join(REPO, 'evals/cases/storyboard');
  const cases = fs.existsSync(casesDir)
    ? fs.readdirSync(casesDir).filter((f) => /\.ya?ml$/i.test(f))
    : [];

  const summary = {
    suite: 'storyboard-v1',
    timestamp: new Date().toISOString(),
    e0_passed: results[0].code === 0,
    cases_validated: results[1].code === 0,
    storyboard_case_count: cases.length,
    cases,
    next:
      'Run agent trials per case into evals/runs/<case-id>/<trial>/ then apply storyboard-artifact-gates, vision, and human rubrics.',
    human_rubric: 'evals/rubrics/storyboard.md',
    report_template: 'evals/reports/REPORT_TEMPLATE.md',
  };

  const outDir = path.join(REPO, 'evals/runs');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `storyboard-suite-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  console.error(`\nWrote ${path.relative(REPO, outFile)}`);

  const failed = results.some((r) => r.code !== 0);
  process.exit(failed ? 1 : 0);
}

main();
