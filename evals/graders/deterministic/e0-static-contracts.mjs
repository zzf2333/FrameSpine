#!/usr/bin/env node
/**
 * E0 Static Contract Checks
 *
 * Offline Skill-repo grader only. Does not score creative quality at runtime.
 * Failures here mean the Skill documents/scripts drifted from frozen architecture.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

const REQUIRED_FILES = [
  'SKILL.md',
  'references/core/episode-production.md',
  'references/core/hyperframes-directing.md',
  'references/core/quality-and-iteration.md',
  'references/core/image-storytelling.md',
  'references/core/series-initialization.md',
  'templates/episode/STORYBOARD.md',
  'templates/episode/image-prompts.json',
  'scripts/generate-images.mjs',
];

/** Patterns that must remain present in Skill docs. */
const MUST_CONTAIN = [
  {
    file: 'SKILL.md',
    patterns: [
      /Story Flow\s*→\s*Image Animatic\s*→\s*Timed Animatic\s*→\s*Final Composition/,
      /Storyboard Frame 必须是视觉设计/,
      /Visual-Only/,
      /不建立创意审批状态机/,
    ],
  },
  {
    file: 'references/core/episode-production.md',
    patterns: [
      /Storyboard Frame Contract/,
      /Storyboard Sequence Contract/,
      /Visual-Only Pass/,
      /Sequence Pass/,
      /Source-Separation Pass/,
      /B08-F1/,
      /Stop Here/,
    ],
  },
  {
    file: 'references/core/hyperframes-directing.md',
    patterns: [
      /Storyboard Frame Contract/,
      /Beat \/ Frame Mapping Contract/,
      /Storyboard Sequence Contract/,
      /Board Overview/,
      /低保真表示美术完成度低/,
    ],
  },
  {
    file: 'templates/episode/STORYBOARD.md',
    patterns: [
      /Storyboard Frame Canvas Contract/,
      /status → built/,
      /outline \/ built \/ animated/,
      /Audience Discovery/,
      /Visual Event/,
      /Handoff/,
    ],
  },
  {
    file: 'scripts/generate-images.mjs',
    patterns: [
      /每张图片需要 id、prompt 和 output/,
    ],
  },
];

/**
 * Patterns that must not appear as affirmative Core production defaults.
 * Anti-patterns described as prohibitions ("不要…", "不把它做成…") are allowed.
 */
const MUST_NOT_CONTAIN = [
  {
    file: 'SKILL.md',
    patterns: [
      { re: /approved\s*=\s*true/i, label: 'runtime approval state' },
      {
        re: /(?:建设|启用|引入|实现).{0,12}创意评分器|(?:创意评分器).{0,12}(?:自动通关|批准|门禁)/,
        label: 'creative scorer as runtime system',
      },
      {
        re: /(?:默认|应当|必须).{0,8}一句旁白一张图|一句旁白一张图(?:作为|完成)/,
        label: 'one-line-one-image default',
      },
    ],
  },
  {
    file: 'references/core/episode-production.md',
    patterns: [
      {
        re: /(?:默认|应当|必须).{0,8}一句旁白一张图|一句旁白一张图(?:作为|完成)/,
        label: 'one-line-one-image default',
      },
      { re: /FRAME_CONTRACT\.md/, label: 'new contract file' },
    ],
  },
  {
    file: 'references/core/hyperframes-directing.md',
    patterns: [
      {
        re: /(?:默认|应当|必须).{0,12}(?:所有图片都慢慢推进|全部图片缓慢推进)/,
        label: 'default push-in on all images',
      },
    ],
  },
  {
    file: 'references/core/series-initialization.md',
    patterns: [
      {
        re: /Narrative Mode.{0,20}必须.{0,20}摄影|摄影.{0,12}唯一.{0,12}Narrative/,
        label: 'narrative selects medium allowlist',
      },
    ],
  },
  {
    file: 'templates/episode/STORYBOARD.md',
    patterns: [
      { re: /audience_discovery\s*:/, label: 'new metadata key audience_discovery' },
      { re: /visual_event\s*:/, label: 'new metadata key visual_event' },
      { re: /placeholder_risk\s*:/, label: 'new metadata key placeholder_risk' },
      { re: /status\s*→\s*(sketch|reference|draft|evidence)/, label: 'non-official status enum' },
    ],
  },
];

/** Repo-wide greps limited to Skill runtime paths (not evals/). */
const REPO_RUNTIME_GLOBS = [
  'SKILL.md',
  'README.md',
  'references',
  'templates',
  'scripts',
  'agents',
];

const REPO_FORBIDDEN = [
  {
    re: /FRAME_CONTRACT\.md/,
    label: 'FRAME_CONTRACT.md introduced',
  },
];

/** Affirmative introduction of forbidden systems, ignoring explicit prohibitions. */
const FORBIDDEN_SYSTEM_NAMES = [
  'Reality Verification System',
  'Fiction Detection',
  'AI Disclosure Gate',
];

function isProhibitionContext(text, index) {
  // Use the current sentence / bullet so list tails like
  // "不把它做成 A、B 或 C" still count as prohibition for B and C.
  const sentenceStart = Math.max(
    text.lastIndexOf('。', index - 1) + 1,
    text.lastIndexOf('\n', index - 1) + 1,
    0,
  );
  const sentenceEndCandidates = ['。', '\n']
    .map((ch) => text.indexOf(ch, index))
    .filter((i) => i !== -1);
  const sentenceEnd = sentenceEndCandidates.length
    ? Math.min(...sentenceEndCandidates)
    : text.length;
  const sentence = text.slice(sentenceStart, sentenceEnd);
  return /不(?:要|能|得|会|应|可|把它做成|做成|建立|启用|引入)|禁止|避免|不是/.test(sentence);
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'evals' || entry.name === '.pi-subagents') {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function collectRuntimeFiles() {
  const files = [];
  for (const g of REPO_RUNTIME_GLOBS) {
    const full = path.join(ROOT, g);
    if (!fs.existsSync(full)) continue;
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files.filter((f) => /\.(md|mjs|js|json|ya?ml|txt)$/i.test(f));
}

function checkImagePromptsTemplate() {
  const findings = [];
  const raw = read('templates/episode/image-prompts.json');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    findings.push({ level: 'P0', check: 'image-prompts-json', message: `invalid JSON: ${err.message}` });
    return findings;
  }
  if (!Array.isArray(data)) {
    findings.push({ level: 'P0', check: 'image-prompts-json', message: 'template must be an array' });
    return findings;
  }
  for (const [i, item] of data.entries()) {
    if (item && typeof item === 'object' && Object.hasOwn(item, 'prompt')) {
      if (typeof item.prompt === 'string' && item.prompt.trim() === '') {
        // Empty prompt in template is allowed as a slot, but generate-images must reject it.
        findings.push({
          level: 'info',
          check: 'empty-prompt-slot',
          message: `item[${i}] has empty prompt slot (OK if generate-images rejects blanks)`,
        });
      }
    }
  }
  return findings;
}

function main() {
  const findings = [];

  for (const rel of REQUIRED_FILES) {
    if (!exists(rel)) {
      findings.push({ level: 'P0', check: 'required-file', message: `missing ${rel}` });
    }
  }

  for (const item of MUST_CONTAIN) {
    if (!exists(item.file)) continue;
    const text = read(item.file);
    for (const re of item.patterns) {
      if (!re.test(text)) {
        findings.push({
          level: 'P0',
          check: 'must-contain',
          message: `${item.file} missing required contract pattern: ${re}`,
        });
      }
    }
  }

  for (const item of MUST_NOT_CONTAIN) {
    if (!exists(item.file)) continue;
    const text = read(item.file);
    for (const p of item.patterns) {
      if (p.re.test(text)) {
        findings.push({
          level: 'P0',
          check: 'must-not-contain',
          message: `${item.file} contains forbidden pattern (${p.label}): ${p.re}`,
        });
      }
    }
  }

  findings.push(...checkImagePromptsTemplate());

  const runtimeFiles = collectRuntimeFiles();
  for (const file of runtimeFiles) {
    const rel = path.relative(ROOT, file);
    const text = fs.readFileSync(file, 'utf8');
    for (const ban of REPO_FORBIDDEN) {
      if (ban.re.test(text)) {
        findings.push({
          level: 'P0',
          check: 'repo-forbidden',
          message: `${rel}: ${ban.label}`,
        });
      }
    }
    for (const name of FORBIDDEN_SYSTEM_NAMES) {
      let from = 0;
      while (from < text.length) {
        const idx = text.indexOf(name, from);
        if (idx === -1) break;
        if (!isProhibitionContext(text, idx)) {
          findings.push({
            level: 'P0',
            check: 'repo-forbidden',
            message: `${rel}: forbidden architecture system introduced (${name})`,
          });
        }
        from = idx + name.length;
      }
    }
  }

  // Photography defaults should not be Core defaults in series-initialization / skill top principles.
  // Medium examples under references/examples/visual-mediums are allowed.
  for (const rel of [
    'SKILL.md',
    'references/core/series-initialization.md',
    'references/core/image-storytelling.md',
  ]) {
    if (!exists(rel)) continue;
    const text = read(rel);
    const photoDefaults = [
      /Physical Realism｜物理真实感/,
      /普通窗光作为默认/,
      /浅景深作为默认/,
      /所有图片.*推进/,
    ];
    for (const re of photoDefaults) {
      if (re.test(text)) {
        findings.push({
          level: 'P0',
          check: 'photo-default-in-core',
          message: `${rel} appears to reintroduce photography core default: ${re}`,
        });
      }
    }
  }

  // Eval pollution check: Skill runtime should not import evals as production instructions.
  for (const rel of ['SKILL.md', 'references/core/episode-production.md']) {
    if (!exists(rel)) continue;
    const text = read(rel);
    if (/evals\/cases\//.test(text) || /Visual-Only Comprehension Rate/.test(text)) {
      findings.push({
        level: 'P0',
        check: 'eval-pollution',
        message: `${rel} references eval suite internals; keep scoring/tests out of runtime Skill`,
      });
    }
  }

  const p0 = findings.filter((f) => f.level === 'P0');
  const info = findings.filter((f) => f.level === 'info');

  const report = {
    grader: 'e0-static-contracts',
    root: ROOT,
    passed: p0.length === 0,
    p0_count: p0.length,
    info_count: info.length,
    findings,
  };

  console.log(JSON.stringify(report, null, 2));
  if (p0.length > 0) {
    console.error(`\nE0 FAILED: ${p0.length} P0 finding(s)`);
    process.exit(1);
  }
  console.error(`\nE0 PASSED (${info.length} info)`);
}

main();
