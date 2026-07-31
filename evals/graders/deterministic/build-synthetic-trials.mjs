#!/usr/bin/env node
/**
 * Build synthetic trial workspaces for offline Storyboard gate regression.
 *
 * These are NOT agent outputs. They encode known pass/fail board claims so
 * deterministic graders can be tested without HyperFrames Studio or LLM runs.
 *
 * Output:
 *   evals/runs/synthetic/<case-id>/workspace/
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadCaseFile } from '../lib/case-yaml.mjs';
import { REPO_ROOT, EVALS_ROOT } from '../lib/paths.mjs';

const CASES_DIR = path.join(EVALS_ROOT, 'cases/storyboard');
const OUT_ROOT = path.join(EVALS_ROOT, 'runs/synthetic');

function walkCases(dir) {
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

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
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
    `# Episode (synthetic)\n\nCase: ${caze.id}\nStage: story-flow\n`,
  );
  write(path.join(ws, 'SCRIPT.md'), source);
  write(path.join(ws, 'captions.json'), '[]\n');

  // series notes for context only
  const series = caze.start_state?.series_fixture;
  if (series) {
    copyIfExists(
      path.join(EVALS_ROOT, series, 'SERIES.md'),
      path.join(ws, 'series-SERIES.md'),
    );
    copyIfExists(
      path.join(EVALS_ROOT, series, 'DESIGN.md'),
      path.join(ws, 'series-DESIGN.md'),
    );
  }
}

function frameHtml({ id, kind, subjects, burned }) {
  if (kind === 'empty') {
    return `<!doctype html><html><body data-canvas-kind="empty"><!-- empty-frame --><div class="box"></div></body></html>\n`;
  }
  if (kind === 'generic') {
    return `<!doctype html><html><body data-canvas-kind="generic"><div class="box"></div><div class="box"></div><div class="circle"></div></body></html>\n`;
  }
  const subjectBits = subjects.map((s) => `<div class="subject">${s}</div>`).join('');
  const burn = burned
    ? `<div class="narration" data-role="narration">旁白：小店开在巷子尽头</div><div class="director-note">【导演】关键转折</div>`
    : '';
  return `<!doctype html><html><body data-canvas-kind="concrete" data-frame-id="${id}">${subjectBits}${burn}</body></html>\n`;
}

function writeFrame(ws, frame) {
  const rel = `video/compositions/frames/${frame.id.toLowerCase()}.html`;
  write(
    path.join(ws, rel),
    frameHtml({
      id: frame.id,
      kind: frame.canvas.kind,
      subjects: frame.canvas.subjects,
      burned: frame.canvas.text_roles?.some((r) =>
        ['narration', 'director_note', 'subtitle'].includes(r),
      ),
    }),
  );
  return rel;
}

function happyFrames(caze) {
  if (caze.id.includes('b08')) {
    return [
      {
        id: 'B08-F1',
        beat: 'B08',
        sequence_role: 'entry',
        status: 'built',
        canvas: {
          kind: 'concrete',
          subjects: ['small shop still open', 'core product on counter'],
          text_on_canvas: [],
          text_roles: [],
          inspector_dependency: false,
        },
      },
      {
        id: 'B08-F2',
        beat: 'B08',
        sequence_role: 'development',
        status: 'built',
        canvas: {
          kind: 'concrete',
          subjects: [
            'user works on wall',
            'repurchase notes',
            'new city order tags spreading',
          ],
          text_on_canvas: [],
          text_roles: [],
          inspector_dependency: false,
        },
      },
      {
        id: 'B08-F3',
        beat: 'B08',
        sequence_role: 'handoff',
        status: 'built',
        canvas: {
          kind: 'concrete',
          subjects: [
            'core product unchanged',
            'wall of real reviews',
            'ending handoff space',
          ],
          text_on_canvas: ['10000 reviews ledger'],
          text_roles: ['story_object'],
          inspector_dependency: false,
        },
      },
    ];
  }

  if (caze.id.includes('evidence')) {
    return [
      {
        id: 'B03-F1',
        beat: 'B03',
        status: 'built',
        sequence_role: 'evidence',
        canvas: {
          kind: 'concrete',
          subjects: ['order ledger open', 'hand pointing at date stamp'],
          text_on_canvas: ['2024-03-12 stamp'],
          text_roles: ['story_object'],
          inspector_dependency: false,
        },
      },
    ];
  }

  // default locked / development / revision happy path
  return [
    {
      id: 'B01-F1',
      beat: 'B01',
      status: 'built',
      sequence_role: 'entry',
      canvas: {
        kind: 'concrete',
        subjects: ['alley-end shop exterior', 'owner wiping counter product'],
        text_on_canvas: [],
        text_roles: [],
        inspector_dependency: false,
      },
    },
    {
      id: 'B02-F1',
      beat: 'B02',
      status: 'built',
      sequence_role: 'development',
      canvas: {
        kind: 'concrete',
        subjects: ['phone filming product', 'comment cities appearing'],
        text_on_canvas: [],
        text_roles: [],
        inspector_dependency: false,
      },
    },
    {
      id: 'B03-F1',
      beat: 'B03',
      status: 'built',
      sequence_role: 'payoff',
      canvas: {
        kind: 'concrete',
        subjects: ['notebook of regulars', 'national order tags on shelf'],
        text_on_canvas: [],
        text_roles: [],
        inspector_dependency: false,
      },
    },
  ];
}

function buildPositive(ws, caze) {
  baseWorkspace(ws, caze);
  const frames = happyFrames(caze);
  for (const f of frames) {
    f.src = writeFrame(ws, f);
  }

  write(path.join(ws, 'STORYBOARD.md'), storyboardMd(caze, frames, false));
  write(path.join(ws, 'eval-artifacts/storyboard-route.txt'), 'hyperframes://storyboard/synthetic\n');
  write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
    surface: 'hyperframes-storyboard',
    storyboard_route: 'hyperframes://storyboard/synthetic',
    full_composition_playback: false,
    custom_storyboard_page: false,
  });
  write(path.join(ws, 'eval-artifacts/board-manifest.json'), {
    visual_only_readable: true,
    sequence_roles_present: frames.map((f) => f.sequence_role).filter(Boolean),
    frames,
  });
  write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
    case_id: caze.id,
    events: [
      { type: 'tool', tool: 'read', path: 'SCRIPT.md' },
      { type: 'tool', tool: 'write', path: 'STORYBOARD.md' },
      {
        type: 'stage_stop',
        stage: 'story-flow',
        route: 'hyperframes://storyboard/synthetic',
      },
    ],
  });
}

function buildNegative(ws, caze) {
  baseWorkspace(ws, caze);
  const inj = caze.start_state?.injected_failure || '';
  const id = caze.id;

  if (id.includes('empty-frame') || inj.includes('empty-frames')) {
    const frames = [
      {
        id: 'B01-F1',
        status: 'built',
        canvas: {
          kind: 'empty',
          subjects: [],
          text_on_canvas: [],
          text_roles: [],
          inspector_dependency: true,
        },
      },
      {
        id: 'B02-F1',
        status: 'built',
        canvas: {
          kind: 'generic',
          subjects: [],
          text_on_canvas: [],
          text_roles: [],
          inspector_dependency: true,
        },
      },
      {
        id: 'B03-F1',
        status: 'built',
        canvas: {
          kind: 'generic',
          subjects: [],
          text_on_canvas: [],
          text_roles: [],
          inspector_dependency: true,
        },
      },
    ];
    for (const f of frames) f.src = writeFrame(ws, f);
    write(path.join(ws, 'STORYBOARD.md'), storyboardMd(caze, frames, true));
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-storyboard',
      storyboard_route: 'hyperframes://storyboard/synthetic',
      full_composition_playback: false,
      custom_storyboard_page: false,
    });
    write(path.join(ws, 'eval-artifacts/storyboard-route.txt'), 'hyperframes://storyboard/synthetic\n');
    write(path.join(ws, 'eval-artifacts/board-manifest.json'), {
      visual_only_readable: false,
      frames,
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [{ type: 'stage_stop', stage: 'story-flow' }],
    });
    return;
  }

  if (id.includes('burned-text') || inj.includes('burned-narration')) {
    const frames = [
      {
        id: 'B01-F1',
        status: 'built',
        canvas: {
          kind: 'concrete',
          subjects: ['shop'],
          text_on_canvas: ['旁白：小店开在巷子尽头', '【导演】关键转折'],
          text_roles: ['narration', 'director_note'],
          inspector_dependency: false,
        },
      },
    ];
    for (const f of frames) f.src = writeFrame(ws, f);
    write(path.join(ws, 'STORYBOARD.md'), storyboardMd(caze, frames, true));
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-storyboard',
      storyboard_route: 'hyperframes://storyboard/synthetic',
      full_composition_playback: false,
      custom_storyboard_page: false,
    });
    write(path.join(ws, 'eval-artifacts/storyboard-route.txt'), 'hyperframes://storyboard/synthetic\n');
    write(path.join(ws, 'eval-artifacts/board-manifest.json'), {
      visual_only_readable: true,
      frames,
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [{ type: 'stage_stop', stage: 'story-flow' }],
    });
    return;
  }

  if (id.includes('custom-page') || inj.includes('custom-storyboard')) {
    write(path.join(ws, 'STORYBOARD.md'), '# Custom page used instead of official board\n');
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'custom-html-page',
      storyboard_route: null,
      full_composition_playback: false,
      custom_storyboard_page: true,
    });
    write(path.join(ws, 'eval-artifacts/board-manifest.json'), {
      visual_only_readable: false,
      frames: [],
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [{ type: 'stage_stop', stage: 'story-flow' }],
    });
    return;
  }

  if (id.includes('stage-skip') || inj.includes('cross-stage')) {
    const frames = happyFrames(caze);
    for (const f of frames) f.src = writeFrame(ws, f);
    write(path.join(ws, 'STORYBOARD.md'), storyboardMd(caze, frames, false));
    write(path.join(ws, 'captions.json'), JSON.stringify([{ start: 0, end: 1, text: 'too early' }], null, 2));
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-storyboard',
      storyboard_route: 'hyperframes://storyboard/synthetic',
      full_composition_playback: true,
      custom_storyboard_page: false,
    });
    write(path.join(ws, 'eval-artifacts/storyboard-route.txt'), 'hyperframes://storyboard/synthetic\n');
    write(path.join(ws, 'eval-artifacts/board-manifest.json'), {
      visual_only_readable: true,
      frames,
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [
        { type: 'tool', tool: 'generate-tts' },
        { type: 'tool', tool: 'generate-images' },
        { type: 'tool', name: 'full_composition_playback', full_composition_playback: true },
        // deliberately no stage_stop before continuing
      ],
    });
    return;
  }

  if (id.includes('script-rewrite') || inj.includes('locked-script-rewrite')) {
    const frames = happyFrames(caze);
    for (const f of frames) f.src = writeFrame(ws, f);
    // Board looks fine, but SCRIPT was silently rewritten.
    write(
      path.join(ws, 'SCRIPT.md'),
      `# Rewritten without authorization\n\n小店很成功。大家都很喜欢。一年后订单很多。\n\n结尾：欢迎点赞。\n`,
    );
    write(path.join(ws, 'STORYBOARD.md'), storyboardMd(caze, frames, false));
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-storyboard',
      storyboard_route: 'hyperframes://storyboard/synthetic',
      full_composition_playback: false,
      custom_storyboard_page: false,
    });
    write(path.join(ws, 'eval-artifacts/storyboard-route.txt'), 'hyperframes://storyboard/synthetic\n');
    write(path.join(ws, 'eval-artifacts/board-manifest.json'), {
      visual_only_readable: true,
      frames,
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [{ type: 'stage_stop', stage: 'story-flow' }],
    });
    return;
  }

  if (id.includes('inspector-complete') || inj.includes('inspector-rich')) {
    const frames = [
      {
        id: 'B01-F1',
        status: 'built',
        canvas: {
          kind: 'empty',
          subjects: [],
          text_on_canvas: [],
          text_roles: [],
          inspector_dependency: true,
        },
      },
      {
        id: 'B02-F1',
        status: 'built',
        canvas: {
          kind: 'empty',
          subjects: [],
          text_on_canvas: [],
          text_roles: [],
          inspector_dependency: true,
        },
      },
    ];
    for (const f of frames) f.src = writeFrame(ws, f);
    write(
      path.join(ws, 'STORYBOARD.md'),
      `${storyboardMd(caze, frames, true)}\n\n## Rich inspector only\nAudience Discovery: long prose...\nVisual Event: long prose...\n`,
    );
    write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
      surface: 'hyperframes-storyboard',
      storyboard_route: 'hyperframes://storyboard/synthetic',
      full_composition_playback: false,
      custom_storyboard_page: false,
    });
    write(path.join(ws, 'eval-artifacts/storyboard-route.txt'), 'hyperframes://storyboard/synthetic\n');
    write(path.join(ws, 'eval-artifacts/board-manifest.json'), {
      visual_only_readable: false,
      frames,
    });
    write(path.join(ws, 'eval-artifacts/tool-trace.json'), {
      events: [{ type: 'stage_stop', stage: 'story-flow' }],
    });
    return;
  }

  // fallback negative: generic incomplete
  write(path.join(ws, 'STORYBOARD.md'), '# incomplete\n');
  write(path.join(ws, 'eval-artifacts/preview-manifest.json'), {
    surface: 'unknown',
    custom_storyboard_page: false,
    full_composition_playback: false,
  });
  write(path.join(ws, 'eval-artifacts/board-manifest.json'), {
    visual_only_readable: false,
    frames: [],
  });
  write(path.join(ws, 'eval-artifacts/tool-trace.json'), { events: [] });
}

function storyboardMd(caze, frames, inspectorHeavy) {
  const lines = [
    `# STORYBOARD (synthetic) — ${caze.id}`,
    '',
    '## Frames',
    '',
  ];
  for (const f of frames) {
    lines.push(`### ${f.id}`);
    lines.push(`- status: ${f.status || 'built'}`);
    lines.push(`- src: ${f.src || '(pending)'}`);
    if (inspectorHeavy) {
      lines.push('- narrative: long explanation that should not rescue empty canvas');
    } else {
      lines.push(
        `- visual: ${(f.canvas.subjects || []).join('; ') || f.canvas.kind}`,
      );
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
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
        builder: 'build-synthetic-trials',
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
