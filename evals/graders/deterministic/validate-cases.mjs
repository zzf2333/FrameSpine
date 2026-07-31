#!/usr/bin/env node
/**
 * Validate eval case YAML/JSON files without external dependencies.
 * Supports a minimal YAML subset used by this suite.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const CASES_DIR = path.join(ROOT, 'evals/cases');

const REQUIRED_KEYS = [
  'id',
  'suite',
  'slice',
  'target_stage',
  'must_do',
  'must_not_do',
  'gates',
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ya?ml|json)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

/**
 * Minimal YAML loader for this repo's case format:
 * - key: value
 * - nested objects by indentation
 * - lists with "- item"
 * - block scalars with "|"" are stored as strings starting after the marker
 */
function parseMinimalYaml(text) {
  const lines = text.replace(/\t/g, '  ').split(/\r?\n/);
  const root = {};
  const stack = [{ indent: -1, value: root, key: null, kind: 'map' }];
  let i = 0;

  function current() {
    return stack[stack.length - 1];
  }

  while (i < lines.length) {
    const line = lines[i];
    i += 1;
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.match(/^ */)[0].length;
    const trimmed = line.trim();

    while (stack.length > 1 && indent <= current().indent) {
      stack.pop();
    }

    const ctx = current();

    if (trimmed.startsWith('- ')) {
      const itemText = trimmed.slice(2);
      if (!Array.isArray(ctx.value)) {
        throw new Error(`list item without list context near: ${line}`);
      }
      if (itemText.includes(': ') && !itemText.startsWith('"') && !itemText.startsWith("'")) {
        // object list item single-line not used; treat as string
        ctx.value.push(parseScalar(itemText));
      } else {
        ctx.value.push(parseScalar(itemText));
      }
      continue;
    }

    const m = trimmed.match(/^([^:]+):(.*)$/);
    if (!m) {
      throw new Error(`cannot parse line: ${line}`);
    }
    const key = m[1].trim();
    const rest = m[2].trim();

    if (!rest) {
      // Look ahead: list or map
      const next = lines[i];
      const nextIndent = next ? next.match(/^ */)[0].length : 0;
      const nextTrim = next ? next.trim() : '';
      let child;
      if (nextTrim.startsWith('- ')) {
        child = [];
      } else if (next && nextTrim && nextIndent > indent) {
        child = {};
      } else {
        child = null;
      }
      if (Array.isArray(ctx.value)) {
        throw new Error(`map key inside list unsupported: ${key}`);
      }
      ctx.value[key] = child;
      if (child && typeof child === 'object') {
        stack.push({ indent, value: child, key, kind: Array.isArray(child) ? 'list' : 'map' });
      }
      continue;
    }

    if (rest === '|' || rest === '>') {
      const collected = [];
      while (i < lines.length) {
        const nl = lines[i];
        if (!nl.trim()) {
          collected.push('');
          i += 1;
          continue;
        }
        const nIndent = nl.match(/^ */)[0].length;
        if (nIndent <= indent) break;
        collected.push(nl.slice(indent + 2));
        i += 1;
      }
      ctx.value[key] = collected.join('\n').replace(/\s+$/, '');
      continue;
    }

    ctx.value[key] = parseScalar(rest);
  }

  return root;
}

function parseScalar(v) {
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null') return null;
  if (/^-?\d+$/.test(v)) return Number(v);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function loadCase(file) {
  const raw = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.json')) {
    try {
      return JSON.parse(raw);
    } catch (err) {
      throw new Error(`invalid JSON: ${err.message}`);
    }
  }
  return parseMinimalYaml(raw);
}

function validateCase(file, data, ids) {
  const errors = [];
  const rel = path.relative(ROOT, file);

  for (const key of REQUIRED_KEYS) {
    if (data[key] === undefined || data[key] === null) {
      errors.push(`${rel}: missing required key '${key}'`);
    }
  }

  if (data.id) {
    if (ids.has(data.id)) errors.push(`${rel}: duplicate id ${data.id}`);
    ids.add(data.id);
  }

  if (data.must_do && !Array.isArray(data.must_do)) errors.push(`${rel}: must_do must be array`);
  if (data.must_not_do && !Array.isArray(data.must_not_do)) errors.push(`${rel}: must_not_do must be array`);
  if (data.gates && !Array.isArray(data.gates)) errors.push(`${rel}: gates must be array`);

  if (data.slice && typeof data.slice === 'object') {
    for (const k of ['input_mode', 'stage']) {
      if (!data.slice[k]) errors.push(`${rel}: slice.${k} required`);
    }
  }

  // Resolve fixture paths if present
  const start = data.start_state || {};
  for (const v of Object.values(start)) {
    if (typeof v === 'string' && v.startsWith('fixtures/')) {
      const full = path.join(ROOT, 'evals', v);
      if (!fs.existsSync(full)) {
        errors.push(`${rel}: missing fixture ${v}`);
      }
    }
  }

  if (data.expected_result && !['pass', 'fail'].includes(data.expected_result)) {
    errors.push(`${rel}: expected_result must be pass|fail when set`);
  }

  return errors;
}

function main() {
  const files = walk(CASES_DIR);
  const ids = new Set();
  const errors = [];
  const cases = [];

  for (const file of files) {
    try {
      const data = loadCase(file);
      cases.push({ file: path.relative(ROOT, file), id: data.id, suite: data.suite });
      errors.push(...validateCase(file, data, ids));
    } catch (err) {
      errors.push(`${path.relative(ROOT, file)}: parse error: ${err.message}`);
    }
  }

  const report = {
    grader: 'validate-cases',
    case_count: cases.length,
    passed: errors.length === 0,
    errors,
    cases,
  };
  console.log(JSON.stringify(report, null, 2));
  if (errors.length) {
    console.error(`\nCase validation FAILED: ${errors.length} error(s)`);
    process.exit(1);
  }
  console.error(`\nCase validation PASSED: ${cases.length} case(s)`);
}

main();
