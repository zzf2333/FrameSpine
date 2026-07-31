#!/usr/bin/env node
/**
 * Grade all trials under evals/runs/<case-id>/ with the stage deterministic gate.
 *
 *   node evals/graders/trace/grade-trials.mjs --case-id storyboard-locked-001
 *   node evals/graders/trace/grade-trials.mjs --case-run evals/runs/storyboard-locked-001
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { loadCaseFile } from "../lib/case-yaml.mjs";
import { EVALS_ROOT, REPO_ROOT } from "../lib/paths.mjs";
import {
	listTrialDirs,
	normalizeStage,
	readJsonSafe,
	stageGateModule,
	validateTrialLayout,
	writeJson,
} from "./trial-layout.mjs";

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

async function loadGrader(modInfo) {
	const full = path.join(REPO_ROOT, modInfo.path);
	const mod = await import(pathToFileURL(full).href);
	const fn = mod[modInfo.exportName];
	if (typeof fn !== "function") {
		throw new Error(
			`export ${modInfo.exportName} not found in ${modInfo.path}`,
		);
	}
	return fn;
}

async function main() {
	const args = parseArgs(process.argv);
	let caseRunDir;
	if (args["case-run"]) {
		caseRunDir = path.isAbsolute(args["case-run"])
			? args["case-run"]
			: path.join(REPO_ROOT, args["case-run"]);
	} else if (args["case-id"] || args.case) {
		const id = args["case-id"] || args.case;
		caseRunDir = path.join(EVALS_ROOT, "runs", id);
	} else {
		console.error(
			"Usage: node grade-trials.mjs --case-id <id> | --case-run <dir>",
		);
		process.exit(2);
	}

	if (!fs.existsSync(caseRunDir)) {
		console.error(`case run dir not found: ${caseRunDir}`);
		process.exit(2);
	}

	const suite = readJsonSafe(path.join(caseRunDir, "suite-manifest.json"));
	const casePathRel = suite?.case_path || args["case-path"] || null;
	if (!casePathRel) {
		console.error(
			"missing suite-manifest.json case_path; pass --case-path evals/cases/...",
		);
		process.exit(2);
	}
	const casePath = path.join(REPO_ROOT, casePathRel);
	const caze = loadCaseFile(casePath, fs.readFileSync);
	const stage = normalizeStage(
		suite?.target_stage || caze.target_stage || caze.slice?.stage,
	);
	const modInfo = stageGateModule(stage);
	if (!modInfo) {
		console.error(`no deterministic grader for stage: ${stage}`);
		process.exit(2);
	}
	const gradeFn = await loadGrader(modInfo);

	const sourceScript = caze.start_state?.user_input
		? path.join(EVALS_ROOT, caze.start_state.user_input)
		: null;

	const trials = listTrialDirs(caseRunDir);
	const rows = [];

	for (const trialDir of trials) {
		const trialName = path.basename(trialDir);
		const trialNum = Number(trialName.split("-")[1]) || null;
		const workspace = path.join(trialDir, "workspace");
		const layout = validateTrialLayout(trialDir, stage);

		let result;
		if (!layout.ok) {
			result = {
				grader: "grade-trials",
				case_id: caze.id,
				trial: trialNum,
				workspace: path.relative(REPO_ROOT, workspace),
				expected_result: caze.expected_result || "pass",
				passed: false,
				verdict: "fail",
				matched: (caze.expected_result || "pass") === "fail",
				p0_count: layout.issues.length,
				gate_failures: ["layout"],
				gates: { layout: false },
				findings: layout.issues.map((i) => ({
					level: i.level,
					gate: "layout",
					message: i.message,
					code: i.code,
				})),
				layout,
			};
			// For expected pass, missing layout → fail unmatched unless expected fail
			if ((caze.expected_result || "pass") === "pass") {
				result.matched = false;
				result.verdict = "fail";
			} else {
				result.verdict = "fail_as_expected";
				result.matched = true;
			}
		} else {
			const options = {
				evalsRoot: EVALS_ROOT,
				casePath: casePathRel,
			};
			if (modInfo.needsSourceScript && sourceScript) {
				options.sourceScriptPath = sourceScript;
			}
			result = gradeFn(workspace, caze, options);
			result.trial = trialNum;
			result.layout = layout;
		}

		writeJson(path.join(trialDir, "grades/deterministic.json"), result);

		const summary = {
			case_id: caze.id,
			trial: trialNum,
			target_stage: stage,
			expected_result: result.expected_result,
			verdict: result.verdict,
			matched: result.matched,
			p0_count: result.p0_count,
			gate_failures: result.gate_failures || [],
			graded_at: new Date().toISOString(),
		};
		writeJson(path.join(trialDir, "grades/summary.json"), summary);

		// update trial-manifest if present
		const tmPath = path.join(trialDir, "trial-manifest.json");
		const tm = readJsonSafe(tmPath) || {
			case_id: caze.id,
			trial: trialNum,
			target_stage: stage,
		};
		tm.status = layout.ok ? "complete" : "partial";
		tm.workspace_ready = layout.ok;
		tm.artifacts_claimed = layout.ok;
		tm.completed_at = new Date().toISOString();
		tm.last_verdict = result.verdict;
		tm.last_matched = result.matched;
		writeJson(tmPath, tm);

		rows.push(summary);
	}

	const out = {
		grader: "grade-trials",
		case_id: caze.id,
		target_stage: stage,
		case_run: path.relative(REPO_ROOT, caseRunDir),
		trials_graded: rows.length,
		rows,
	};
	console.log(JSON.stringify(out, null, 2));
	console.error(`Graded ${rows.length} trial(s) for ${caze.id} (${stage})`);
	// exit 0 even if some fail — aggregate decides stability; use --strict to fail
	if (args.strict) {
		const bad = rows.some((r) => !r.matched);
		process.exit(bad ? 1 : 0);
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main().catch((err) => {
		console.error(err);
		process.exit(1);
	});
}
