/**
 * Shared offline suite runner for E2 stage matrices.
 * Skill-independent; only used under evals/.
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { REPO_ROOT } from "./paths.mjs";

export function runLabeled(label, command, args, { cwd = REPO_ROOT } = {}) {
	console.error(`\n==> ${label}`);
	const res = spawnSync(command, args, { cwd, encoding: "utf8" });
	if (res.stdout) process.stdout.write(res.stdout);
	if (res.stderr) process.stderr.write(res.stderr);
	return {
		label,
		code: res.status ?? 1,
		stdout: res.stdout || "",
		stderr: res.stderr || "",
	};
}

export function listYamlCases(casesDir) {
	if (!fs.existsSync(casesDir)) return [];
	return fs.readdirSync(casesDir).filter((f) => /\.ya?ml$/i.test(f));
}

export function readMatrix(matrixPath) {
	if (!fs.existsSync(matrixPath)) return null;
	try {
		return JSON.parse(fs.readFileSync(matrixPath, "utf8"));
	} catch {
		return null;
	}
}

/**
 * @param {object} cfg
 * @param {string} cfg.suite - suite id e.g. storyboard-v1
 * @param {Array<{label:string, script:string, args?:string[]}>} cfg.steps
 * @param {string} cfg.casesDir - absolute or repo-relative
 * @param {string} [cfg.caseCountKey] - summary field for case count
 * @param {string} cfg.matrixPath - path to matrix.json
 * @param {string[]} [cfg.next]
 * @param {string} [cfg.humanRubric]
 * @param {string} [cfg.reportTemplate]
 * @param {string} [cfg.summaryPrefix] - filename prefix under runs/
 * @param {string} [cfg.matrixLabel] - stderr label for matrix line
 * @param {(results: object[], matrix: object|null, cases: string[]) => object} [cfg.extraSummary]
 */
export function runStageSuite(cfg) {
	const results = [];
	for (const step of cfg.steps) {
		results.push(
			runLabeled(step.label, process.execPath, [
				step.script,
				...(step.args || []),
			]),
		);
	}

	const casesDir = path.isAbsolute(cfg.casesDir)
		? cfg.casesDir
		: path.join(REPO_ROOT, cfg.casesDir);
	const cases = listYamlCases(casesDir);
	const matrixPath = path.isAbsolute(cfg.matrixPath)
		? cfg.matrixPath
		: path.join(REPO_ROOT, cfg.matrixPath);
	const matrix = readMatrix(matrixPath);

	const caseCountKey = cfg.caseCountKey || "case_count";
	const summary = {
		suite: cfg.suite,
		timestamp: new Date().toISOString(),
		...Object.fromEntries(
			results.map((r, i) => {
				const key =
					cfg.stepResultKeys?.[i] ||
					r.label
						.toLowerCase()
						.replace(/[^a-z0-9]+/g, "_")
						.replace(/^_|_$/g, "");
				return [key, r.code === 0];
			}),
		),
		[caseCountKey]: cases.length,
		cases,
		synthetic_matrix: matrix
			? {
					total: matrix.total,
					matched: matrix.matched,
					mismatched: matrix.mismatched,
					pass_rate: matrix.pass_rate,
					rows: matrix.rows,
				}
			: null,
		next: cfg.next || [],
		human_rubric: cfg.humanRubric || null,
		report_template:
			cfg.reportTemplate || "evals/reports/REPORT_TEMPLATE.md",
		...(cfg.extraSummary
			? cfg.extraSummary(results, matrix, cases) || {}
			: {}),
	};

	// Prefer explicit booleans for known pipeline stages when provided
	if (cfg.stepResultKeys) {
		for (let i = 0; i < cfg.stepResultKeys.length; i += 1) {
			summary[cfg.stepResultKeys[i]] = results[i]?.code === 0;
		}
	}

	const outDir = path.join(REPO_ROOT, "evals/runs");
	fs.mkdirSync(outDir, { recursive: true });
	const prefix = cfg.summaryPrefix || cfg.suite;
	const outFile = path.join(outDir, `${prefix}-${Date.now()}.json`);
	fs.writeFileSync(outFile, JSON.stringify(summary, null, 2));
	console.log(JSON.stringify(summary, null, 2));
	console.error(`\nWrote ${path.relative(REPO_ROOT, outFile)}`);
	if (matrix) {
		const label = cfg.matrixLabel || "Gate matrix";
		console.error(
			`${label}: ${matrix.matched}/${matrix.total} matched`,
		);
	}

	const failed = results.some((r) => r.code !== 0);
	process.exit(failed ? 1 : 0);
}
