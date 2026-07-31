#!/usr/bin/env node
/**
 * Image Animatic suite entry (v2 slice).
 *
 * Runs:
 * 1) case validation (all suites, including new animatic cases)
 * 2) synthetic Image Animatic trial build
 * 3) deterministic Image Animatic gate matrix
 *
 * Does not re-run Storyboard suite; use npm run eval:storyboard for that.
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
    run('Validate cases', process.execPath, [
      'evals/graders/deterministic/validate-cases.mjs',
    ]),
  );
  results.push(
    run('Build synthetic Image Animatic trials', process.execPath, [
      'evals/graders/deterministic/build-synthetic-animatic.mjs',
    ]),
  );
  results.push(
    run('Grade synthetic Image Animatic trials', process.execPath, [
      'evals/graders/deterministic/grade-synthetic-animatic.mjs',
    ]),
  );

  const casesDir = path.join(REPO, 'evals/cases/animatic');
  const cases = fs.existsSync(casesDir)
    ? fs.readdirSync(casesDir).filter((f) => /\.ya?ml$/i.test(f))
    : [];

  const matrixPath = path.join(
    REPO,
    'evals/runs/synthetic-animatic/matrix.json',
  );
  let matrix = null;
  if (fs.existsSync(matrixPath)) {
    try {
      matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
    } catch {
      matrix = null;
    }
  }

  const summary = {
    suite: 'image-animatic-v1',
    timestamp: new Date().toISOString(),
    cases_validated: results[0].code === 0,
    synthetic_built: results[1].code === 0,
    synthetic_graded: results[2].code === 0,
    image_animatic_case_count: cases.length,
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
      'Live agent Image Animatic trial after Story Flow confirmation',
      'Human review of dwell / handoff / not-slideshow using human sheet',
      'Expand Timed Animatic suite after Image Animatic stability',
    ],
    human_rubric: 'evals/rubrics/image-animatic.md',
    report_template: 'evals/reports/REPORT_TEMPLATE.md',
  };

  const outDir = path.join(REPO, 'evals/runs');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `image-animatic-suite-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  console.error(`\nWrote ${path.relative(REPO, outFile)}`);
  if (matrix) {
    console.error(
      `Image Animatic gate matrix: ${matrix.matched}/${matrix.total} matched`,
    );
  }

  const failed = results.some((r) => r.code !== 0);
  process.exit(failed ? 1 : 0);
}

main();
