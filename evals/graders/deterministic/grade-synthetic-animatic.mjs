#!/usr/bin/env node
/**
 * Grade all synthetic Image Animatic trials and emit a matrix report.
 *
 *   node evals/graders/deterministic/build-synthetic-animatic.mjs
 *   node evals/graders/deterministic/grade-synthetic-animatic.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadCaseFile } from '../lib/case-yaml.mjs';
import { REPO_ROOT, EVALS_ROOT } from '../lib/paths.mjs';
import { gradeImageAnimaticWorkspace } from './image-animatic-gates.mjs';

const SYN_ROOT = path.join(EVALS_ROOT, 'runs/synthetic-animatic');

function main() {
  if (!fs.existsSync(path.join(SYN_ROOT, 'index.json'))) {
    console.error(
      'No synthetic-animatic index. Run: node evals/graders/deterministic/build-synthetic-animatic.mjs',
    );
    process.exit(2);
  }

  let index;
  try {
    index = JSON.parse(
      fs.readFileSync(path.join(SYN_ROOT, 'index.json'), 'utf8'),
    );
  } catch (err) {
    console.error(`invalid synthetic-animatic index.json: ${err.message}`);
    process.exit(2);
  }

  const rows = [];
  for (const trial of index.trials) {
    const casePath = path.join(REPO_ROOT, trial.case);
    const workspace = path.join(REPO_ROOT, trial.workspace);
    const caze = loadCaseFile(casePath, fs.readFileSync);
    const result = gradeImageAnimaticWorkspace(workspace, caze, {
      evalsRoot: EVALS_ROOT,
      casePath: trial.case,
    });
    const gradePath = path.join(
      SYN_ROOT,
      trial.id,
      'grades/deterministic.json',
    );
    fs.mkdirSync(path.dirname(gradePath), { recursive: true });
    fs.writeFileSync(gradePath, JSON.stringify(result, null, 2));
    rows.push({
      id: trial.id,
      expected: result.expected_result,
      verdict: result.verdict,
      matched: result.matched,
      p0_count: result.p0_count,
      gate_failures: result.gate_failures,
    });
  }

  const matched = rows.filter((r) => r.matched).length;
  const report = {
    grader: 'grade-synthetic-animatic',
    generated_at: new Date().toISOString(),
    total: rows.length,
    matched,
    mismatched: rows.length - matched,
    pass_rate: rows.length ? matched / rows.length : 0,
    rows,
  };

  const out = path.join(SYN_ROOT, 'matrix.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2));

  const md = [
    '# Image Animatic Synthetic Gate Matrix',
    '',
    `Generated: ${report.generated_at}`,
    '',
    `| matched | total | pass rate |`,
    `| --- | --- | --- |`,
    `| ${matched} | ${rows.length} | ${(report.pass_rate * 100).toFixed(1)}% |`,
    '',
    '| case | expected | verdict | matched | p0 | gate failures |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows.map(
      (r) =>
        `| ${r.id} | ${r.expected} | ${r.verdict} | ${r.matched ? 'yes' : 'NO'} | ${r.p0_count} | ${(r.gate_failures || []).join(', ') || '—'} |`,
    ),
    '',
    '## Notes',
    '',
    '- Synthetic trials validate **Image Animatic gate logic**, not Studio timing quality.',
    '- Real trials still need HyperFrames Composition playback + human dwell/handoff review.',
    '- `fail_as_expected` is success for negative baselines.',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(SYN_ROOT, 'matrix.md'), md);

  // convenient copy for reports/
  const reportsDir = path.join(EVALS_ROOT, 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(
    path.join(reportsDir, 'image-animatic-synthetic-latest.md'),
    md,
  );

  console.log(JSON.stringify(report, null, 2));
  console.error(`\nWrote ${path.relative(REPO_ROOT, out)}`);
  console.error(
    `Wrote ${path.relative(REPO_ROOT, path.join(SYN_ROOT, 'matrix.md'))}`,
  );

  process.exit(report.mismatched === 0 ? 0 : 1);
}

main();
