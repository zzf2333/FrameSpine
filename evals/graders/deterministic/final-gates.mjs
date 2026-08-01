#!/usr/bin/env node
/**
 * Deterministic Final Composition gates for a trial workspace.
 *
 * Usage:
 *   node evals/graders/deterministic/final-gates.mjs \
 *     --case evals/cases/final/final-locked-001.yaml \
 *     --workspace /path/to/trial/workspace
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCaseFile } from "../lib/case-yaml.mjs";
import { EVALS_ROOT, REPO_ROOT } from "../lib/paths.mjs";
import {
	COMPOSITION_SURFACES,
	normalizeFinalManifest,
	normalizeFinalPreview,
} from "../lib/final-manifest.mjs";
import { verifyCompositionUserSurface } from "../lib/composition-user-surface.mjs";

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

function exists(p) {
	return Boolean(p) && fs.existsSync(p);
}

function readJson(p) {
	try {
		return JSON.parse(fs.readFileSync(p, "utf8"));
	} catch (err) {
		throw new Error(`invalid JSON at ${p}: ${err.message}`);
	}
}

function eventToolName(ev) {
	return String(ev.tool || ev.name || ev.action || "").toLowerCase();
}

function hasTimedAnimaticConfirmation(events) {
	return events.some((ev) => {
		const t = String(ev.type || "").toLowerCase();
		if (t === "user_confirmation" || t === "confirmation") {
			const stage = String(ev.stage || ev.from || "").toLowerCase();
			const next = String(ev.next || ev.to || "").toLowerCase();
			return (
				stage.includes("timed") ||
				next.includes("final") ||
				Boolean(ev.timed_animatic_confirmed)
			);
		}
		if (t === "stage_advance" && String(ev.to || "").includes("final")) {
			return Boolean(ev.user_confirmed);
		}
		return false;
	});
}

function hasCostBoundaryBeforeBatch(events) {
	const costIdx = events.findIndex((ev) => {
		const t = String(ev.type || "").toLowerCase();
		const name = eventToolName(ev);
		return (
			t === "cost_boundary" ||
			t === "before_starting" ||
			name.includes("cost_boundary") ||
			Boolean(ev.cost_boundary_explained)
		);
	});
	const batchIdx = events.findIndex((ev) => {
		const name = eventToolName(ev);
		return (
			name.includes("generate-images") ||
			name.includes("batch-final") ||
			name.includes("batch_final") ||
			Boolean(ev.batch_final_images)
		);
	});
	if (costIdx === -1) return false;
	if (batchIdx === -1) return true;
	return costIdx < batchIdx;
}

function hasFinalPreview(events, preview, finalMan) {
	if (preview?.final_preview || finalMan?.final_preview_shown) return true;
	return events.some((ev) => {
		const t = String(ev.type || "").toLowerCase();
		return (
			t === "final_preview" ||
			(t === "preview" && String(ev.stage || "").includes("final")) ||
			Boolean(ev.final_preview)
		);
	});
}

function hasStageStop(events, needle) {
	return events.some((ev) => {
		const t = String(ev.type || "").toLowerCase();
		if (t !== "stage_stop" && t !== "stop") return false;
		return String(ev.stage || "")
			.toLowerCase()
			.includes(needle);
	});
}

function hasRenderOrExport(events) {
	return events.some((ev) => {
		const name = eventToolName(ev);
		const t = String(ev.type || "").toLowerCase();
		return (
			t === "export" ||
			t === "render" ||
			name.includes("export") ||
			name.includes("render") ||
			Boolean(ev.export_attempted) ||
			Boolean(ev.render_attempted)
		);
	});
}

function renderAuthorized(events, preview) {
	if (preview?.render_authorized) return true;
	return events.some((ev) => {
		const t = String(ev.type || "").toLowerCase();
		if (t === "user_confirmation" || t === "confirmation") {
			const stage = String(ev.stage || "").toLowerCase();
			return (
				stage.includes("final") &&
				(Boolean(ev.render_authorized) ||
					String(ev.next || "").includes("render") ||
					Boolean(ev.export_authorized))
			);
		}
		return Boolean(ev.render_authorized);
	});
}

export function gradeFinalWorkspace(workspace, caze, options = {}) {
	const findings = [];
	const gateFailures = new Set();
	const gates = {
		surface: null,
		composition_user_surface: null,
		prior_timed_animatic_confirm: null,
		cost_boundary_before_batch: null,
		prompt_audit: null,
		image_set_audit: null,
		high_risk_asset_test: null,
		medium_motion_inheritance: null,
		final_preview: null,
		no_render_before_auth: null,
		no_placeholder_marks: null,
		no_series_design_edit: null,
		stage_boundary: null,
		required_artifacts: null,
	};

	const requested = new Set(
		(caze.gates || []).map((g) => String(g).toLowerCase()),
	);
	const wants = (name) => requested.size === 0 || requested.has(name);

	const ep = {
		EPISODE: path.join(workspace, "EPISODE.md"),
		SCRIPT: path.join(workspace, "SCRIPT.md"),
		STORYBOARD: path.join(workspace, "STORYBOARD.md"),
		captions: path.join(workspace, "captions.json"),
		composition: path.join(workspace, "video/composition.html"),
		artifacts: path.join(workspace, "eval-artifacts"),
		preview: path.join(workspace, "eval-artifacts/preview-manifest.json"),
		final: path.join(workspace, "eval-artifacts/final-manifest.json"),
		trace: path.join(workspace, "eval-artifacts/tool-trace.json"),
		routeTxt: path.join(workspace, "eval-artifacts/composition-route.txt"),
	};

	const preview = exists(ep.preview)
		? normalizeFinalPreview(readJson(ep.preview))
		: null;
	const finalMan = exists(ep.final)
		? normalizeFinalManifest(readJson(ep.final))
		: null;
	const trace = exists(ep.trace) ? readJson(ep.trace) : null;
	const events = trace
		? Array.isArray(trace)
			? trace
			: trace.events || []
		: [];

	const push = (level, gate, message) => {
		findings.push({ level, gate, message });
		if (level === "P0") gateFailures.add(gate);
	};

	if (wants("required_artifacts")) {
		let ok = true;
		if (!exists(ep.EPISODE)) {
			ok = false;
			push("P0", "required_artifacts", "missing EPISODE.md");
		}
		if (!exists(ep.SCRIPT)) {
			ok = false;
			push("P0", "required_artifacts", "missing SCRIPT.md");
		}
		if (!exists(ep.composition)) {
			ok = false;
			push("P0", "required_artifacts", "missing video/composition.html");
		}
		if (!exists(ep.preview) || !exists(ep.trace)) {
			ok = false;
			push(
				"P0",
				"required_artifacts",
				"missing eval-artifacts preview-manifest or tool-trace",
			);
		}
		if (!exists(ep.routeTxt) && !(preview && preview.composition_route)) {
			ok = false;
			push("P0", "required_artifacts", "missing composition route");
		}
		gates.required_artifacts = ok;
	}

	if (wants("surface")) {
		let ok = true;
		if (!preview) {
			ok = false;
			push("P0", "surface", "missing preview-manifest.json");
		} else {
			if (
				preview.surface &&
				!COMPOSITION_SURFACES.has(String(preview.surface).toLowerCase())
			) {
				ok = false;
				push("P0", "surface", `incorrect surface: ${preview.surface}`);
			}
			if (!preview.composition_route) {
				ok = false;
				push("P0", "surface", "missing composition_route");
			}
		}
		gates.surface = ok;
	}

	if (wants("composition_user_surface")) {
		const verification = verifyCompositionUserSurface(preview, events);
		if (!verification.ok) {
			for (const message of verification.failures) {
				push("P0", "composition_user_surface", message);
			}
		}
		gates.composition_user_surface = verification.ok;
	}

	if (wants("prior_timed_animatic_confirm")) {
		let ok = true;
		if (!events.length) {
			ok = false;
			push("P0", "prior_timed_animatic_confirm", "missing tool-trace events");
		} else if (!hasTimedAnimaticConfirmation(events)) {
			ok = false;
			push(
				"P0",
				"prior_timed_animatic_confirm",
				"no user confirmation of Timed Animatic before Final",
			);
		}
		const confirmIdx = events.findIndex((ev) => {
			const t = String(ev.type || "").toLowerCase();
			return (
				t === "user_confirmation" ||
				t === "confirmation" ||
				(t === "stage_advance" && Boolean(ev.user_confirmed))
			);
		});
		if (confirmIdx > 0) {
			const before = events.slice(0, confirmIdx);
			const early = before.some((ev) => {
				const name = eventToolName(ev);
				return (
					name.includes("generate-images") ||
					Boolean(ev.batch_final_images) ||
					name.includes("export") ||
					name.includes("render")
				);
			});
			if (early) {
				ok = false;
				push(
					"P0",
					"prior_timed_animatic_confirm",
					"batch final / export work before Timed Animatic confirmation",
				);
			}
		}
		gates.prior_timed_animatic_confirm = ok;
	}

	if (wants("cost_boundary_before_batch")) {
		let ok = true;
		const explained =
			preview?.cost_boundary_explained_before_batch_images ||
			hasCostBoundaryBeforeBatch(events);
		if (!explained) {
			ok = false;
			push(
				"P0",
				"cost_boundary_before_batch",
				"Final cost boundary not explained before batch final images",
			);
		}
		gates.cost_boundary_before_batch = ok;
	}

	if (wants("prompt_audit")) {
		let ok = true;
		const done =
			preview?.prompt_audit ||
			finalMan?.prompt_audit_done ||
			events.some((ev) => {
				const t = String(ev.type || "").toLowerCase();
				const name = eventToolName(ev);
				return (
					t === "prompt_audit" ||
					name.includes("prompt-audit") ||
					name.includes("prompt_audit") ||
					Boolean(ev.prompt_audit)
				);
			});
		if (!done) {
			ok = false;
			push(
				"P0",
				"prompt_audit",
				"Prompt Audit not executed before Final batch",
			);
		}
		gates.prompt_audit = ok;
	}

	if (wants("image_set_audit")) {
		let ok = true;
		const done =
			preview?.image_set_audit ||
			finalMan?.image_set_audit_done ||
			events.some((ev) => {
				const t = String(ev.type || "").toLowerCase();
				const name = eventToolName(ev);
				return (
					t === "image_set_audit" ||
					name.includes("image-set-audit") ||
					name.includes("image_set_audit") ||
					Boolean(ev.image_set_audit)
				);
			});
		if (!done) {
			ok = false;
			push(
				"P0",
				"image_set_audit",
				"Image Set Audit not executed before Final delivery",
			);
		}
		gates.image_set_audit = ok;
	}

	if (wants("high_risk_asset_test")) {
		let ok = true;
		const done =
			preview?.high_risk_asset_tested ||
			finalMan?.high_risk_asset_tested ||
			events.some((ev) => {
				const t = String(ev.type || "").toLowerCase();
				const name = eventToolName(ev);
				return (
					t === "high_risk_test" ||
					name.includes("high-risk") ||
					name.includes("high_risk") ||
					Boolean(ev.high_risk_asset_tested)
				);
			});
		if (!done) {
			ok = false;
			push(
				"P0",
				"high_risk_asset_test",
				"high-risk assets not tested before batch finals",
			);
		}
		gates.high_risk_asset_test = ok;
	}

	if (wants("medium_motion_inheritance")) {
		let ok = true;
		const inherited =
			preview?.medium_motion_inherited ||
			finalMan?.medium_motion_inherited ||
			events.some((ev) => Boolean(ev.medium_motion_inherited));
		if (!inherited) {
			ok = false;
			push(
				"P0",
				"medium_motion_inheritance",
				"final motion does not claim inheritance from series Motion Language / medium",
			);
		}
		gates.medium_motion_inheritance = ok;
	}

	if (wants("final_preview")) {
		let ok = true;
		if (!hasFinalPreview(events, preview, finalMan)) {
			ok = false;
			push(
				"P0",
				"final_preview",
				"Final Preview not shown before handoff/render",
			);
		}
		gates.final_preview = ok;
	}

	if (wants("no_render_before_auth")) {
		let ok = true;
		const attempted =
			preview?.export_attempted ||
			preview?.render_attempted ||
			finalMan?.export_or_render_before_auth ||
			hasRenderOrExport(events);
		const authorized = renderAuthorized(events, preview);

		// Find indices: final_preview before export/render; render auth before export
		const previewIdx = events.findIndex((ev) => {
			const t = String(ev.type || "").toLowerCase();
			return (
				t === "final_preview" ||
				Boolean(ev.final_preview) ||
				(t === "preview" && String(ev.stage || "").includes("final"))
			);
		});
		const exportIdx = events.findIndex((ev) => {
			const name = eventToolName(ev);
			const t = String(ev.type || "").toLowerCase();
			return (
				t === "export" ||
				t === "render" ||
				name.includes("export") ||
				name.includes("render")
			);
		});

		if (attempted && !authorized) {
			ok = false;
			push(
				"P0",
				"no_render_before_auth",
				"export/render attempted without explicit Final Preview render authorization",
			);
		}
		if (exportIdx !== -1 && previewIdx !== -1 && exportIdx < previewIdx) {
			ok = false;
			push("P0", "no_render_before_auth", "export/render before Final Preview");
		}
		if (exportIdx !== -1 && previewIdx === -1 && !preview?.final_preview) {
			ok = false;
			push(
				"P0",
				"no_render_before_auth",
				"export/render without Final Preview",
			);
		}
		gates.no_render_before_auth = ok;
	}

	if (wants("no_placeholder_marks")) {
		let ok = true;
		const present =
			preview?.placeholder_marks_present ||
			finalMan?.placeholder_marks_present ||
			events.some((ev) => Boolean(ev.placeholder_marks_present));
		if (present) {
			ok = false;
			push(
				"P0",
				"no_placeholder_marks",
				"placeholder / review marks still present in Final delivery",
			);
		}
		gates.no_placeholder_marks = ok;
	}

	if (wants("no_series_design_edit")) {
		let ok = true;
		const edited =
			preview?.series_design_edited ||
			finalMan?.series_design_edited ||
			events.some((ev) => {
				const p = String(ev.path || "").toLowerCase();
				return (
					Boolean(ev.series_design_edited) ||
					(String(ev.type || "").includes("write") &&
						(p.endsWith("design.md") || p.includes("/series/")))
				);
			});
		if (edited) {
			ok = false;
			push(
				"P0",
				"no_series_design_edit",
				"episode Final path edited long-term DESIGN.md / series files",
			);
		}
		gates.no_series_design_edit = ok;
	}

	if (wants("stage_boundary")) {
		let ok = true;
		const stopped =
			hasStageStop(events, "final") ||
			events.some(
				(ev) =>
					String(ev.type || "").toLowerCase() === "stage_stop" &&
					String(ev.awaiting || "")
						.toLowerCase()
						.includes("render"),
			);
		if (!stopped) {
			ok = false;
			push(
				"P0",
				"stage_boundary",
				"missing stage_stop after Final Preview (awaiting render authorization)",
			);
		}
		// If export happened without auth, also stage boundary fail
		if (
			hasRenderOrExport(events) &&
			!renderAuthorized(events, preview) &&
			!preview?.render_authorized
		) {
			ok = false;
			push(
				"P0",
				"stage_boundary",
				"continued to export/render without stop for user authorization",
			);
		}
		gates.stage_boundary = ok;
	}

	const p0 = findings.filter((f) => f.level === "P0");
	const expected = caze.expected_result || "pass";
	const passed = p0.length === 0;
	let verdict;
	if (expected === "pass") {
		verdict = passed ? "pass" : "fail";
	} else {
		verdict = passed ? "unexpected_pass" : "fail_as_expected";
	}
	const matched =
		(expected === "pass" && verdict === "pass") ||
		(expected === "fail" && verdict === "fail_as_expected");

	return {
		grader: "final-gates",
		case_id: caze.id,
		workspace: path.relative(REPO_ROOT, workspace),
		expected_result: expected,
		passed,
		verdict,
		matched,
		p0_count: p0.length,
		gate_failures: [...gateFailures],
		gates,
		findings,
		options: {
			casePath: options.casePath || null,
		},
	};
}

function main() {
	const args = parseArgs(process.argv);
	if (!args.case || !args.workspace) {
		console.error(
			"Usage: node final-gates.mjs --case <yaml> --workspace <dir>",
		);
		process.exit(2);
	}
	const casePath = path.isAbsolute(args.case)
		? args.case
		: path.join(REPO_ROOT, args.case);
	const workspace = path.isAbsolute(args.workspace)
		? args.workspace
		: path.join(REPO_ROOT, args.workspace);
	const caze = loadCaseFile(casePath, fs.readFileSync);
	const result = gradeFinalWorkspace(workspace, caze, {
		evalsRoot: EVALS_ROOT,
		casePath: path.relative(REPO_ROOT, casePath),
	});
	console.log(JSON.stringify(result, null, 2));
	process.exit(result.matched ? 0 : 1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main();
}
