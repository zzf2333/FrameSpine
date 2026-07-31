#!/usr/bin/env node
/**
 * Build synthetic Image Animatic trial workspaces for offline gate regression.
 *
 * Output:
 *   evals/runs/synthetic-animatic/<case-id>/workspace/
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadCaseFile } from '../lib/case-yaml.mjs';
import { REPO_ROOT, EVALS_ROOT } from '../lib/paths.mjs';

const CASES_DIR = path.join(EVALS_ROOT, 'cases/animatic');
const OUT_ROOT = path.join(EVALS_ROOT, 'runs/synthetic-animatic');

function walkCases(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.ya?ml$/i.test(f))
    .map((f) => path.join(dir, f));
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    typeof content === 'string' ? content : JSON.stringify(content, null, 2),
  );
}

function readFixture(rel) {
  if (!rel) return null;
  const full = path.join(EVALS_ROOT, rel);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, 'utf8');
}

function baseWorkspace(ws, caze) {
  const inputRel = caze.start_state?.user_input;
  const source = readFixture(inputRel) || '# missing fixture\n';
  write(
    path.join(ws, 'EPISODE.md'),
    `# Episode (synthetic animatic)\n\nCase: ${caze.id}\nStage: image-animatic\n`,
  );
  write(path.join(ws, 'SCRIPT.md'), source);
  write(
    path.join(ws, 'STORYBOARD.md'),
    `# Confirmed Storyboard\n\nCase ${caze.id}\n\n### B01-F1\n- status: built\n- src: video/compositions/frames/b01-f1.html\n`,
  );
  write(
    path.join(ws, 'video/compositions/frames/b01-f1.html'),
    `<!doctype html><html><body data-canvas-kind="concrete"><div class="subject">shop</div></body></html>\n`,
  );
  write(path.join(ws, 'captions.json'), '[]\n');
}

function happyBeats() {
  return [
    {
      id: 'B01',
      frame_ids: ['B01-F1'],
      entry: true,
      development: false,
      emphasis: false,
      handoff: true,
      visible_media: true,
    },
    {
      id: 'B02',
      frame_ids: ['B02-F1'],
      entry: true,
      development: true,
      emphasis: true,
      handoff: true,
      visible_media: true,
    },
    {
      id: 'B03',
      frame_ids: ['B03-F1'],
      entry: true,
      development: true,
      emphasis: false,
      handoff: true,
      visible_media: true,
    },
  ];
}

function writeComposition(ws) {
  write(
    path.join(ws, 'video/composition.html'),
    `<!doctype html><html><body data-stage="image-animatic"><!-- low-cost timeline --><div class="timeline"></div></body></html>\n`,
  );
}

function buildPositive(ws, caze) {
  baseWorkspace(ws, caze);
  writeComposition(ws);
  const beats = happyBeats();
  write(path.join(ws, 'eval-artifacts/composition-route.txt'), 'hyperframes://composition/synthetic-animatic\n');
  write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
    surface: 'hyperframes-composition',
    stage: 'image-animatic',
    composition_route: 'hyperframes://composition/synthetic-animatic',
    full_composition_playback: true,
    custom_storyboard_page: false,
    formal_tts: false,
    formal_captions: false,
    batch_final_images: false,
    export_attempted: false,
    temporary_audio_or_estimated_duration: true,
  });
  write(path.join(ws, 'eval-artifacts/composition-manifest.json'), {
    inherits_confirmed_storyboard_frames: true,
    low_cost_media: true,
    estimated_duration_or_temp_audio: true,
    motion_source: 'series-motion-language',
    default_camera_on_all: false,
    slideshow_risk: false,
    final_polish: false,
    beats,
  });
  write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
    case_id: caze.id,
    events: [
      {
        type: 'user_confirmation',
        stage: 'story-flow',
        next: 'image-animatic',
        story_flow_confirmed: true,
      },
      { type: 'tool', tool: 'write', path: 'video/composition.html' },
      {
        type: 'composition_playback',
        full_composition_playback: true,
        route: 'hyperframes://composition/synthetic-animatic',
      },
      {
        type: 'stage_stop',
        stage: 'image-animatic',
        route: 'hyperframes://composition/synthetic-animatic',
        awaiting: 'user confirmation before timed-animatic',
      },
    ],
  });
}

function buildNegative(ws, caze) {
  baseWorkspace(ws, caze);
  const id = caze.id;

  if (id.includes('before-confirm')) {
    writeComposition(ws);
    write(path.join(ws, 'eval-artifacts/composition-route.txt'), 'hyperframes://composition/early\n');
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-composition',
      stage: 'image-animatic',
      composition_route: 'hyperframes://composition/early',
      full_composition_playback: true,
      temporary_audio_or_estimated_duration: true,
    });
    write(path.join(ws, 'eval-artifacts/composition-manifest.json'), {
      inherits_confirmed_storyboard_frames: true,
      low_cost_media: true,
      estimated_duration_or_temp_audio: true,
      beats: happyBeats(),
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [
        // composition work without user_confirmation
        { type: 'tool', tool: 'write', path: 'video/composition.html' },
        { type: 'composition_playback', full_composition_playback: true },
        { type: 'stage_stop', stage: 'image-animatic' },
      ],
    });
    return;
  }

  if (id.includes('no-playback') || id.includes('storyboard-only')) {
    write(path.join(ws, 'eval-artifacts/composition-route.txt'), '');
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-storyboard',
      stage: 'image-animatic',
      storyboard_route: 'hyperframes://storyboard/still-contact-sheet',
      composition_route: null,
      full_composition_playback: false,
      custom_storyboard_page: false,
    });
    write(path.join(ws, 'eval-artifacts/composition-manifest.json'), {
      inherits_confirmed_storyboard_frames: true,
      low_cost_media: true,
      estimated_duration_or_temp_audio: false,
      slideshow_risk: true,
      beats: [],
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [
        {
          type: 'user_confirmation',
          stage: 'story-flow',
          next: 'image-animatic',
        },
        { type: 'stage_stop', stage: 'image-animatic' },
      ],
    });
    return;
  }

  if (id.includes('formal-tts')) {
    writeComposition(ws);
    write(path.join(ws, 'eval-artifacts/composition-route.txt'), 'hyperframes://composition/tts-early\n');
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-composition',
      stage: 'image-animatic',
      composition_route: 'hyperframes://composition/tts-early',
      full_composition_playback: true,
      formal_tts: true,
      temporary_audio_or_estimated_duration: false,
    });
    write(path.join(ws, 'eval-artifacts/composition-manifest.json'), {
      inherits_confirmed_storyboard_frames: true,
      low_cost_media: true,
      estimated_duration_or_temp_audio: false,
      beats: happyBeats(),
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [
        {
          type: 'user_confirmation',
          stage: 'story-flow',
          next: 'image-animatic',
        },
        { type: 'tool', tool: 'generate-tts' },
        { type: 'composition_playback', full_composition_playback: true },
        { type: 'stage_stop', stage: 'image-animatic' },
      ],
    });
    return;
  }

  if (id.includes('formal-captions')) {
    writeComposition(ws);
    write(
      path.join(ws, 'captions.json'),
      JSON.stringify(
        [{ start: 0, end: 1.2, text: '正式字幕过早写入' }],
        null,
        2,
      ),
    );
    write(path.join(ws, 'eval-artifacts/composition-route.txt'), 'hyperframes://composition/captions-early\n');
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-composition',
      stage: 'image-animatic',
      composition_route: 'hyperframes://composition/captions-early',
      full_composition_playback: true,
      formal_captions: true,
      temporary_audio_or_estimated_duration: true,
    });
    write(path.join(ws, 'eval-artifacts/composition-manifest.json'), {
      inherits_confirmed_storyboard_frames: true,
      low_cost_media: true,
      estimated_duration_or_temp_audio: true,
      beats: happyBeats(),
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [
        {
          type: 'user_confirmation',
          stage: 'story-flow',
          next: 'image-animatic',
        },
        { type: 'composition_playback', full_composition_playback: true },
        { type: 'stage_stop', stage: 'image-animatic' },
      ],
    });
    return;
  }

  if (id.includes('final-early') || id.includes('export')) {
    writeComposition(ws);
    write(path.join(ws, 'eval-artifacts/composition-route.txt'), 'hyperframes://composition/final-early\n');
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-composition',
      stage: 'image-animatic',
      composition_route: 'hyperframes://composition/final-early',
      full_composition_playback: true,
      batch_final_images: true,
      export_attempted: true,
      temporary_audio_or_estimated_duration: true,
    });
    write(path.join(ws, 'eval-artifacts/composition-manifest.json'), {
      inherits_confirmed_storyboard_frames: true,
      low_cost_media: false,
      final_polish: true,
      estimated_duration_or_temp_audio: true,
      beats: happyBeats(),
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [
        {
          type: 'user_confirmation',
          stage: 'story-flow',
          next: 'image-animatic',
        },
        { type: 'tool', tool: 'generate-images' },
        { type: 'tool', tool: 'export' },
        { type: 'composition_playback', full_composition_playback: true },
        { type: 'stage_stop', stage: 'image-animatic' },
      ],
    });
    return;
  }

  if (id.includes('slideshow')) {
    writeComposition(ws);
    write(path.join(ws, 'eval-artifacts/composition-route.txt'), 'hyperframes://composition/slideshow\n');
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-composition',
      stage: 'image-animatic',
      composition_route: 'hyperframes://composition/slideshow',
      full_composition_playback: true,
      temporary_audio_or_estimated_duration: true,
    });
    write(path.join(ws, 'eval-artifacts/composition-manifest.json'), {
      inherits_confirmed_storyboard_frames: true,
      low_cost_media: true,
      estimated_duration_or_temp_audio: true,
      default_camera_on_all: true,
      slideshow_risk: true,
      beats: [
        {
          id: 'B01',
          entry: false,
          development: false,
          emphasis: false,
          handoff: false,
          visible_media: true,
        },
        {
          id: 'B02',
          entry: false,
          development: false,
          emphasis: false,
          handoff: false,
          visible_media: true,
        },
      ],
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [
        {
          type: 'user_confirmation',
          stage: 'story-flow',
          next: 'image-animatic',
        },
        { type: 'composition_playback', full_composition_playback: true },
        { type: 'stage_stop', stage: 'image-animatic' },
      ],
    });
    return;
  }

  // fallback incomplete
  write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
    surface: 'unknown',
    full_composition_playback: false,
  });
  write(path.join(ws, 'eval-artifacts/composition-manifest.json'), {
    inherits_confirmed_storyboard_frames: false,
    beats: [],
  });
  write(path.join(ws, 'eval-artifacts/tool-trace.json'), { events: [] });
}

function main() {
  fs.rmSync(OUT_ROOT, { recursive: true, force: true });
  fs.mkdirSync(OUT_ROOT, { recursive: true });

  const cases = walkCases(CASES_DIR).map((file) => ({
    file,
    data: loadCaseFile(file, fs.readFileSync),
  }));

  const built = [];
  for (const { file, data } of cases) {
    const ws = path.join(OUT_ROOT, data.id, 'workspace');
    fs.mkdirSync(ws, { recursive: true });
    const negative =
      data.expected_result === 'fail' || data.case_kind === 'negative-baseline';
    if (negative) buildNegative(ws, data);
    else buildPositive(ws, data);
    built.push({
      id: data.id,
      case: path.relative(REPO_ROOT, file),
      workspace: path.relative(REPO_ROOT, ws),
      expected_result: data.expected_result || 'pass',
      negative,
    });
  }

  write(path.join(OUT_ROOT, 'index.json'), {
    generated_at: new Date().toISOString(),
    count: built.length,
    trials: built,
  });

  console.log(
    JSON.stringify(
      {
        builder: 'build-synthetic-animatic',
        out: path.relative(REPO_ROOT, OUT_ROOT),
        count: built.length,
        trials: built,
      },
      null,
      2,
    ),
  );
}

main();
