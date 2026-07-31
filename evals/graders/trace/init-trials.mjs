#!/usr/bin/env node
/**
 * Initialize multi-trial directories for a case (E3 harness).
 * Does NOT run an Agent. External runner fills workspace/.
 *
 *   node evals/graders/trace/init-trials.mjs \
 *     --case evals/cases/storyboard/storyboard-locked-001.yaml \
 *     [--trials 3] [--force]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCaseFile } from "../lib/case-yaml.mjs";
import { EVALS_ROOT, REPO_ROOT } from "../lib/paths.mjs";
import { normalizeStage, writeJson } from "./trial-layout.mjs";

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

function copySeriesFixture(seriesRel, destDir) {
	if (!seriesRel) return;
	const src = path.join(EVALS_ROOT, seriesRel);
	if (!fs.existsSync(src)) return;
	fs.mkdirSync(destDir, { recursive: true });
	for (const name of fs.readdirSync(src)) {
		const from = path.join(src, name);
		const to = path.join(destDir, name);
		if (fs.statSync(from).isFile()) {
			fs.copyFileSync(from, to);
		}
	}
}

function seedWorkspace(ws, caze) {
	fs.mkdirSync(path.join(ws, "eval-artifacts"), { recursive: true });
	fs.mkdirSync(path.join(ws, "video"), { recursive: true });

	const seriesRel = caze.start_state?.series_fixture;
	if (seriesRel) {
		copySeriesFixture(seriesRel, ws);
	}

	const inputRel = caze.start_state?.user_input;
	if (inputRel) {
		const src = path.join(EVALS_ROOT, inputRel);
		if (fs.existsSync(src)) {
			const text = fs.readFileSync(src, "utf8");
			// Locked / script inputs seed SCRIPT.md for the agent; agent must preserve.
			if (!fs.existsSync(path.join(ws, "SCRIPT.md"))) {
				fs.writeFileSync(path.join(ws, "SCRIPT.md"), text);
			}
			if (!fs.existsSync(path.join(ws, "narration.txt"))) {
				fs.writeFileSync(path.join(ws, "narration.txt"), text);
			}
		}
	}

	if (!fs.existsSync(path.join(ws, "EPISODE.md"))) {
		fs.writeFileSync(
			path.join(ws, "EPISODE.md"),
			`# Episode\n\nCase: ${caze.id}\nTarget: ${caze.target_stage}\n\n_Seeded by E3 harness. Agent fills production content._\n`,
		);
	}

	const stage = normalizeStage(caze.target_stage || caze.slice?.stage);
	if (stage === "story-flow" || stage === "image-animatic") {
		const cap = path.join(ws, "captions.json");
		if (!fs.existsSync(cap)) {
			fs.writeFileSync(cap, "[]\n");
		}
	}

	// Placeholder README for agents
	fs.writeFileSync(
		path.join(ws, "eval-artifacts/README.md"),
		`# eval-artifacts\n\nAgent/harness must write stage manifests + tool-trace here.\nSee evals/fixtures/trial-schema/ and evals/graders/trace/HARNESS.md.\nStage: ${stage}\n`,
	);
}

function main() {
	const args = parseArgs(process.argv);
	if (!args.case) {
		console.error(
			"Usage: node init-trials.mjs --case <yaml> [--trials N] [--force]",
		);
		process.exit(2);
	}

	const casePath = path.isAbsolute(args.case)
		? args.case
		: path.join(REPO_ROOT, args.case);
	if (!fs.existsSync(casePath)) {
		console.error(`case not found: ${casePath}`);
		process.exit(2);
	}

	const caze = loadCaseFile(casePath, fs.readFileSync);
	const n = Math.max(
		1,
		Number(args.trials || caze.recommended_trials || 3) || 3,
	);
	const stage = normalizeStage(caze.target_stage || caze.slice?.stage);
	const caseRunDir = path.join(EVALS_ROOT, "runs", caze.id);

	if (fs.existsSync(caseRunDir) && !args.force) {
		// Allow additive init if empty-ish; refuse clobber without --force
		const existing = fs
			.readdirSync(caseRunDir)
			.filter((name) => /^trial-\d+$/i.test(name));
		if (existing.length) {
			console.error(
				`runs/${caze.id} already has trials. Use --force to re-seed (destructive) or grade existing.`,
			);
			process.exit(2);
		}
	}

	if (args.force && fs.existsSync(caseRunDir)) {
		// only remove trial-* and suite-manifest; keep other files if mixed
		for (const name of fs.readdirSync(caseRunDir)) {
			if (
				/^trial-\d+$/i.test(name) ||
				name.startsWith("suite-manifest") ||
				name.startsWith("aggregate.")
			) {
				fs.rmSync(path.join(caseRunDir, name), {
					recursive: true,
					force: true,
				});
			}
		}
	}

	fs.mkdirSync(caseRunDir, { recursive: true });

	const suite = {
		case_id: caze.id,
		case_path: path.relative(REPO_ROOT, casePath),
		target_stage: stage,
		recommended_trials: n,
		trial_count: n,
		model: args.model || null,
		created_at: new Date().toISOString(),
		mode: "live-agent",
		notes:
			"External runner fills each trial workspace; then run eval:harness:grade + aggregate.",
	};
	writeJson(path.join(caseRunDir, "suite-manifest.json"), suite);

	const trials = [];
	for (let i = 1; i <= n; i += 1) {
		const trialDir = path.join(caseRunDir, `trial-${i}`);
		const ws = path.join(trialDir, "workspace");
		fs.mkdirSync(path.join(trialDir, "grades"), { recursive: true });
		fs.mkdirSync(path.join(trialDir, "human"), { recursive: true });
		seedWorkspace(ws, caze);

		const sheetSrc = {
			"story-flow": "evals/graders/human/storyboard-review-sheet.md",
			"image-animatic": "evals/graders/human/image-animatic-review-sheet.md",
			"timed-animatic": "evals/graders/human/timed-animatic-review-sheet.md",
			final: "evals/graders/human/final-review-sheet.md",
		}[stage];
		if (sheetSrc) {
			const full = path.join(REPO_ROOT, sheetSrc);
			if (fs.existsSync(full)) {
				fs.copyFileSync(full, path.join(trialDir, "human/review-sheet.md"));
			}
		}

		const trialManifest = {
			case_id: caze.id,
			trial: i,
			target_stage: stage,
			status: "pending",
			model: args.model || null,
			started_at: null,
			completed_at: null,
			workspace_ready: false,
			artifacts_claimed: false,
			notes: "Seeded by init-trials. External agent produces stage artifacts.",
		};
		writeJson(path.join(trialDir, "trial-manifest.json"), trialManifest);
		trials.push({
			trial: i,
			path: path.relative(REPO_ROOT, trialDir),
		});
	}

	const out = {
		ok: true,
		suite: path.relative(
			REPO_ROOT,
			path.join(caseRunDir, "suite-manifest.json"),
		),
		case_id: caze.id,
		target_stage: stage,
		trials,
		next: [
			`External agent: produce stage work under each trial-N/workspace`,
			`Write eval-artifacts per evals/fixtures/trial-schema/`,
			`npm run eval:harness:grade -- --case-id ${caze.id}`,
			`npm run eval:harness:aggregate -- --case-id ${caze.id}`,
		],
	};
	console.log(JSON.stringify(out, null, 2));
	console.error(
		`Initialized ${n} trials under evals/runs/${caze.id}/ (stage=${stage})`,
	);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main();
}
