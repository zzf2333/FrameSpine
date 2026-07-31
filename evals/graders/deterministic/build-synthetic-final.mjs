#!/usr/bin/env node
/**
 * Build synthetic Final Composition trial workspaces.
 * Output: evals/runs/synthetic-final/<case-id>/workspace/
 */

import fs from "node:fs";
import path from "node:path";
import { loadCaseFile } from "../lib/case-yaml.mjs";
import { REPO_ROOT, EVALS_ROOT } from "../lib/paths.mjs";

const CASES_DIR = path.join(EVALS_ROOT, "cases/final");
const OUT_ROOT = path.join(EVALS_ROOT, "runs/synthetic-final");

function walkCases(dir) {
	if (!fs.existsSync(dir)) return [];
	return fs
		.readdirSync(dir)
		.filter((f) => /\.ya?ml$/i.test(f))
		.map((f) => path.join(dir, f));
}

function write(file, content) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(
		file,
		typeof content === "string" ? content : JSON.stringify(content, null, 2),
	);
}

function readFixture(rel) {
	if (!rel) return null;
	const full = path.join(EVALS_ROOT, rel);
	if (!fs.existsSync(full)) return null;
	return fs.readFileSync(full, "utf8");
}

function baseWorkspace(ws, caze) {
	const inputRel = caze.start_state?.user_input;
	const source = readFixture(inputRel) || "# missing fixture\n";
	write(
		path.join(ws, "EPISODE.md"),
		`# Episode (synthetic final)\n\nCase: ${caze.id}\nStage: final\n`,
	);
	write(path.join(ws, "SCRIPT.md"), source);
	write(path.join(ws, "narration.txt"), source);
	write(
		path.join(ws, "STORYBOARD.md"),
		`# Confirmed Storyboard\n\nCase ${caze.id}\n`,
	);
	write(
		path.join(ws, "captions.json"),
		JSON.stringify(
			[{ start: 0, end: 2, text: "synthetic final captions" }],
			null,
			2,
		),
	);
	write(
		path.join(ws, "video/composition.html"),
		`<!doctype html><html><body data-stage="final"><div class="timeline" data-final="true"></div></body></html>\n`,
	);
}

function happyEvents() {
	return [
		{
			type: "user_confirmation",
			stage: "timed-animatic",
			next: "final",
			timed_animatic_confirmed: true,
		},
		{
			type: "cost_boundary",
			stage: "final",
			cost_boundary_explained: true,
			message: "batch final images before Final Preview",
		},
		{ type: "prompt_audit", prompt_audit: true },
		{ type: "high_risk_test", high_risk_asset_tested: true },
		{ type: "tool", tool: "generate-images", batch_final_images: true },
		{ type: "image_set_audit", image_set_audit: true },
		{
			type: "tool",
			tool: "compose-final",
			medium_motion_inherited: true,
		},
		{ type: "final_preview", final_preview: true, stage: "final" },
		{
			type: "stage_stop",
			stage: "final",
			awaiting: "user render authorization",
		},
	];
}

function happyPreview(route) {
	return {
		surface: "hyperframes-composition",
		stage: "final",
		composition_route: route,
		full_composition_playback: true,
		final_preview: true,
		cost_boundary_explained_before_batch_images: true,
		prompt_audit: true,
		image_set_audit: true,
		high_risk_asset_tested: true,
		batch_final_images: true,
		medium_motion_inherited: true,
		placeholder_marks_present: false,
		export_attempted: false,
		render_attempted: false,
		render_authorized: false,
		series_design_edited: false,
	};
}

function happyFinalManifest() {
	return {
		prompt_audit_done: true,
		image_set_audit_done: true,
		high_risk_asset_tested: true,
		batch_final_images: true,
		medium_motion_inherited: true,
		final_preview_shown: true,
		placeholder_marks_present: false,
		export_or_render_before_auth: false,
		series_design_edited: false,
		inherits_timed_animatic: true,
	};
}

function buildPositive(ws, caze) {
	baseWorkspace(ws, caze);
	const route = "hyperframes://composition/synthetic-final";
	write(path.join(ws, "eval-artifacts/composition-route.txt"), `${route}\n`);
	write(path.join(ws, "eval-artifacts/preview-manifest.json"), happyPreview(route));
	write(path.join(ws, "eval-artifacts/final-manifest.json"), happyFinalManifest());
	write(path.join(ws, "eval-artifacts/tool-trace.json"), {
		case_id: caze.id,
		events: happyEvents(),
	});
}

function buildNegative(ws, caze) {
	baseWorkspace(ws, caze);
	const id = caze.id;
	const route = "hyperframes://composition/synthetic-final-neg";

	if (id.includes("before-confirm")) {
		write(path.join(ws, "eval-artifacts/composition-route.txt"), `${route}\n`);
		write(path.join(ws, "eval-artifacts/preview-manifest.json"), {
			...happyPreview(route),
			// still claims audits to isolate prior-confirm failure
		});
		write(path.join(ws, "eval-artifacts/final-manifest.json"), happyFinalManifest());
		write(path.join(ws, "eval-artifacts/tool-trace.json"), {
			events: [
				// no timed-animatic confirmation
				{ type: "cost_boundary", cost_boundary_explained: true },
				{ type: "prompt_audit", prompt_audit: true },
				{ type: "tool", tool: "generate-images", batch_final_images: true },
				{ type: "image_set_audit", image_set_audit: true },
				{ type: "final_preview", final_preview: true },
				{ type: "stage_stop", stage: "final", awaiting: "render authorization" },
			],
		});
		return;
	}

	if (id.includes("batch-before-cost") || id.includes("before-cost")) {
		write(path.join(ws, "eval-artifacts/composition-route.txt"), `${route}\n`);
		write(path.join(ws, "eval-artifacts/preview-manifest.json"), {
			...happyPreview(route),
			cost_boundary_explained_before_batch_images: false,
		});
		write(path.join(ws, "eval-artifacts/final-manifest.json"), happyFinalManifest());
		write(path.join(ws, "eval-artifacts/tool-trace.json"), {
			events: [
				{
					type: "user_confirmation",
					stage: "timed-animatic",
					next: "final",
					timed_animatic_confirmed: true,
				},
				// batch before cost
				{ type: "tool", tool: "generate-images", batch_final_images: true },
				{ type: "cost_boundary", cost_boundary_explained: true },
				{ type: "prompt_audit", prompt_audit: true },
				{ type: "high_risk_test", high_risk_asset_tested: true },
				{ type: "image_set_audit", image_set_audit: true },
				{ type: "final_preview", final_preview: true },
				{ type: "stage_stop", stage: "final", awaiting: "render authorization" },
			],
		});
		return;
	}

	if (id.includes("no-prompt-audit")) {
		write(path.join(ws, "eval-artifacts/composition-route.txt"), `${route}\n`);
		write(path.join(ws, "eval-artifacts/preview-manifest.json"), {
			...happyPreview(route),
			prompt_audit: false,
		});
		write(path.join(ws, "eval-artifacts/final-manifest.json"), {
			...happyFinalManifest(),
			prompt_audit_done: false,
		});
		write(path.join(ws, "eval-artifacts/tool-trace.json"), {
			events: happyEvents().filter((e) => e.type !== "prompt_audit"),
		});
		return;
	}

	if (id.includes("no-image-set-audit")) {
		write(path.join(ws, "eval-artifacts/composition-route.txt"), `${route}\n`);
		write(path.join(ws, "eval-artifacts/preview-manifest.json"), {
			...happyPreview(route),
			image_set_audit: false,
		});
		write(path.join(ws, "eval-artifacts/final-manifest.json"), {
			...happyFinalManifest(),
			image_set_audit_done: false,
		});
		write(path.join(ws, "eval-artifacts/tool-trace.json"), {
			events: happyEvents().filter((e) => e.type !== "image_set_audit"),
		});
		return;
	}

	if (id.includes("render-before-preview") || id.includes("export-early")) {
		write(path.join(ws, "eval-artifacts/composition-route.txt"), `${route}\n`);
		write(path.join(ws, "eval-artifacts/preview-manifest.json"), {
			...happyPreview(route),
			final_preview: false,
			export_attempted: true,
			render_attempted: true,
			render_authorized: false,
		});
		write(path.join(ws, "eval-artifacts/final-manifest.json"), {
			...happyFinalManifest(),
			final_preview_shown: false,
			export_or_render_before_auth: true,
		});
		write(path.join(ws, "eval-artifacts/tool-trace.json"), {
			events: [
				{
					type: "user_confirmation",
					stage: "timed-animatic",
					next: "final",
					timed_animatic_confirmed: true,
				},
				{ type: "cost_boundary", cost_boundary_explained: true },
				{ type: "prompt_audit", prompt_audit: true },
				{ type: "high_risk_test", high_risk_asset_tested: true },
				{ type: "tool", tool: "generate-images", batch_final_images: true },
				{ type: "image_set_audit", image_set_audit: true },
				// export before final preview
				{ type: "export", tool: "export", export_attempted: true },
				{ type: "stage_stop", stage: "final" },
			],
		});
		return;
	}

	if (id.includes("export-without-auth") || id.includes("render-without-auth")) {
		write(path.join(ws, "eval-artifacts/composition-route.txt"), `${route}\n`);
		write(path.join(ws, "eval-artifacts/preview-manifest.json"), {
			...happyPreview(route),
			export_attempted: true,
			render_attempted: true,
			render_authorized: false,
		});
		write(path.join(ws, "eval-artifacts/final-manifest.json"), {
			...happyFinalManifest(),
			export_or_render_before_auth: true,
		});
		write(path.join(ws, "eval-artifacts/tool-trace.json"), {
			events: [
				...happyEvents().filter((e) => e.type !== "stage_stop"),
				// final preview happened, but export without auth and no stop
				{ type: "export", tool: "export", export_attempted: true },
			],
		});
		return;
	}

	// generic fail: missing stop
	write(path.join(ws, "eval-artifacts/composition-route.txt"), `${route}\n`);
	write(path.join(ws, "eval-artifacts/preview-manifest.json"), happyPreview(route));
	write(path.join(ws, "eval-artifacts/final-manifest.json"), happyFinalManifest());
	write(path.join(ws, "eval-artifacts/tool-trace.json"), {
		events: happyEvents().filter((e) => e.type !== "stage_stop"),
	});
}

function main() {
	if (fs.existsSync(OUT_ROOT)) {
		fs.rmSync(OUT_ROOT, { recursive: true, force: true });
	}
	fs.mkdirSync(OUT_ROOT, { recursive: true });

	const files = walkCases(CASES_DIR);
	const trials = [];
	for (const file of files) {
		const caze = loadCaseFile(file, fs.readFileSync);
		const id = caze.id;
		const ws = path.join(OUT_ROOT, id, "workspace");
		fs.mkdirSync(ws, { recursive: true });
		const expected = caze.expected_result || "pass";
		if (expected === "pass") buildPositive(ws, caze);
		else buildNegative(ws, caze);
		trials.push({
			id,
			case: path.relative(REPO_ROOT, file),
			workspace: path.relative(REPO_ROOT, ws),
			expected_result: expected,
		});
	}

	const index = {
		suite: "final-v1-synthetic",
		generated_at: new Date().toISOString(),
		trials,
	};
	write(path.join(OUT_ROOT, "index.json"), index);
	console.log(JSON.stringify(index, null, 2));
	console.error(`Built ${trials.length} synthetic Final trials under ${path.relative(REPO_ROOT, OUT_ROOT)}`);
}

main();
