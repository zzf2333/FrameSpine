#!/usr/bin/env node
/**
 * Validate E3 trial layout (artifacts present for target stage).
 *
 *   node evals/graders/trace/validate-trial.mjs \
 *     --trial-dir evals/runs/storyboard-locked-001/trial-1 \
 *     [--stage story-flow]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { REPO_ROOT } from "../lib/paths.mjs";
import {
	normalizeStage,
	readJsonSafe,
	validateTrialLayout,
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

function main() {
	const args = parseArgs(process.argv);
	if (!args["trial-dir"] && !args.trial) {
		console.error(
			"Usage: node validate-trial.mjs --trial-dir <path> [--stage story-flow]",
		);
		process.exit(2);
	}
	const trialDir = path.isAbsolute(args["trial-dir"] || args.trial)
		? args["trial-dir"] || args.trial
		: path.join(REPO_ROOT, args["trial-dir"] || args.trial);

	const trialMan = readJsonSafe(path.join(trialDir, "trial-manifest.json"));
	const parentSuite = readJsonSafe(
		path.join(path.dirname(trialDir), "suite-manifest.json"),
	);
	const stage =
		args.stage ||
		trialMan?.target_stage ||
		parentSuite?.target_stage ||
		"story-flow";

	const result = validateTrialLayout(trialDir, normalizeStage(stage));
	const out = {
		grader: "validate-trial",
		trial_dir: path.relative(REPO_ROOT, trialDir),
		target_stage: result.stage,
		ok: result.ok,
		issue_count: result.issues.length,
		issues: result.issues,
	};
	console.log(JSON.stringify(out, null, 2));
	process.exit(result.ok ? 0 : 1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main();
}
