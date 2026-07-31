#!/usr/bin/env node
/**
 * Validate eval case YAML/JSON files without external dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadCaseFile } from '../lib/case-yaml.mjs';
import { REPO_ROOT, EVALS_ROOT } from '../lib/paths.mjs';

const CASES_DIR = path.join(EVALS_ROOT, 'cases');

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

function validateCase(file, data, ids) {
  const errors = [];
  const rel = path.relative(REPO_ROOT, file);

  for (const key of REQUIRED_KEYS) {
    if (data[key] === undefined || data[key] === null) {
      errors.push(`${rel}: missing required key '${key}'`);
    }
  }

  if (data.id) {
    if (ids.has(data.id)) errors.push(`${rel}: duplicate id ${data.id}`);
    ids.add(data.id);
  }

  if (data.must_do && !Array.isArray(data.must_do)) {
    errors.push(`${rel}: must_do must be array`);
  }
  if (data.must_not_do && !Array.isArray(data.must_not_do)) {
    errors.push(`${rel}: must_not_do must be array`);
  }
  if (data.gates && !Array.isArray(data.gates)) {
    errors.push(`${rel}: gates must be array`);
  }

  if (data.slice && typeof data.slice === 'object') {
    for (const k of ['input_mode', 'stage']) {
      if (!data.slice[k]) errors.push(`${rel}: slice.${k} required`);
    }
  }

  const start = data.start_state || {};
  for (const v of Object.values(start)) {
    if (typeof v === 'string' && v.startsWith('fixtures/')) {
      const full = path.join(EVALS_ROOT, v);
      if (!fs.existsSync(full)) {
        errors.push(`${rel}: missing fixture ${v}`);
      }
    }
  }

  if (data.expected_result && !['pass', 'fail'].includes(data.expected_result)) {
    errors.push(`${rel}: expected_result must be pass|fail when set`);
  }

  if (data.expected_frame_development) {
    const e = data.expected_frame_development;
    if (typeof e !== 'object' || e === null) {
      errors.push(`${rel}: expected_frame_development must be object`);
    } else if (e.minimum_frames != null && typeof e.minimum_frames !== 'number') {
      errors.push(`${rel}: expected_frame_development.minimum_frames must be number`);
    }
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
      const data = loadCaseFile(file, fs.readFileSync);
      cases.push({
        file: path.relative(REPO_ROOT, file),
        id: data.id,
        suite: data.suite,
        expected_result: data.expected_result || 'pass',
      });
      errors.push(...validateCase(file, data, ids));
    } catch (err) {
      errors.push(`${path.relative(REPO_ROOT, file)}: parse error: ${err.message}`);
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
