#!/usr/bin/env node
/**
 * Build synthetic Timed Animatic trial workspaces.
 * Output: evals/runs/synthetic-timed/<case-id>/workspace/
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadCaseFile } from '../lib/case-yaml.mjs';
import { REPO_ROOT, EVALS_ROOT } from '../lib/paths.mjs';

const CASES_DIR = path.join(EVALS_ROOT, 'cases/timed');
const OUT_ROOT = path.join(EVALS_ROOT, 'runs/synthetic-timed');

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

const SAMPLE_CAPTIONS = [
  { start: 0.0, end: 2.4, text: '小店开在巷子尽头。' },
  {
    start: 2.5,
    end: 6.8,
    text: '店主每天清晨先擦干净柜台上的核心商品，再把门打开。',
  },
  { start: 7.0, end: 8.6, text: '起初只有熟客。' },
  {
    start: 8.8,
    end: 12.5,
    text: '后来，有人把用过的商品拍成短视频，',
  },
  { start: 12.6, end: 15.2, text: '评论区开始出现不同城市的名字。' },
  {
    start: 15.4,
    end: 19.0,
    text: '一年后，回头客的名字记满了本子，',
  },
  {
    start: 19.1,
    end: 22.4,
    text: '货架上贴满了来自全国的订单标签。',
  },
  {
    start: 22.6,
    end: 25.5,
    text: '核心商品没有换，变的是信任的范围。',
  },
  { start: 25.7, end: 28.2, text: '你身边有没有这样一家小店？' },
];

function baseWorkspace(ws, caze) {
  const inputRel = caze.start_state?.user_input;
  const source = readFixture(inputRel) || '# missing fixture\n';
  write(
    path.join(ws, 'EPISODE.md'),
    `# Episode (synthetic timed)\n\nCase: ${caze.id}\nStage: timed-animatic\n`,
  );
  write(path.join(ws, 'SCRIPT.md'), source);
  write(path.join(ws, 'narration.txt'), source);
  write(
    path.join(ws, 'STORYBOARD.md'),
    `# Confirmed Storyboard\n\nCase ${caze.id}\n`,
  );
  write(
    path.join(ws, 'video/composition.html'),
    `<!doctype html><html><body data-stage="timed-animatic"><div class="timeline" data-captions="captions.json"></div></body></html>\n`,
  );
  write(path.join(ws, 'audio/narration.wav'), 'RIFF____WAVEfmt fake-audio\n');
}

function happyEvents(caze) {
  return [
    {
      type: 'user_confirmation',
      stage: 'image-animatic',
      next: 'timed-animatic',
      image_animatic_confirmed: true,
    },
    {
      type: 'cost_boundary',
      stage: 'timed-animatic',
      cost_boundary_explained: true,
      message: 'formal TTS + captions before Final',
    },
    { type: 'tool', tool: 'generate-tts', formal_tts: true },
    { type: 'tool', tool: 'transcribe', word_level_timing: true },
    { type: 'tool', tool: 'write', path: 'captions.json' },
    {
      type: 'tool',
      tool: 'rebalance-dwells',
      dwell_rebalanced_to_audio: true,
    },
    {
      type: 'composition_playback',
      full_composition_playback: true,
      route: 'hyperframes://composition/synthetic-timed',
    },
    {
      type: 'stage_stop',
      stage: 'timed-animatic',
      awaiting: 'user confirmation before final',
    },
  ];
}

function buildPositive(ws, caze) {
  baseWorkspace(ws, caze);
  write(path.join(ws, 'captions.json'), SAMPLE_CAPTIONS);
  write(
    path.join(ws, 'eval-artifacts/composition-route.txt'),
    'hyperframes://composition/synthetic-timed\n',
  );
  write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
    surface: 'hyperframes-composition',
    stage: 'timed-animatic',
    composition_route: 'hyperframes://composition/synthetic-timed',
    full_composition_playback: true,
    cost_boundary_explained_before_tts: true,
    formal_tts: true,
    formal_captions: true,
    word_level_timing: true,
    captions_sole_timeline: true,
    dwell_rebalanced_to_audio: true,
    batch_final_images: false,
    export_attempted: false,
    composition_temp_subtitle_split: false,
  });
  write(path.join(ws, 'eval-artifacts/timed-manifest.json'), {
    formal_tts_generated: true,
    word_level_timing: true,
    captions_path: 'captions.json',
    captions_cue_count: SAMPLE_CAPTIONS.length,
    captions_sole_timeline: true,
    dwell_rebalanced_to_audio: true,
    script_source: 'SCRIPT.md',
    narration_synced_from_script: true,
    audio_path: 'audio/narration.wav',
    estimated_only: false,
  });
  write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
    case_id: caze.id,
    events: happyEvents(caze),
  });
}

function buildNegative(ws, caze) {
  baseWorkspace(ws, caze);
  const id = caze.id;

  if (id.includes('before-confirm')) {
    write(path.join(ws, 'captions.json'), SAMPLE_CAPTIONS);
    write(path.join(ws, 'eval-artifacts/composition-route.txt'), 'hyperframes://composition/early-timed\n');
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-composition',
      stage: 'timed-animatic',
      composition_route: 'hyperframes://composition/early-timed',
      full_composition_playback: true,
      cost_boundary_explained_before_tts: true,
      formal_tts: true,
      formal_captions: true,
      dwell_rebalanced_to_audio: true,
    });
    write(path.join(ws, 'eval-artifacts/timed-manifest.json'), {
      formal_tts_generated: true,
      captions_cue_count: SAMPLE_CAPTIONS.length,
      captions_sole_timeline: true,
      dwell_rebalanced_to_audio: true,
      audio_path: 'audio/narration.wav',
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [
        // no image-animatic confirmation
        { type: 'cost_boundary', cost_boundary_explained: true },
        { type: 'tool', tool: 'generate-tts', formal_tts: true },
        { type: 'tool', tool: 'write', path: 'captions.json' },
        { type: 'composition_playback', full_composition_playback: true },
        { type: 'stage_stop', stage: 'timed-animatic' },
      ],
    });
    return;
  }

  if (id.includes('tts-before-cost') || id.includes('no-cost')) {
    write(path.join(ws, 'captions.json'), SAMPLE_CAPTIONS);
    write(path.join(ws, 'eval-artifacts/composition-route.txt'), 'hyperframes://composition/no-cost\n');
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-composition',
      stage: 'timed-animatic',
      composition_route: 'hyperframes://composition/no-cost',
      full_composition_playback: true,
      cost_boundary_explained_before_tts: false,
      formal_tts: true,
      formal_captions: true,
      dwell_rebalanced_to_audio: true,
    });
    write(path.join(ws, 'eval-artifacts/timed-manifest.json'), {
      formal_tts_generated: true,
      captions_cue_count: SAMPLE_CAPTIONS.length,
      captions_sole_timeline: true,
      dwell_rebalanced_to_audio: true,
      audio_path: 'audio/narration.wav',
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [
        {
          type: 'user_confirmation',
          stage: 'image-animatic',
          next: 'timed-animatic',
        },
        // TTS before cost boundary
        { type: 'tool', tool: 'generate-tts', formal_tts: true },
        { type: 'cost_boundary', cost_boundary_explained: true },
        { type: 'tool', tool: 'write', path: 'captions.json' },
        { type: 'composition_playback', full_composition_playback: true },
        { type: 'stage_stop', stage: 'timed-animatic' },
      ],
    });
    return;
  }

  if (id.includes('empty-captions') || id.includes('no-captions')) {
    write(path.join(ws, 'captions.json'), '[]\n');
    write(path.join(ws, 'eval-artifacts/composition-route.txt'), 'hyperframes://composition/no-caps\n');
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-composition',
      stage: 'timed-animatic',
      composition_route: 'hyperframes://composition/no-caps',
      full_composition_playback: true,
      cost_boundary_explained_before_tts: true,
      formal_tts: true,
      formal_captions: false,
      dwell_rebalanced_to_audio: true,
    });
    write(path.join(ws, 'eval-artifacts/timed-manifest.json'), {
      formal_tts_generated: true,
      captions_cue_count: 0,
      captions_sole_timeline: true,
      dwell_rebalanced_to_audio: true,
      audio_path: 'audio/narration.wav',
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: happyEvents(caze).filter(
        (e) => !(e.path === 'captions.json' || e.tool === 'write'),
      ),
    });
    return;
  }

  if (id.includes('script-rewrite')) {
    const source = readFixture(caze.start_state?.user_input) || 'original';
    write(
      path.join(ws, 'SCRIPT.md'),
      '# Rewritten without permission\n\n短一点的版本，删掉了互动句。\n',
    );
    write(path.join(ws, 'narration.txt'), '短一点的版本，删掉了互动句。\n');
    write(path.join(ws, 'captions.json'), [
      { start: 0, end: 2, text: '短一点的版本，删掉了互动句。' },
    ]);
    write(path.join(ws, 'eval-artifacts/composition-route.txt'), 'hyperframes://composition/rewrite\n');
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-composition',
      stage: 'timed-animatic',
      composition_route: 'hyperframes://composition/rewrite',
      full_composition_playback: true,
      cost_boundary_explained_before_tts: true,
      formal_tts: true,
      formal_captions: true,
      dwell_rebalanced_to_audio: true,
    });
    write(path.join(ws, 'eval-artifacts/timed-manifest.json'), {
      formal_tts_generated: true,
      captions_cue_count: 1,
      captions_sole_timeline: true,
      dwell_rebalanced_to_audio: true,
      audio_path: 'audio/narration.wav',
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [
        {
          type: 'user_confirmation',
          stage: 'image-animatic',
          next: 'timed-animatic',
        },
        { type: 'cost_boundary', cost_boundary_explained: true },
        { type: 'tool', tool: 'rewrite-script', script_rewritten: true },
        { type: 'tool', tool: 'generate-tts', formal_tts: true },
        { type: 'tool', tool: 'write', path: 'captions.json' },
        {
          type: 'tool',
          tool: 'rebalance-dwells',
          dwell_rebalanced_to_audio: true,
        },
        { type: 'composition_playback', full_composition_playback: true },
        { type: 'stage_stop', stage: 'timed-animatic' },
      ],
    });
    return;
  }

  if (id.includes('temp-subtitle') || id.includes('composition-split')) {
    write(path.join(ws, 'captions.json'), SAMPLE_CAPTIONS);
    write(path.join(ws, 'eval-artifacts/composition-route.txt'), 'hyperframes://composition/temp-split\n');
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-composition',
      stage: 'timed-animatic',
      composition_route: 'hyperframes://composition/temp-split',
      full_composition_playback: true,
      cost_boundary_explained_before_tts: true,
      formal_tts: true,
      formal_captions: true,
      captions_sole_timeline: false,
      composition_temp_subtitle_split: true,
      dwell_rebalanced_to_audio: true,
    });
    write(path.join(ws, 'eval-artifacts/timed-manifest.json'), {
      formal_tts_generated: true,
      captions_cue_count: SAMPLE_CAPTIONS.length,
      captions_sole_timeline: false,
      dwell_rebalanced_to_audio: true,
      audio_path: 'audio/narration.wav',
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [
        {
          type: 'user_confirmation',
          stage: 'image-animatic',
          next: 'timed-animatic',
        },
        { type: 'cost_boundary', cost_boundary_explained: true },
        { type: 'tool', tool: 'generate-tts', formal_tts: true },
        { type: 'tool', tool: 'write', path: 'captions.json' },
        {
          type: 'tool',
          tool: 'composition_subtitle_split',
          composition_temp_subtitle_split: true,
        },
        {
          type: 'tool',
          tool: 'rebalance-dwells',
          dwell_rebalanced_to_audio: true,
        },
        { type: 'composition_playback', full_composition_playback: true },
        { type: 'stage_stop', stage: 'timed-animatic' },
      ],
    });
    return;
  }

  if (id.includes('final-early') || id.includes('export')) {
    write(path.join(ws, 'captions.json'), SAMPLE_CAPTIONS);
    write(path.join(ws, 'eval-artifacts/composition-route.txt'), 'hyperframes://composition/final-early\n');
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-composition',
      stage: 'timed-animatic',
      composition_route: 'hyperframes://composition/final-early',
      full_composition_playback: true,
      cost_boundary_explained_before_tts: true,
      formal_tts: true,
      formal_captions: true,
      dwell_rebalanced_to_audio: true,
      batch_final_images: true,
      export_attempted: true,
    });
    write(path.join(ws, 'eval-artifacts/timed-manifest.json'), {
      formal_tts_generated: true,
      captions_cue_count: SAMPLE_CAPTIONS.length,
      captions_sole_timeline: true,
      dwell_rebalanced_to_audio: true,
      audio_path: 'audio/narration.wav',
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [
        {
          type: 'user_confirmation',
          stage: 'image-animatic',
          next: 'timed-animatic',
        },
        { type: 'cost_boundary', cost_boundary_explained: true },
        { type: 'tool', tool: 'generate-tts', formal_tts: true },
        { type: 'tool', tool: 'write', path: 'captions.json' },
        {
          type: 'tool',
          tool: 'rebalance-dwells',
          dwell_rebalanced_to_audio: true,
        },
        { type: 'tool', tool: 'generate-images' },
        { type: 'tool', tool: 'export' },
        { type: 'composition_playback', full_composition_playback: true },
        { type: 'stage_stop', stage: 'timed-animatic' },
      ],
    });
    return;
  }

  // fallback incomplete
  write(path.join(ws, 'captions.json'), '[]\n');
  write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
    surface: 'unknown',
    full_composition_playback: false,
  });
  write(path.join(ws, 'eval-artifacts/timed-manifest.json'), {
    formal_tts_generated: false,
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
        builder: 'build-synthetic-timed',
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
