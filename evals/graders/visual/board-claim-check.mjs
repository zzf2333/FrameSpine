#!/usr/bin/env node
/**
 * Lightweight visual claim checker (no model).
 * Reads board-manifest.json and emits vision-style findings for empty/generic/
 * burned-text frames. Real pixel/LLM vision remains optional and offline.
 *
 *   node evals/graders/visual/board-claim-check.mjs --workspace <dir>
 */

import fs from 'node:fs';
import path from 'node:path';
import { normalizeBoardManifest, FORBIDDEN_TEXT_ROLES } from '../lib/board-manifest.mjs';
import { resolveRepo } from '../lib/paths.mjs';

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      out[key] = val;
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.workspace) {
    console.error('Usage: node board-claim-check.mjs --workspace <dir>');
    process.exit(2);
  }
  const workspace = resolveRepo(args.workspace);
  const boardPath = path.join(workspace, 'eval-artifacts/board-manifest.json');
  if (!fs.existsSync(boardPath)) {
    console.log(
      JSON.stringify(
        {
          grader: 'board-claim-check',
          passed: false,
          inconclusive: true,
          message: 'missing board-manifest.json',
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  let board;
  try {
    board = normalizeBoardManifest(
      JSON.parse(fs.readFileSync(boardPath, 'utf8')),
    );
  } catch (err) {
    console.error(`invalid board-manifest: ${err.message}`);
    process.exit(2);
  }

  const frames = board.frames.map((f) => {
    const empty_or_generic =
      f.canvas.kind === 'empty' || f.canvas.kind === 'generic';
    const text_burned = f.canvas.text_roles.some((r) =>
      FORBIDDEN_TEXT_ROLES.has(r),
    );
    let notes = '';
    if (empty_or_generic) notes = `canvas kind=${f.canvas.kind}`;
    else if (text_burned) notes = `forbidden roles: ${f.canvas.text_roles.join(',')}`;

    return {
      id: f.id,
      empty_or_generic,
      text_burned,
      inspector_dependency_likely: Boolean(f.canvas.inspector_dependency),
      notes,
    };
  });

  const sequence = {
    adjacent_repetition: false,
    development_visible:
      board.visual_only_readable !== false && board.frames.length >= 2,
    visual_only_readable: board.visual_only_readable,
  };

  for (let i = 1; i < board.frames.length; i += 1) {
    const a = board.frames[i - 1].canvas.subjects.join('|');
    const b = board.frames[i].canvas.subjects.join('|');
    if (a && a === b) sequence.adjacent_repetition = true;
  }

  const issues = frames.filter(
    (f) => f.empty_or_generic || f.text_burned || f.inspector_dependency_likely,
  );
  const report = {
    grader: 'board-claim-check',
    workspace,
    frames,
    sequence,
    issue_count: issues.length,
    passed: issues.length === 0 && board.visual_only_readable !== false,
  };
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.passed ? 0 : 1);
}

main();
