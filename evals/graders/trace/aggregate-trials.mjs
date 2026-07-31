#!/usr/bin/env node
/**
 * Aggregate multi-trial grades for a case run (E3 stability).
 *
 *   node evals/graders/trace/aggregate-trials.mjs --case-id storyboard-locked-001
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EVALS_ROOT, REPO_ROOT } from "../lib/paths.mjs";
import { listTrialDirs, readJsonSafe, writeJson } from "./trial-layout.mjs";

function parseArgs(argv) {
	const out = {};
	for (let i = 2; i < argv.length; i += 1) {
		const a = argv[i];
		if (a.startsWith("--")) {
			const key = a.slice(2);
			const val =
				argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
			out[key] = val;
		}
	}
	return out;
}

function main() {
	const args = parseArgs(process.argv);
	let caseRunDir;
	if (args["case-run"]) {
		caseRunDir = path.isAbsolute(args["case-run"])
			? args["case-run"]
			: path.join(REPO_ROOT, args["case-run"]);
	} else if (args["case-id"] || args.case) {
		caseRunDir = path.join(EVALS_ROOT, "runs", args["case-id"] || args.case);
	} else {
		console.error(
			"Usage: node aggregate-trials.mjs --case-id <id> | --case-run <dir>",
		);
		process.exit(2);
	}

	if (!fs.existsSync(caseRunDir)) {
		console.error(`case run dir not found: ${caseRunDir}`);
		process.exit(2);
	}

	const suite =
		readJsonSafe(path.join(caseRunDir, "suite-manifest.json")) || {};
	const trials = listTrialDirs(caseRunDir);
	const rows = [];
	const gateFailCounts = new Map();

	for (const trialDir of trials) {
		const summary =
			readJsonSafe(path.join(trialDir, "grades/summary.json")) ||
			readJsonSafe(path.join(trialDir, "grades/deterministic.json"));
		const trialMan = readJsonSafe(path.join(trialDir, "trial-manifest.json"));
		if (!summary) {
			rows.push({
				trial: trialMan?.trial || path.basename(trialDir),
				status: trialMan?.status || "pending",
				matched: null,
				verdict: "ungraded",
				p0_count: null,
				gate_failures: [],
			});
			continue;
		}
		const gateFailures = summary.gate_failures || [];
		for (const g of gateFailures) {
			gateFailCounts.set(g, (gateFailCounts.get(g) || 0) + 1);
		}
		rows.push({
			trial: summary.trial ?? trialMan?.trial ?? path.basename(trialDir),
			status: trialMan?.status || "complete",
			matched: summary.matched,
			verdict: summary.verdict,
			p0_count: summary.p0_count,
			gate_failures: gateFailures,
		});
	}

	const graded = rows.filter((r) => r.verdict !== "ungraded");
	const complete = graded;
	const p0Free = complete.filter(
		(r) => r.p0_count === 0 || (r.matched && r.verdict === "pass"),
	);
	// Prefer explicit p0_count when present
	const p0FreeCount = complete.filter((r) => Number(r.p0_count) === 0).length;
	const matchedCount = complete.filter((r) => r.matched === true).length;
	const failAsExpected = complete.filter(
		(r) => r.verdict === "fail_as_expected",
	).length;
	const unexpectedPass = complete.filter(
		(r) => r.verdict === "unexpected_pass",
	).length;
	const anyFail = complete.some(
		(r) => r.matched === false || r.verdict === "fail",
	);
	const allPass =
		complete.length > 0 && complete.every((r) => r.matched === true);

	const threshold = Math.ceil(complete.length / 2) || 1;
	const highFrequency = [...gateFailCounts.entries()]
		.filter(([, c]) => c >= threshold)
		.map(([gate, count]) => ({ gate, count }))
		.sort((a, b) => b.count - a.count);

	let stability = "insufficient";
	if (complete.length >= 2) {
		const keys = complete.map((r) => `${r.verdict}:${r.matched}`);
		const same = keys.every((k) => k === keys[0]);
		stability = same ? "stable" : "unstable";
	}

	const aggregate = {
		grader: "aggregate-trials",
		case_id: suite.case_id || path.basename(caseRunDir),
		target_stage: suite.target_stage || null,
		generated_at: new Date().toISOString(),
		case_run: path.relative(REPO_ROOT, caseRunDir),
		trials_total: rows.length,
		trials_graded: complete.length,
		trials_pending: rows.length - complete.length,
		p0_free_count: p0FreeCount,
		p0_free_rate: complete.length ? p0FreeCount / complete.length : null,
		matched_count: matchedCount,
		matched_rate: complete.length ? matchedCount / complete.length : null,
		all_pass: allPass,
		any_fail: anyFail,
		fail_as_expected_count: failAsExpected,
		unexpected_pass_count: unexpectedPass,
		high_frequency_gate_failures: highFrequency,
		cross_trial_stability: stability,
		// do NOT emit a single overall score
		rows,
		human_note:
			"Soft quality / Visual-Only not included. Fill human/review-sheet.md separately.",
	};

	writeJson(path.join(caseRunDir, "aggregate.json"), aggregate);

	const md = [
		`# Multi-trial aggregate: ${aggregate.case_id}`,
		"",
		`Generated: ${aggregate.generated_at}`,
		"",
		`Stage: ${aggregate.target_stage || "—"}`,
		"",
		"| metric | value |",
		"| --- | --- |",
		`| trials_total | ${aggregate.trials_total} |`,
		`| trials_graded | ${aggregate.trials_graded} |`,
		`| p0_free_rate | ${aggregate.p0_free_rate == null ? "—" : (aggregate.p0_free_rate * 100).toFixed(1) + "%"} |`,
		`| matched_rate | ${aggregate.matched_rate == null ? "—" : (aggregate.matched_rate * 100).toFixed(1) + "%"} |`,
		`| all_pass | ${aggregate.all_pass} |`,
		`| any_fail | ${aggregate.any_fail} |`,
		`| cross_trial_stability | ${aggregate.cross_trial_stability} |`,
		"",
		"## Per trial",
		"",
		"| trial | status | verdict | matched | p0 | gate failures |",
		"| --- | --- | --- | --- | --- | --- |",
		...rows.map(
			(r) =>
				`| ${r.trial} | ${r.status} | ${r.verdict} | ${r.matched} | ${r.p0_count} | ${(r.gate_failures || []).join(", ") || "—"} |`,
		),
		"",
		"## High-frequency gate failures",
		"",
		highFrequency.length
			? highFrequency.map((h) => `- \`${h.gate}\` × ${h.count}`).join("\n")
			: "- none",
		"",
		"## Notes",
		"",
		"- No single total score by design.",
		"- Synthetic gate matrix is separate from live multi-trial stability.",
		"- Soft dims require human review sheets.",
		"",
	].join("\n");
	fs.writeFileSync(path.join(caseRunDir, "aggregate.md"), md);

	console.log(JSON.stringify(aggregate, null, 2));
	console.error(
		`Aggregate ${aggregate.case_id}: stability=${stability} graded=${complete.length}/${rows.length}`,
	);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main();
}
