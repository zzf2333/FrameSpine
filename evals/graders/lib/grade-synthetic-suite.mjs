/**
 * Shared synthetic matrix grader for E2 stage suites.
 */

import fs from "node:fs";
import path from "node:path";
import { loadCaseFile } from "./case-yaml.mjs";
import { REPO_ROOT, EVALS_ROOT } from "./paths.mjs";

/**
 * @param {object} cfg
 * @param {string} cfg.synRoot - absolute path to synthetic runs root
 * @param {string} cfg.buildHint - how to build if index missing
 * @param {string} cfg.graderName
 * @param {(workspace: string, caze: object, options: object) => object} cfg.gradeFn
 * @param {string} cfg.title - markdown H1
 * @param {string[]} cfg.notes - markdown notes bullets
 * @param {string} [cfg.latestReportName] - under evals/reports/
 * @param {(caze: object, trial: object) => object} [cfg.optionsForCase]
 */
export function gradeSyntheticSuite(cfg) {
	const indexPath = path.join(cfg.synRoot, "index.json");
	if (!fs.existsSync(indexPath)) {
		console.error(`No synthetic index. Run: ${cfg.buildHint}`);
		process.exit(2);
	}

	let index;
	try {
		index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
	} catch (err) {
		console.error(`invalid index.json: ${err.message}`);
		process.exit(2);
	}

	const rows = [];
	for (const trial of index.trials) {
		const casePath = path.join(REPO_ROOT, trial.case);
		const workspace = path.join(REPO_ROOT, trial.workspace);
		const caze = loadCaseFile(casePath, fs.readFileSync);
		const baseOptions = {
			evalsRoot: EVALS_ROOT,
			casePath: trial.case,
		};
		const options = {
			...baseOptions,
			...(cfg.optionsForCase ? cfg.optionsForCase(caze, trial) : {}),
		};
		const result = cfg.gradeFn(workspace, caze, options);
		const gradePath = path.join(
			cfg.synRoot,
			trial.id,
			"grades/deterministic.json",
		);
		fs.mkdirSync(path.dirname(gradePath), { recursive: true });
		fs.writeFileSync(gradePath, JSON.stringify(result, null, 2));
		rows.push({
			id: trial.id,
			expected: result.expected_result,
			verdict: result.verdict,
			matched: result.matched,
			p0_count: result.p0_count,
			gate_failures: result.gate_failures,
		});
	}

	const matched = rows.filter((r) => r.matched).length;
	const report = {
		grader: cfg.graderName,
		generated_at: new Date().toISOString(),
		total: rows.length,
		matched,
		mismatched: rows.length - matched,
		pass_rate: rows.length ? matched / rows.length : 0,
		rows,
	};

	const out = path.join(cfg.synRoot, "matrix.json");
	fs.writeFileSync(out, JSON.stringify(report, null, 2));

	const md = [
		`# ${cfg.title}`,
		"",
		`Generated: ${report.generated_at}`,
		"",
		`| matched | total | pass rate |`,
		`| --- | --- | --- |`,
		`| ${matched} | ${rows.length} | ${(report.pass_rate * 100).toFixed(1)}% |`,
		"",
		"| case | expected | verdict | matched | p0 | gate failures |",
		"| --- | --- | --- | --- | --- | --- |",
		...rows.map(
			(r) =>
				`| ${r.id} | ${r.expected} | ${r.verdict} | ${r.matched ? "yes" : "NO"} | ${r.p0_count} | ${(r.gate_failures || []).join(", ") || "—"} |`,
		),
		"",
		"## Notes",
		"",
		...(cfg.notes || []).map((n) => `- ${n}`),
		"",
	].join("\n");
	fs.writeFileSync(path.join(cfg.synRoot, "matrix.md"), md);

	if (cfg.latestReportName) {
		const reportsDir = path.join(EVALS_ROOT, "reports");
		fs.mkdirSync(reportsDir, { recursive: true });
		fs.writeFileSync(path.join(reportsDir, cfg.latestReportName), md);
	}

	console.log(JSON.stringify(report, null, 2));
	console.error(`\nWrote ${path.relative(REPO_ROOT, out)}`);
	console.error(
		`Wrote ${path.relative(REPO_ROOT, path.join(cfg.synRoot, "matrix.md"))}`,
	);

	process.exit(report.mismatched === 0 ? 0 : 1);
}
