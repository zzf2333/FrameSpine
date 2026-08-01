#!/usr/bin/env node
/**
 * Deterministic Timed Animatic gates for a trial workspace.
 *
 * Usage:
 *   node evals/graders/deterministic/timed-animatic-gates.mjs \
 *     --case evals/cases/timed/timed-animatic-locked-001.yaml \
 *     --workspace /path/to/trial/workspace \
 *     --source-script evals/fixtures/inputs/locked-script-a.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCaseFile } from '../lib/case-yaml.mjs';
import { EVALS_ROOT, REPO_ROOT } from '../lib/paths.mjs';
import {
  COMPOSITION_SURFACES,
  captionsCueCount,
  captionsLooksFormal,
  normalizeTimedManifest,
  normalizeTimedPreview,
} from '../lib/timed-manifest.mjs';
import { verifyCompositionUserSurface } from '../lib/composition-user-surface.mjs';

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

function normalizeText(s) {
  return String(s || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function eventToolName(ev) {
  return String(ev.tool || ev.name || ev.action || '').toLowerCase();
}

function hasImageAnimaticConfirmation(events) {
  return events.some((ev) => {
    const t = String(ev.type || '').toLowerCase();
    if (t === 'user_confirmation' || t === 'confirmation') {
      const stage = String(ev.stage || ev.from || '').toLowerCase();
      const next = String(ev.next || ev.to || '').toLowerCase();
      return (
        stage.includes('image-animatic') ||
        stage.includes('animatic') ||
        next.includes('timed') ||
        Boolean(ev.image_animatic_confirmed)
      );
    }
    if (t === 'stage_advance' && String(ev.to || '').includes('timed')) {
      return Boolean(ev.user_confirmed);
    }
    return false;
  });
}

function hasCostBoundaryBeforeTts(events) {
  const costIdx = events.findIndex((ev) => {
    const t = String(ev.type || '').toLowerCase();
    const name = eventToolName(ev);
    return (
      t === 'cost_boundary' ||
      t === 'before_starting' ||
      name.includes('cost_boundary') ||
      Boolean(ev.cost_boundary_explained)
    );
  });
  const ttsIdx = events.findIndex((ev) => {
    const name = eventToolName(ev);
    return (
      name.includes('generate-tts') ||
      name === 'tts' ||
      Boolean(ev.formal_tts)
    );
  });
  if (costIdx === -1) return false;
  if (ttsIdx === -1) return true;
  return costIdx < ttsIdx;
}

function hasStageStop(events, needle) {
  return events.some((ev) => {
    const t = String(ev.type || '').toLowerCase();
    if (t !== 'stage_stop' && t !== 'stop') return false;
    return String(ev.stage || '')
      .toLowerCase()
      .includes(needle);
  });
}

export function gradeTimedAnimaticWorkspace(workspace, caze, options = {}) {
  const findings = [];
  const gateFailures = new Set();
  const gates = {
    surface: null,
    composition_user_surface: null,
    prior_image_animatic_confirm: null,
    cost_boundary_before_tts: null,
    formal_tts: null,
    formal_captions: null,
    captions_sole_timeline: null,
    script_preservation: null,
    dwell_rebalance: null,
    full_playback: null,
    no_final_export: null,
    stage_boundary: null,
    required_artifacts: null,
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
    narration: path.join(workspace, 'narration.txt'),
    composition: path.join(workspace, 'video/composition.html'),
    audioDir: path.join(workspace, 'audio'),
    artifacts: path.join(workspace, 'eval-artifacts'),
    preview: path.join(workspace, 'eval-artifacts/preview-manifest.json'),
    timed: path.join(workspace, 'eval-artifacts/timed-manifest.json'),
    trace: path.join(workspace, 'eval-artifacts/tool-trace.json'),
    routeTxt: path.join(workspace, 'eval-artifacts/composition-route.txt'),
  };

  const preview = exists(ep.preview)
    ? normalizeTimedPreview(readJson(ep.preview))
    : null;
  const timed = exists(ep.timed)
    ? normalizeTimedManifest(readJson(ep.timed))
    : null;
  const trace = exists(ep.trace) ? readJson(ep.trace) : null;
  const events = trace
    ? Array.isArray(trace)
      ? trace
      : trace.events || []
    : [];

  let captionsRaw = null;
  if (exists(ep.captions)) {
    try {
      captionsRaw = readJson(ep.captions);
    } catch {
      captionsRaw = '__invalid__';
    }
  }

  const push = (level, gate, message) => {
    findings.push({ level, gate, message });
    if (level === 'P0') gateFailures.add(gate);
  };

  // required_artifacts
  if (wants('required_artifacts')) {
    let ok = true;
    if (!exists(ep.EPISODE)) {
      ok = false;
      push('P0', 'required_artifacts', 'missing EPISODE.md');
    }
    if (!exists(ep.SCRIPT)) {
      ok = false;
      push('P0', 'required_artifacts', 'missing SCRIPT.md');
    }
    if (!exists(ep.captions)) {
      ok = false;
      push('P0', 'required_artifacts', 'missing captions.json');
    }
    if (!exists(ep.preview) || !exists(ep.trace)) {
      ok = false;
      push(
        'P0',
        'required_artifacts',
        'missing eval-artifacts preview-manifest or tool-trace',
      );
    }
    if (
      !exists(ep.routeTxt) &&
      !(preview && preview.composition_route)
    ) {
      ok = false;
      push('P0', 'required_artifacts', 'missing composition route');
    }
    gates.required_artifacts = ok;
  }

  // surface
  if (wants('surface')) {
    let ok = true;
    if (!preview) {
      ok = false;
      push('P0', 'surface', 'missing preview-manifest.json');
    } else {
      if (
        preview.surface &&
        !COMPOSITION_SURFACES.has(String(preview.surface).toLowerCase())
      ) {
        ok = false;
        push('P0', 'surface', `incorrect surface: ${preview.surface}`);
      }
      if (!preview.composition_route) {
        ok = false;
        push('P0', 'surface', 'missing composition_route');
      }
    }
    gates.surface = ok;
  }

  // composition_user_surface
  if (wants('composition_user_surface')) {
    const verification = verifyCompositionUserSurface(preview, events);
    if (!verification.ok) {
      for (const message of verification.failures) {
        push('P0', 'composition_user_surface', message);
      }
    }
    gates.composition_user_surface = verification.ok;
  }

  // prior_image_animatic_confirm
  if (wants('prior_image_animatic_confirm')) {
    let ok = true;
    if (!events.length) {
      ok = false;
      push('P0', 'prior_image_animatic_confirm', 'missing tool-trace events');
    } else if (!hasImageAnimaticConfirmation(events)) {
      ok = false;
      push(
        'P0',
        'prior_image_animatic_confirm',
        'no user confirmation of Image Animatic before Timed Animatic',
      );
    }
    const confirmIdx = events.findIndex((ev) => {
      const t = String(ev.type || '').toLowerCase();
      return (
        t === 'user_confirmation' ||
        t === 'confirmation' ||
        (t === 'stage_advance' && Boolean(ev.user_confirmed))
      );
    });
    if (confirmIdx > 0) {
      const before = events.slice(0, confirmIdx);
      const early = before.some((ev) => {
        const name = eventToolName(ev);
        return (
          name.includes('generate-tts') ||
          name.includes('transcribe') ||
          (name.includes('captions') && name.includes('write'))
        );
      });
      if (early) {
        ok = false;
        push(
          'P0',
          'prior_image_animatic_confirm',
          'formal TTS/captions work before Image Animatic confirmation',
        );
      }
    }
    gates.prior_image_animatic_confirm = ok;
  }

  // cost_boundary_before_tts
  if (wants('cost_boundary_before_tts')) {
    let ok = true;
    const explained =
      preview?.cost_boundary_explained_before_tts ||
      hasCostBoundaryBeforeTts(events);
    if (!explained) {
      ok = false;
      push(
        'P0',
        'cost_boundary_before_tts',
        'Timed Animatic cost boundary not explained before formal TTS',
      );
    }
    // if TTS exists before cost event
    if (events.length && !hasCostBoundaryBeforeTts(events) && !preview?.cost_boundary_explained_before_tts) {
      ok = false;
    }
    gates.cost_boundary_before_tts = ok;
  }

  // formal_tts
  if (wants('formal_tts')) {
    let ok = true;
    const claimed =
      preview?.formal_tts ||
      timed?.formal_tts_generated ||
      events.some((ev) => {
        const name = eventToolName(ev);
        return name.includes('generate-tts') || Boolean(ev.formal_tts);
      });
    if (!claimed) {
      ok = false;
      push('P0', 'formal_tts', 'formal TTS not produced for Timed Animatic');
    }
    if (timed?.estimated_only) {
      ok = false;
      push(
        'P0',
        'formal_tts',
        'timed-manifest still claims estimated_only audio',
      );
    }
    // audio file optional but preferred
    const hasAudio =
      exists(path.join(workspace, 'audio/narration.wav')) ||
      exists(path.join(workspace, 'audio/narration.mp3')) ||
      exists(path.join(workspace, 'video/audio/narration.wav')) ||
      (timed?.audio_path && exists(path.join(workspace, timed.audio_path)));
    if (claimed && !hasAudio && !timed?.formal_tts_generated) {
      // still ok if events claim generate-tts; warn as P1
      push('P1', 'formal_tts', 'no audio file found; relying on trace claim');
    }
    gates.formal_tts = ok;
  }

  // formal_captions
  if (wants('formal_captions')) {
    let ok = true;
    if (captionsRaw === '__invalid__') {
      ok = false;
      push('P0', 'formal_captions', 'captions.json is invalid JSON');
    } else if (!captionsLooksFormal(captionsRaw)) {
      ok = false;
      push(
        'P0',
        'formal_captions',
        'captions.json empty — Timed Animatic requires formal subtitle timeline',
      );
    }
    if (preview && preview.formal_captions === false && captionsLooksFormal(captionsRaw)) {
      // inconsistent claim; prefer file truth, P1 only
      push(
        'P1',
        'formal_captions',
        'preview-manifest formal_captions=false but captions.json has cues',
      );
    }
    const count = captionsCueCount(captionsRaw);
    if (timed && timed.captions_cue_count != null && timed.captions_cue_count !== count) {
      push(
        'P1',
        'formal_captions',
        `timed-manifest cue count ${timed.captions_cue_count} != file ${count}`,
      );
    }
    gates.formal_captions = ok;
  }

  // captions_sole_timeline
  if (wants('captions_sole_timeline')) {
    let ok = true;
    if (preview?.composition_temp_subtitle_split) {
      ok = false;
      push(
        'P0',
        'captions_sole_timeline',
        'composition temp subtitle split replaces captions.json',
      );
    }
    if (timed?.captions_sole_timeline === false) {
      ok = false;
      push(
        'P0',
        'captions_sole_timeline',
        'timed-manifest claims captions are not sole timeline',
      );
    }
    const badSplit = events.some((ev) => {
      const name = eventToolName(ev);
      return (
        name.includes('temp-subtitle') ||
        name.includes('composition_subtitle_split') ||
        Boolean(ev.composition_temp_subtitle_split)
      );
    });
    if (badSplit) {
      ok = false;
      push(
        'P0',
        'captions_sole_timeline',
        'tool-trace shows composition-side subtitle re-splitting',
      );
    }
    // if formal captions exist and sole_timeline null, accept as soft ok
    if (
      captionsLooksFormal(captionsRaw) &&
      timed?.captions_sole_timeline == null &&
      !preview?.composition_temp_subtitle_split
    ) {
      // still pass if no evidence of split
      ok = true;
    }
    gates.captions_sole_timeline = ok;
  }

  // script_preservation
  if (wants('script_preservation')) {
    let ok = true;
    const sourcePath = options.sourceScriptPath
      ? path.isAbsolute(options.sourceScriptPath)
        ? options.sourceScriptPath
        : path.join(REPO_ROOT, options.sourceScriptPath)
      : null;
    const fixtureRel = caze.start_state?.user_input;
    const fixturePath =
      !sourcePath && fixtureRel
        ? path.join(EVALS_ROOT, fixtureRel)
        : sourcePath;
    if (fixturePath && exists(fixturePath) && exists(ep.SCRIPT)) {
      const src = normalizeText(fs.readFileSync(fixturePath, 'utf8'));
      const got = normalizeText(fs.readFileSync(ep.SCRIPT, 'utf8'));
      // allow heading wrappers: require source body retained
      const srcBody = src
        .replace(/^#.*$/gm, '')
        .trim();
      if (srcBody && !got.includes(srcBody) && got !== src) {
        // line-level: every non-empty source line should appear
        const lines = srcBody
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        const missing = lines.filter((l) => !got.includes(l));
        if (missing.length) {
          ok = false;
          push(
            'P0',
            'script_preservation',
            `SCRIPT.md missing locked source lines: ${missing.slice(0, 3).join(' | ')}`,
          );
        }
      }
    } else if (wants('script_preservation')) {
      // if rewrite event present
      const rewritten = events.some(
        (ev) =>
          Boolean(ev.script_rewritten) ||
          eventToolName(ev).includes('rewrite-script'),
      );
      if (rewritten) {
        ok = false;
        push(
          'P0',
          'script_preservation',
          'tool-trace claims silent script rewrite',
        );
      }
    }
    gates.script_preservation = ok;
  }

  // dwell_rebalance
  if (wants('dwell_rebalance')) {
    let ok = true;
    const rebalanced =
      preview?.dwell_rebalanced_to_audio ||
      timed?.dwell_rebalanced_to_audio ||
      events.some(
        (ev) =>
          Boolean(ev.dwell_rebalanced_to_audio) ||
          eventToolName(ev).includes('rebalance') ||
          eventToolName(ev).includes('retimed'),
      );
    if (!rebalanced) {
      ok = false;
      push(
        'P0',
        'dwell_rebalance',
        'no claim that image dwells were rebalanced to real audio',
      );
    }
    gates.dwell_rebalance = ok;
  }

  // full_playback
  if (wants('full_playback')) {
    let ok = true;
    if (!preview?.full_composition_playback) {
      ok = false;
      push(
        'P0',
        'full_playback',
        'Timed Animatic missing full composition playback claim',
      );
    }
    const played = events.some(
      (ev) =>
        eventToolName(ev).includes('full_composition_playback') ||
        Boolean(ev.full_composition_playback) ||
        String(ev.type || '').toLowerCase() === 'composition_playback',
    );
    if (events.length && !played && !preview?.full_composition_playback) {
      ok = false;
      push('P0', 'full_playback', 'no composition playback event in tool-trace');
    }
    gates.full_playback = ok;
  }

  // no_final_export
  if (wants('no_final_export')) {
    let ok = true;
    if (preview?.export_attempted || preview?.batch_final_images) {
      ok = false;
      push(
        'P0',
        'no_final_export',
        'batch final images or export during Timed Animatic',
      );
    }
    const bad = events.some((ev) => {
      const name = eventToolName(ev);
      return (
        name.includes('export') ||
        name.includes('final-render') ||
        name.includes('render-final') ||
        name.includes('batch-final') ||
        name.includes('generate-images')
      );
    });
    if (bad) {
      ok = false;
      push(
        'P0',
        'no_final_export',
        'final/export/batch image tools used during Timed Animatic',
      );
    }
    gates.no_final_export = ok;
  }

  // stage_boundary
  if (wants('stage_boundary')) {
    let ok = true;
    if (
      !hasStageStop(events, 'timed-animatic') &&
      !hasStageStop(events, 'timed')
    ) {
      ok = false;
      push(
        'P0',
        'stage_boundary',
        'no stage_stop after Timed Animatic handoff',
      );
    }
    const finalEarly = events.some((ev) => {
      const t = String(ev.type || '').toLowerCase();
      const name = eventToolName(ev);
      return (
        (t === 'stage_advance' &&
          String(ev.to || '').includes('final') &&
          !ev.user_confirmed) ||
        name.includes('export') ||
        name.includes('final-render')
      );
    });
    if (finalEarly) {
      ok = false;
      push(
        'P0',
        'stage_boundary',
        'Final work or advance without stop/confirmation',
      );
    }
    gates.stage_boundary = ok;
  }

  const p0 = findings.filter((f) => f.level === 'P0');
  const expected = caze.expected_result || 'pass';
  let verdict;
  if (p0.length === 0) {
    verdict = expected === 'fail' ? 'unexpected_pass' : 'pass';
  } else {
    verdict = expected === 'fail' ? 'fail_as_expected' : 'unexpected_fail';
  }
  const matched =
    (expected === 'pass' && verdict === 'pass') ||
    (expected === 'fail' && verdict === 'fail_as_expected');

  return {
    grader: 'timed-animatic-gates',
    case: options.casePath || null,
    workspace,
    case_id: caze.id || null,
    expected_result: expected,
    verdict,
    matched,
    p0_count: p0.length,
    gate_failures: [...gateFailures],
    gates,
    findings,
  };
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.case || !args.workspace) {
    console.error(
      'Usage: node timed-animatic-gates.mjs --case <yaml> --workspace <dir> [--source-script <path>]',
    );
    process.exit(2);
  }
  const casePath = path.isAbsolute(args.case)
    ? args.case
    : path.join(process.cwd(), args.case);
  const workspace = path.isAbsolute(args.workspace)
    ? args.workspace
    : path.join(process.cwd(), args.workspace);
  if (!exists(casePath) || !exists(workspace)) {
    console.error('case or workspace not found');
    process.exit(2);
  }
  const caze = loadCaseFile(casePath, fs.readFileSync);
  const result = gradeTimedAnimaticWorkspace(workspace, caze, {
    casePath: path.relative(process.cwd(), casePath),
    sourceScriptPath: args['source-script'] || null,
    evalsRoot: EVALS_ROOT,
  });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.matched ? 0 : 1);
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main();
}
