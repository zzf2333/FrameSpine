#!/usr/bin/env node
/**
 * Grade all synthetic Timed Animatic trials and emit a matrix report.
 *
 *   node evals/graders/deterministic/build-synthetic-timed.mjs
 *   node evals/graders/deterministic/grade-synthetic-timed.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadCaseFile } from '../lib/case-yaml.mjs';
import { REPO_ROOT, EVALS_ROOT } from '../lib/paths.mjs';
import { gradeTimedAnimaticWorkspace } from './timed-animatic-gates.mjs';

const SYN_ROOT = path.join(EVALS_ROOT, 'runs/synthetic-timed');

function main() {
  if (!fs.existsSync(path.join(SYN_ROOT, 'index.json'))) {
    console.error(
      'No synthetic-timed index. Run: node evals/graders/deterministic/build-synthetic-timed.mjs',
    );
    process.exit(2);
  }

  let index;
  try {
    index = JSON.parse(
      fs.readFileSync(path.join(SYN_ROOT, 'index.json'), 'utf8'),
    );
  } catch (err) {
    console.error(`invalid synthetic-timed index.json: ${err.message}`);
    process.exit(2);
  }

  const rows = [];
  for (const trial of index.trials) {
    const casePath = path.join(REPO_ROOT, trial.case);
    const workspace = path.join(REPO_ROOT, trial.workspace);
    const caze = loadCaseFile(casePath, fs.readFileSync);
    const sourceScript = caze.start_state?.user_input
      ? path.join(EVALS_ROOT, caze.start_state.user_input)
      : null;
    const result = gradeTimedAnimaticWorkspace(workspace, caze, {
      evalsRoot: EVALS_ROOT,
      casePath: trial.case,
      sourceScriptPath: sourceScript,
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
    grader: 'grade-synthetic-timed',
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
    '# Timed Animatic Synthetic Gate Matrix',
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
    '- Synthetic trials validate **Timed Animatic gate logic**, not Studio sync quality.',
    '- Real trials still need HyperFrames Composition playback with formal audio + human sync review.',
    '- `fail_as_expected` is success for negative baselines.',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(SYN_ROOT, 'matrix.md'), md);

  const reportsDir = path.join(EVALS_ROOT, 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(
    path.join(reportsDir, 'timed-animatic-synthetic-latest.md'),
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
