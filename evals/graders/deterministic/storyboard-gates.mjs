#!/usr/bin/env node
/**
 * Deterministic Storyboard gates for a trial workspace.
 *
 * Usage:
 *   node evals/graders/deterministic/storyboard-gates.mjs \
 *     --case evals/cases/storyboard/storyboard-locked-001.yaml \
 *     --workspace /path/to/trial/workspace
 *
 * Optional:
 *   --source-script path/to/locked-script.md   # for preservation checks
 *
 * Exit codes:
 *   0  gates match expected_result (pass cases pass; fail cases correctly fail)
 *   1  gate outcome mismatches expected_result or positive case hard-fails
 *   2  usage / IO error
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCaseFile } from '../lib/case-yaml.mjs';
import { REPO_ROOT, resolveRepo, resolveEvals } from '../lib/paths.mjs';
import {
  ALLOWED_TEXT_ROLES,
  FORBIDDEN_TEXT_ROLES,
  OFFICIAL_SURFACES,
  normalizeBoardManifest,
  normalizePreviewManifest,
} from '../lib/board-manifest.mjs';

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val =
        argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      out[key] = val;
    }
  }
  return out;
}

function exists(p) {
  return Boolean(p) && fs.existsSync(p);
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (err) {
    throw new Error(`invalid JSON at ${p}: ${err.message}`);
  }
}

function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

function listIfDir(p) {
  if (!exists(p)) return [];
  return fs.readdirSync(p);
}

/**
 * Grade a workspace against a case.
 * Returns { verdict, expected, gate_failures, findings, gates, ... }
 *
 * verdict:
 *   pass              — no P0 and expected is pass/undefined
 *   fail_as_expected  — has P0 and expected_result is fail
 *   unexpected_pass   — no P0 but expected fail
 *   unexpected_fail   — has P0 but expected pass
 *   inconclusive      — missing harness artifacts required to judge
 */
export function gradeStoryboardWorkspace(workspace, caze, options = {}) {
  const findings = [];
  const gateFailures = new Set();
  const gates = {
    surface: null,
    frame_canvas: null,
    sequence: null,
    source_separation: null,
    stage_boundary: null,
    required_artifacts: null,
    script_preservation: null,
    multi_frame_development: null,
  };

  const requested = new Set(
    (caze.gates || []).map((g) => String(g).toLowerCase()),
  );
  const wants = (name) => requested.size === 0 || requested.has(name);

  const ep = {
    EPISODE: path.join(workspace, 'EPISODE.md'),
    SCRIPT: path.join(workspace, 'SCRIPT.md'),
    STORYBOARD: path.join(workspace, 'STORYBOARD.md'),
    captions: path.join(workspace, 'captions.json'),
    framesDir: path.join(workspace, 'video/compositions/frames'),
    artifacts: path.join(workspace, 'eval-artifacts'),
    preview: path.join(workspace, 'eval-artifacts/preview-manifest.json'),
    board: path.join(workspace, 'eval-artifacts/board-manifest.json'),
    trace: path.join(workspace, 'eval-artifacts/tool-trace.json'),
    routeTxt: path.join(workspace, 'eval-artifacts/storyboard-route.txt'),
  };

  const preview = exists(ep.preview)
    ? normalizePreviewManifest(readJson(ep.preview))
    : null;
  const board = exists(ep.board)
    ? normalizeBoardManifest(readJson(ep.board))
    : null;
  const trace = exists(ep.trace) ? readJson(ep.trace) : null;
  const events = trace
    ? Array.isArray(trace)
      ? trace
      : trace.events || []
    : [];

  // --- required artifacts ---
  if (wants('surface') || wants('required_artifacts') || (caze.required_artifacts || []).length) {
    const missing = [];
    for (const art of caze.required_artifacts || []) {
      const a = String(art);
      if (a === 'EPISODE.md' && !exists(ep.EPISODE)) missing.push(a);
      if (a === 'SCRIPT.md' && !exists(ep.SCRIPT)) missing.push(a);
      if (a === 'STORYBOARD.md' && !exists(ep.STORYBOARD)) missing.push(a);
      if (a === 'official storyboard route') {
        const routes = [
          ep.routeTxt,
          path.join(workspace, 'video/storyboard-route.txt'),
          path.join(workspace, 'PREVIEW_ROUTE.txt'),
        ];
        const hasRoute =
          routes.some(exists) ||
          Boolean(preview?.storyboard_route) ||
          OFFICIAL_SURFACES.has(preview?.surface);
        if (!hasRoute) missing.push(a);
      }
      if (
        a.startsWith('renderable frame') ||
        a.includes('frame sources') ||
        a.includes('B08-F')
      ) {
        const hasFramesDir = listIfDir(ep.framesDir).length > 0;
        const hasBoardFrames =
          board && board.frames.some((f) => f.src || f.canvas?.kind === 'concrete');
        if (!hasFramesDir && !hasBoardFrames) missing.push(a);
      }
    }
    gates.required_artifacts = missing.length === 0;
    if (missing.length) {
      gateFailures.add('required_artifacts');
      findings.push({
        level: 'P0',
        gate: 'required_artifacts',
        message: `missing: ${missing.join(', ')}`,
      });
    }
  }

  // --- surface ---
  if (wants('surface')) {
    if (!preview) {
      findings.push({
        level: 'info',
        gate: 'surface',
        message: 'no preview-manifest.json; surface deferred',
      });
      gates.surface = null;
    } else {
      let ok = true;
      if (
        !OFFICIAL_SURFACES.has(preview.surface) &&
        !preview.storyboard_route
      ) {
        ok = false;
        findings.push({
          level: 'P0',
          gate: 'surface',
          message: `incorrect or missing official storyboard surface: ${preview.surface}`,
        });
      }
      if (preview.custom_storyboard_page) {
        ok = false;
        findings.push({
          level: 'P0',
          gate: 'surface',
          message: 'custom storyboard page used',
        });
      }
      if (
        preview.full_composition_playback &&
        caze.target_stage === 'story-flow'
      ) {
        ok = false;
        findings.push({
          level: 'P0',
          gate: 'surface',
          message: 'full composition playback used during story-flow',
        });
      }
      gates.surface = ok;
      if (!ok) gateFailures.add('surface');
    }
  }

  // --- frame canvas ---
  if (wants('frame_canvas')) {
    if (!board || board.frames.length === 0) {
      findings.push({
        level: 'info',
        gate: 'frame_canvas',
        message: 'no board-manifest frames; frame_canvas deferred to vision/human',
      });
      gates.frame_canvas = null;
    } else {
      let ok = true;
      for (const frame of board.frames) {
        const kind = frame.canvas.kind;
        if (kind === 'empty' || kind === 'generic') {
          ok = false;
          findings.push({
            level: 'P0',
            gate: 'frame_canvas',
            message: `${frame.id}: canvas kind is ${kind} (incomplete visual design)`,
          });
        }
        if (kind === 'concrete' && frame.canvas.subjects.length === 0) {
          ok = false;
          findings.push({
            level: 'P0',
            gate: 'frame_canvas',
            message: `${frame.id}: concrete frame has no subjects listed`,
          });
        }
        if (frame.canvas.inspector_dependency) {
          ok = false;
          findings.push({
            level: 'P0',
            gate: 'frame_canvas',
            message: `${frame.id}: marked inspector_dependency=true`,
          });
        }
        for (const role of frame.canvas.text_roles) {
          if (FORBIDDEN_TEXT_ROLES.has(role)) {
            ok = false;
            findings.push({
              level: 'P0',
              gate: 'frame_canvas',
              message: `${frame.id}: forbidden canvas text role '${role}'`,
            });
          } else if (
            frame.canvas.text_on_canvas.length &&
            !ALLOWED_TEXT_ROLES.has(role) &&
            role
          ) {
            // unknown role with text present is suspicious
            findings.push({
              level: 'info',
              gate: 'frame_canvas',
              message: `${frame.id}: unknown text role '${role}'`,
            });
          }
        }
        // HTML scan if src exists under workspace
        if (frame.src) {
          const htmlPath = path.isAbsolute(frame.src)
            ? frame.src
            : path.join(workspace, frame.src);
          if (exists(htmlPath) && htmlPath.endsWith('.html')) {
            const html = readText(htmlPath);
            const burns = detectBurnedTextInHtml(html);
            for (const b of burns) {
              ok = false;
              findings.push({
                level: 'P0',
                gate: 'frame_canvas',
                message: `${frame.id}: HTML likely burns ${b}`,
              });
            }
            if (detectEmptyHtmlCanvas(html)) {
              ok = false;
              findings.push({
                level: 'P0',
                gate: 'frame_canvas',
                message: `${frame.id}: HTML canvas appears empty/generic`,
              });
            }
          }
        }
      }
      gates.frame_canvas = ok;
      if (!ok) gateFailures.add('frame_canvas');
    }
  }

  // --- sequence ---
  if (wants('sequence')) {
    if (!board) {
      findings.push({
        level: 'info',
        gate: 'sequence',
        message: 'no board-manifest; sequence deferred to human visual-only review',
      });
      gates.sequence = null;
    } else {
      let ok = true;
      if (board.visual_only_readable === false) {
        ok = false;
        findings.push({
          level: 'P0',
          gate: 'sequence',
          message: 'board-manifest.visual_only_readable=false',
        });
      }
      if (board.frames.length < 2 && caze.expected_frame_development) {
        ok = false;
        findings.push({
          level: 'P0',
          gate: 'sequence',
          message: 'expected multi-frame development but board has <2 frames',
        });
      }
      // adjacent identical subject sets
      for (let i = 1; i < board.frames.length; i += 1) {
        const a = board.frames[i - 1].canvas.subjects.join('|');
        const b = board.frames[i].canvas.subjects.join('|');
        if (a && b && a === b && board.frames[i].canvas.kind === 'concrete') {
          findings.push({
            level: 'info',
            gate: 'sequence',
            message: `adjacent frames ${board.frames[i - 1].id} and ${board.frames[i].id} list identical subjects`,
          });
        }
      }
      gates.sequence = ok;
      if (!ok) gateFailures.add('sequence');
    }
  }

  // --- multi-frame development (B08 etc.) ---
  if (caze.expected_frame_development) {
    const exp = caze.expected_frame_development;
    const min = Number(exp.minimum_frames || 3);
    let count = 0;
    if (board) {
      const beat = String(exp.beat || '').toUpperCase();
      count = board.frames.filter((f) => {
        const id = String(f.id || '').toUpperCase();
        const b = String(f.beat || '').toUpperCase();
        return b === beat || id.startsWith(`${beat}-`) || id.startsWith(beat);
      }).length;
      if (count === 0) count = board.frames.length; // whole board is the beat
    }
    // also scan STORYBOARD.md for B08-F* ids
    if (exists(ep.STORYBOARD)) {
      const md = readText(ep.STORYBOARD);
      const ids = new Set(
        [...md.matchAll(/\b(B\d{2}-F\d+|B\d{2}-(?:entry|development|handoff))\b/gi)].map(
          (m) => m[1].toUpperCase(),
        ),
      );
      if (ids.size > count) count = ids.size;
    }
    const ok = count >= min;
    gates.multi_frame_development = ok;
    if (!ok) {
      gateFailures.add('sequence');
      findings.push({
        level: 'P0',
        gate: 'sequence',
        message: `expected >= ${min} frames for ${exp.beat || 'beat'}; found ${count}`,
      });
    }
  }

  // --- source separation ---
  if (wants('source_separation')) {
    let ok = true;
    if (caze.target_stage === 'story-flow' && exists(ep.captions)) {
      try {
        const caps = readJson(ep.captions);
        const populated =
          (Array.isArray(caps) && caps.length > 0) ||
          (caps &&
            typeof caps === 'object' &&
            !Array.isArray(caps) &&
            Object.keys(caps).length > 0);
        if (populated) {
          ok = false;
          findings.push({
            level: 'P0',
            gate: 'source_separation',
            message: 'formal captions.json timeline populated during story-flow',
          });
        }
      } catch {
        // ignore invalid empty template
      }
    }
    if (board) {
      for (const frame of board.frames) {
        for (const role of frame.canvas.text_roles) {
          if (FORBIDDEN_TEXT_ROLES.has(role)) {
            ok = false;
            findings.push({
              level: 'P0',
              gate: 'source_separation',
              message: `${frame.id}: source text role '${role}' on canvas`,
            });
          }
        }
      }
    }
    gates.source_separation = ok;
    if (!ok) gateFailures.add('source_separation');
  }

  // --- stage boundary / trace ---
  if (wants('stage_boundary') || wants('trace')) {
    if (!trace) {
      findings.push({
        level: 'info',
        gate: 'stage_boundary',
        message: 'no tool-trace.json; stage boundary deferred',
      });
      gates.stage_boundary = null;
    } else {
      let ok = true;
      const banned = [];
      for (const ev of events) {
        const name = String(ev.tool || ev.name || ev.command || '').toLowerCase();
        if (
          /tts|generate-tts|captions\.json|generate-images|final.?render|batch.?image/.test(
            name,
          )
        ) {
          banned.push(name || 'banned-tool');
        }
        if (ev.full_composition_playback === true) {
          banned.push('full_composition_playback');
        }
      }
      const stopped = events.some(
        (ev) =>
          ev.type === 'stage_stop' ||
          ev.event === 'stop_after_storyboard' ||
          (ev.type === 'handoff' && ev.stage === 'story-flow'),
      );
      const confirmed = events.some(
        (ev) =>
          (ev.type === 'user_confirmation' || ev.event === 'user_confirmation') &&
          (ev.stage === 'image-animatic' || ev.authorized === true),
      );
      if (banned.length && !confirmed) {
        ok = false;
        findings.push({
          level: 'P0',
          gate: 'stage_boundary',
          message: `forbidden pre-confirmation actions: ${[...new Set(banned)].join(', ')}`,
        });
      }
      if (!stopped && caze.target_stage === 'story-flow') {
        ok = false;
        findings.push({
          level: 'P0',
          gate: 'stage_boundary',
          message: 'no stage_stop after storyboard handoff',
        });
      }
      if (preview?.full_composition_playback) {
        ok = false;
        findings.push({
          level: 'P0',
          gate: 'stage_boundary',
          message: 'composition playback before confirmation',
        });
      }
      gates.stage_boundary = ok;
      if (!ok) gateFailures.add('stage_boundary');
    }
  }

  // --- locked script preservation ---
  const sourceScript =
    options.sourceScriptPath ||
    resolveSourceFromCase(caze, options.evalsRoot);
  const shouldCheckScript =
    wants('script_preservation') ||
    wants('source_separation') ||
    caze.slice?.input_mode === 'locked-script';
  if (
    shouldCheckScript &&
    sourceScript &&
    exists(sourceScript) &&
    exists(ep.SCRIPT) &&
    caze.slice?.input_mode === 'locked-script'
  ) {
    const src = extractNarrationBody(readText(sourceScript));
    const out = extractNarrationBody(readText(ep.SCRIPT));
    const preserved = normalizeForCompare(src) === normalizeForCompare(out);
    gates.script_preservation = preserved;
    if (!preserved) {
      gateFailures.add('script_preservation');
      findings.push({
        level: 'P0',
        gate: 'script_preservation',
        message: 'SCRIPT.md does not preserve locked source narration',
      });
    }
  }

  const p0 = findings.filter((f) => f.level === 'P0');
  const expected = caze.expected_result || 'pass';
  const hardFailed = p0.length > 0;

  // Inconclusive if all requested gates that need artifacts are null and no p0
  const criticalNull =
    !hardFailed &&
    ((wants('surface') && gates.surface === null) ||
      (wants('stage_boundary') && gates.stage_boundary === null) ||
      (wants('frame_canvas') && gates.frame_canvas === null && !board));

  let verdict;
  if (criticalNull && expected === 'pass') {
    verdict = 'inconclusive';
  } else if (expected === 'fail') {
    verdict = hardFailed ? 'fail_as_expected' : 'unexpected_pass';
  } else {
    verdict = hardFailed ? 'unexpected_fail' : 'pass';
  }

  const matched =
    verdict === 'pass' ||
    verdict === 'fail_as_expected';

  return {
    case_id: caze.id,
    expected_result: expected,
    verdict,
    matched,
    p0_count: p0.length,
    gate_failures: [...gateFailures],
    gates,
    findings,
  };
}

function resolveSourceFromCase(caze, evalsRoot) {
  const input = caze.start_state?.user_input;
  if (!input || typeof input !== 'string') return null;
  if (path.isAbsolute(input)) return input;
  if (input.startsWith('fixtures/')) {
    return path.join(evalsRoot || path.join(REPO_ROOT, 'evals'), input);
  }
  return resolveEvals(input);
}

function extractNarrationBody(text) {
  // Strip markdown headers / fixture notes; keep main prose lines.
  return text
    .split(/\r?\n/)
    .filter((l) => {
      const t = l.trim();
      if (!t) return false;
      if (t.startsWith('#')) return false;
      if (t.startsWith('>')) return false;
      if (/^旁白/.test(t)) return false;
      if (/^结尾互动/.test(t)) return true;
      return true;
    })
    .join('\n');
}

function normalizeForCompare(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function detectBurnedTextInHtml(html) {
  const hits = [];
  if (/data-role=["'](narration|subtitle|director|beat-title|attention)/i.test(html)) {
    hits.push('role-labeled production text');
  }
  if (/class=["'][^"']*(narration|subtitle|director-note|beat-title)/i.test(html)) {
    hits.push('class-labeled production text');
  }
  if (/【导演】|旁白：|字幕：|Attention Path|Beat\s*0?\d/i.test(html)) {
    hits.push('literal production labels');
  }
  return hits;
}

function detectEmptyHtmlCanvas(html) {
  if (/data-canvas-kind=["'](empty|generic)["']/i.test(html)) return true;
  if (/<!--\s*empty-frame\s*-->/i.test(html)) return true;
  // very small body with only generic boxes
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || html;
  const text = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length < 8 && /box|placeholder|rect/i.test(body)) return true;
  return false;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.case || !args.workspace) {
    console.error(
      'Usage: node storyboard-gates.mjs --case <case.yaml> --workspace <dir> [--source-script <file>]',
    );
    process.exit(2);
  }

  const casePath = resolveRepo(args.case);
  const workspace = resolveRepo(args.workspace);
  if (!exists(casePath)) {
    console.error(`case not found: ${casePath}`);
    process.exit(2);
  }
  if (!exists(workspace)) {
    console.error(`workspace not found: ${workspace}`);
    process.exit(2);
  }

  const caze = loadCaseFile(casePath, fs.readFileSync);
  const result = gradeStoryboardWorkspace(workspace, caze, {
    sourceScriptPath: args['source-script']
      ? resolveRepo(args['source-script'])
      : null,
    evalsRoot: path.join(REPO_ROOT, 'evals'),
  });

  const report = {
    grader: 'storyboard-gates',
    case: path.relative(REPO_ROOT, casePath),
    workspace: path.relative(REPO_ROOT, workspace),
    ...result,
  };
  console.log(JSON.stringify(report, null, 2));

  if (result.verdict === 'inconclusive') process.exit(0);
  process.exit(result.matched ? 0 : 1);
}

const isDirectRun = process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main();
}
