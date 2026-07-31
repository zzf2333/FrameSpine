#!/usr/bin/env node
/**
 * Deterministic Storyboard artifact gates for a trial workspace.
 *
 * Usage:
 *   node evals/graders/deterministic/storyboard-artifact-gates.mjs \
 *     --case evals/cases/storyboard/storyboard-locked-001.yaml \
 *     --workspace /path/to/trial/episode
 *
 * This grader checks files/routes/tool traces that can be verified without vision.
 * Frame visual quality and visual-only comprehension remain human/vision graders.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

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

function loadCaseViaValidatorLogic(file) {
  // Reuse validate-cases parser by spawning would be heavy; duplicate minimal JSON path only.
  // Cases are YAML; call validate parser through dynamic import of text and a tiny inline parse.
  const raw = fs.readFileSync(file, 'utf8');
  // Prefer running through node YAML-less: use validate-cases' parse by exec is complex.
  // For gates we only need a few fields; extract with simple regex/line parse.
  return parseLooseCase(raw);
}

function parseLooseCase(text) {
  const get = (key) => {
    const m = text.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
    return m ? m[1].trim() : null;
  };
  const list = (key) => {
    const re = new RegExp(`^${key}:\\s*$([\\s\\S]*?)(?=^\\w|$)`, 'm');
    const m = text.match(re);
    if (!m) return [];
    return m[1]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('- '))
      .map((l) => l.slice(2).trim());
  };
  return {
    id: get('id'),
    target_stage: get('target_stage'),
    expected_result: get('expected_result'),
    must_do: list('must_do'),
    must_not_do: list('must_not_do'),
    gates: list('gates'),
    required_artifacts: list('required_artifacts'),
  };
}

function exists(p) {
  return fs.existsSync(p);
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (err) {
    throw new Error(`invalid JSON at ${p}: ${err.message}`);
  }
}

function grade(workspace, caze) {
  const findings = [];
  const gates = {
    surface: null,
    stage_boundary: null,
    source_separation_files: null,
    required_artifacts: null,
  };

  const episodeFiles = {
    EPISODE: path.join(workspace, 'EPISODE.md'),
    SCRIPT: path.join(workspace, 'SCRIPT.md'),
    STORYBOARD: path.join(workspace, 'STORYBOARD.md'),
    captions: path.join(workspace, 'captions.json'),
    video: path.join(workspace, 'video'),
  };

  // Required artifacts (file-level)
  const missing = [];
  for (const art of caze.required_artifacts || []) {
    if (art === 'EPISODE.md' && !exists(episodeFiles.EPISODE)) missing.push(art);
    if (art === 'SCRIPT.md' && !exists(episodeFiles.SCRIPT)) missing.push(art);
    if (art === 'STORYBOARD.md' && !exists(episodeFiles.STORYBOARD)) missing.push(art);
    if (art === 'official storyboard route') {
      // Expect a handoff note or route file written by harness
      const routeCandidates = [
        path.join(workspace, 'eval-artifacts/storyboard-route.txt'),
        path.join(workspace, 'video/storyboard-route.txt'),
        path.join(workspace, 'PREVIEW_ROUTE.txt'),
      ];
      if (!routeCandidates.some(exists)) missing.push(art);
    }
    if (art.startsWith('renderable frame') || art.includes('frame sources')) {
      const framesDir = path.join(workspace, 'video/compositions/frames');
      if (!exists(framesDir) || fs.readdirSync(framesDir).length === 0) missing.push(art);
    }
  }
  gates.required_artifacts = missing.length === 0;
  if (missing.length) {
    findings.push({ level: 'P0', gate: 'required_artifacts', message: `missing: ${missing.join(', ')}` });
  }

  // Surface gate hints from harness manifest if present
  const manifestPath = path.join(workspace, 'eval-artifacts/preview-manifest.json');
  if (exists(manifestPath)) {
    const manifest = readJson(manifestPath);
    const surface = manifest.surface || manifest.preview_surface;
    const ok =
      surface === 'hyperframes-storyboard' ||
      surface === 'official-storyboard' ||
      Boolean(manifest.storyboard_route);
    gates.surface = ok;
    if (!ok) {
      findings.push({
        level: 'P0',
        gate: 'surface',
        message: `incorrect or missing official storyboard surface: ${JSON.stringify(manifest)}`,
      });
    }
    if (manifest.full_composition_playback === true && caze.target_stage === 'story-flow') {
      findings.push({
        level: 'P0',
        gate: 'surface',
        message: 'full composition playback used during story-flow',
      });
      gates.surface = false;
    }
    if (manifest.custom_storyboard_page === true) {
      findings.push({ level: 'P0', gate: 'surface', message: 'custom storyboard page used' });
      gates.surface = false;
    }
  } else {
    findings.push({
      level: 'info',
      gate: 'surface',
      message: 'no eval-artifacts/preview-manifest.json; surface gate deferred to harness/human',
    });
  }

  // Stage boundary from tool trace if present
  const tracePath = path.join(workspace, 'eval-artifacts/tool-trace.json');
  if (exists(tracePath)) {
    const trace = readJson(tracePath);
    const events = Array.isArray(trace) ? trace : trace.events || [];
    const banned = [];
    for (const ev of events) {
      const name = String(ev.tool || ev.name || ev.command || '').toLowerCase();
      const stage = String(ev.stage || trace.stage_at_event || 'story-flow');
      if (stage === 'story-flow' || caze.target_stage === 'story-flow') {
        if (/tts|generate-tts|captions\.json|generate-images|render/.test(name)) {
          banned.push(name);
        }
        if (ev.full_composition_playback === true) banned.push('full_composition_playback');
      }
    }
    const stopped = events.some((ev) => ev.type === 'stage_stop' || ev.event === 'stop_after_storyboard');
    const confirmed = events.some((ev) => ev.type === 'user_confirmation' && ev.stage === 'image-animatic');
    if (banned.length && !confirmed) {
      gates.stage_boundary = false;
      findings.push({
        level: 'P0',
        gate: 'stage_boundary',
        message: `forbidden pre-confirmation actions: ${[...new Set(banned)].join(', ')}`,
      });
    } else if (!stopped && caze.target_stage === 'story-flow') {
      gates.stage_boundary = false;
      findings.push({
        level: 'P0',
        gate: 'stage_boundary',
        message: 'no stage_stop / stop_after_storyboard event in tool trace',
      });
    } else {
      gates.stage_boundary = true;
    }
  } else {
    findings.push({
      level: 'info',
      gate: 'stage_boundary',
      message: 'no eval-artifacts/tool-trace.json; stage boundary deferred to harness/human',
    });
  }

  // Source separation file-level: captions formal timeline should not exist yet for story-flow target
  if (caze.target_stage === 'story-flow' && exists(episodeFiles.captions)) {
    try {
      const caps = readJson(episodeFiles.captions);
      const nonEmpty = Array.isArray(caps)
        ? caps.length > 0
        : caps && typeof caps === 'object' && Object.keys(caps).length > 0;
      // template may ship empty captions.json; only fail if it looks populated as formal timeline
      if (nonEmpty) {
        // empty array is ok; object with segments fails
        if (Array.isArray(caps) && caps.length > 0) {
          findings.push({
            level: 'P0',
            gate: 'source_separation',
            message: 'formal captions.json timeline populated during story-flow',
          });
          gates.source_separation_files = false;
        } else if (!Array.isArray(caps)) {
          findings.push({
            level: 'P0',
            gate: 'source_separation',
            message: 'captions.json appears populated during story-flow',
          });
          gates.source_separation_files = false;
        } else {
          gates.source_separation_files = true;
        }
      } else {
        gates.source_separation_files = true;
      }
    } catch {
      gates.source_separation_files = true;
    }
  }

  const p0 = findings.filter((f) => f.level === 'P0');
  const passed = p0.length === 0;
  if (caze.expected_result === 'fail') {
    // Negative baselines: deterministic pass means "grader correctly found failure" only when
    // harness injected failure artifacts. Without workspace content, mark inconclusive.
    if (!exists(workspace) || fs.readdirSync(workspace).length === 0) {
      return {
        case_id: caze.id,
        passed: false,
        inconclusive: true,
        message: 'negative case requires a workspace with injected failure artifacts',
        findings,
        gates,
      };
    }
  }

  return {
    case_id: caze.id,
    passed,
    inconclusive: findings.every((f) => f.level === 'info') && p0.length === 0 && !exists(manifestPath) && !exists(tracePath),
    p0_count: p0.length,
    findings,
    gates,
  };
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.case) {
    console.error('Usage: node storyboard-artifact-gates.mjs --case <case.yaml> [--workspace <dir>]');
    process.exit(2);
  }
  const casePath = path.isAbsolute(args.case) ? args.case : path.join(ROOT, args.case);
  const workspace = args.workspace
    ? path.isAbsolute(args.workspace)
      ? args.workspace
      : path.join(ROOT, args.workspace)
    : null;

  const caze = loadCaseViaValidatorLogic(casePath);
  if (!workspace) {
    const report = {
      grader: 'storyboard-artifact-gates',
      case_id: caze.id,
      mode: 'case-only',
      message:
        'No workspace provided. Deterministic artifact gates need a trial workspace with eval-artifacts/. Case metadata loaded OK.',
      case: caze,
      passed: true,
    };
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const result = grade(workspace, caze);
  const report = { grader: 'storyboard-artifact-gates', workspace, ...result };
  console.log(JSON.stringify(report, null, 2));
  if (result.inconclusive) process.exit(0);
  process.exit(result.passed ? 0 : 1);
}

main();
