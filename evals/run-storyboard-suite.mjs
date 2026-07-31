#!/usr/bin/env node
/**
 * v1 Storyboard suite entry.
 *
 * Runs:
 * 1) E0 static contracts on the Skill repo
 * 2) case file validation
 * 3) synthetic trial build + deterministic gate matrix
 *
 * Full live agent trials still require an external harness that writes
 * workspaces under evals/runs/<case-id>/<trial>/.
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
  return {
    label,
    code: res.status ?? 1,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
  };
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
  results.push(
    run('Build synthetic trials', process.execPath, [
      'evals/graders/deterministic/build-synthetic-trials.mjs',
    ]),
  );
  results.push(
    run('Grade synthetic trials', process.execPath, [
      'evals/graders/deterministic/grade-synthetic.mjs',
    ]),
  );

  const casesDir = path.join(REPO, 'evals/cases/storyboard');
  const cases = fs.existsSync(casesDir)
    ? fs.readdirSync(casesDir).filter((f) => /\.ya?ml$/i.test(f))
    : [];

  const matrixPath = path.join(REPO, 'evals/runs/synthetic/matrix.json');
  let matrix = null;
  if (fs.existsSync(matrixPath)) {
    try {
      matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
    } catch {
      matrix = null;
    }
  }

  const summary = {
    suite: 'storyboard-v1',
    timestamp: new Date().toISOString(),
    e0_passed: results[0].code === 0,
    cases_validated: results[1].code === 0,
    synthetic_built: results[2].code === 0,
    synthetic_graded: results[3].code === 0,
    storyboard_case_count: cases.length,
    cases,
    synthetic_matrix: matrix
      ? {
          total: matrix.total,
          matched: matrix.matched,
          mismatched: matrix.mismatched,
          pass_rate: matrix.pass_rate,
          rows: matrix.rows,
        }
      : null,
    next: [
      'Human Visual-Only review using evals/graders/human/storyboard-review-sheet.md',
      'Live agent trials into evals/runs/<case-id>/<trial>/ with preview-manifest + board-manifest + tool-trace',
      'Expand Image Animatic / Timed / Final suites after Storyboard stability',
    ],
    human_rubric: 'evals/rubrics/storyboard.md',
    report_template: 'evals/reports/REPORT_TEMPLATE.md',
  };

  const outDir = path.join(REPO, 'evals/runs');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `storyboard-suite-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  console.error(`\nWrote ${path.relative(REPO, outFile)}`);
  if (matrix) {
    console.error(
      `Synthetic gate matrix: ${matrix.matched}/${matrix.total} matched`,
    );
  }

  const failed = results.some((r) => r.code !== 0);
  process.exit(failed ? 1 : 0);
}

main();
