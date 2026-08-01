#!/usr/bin/env node
/**
 * Deterministic Image Animatic gates for a trial workspace.
 *
 * Usage:
 *   node evals/graders/deterministic/image-animatic-gates.mjs \
 *     --case evals/cases/animatic/image-animatic-locked-001.yaml \
 *     --workspace /path/to/trial/workspace
 *
 * Exit codes:
 *   0  gates match expected_result
 *   1  mismatch / unexpected fail on positive
 *   2  usage / IO error
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCaseFile } from "../lib/case-yaml.mjs";
import { EVALS_ROOT } from "../lib/paths.mjs";
import {
	COMPOSITION_SURFACES,
	STORYBOARD_SURFACES,
	normalizeCompositionManifest,
	normalizePreviewManifest,
} from "../lib/composition-manifest.mjs";
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

function captionsIsFormal(captionsPath) {
	if (!exists(captionsPath)) return false;
	try {
		const raw = JSON.parse(fs.readFileSync(captionsPath, "utf8"));
		if (Array.isArray(raw)) return raw.length > 0;
		if (raw && Array.isArray(raw.cues)) return raw.cues.length > 0;
		if (raw && Array.isArray(raw.segments)) return raw.segments.length > 0;
		return Boolean(raw && Object.keys(raw).length);
	} catch {
		// unreadable captions treated as present pollution risk
		return true;
	}
}

function eventToolName(ev) {
	return String(ev.tool || ev.name || ev.action || "").toLowerCase();
}

function hasStoryConfirmation(events) {
	return events.some((ev) => {
		const t = String(ev.type || "").toLowerCase();
		if (t === "user_confirmation" || t === "confirmation") {
			const stage = String(ev.stage || ev.from || "").toLowerCase();
			const next = String(ev.next || ev.to || "").toLowerCase();
			return (
				stage.includes("story") ||
				next.includes("image-animatic") ||
				next.includes("animatic") ||
				Boolean(ev.story_flow_confirmed)
			);
		}
		if (
			t === "stage_advance" &&
			String(ev.to || "").includes("image-animatic")
		) {
			return Boolean(ev.user_confirmed);
		}
		return false;
	});
}

function hasStageStop(events, stageNeedle) {
	return events.some((ev) => {
		const t = String(ev.type || "").toLowerCase();
		if (t !== "stage_stop" && t !== "stop") return false;
		return String(ev.stage || "")
			.toLowerCase()
			.includes(stageNeedle);
	});
}

export function gradeImageAnimaticWorkspace(workspace, caze, options = {}) {
	const findings = [];
	const gateFailures = new Set();
	const gates = {
		surface: null,
		composition_user_surface: null,
		prior_story_confirm: null,
		full_playback: null,
		inherits_storyboard: null,
		low_cost_media: null,
		motion_structure: null,
		no_formal_tts: null,
		no_formal_captions: null,
		no_final_export: null,
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
		compositionAlt: path.join(workspace, "video/index.html"),
		framesDir: path.join(workspace, "video/compositions/frames"),
		artifacts: path.join(workspace, "eval-artifacts"),
		preview: path.join(workspace, "eval-artifacts/preview-manifest.json"),
		compositionManifest: path.join(
			workspace,
			"eval-artifacts/composition-manifest.json",
		),
		trace: path.join(workspace, "eval-artifacts/tool-trace.json"),
		routeTxt: path.join(workspace, "eval-artifacts/composition-route.txt"),
	};

	const preview = exists(ep.preview)
		? normalizePreviewManifest(readJson(ep.preview))
		: null;
	const composition = exists(ep.compositionManifest)
		? normalizeCompositionManifest(readJson(ep.compositionManifest))
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

	// --- required_artifacts ---
	if (wants("required_artifacts")) {
		let ok = true;
		const required = caze.required_artifacts || [
			"EPISODE.md",
			"STORYBOARD.md",
			"composition route",
			"composition playback",
		];
		for (const item of required) {
			const s = String(item).toLowerCase();
			if (s.includes("episode") && !exists(ep.EPISODE)) {
				ok = false;
				push("P0", "required_artifacts", "missing EPISODE.md");
			}
			if (s.includes("storyboard") && !exists(ep.STORYBOARD)) {
				ok = false;
				push("P0", "required_artifacts", "missing STORYBOARD.md");
			}
			if (
				(s.includes("composition route") || s.includes("studio route")) &&
				!exists(ep.routeTxt) &&
				!(preview && preview.composition_route)
			) {
				ok = false;
				push("P0", "required_artifacts", "missing composition route artifact");
			}
			if (
				s.includes("playback") &&
				preview &&
				!preview.full_composition_playback
			) {
				ok = false;
				push(
					"P0",
					"required_artifacts",
					"required full composition playback not claimed",
				);
			}
		}
		if (!exists(ep.preview) || !exists(ep.trace)) {
			ok = false;
			push(
				"P0",
				"required_artifacts",
				"missing eval-artifacts preview-manifest or tool-trace",
			);
		}
		gates.required_artifacts = ok;
	}

	// --- surface ---
	if (wants("surface")) {
		let ok = true;
		if (!preview) {
			ok = false;
			push("P0", "surface", "missing preview-manifest.json");
		} else {
			if (preview.custom_storyboard_page) {
				ok = false;
				push("P0", "surface", "custom storyboard page used for Image Animatic");
			}
			if (
				STORYBOARD_SURFACES.has(String(preview.surface || "").toLowerCase())
			) {
				ok = false;
				push(
					"P0",
					"surface",
					"Image Animatic used Storyboard surface instead of Composition",
				);
			}
			if (
				preview.surface &&
				!COMPOSITION_SURFACES.has(String(preview.surface).toLowerCase())
			) {
				ok = false;
				push(
					"P0",
					"surface",
					`incorrect composition surface: ${preview.surface}`,
				);
			}
			if (!preview.composition_route) {
				ok = false;
				push("P0", "surface", "missing composition_route");
			}
		}
		// composition file optional if route claimed; still preferred
		if (
			!exists(ep.composition) &&
			!exists(ep.compositionAlt) &&
			!exists(path.join(workspace, "video/compositions/main.html"))
		) {
			// only warn if no route either
			if (!preview?.composition_route) {
				ok = false;
				push("P0", "surface", "no composition html and no composition route");
			}
		}
		gates.surface = ok;
	}

	// --- composition_user_surface ---
	if (wants("composition_user_surface")) {
		const verification = verifyCompositionUserSurface(preview, events);
		if (!verification.ok) {
			for (const message of verification.failures) {
				push("P0", "composition_user_surface", message);
			}
		}
		gates.composition_user_surface = verification.ok;
	}

	// --- prior_story_confirm ---
	if (wants("prior_story_confirm")) {
		let ok = true;
		if (!events.length) {
			ok = false;
			push("P0", "prior_story_confirm", "missing tool-trace events");
		} else if (!hasStoryConfirmation(events)) {
			ok = false;
			push(
				"P0",
				"prior_story_confirm",
				"no user confirmation of Story Flow before Image Animatic",
			);
		}
		// if work before confirmation
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
					name.includes("composition") ||
					name.includes("animatic") ||
					name === "full_composition_playback"
				);
			});
			if (early) {
				ok = false;
				push(
					"P0",
					"prior_story_confirm",
					"composition/animatic work before story-flow confirmation",
				);
			}
		}
		gates.prior_story_confirm = ok;
	}

	// --- full_playback ---
	if (wants("full_playback")) {
		let ok = true;
		if (!preview?.full_composition_playback) {
			ok = false;
			push(
				"P0",
				"full_playback",
				"Image Animatic missing full composition playback claim",
			);
		}
		const played = events.some(
			(ev) =>
				eventToolName(ev).includes("full_composition_playback") ||
				Boolean(ev.full_composition_playback) ||
				String(ev.type || "").toLowerCase() === "composition_playback",
		);
		if (events.length && !played && !preview?.full_composition_playback) {
			ok = false;
			push(
				"P0",
				"full_playback",
				"no composition playback event in tool-trace",
			);
		}
		gates.full_playback = ok;
	}

	// --- inherits_storyboard ---
	if (wants("inherits_storyboard")) {
		let ok = true;
		if (!exists(ep.STORYBOARD)) {
			ok = false;
			push("P0", "inherits_storyboard", "missing confirmed STORYBOARD.md");
		}
		if (composition?.inherits_confirmed_storyboard_frames === false) {
			ok = false;
			push(
				"P0",
				"inherits_storyboard",
				"composition does not inherit confirmed storyboard frames",
			);
		}
		if (
			composition &&
			composition.inherits_confirmed_storyboard_frames == null
		) {
			push(
				"P1",
				"inherits_storyboard",
				"composition-manifest missing inherits_confirmed_storyboard_frames claim",
			);
		}
		gates.inherits_storyboard = ok;
	}

	// --- low_cost_media ---
	if (wants("low_cost_media")) {
		let ok = true;
		if (composition?.low_cost_media === false) {
			ok = false;
			push(
				"P0",
				"low_cost_media",
				"Image Animatic claims non-low-cost / final media path",
			);
		}
		if (composition?.final_polish) {
			ok = false;
			push(
				"P0",
				"low_cost_media",
				"final polish claimed during Image Animatic",
			);
		}
		if (preview?.batch_final_images) {
			ok = false;
			push("P0", "low_cost_media", "batch final images during Image Animatic");
		}
		const tools = events.map(eventToolName);
		if (
			tools.some(
				(t) =>
					t.includes("generate-images") ||
					t.includes("batch-final") ||
					t.includes("final-image"),
			)
		) {
			ok = false;
			push(
				"P0",
				"low_cost_media",
				"forbidden final/batch image generation tools in Image Animatic",
			);
		}
		if (
			composition &&
			composition.estimated_duration_or_temp_audio === false &&
			!preview?.temporary_audio_or_estimated_duration
		) {
			ok = false;
			push(
				"P0",
				"low_cost_media",
				"missing estimated duration or temporary audio for Image Animatic",
			);
		}
		gates.low_cost_media = ok;
	}

	// --- motion_structure ---
	if (wants("motion_structure")) {
		let ok = true;
		if (composition?.default_camera_on_all) {
			ok = false;
			push(
				"P0",
				"motion_structure",
				"default camera motion applied to all images",
			);
		}
		if (composition?.slideshow_risk) {
			ok = false;
			push(
				"P0",
				"motion_structure",
				"composition marked as slideshow risk (no readable temporal directing)",
			);
		}
		if (composition?.beats?.length) {
			const anyStructure = composition.beats.some(
				(b) => b.entry || b.development || b.emphasis || b.handoff,
			);
			if (!anyStructure) {
				ok = false;
				push(
					"P0",
					"motion_structure",
					"no Entry/Development/Emphasis/Handoff structure on beats",
				);
			}
			const invisible = composition.beats.filter((b) => !b.visible_media);
			if (invisible.length) {
				ok = false;
				push(
					"P0",
					"motion_structure",
					`beats without visible media: ${invisible.map((b) => b.id).join(", ")}`,
				);
			}
		} else if (wants("motion_structure") && !composition) {
			ok = false;
			push("P0", "motion_structure", "missing composition-manifest.json");
		}
		gates.motion_structure = ok;
	}

	// --- no_formal_tts ---
	if (wants("no_formal_tts")) {
		let ok = true;
		if (preview?.formal_tts) {
			ok = false;
			push(
				"P0",
				"no_formal_tts",
				"formal_tts claimed true in preview-manifest",
			);
		}
		const tts = events.some((ev) => {
			const name = eventToolName(ev);
			return (
				name.includes("generate-tts") ||
				name === "tts" ||
				(name.includes("tts") && !String(ev.temporary || "").length)
			);
		});
		if (tts) {
			ok = false;
			push("P0", "no_formal_tts", "formal TTS tool used during Image Animatic");
		}
		gates.no_formal_tts = ok;
	}

	// --- no_formal_captions ---
	if (wants("no_formal_captions")) {
		let ok = true;
		if (preview?.formal_captions) {
			ok = false;
			push(
				"P0",
				"no_formal_captions",
				"formal_captions claimed true in preview-manifest",
			);
		}
		if (captionsIsFormal(ep.captions)) {
			ok = false;
			push(
				"P0",
				"no_formal_captions",
				"formal captions.json timeline present during Image Animatic",
			);
		}
		gates.no_formal_captions = ok;
	}

	// --- no_final_export ---
	if (wants("no_final_export")) {
		let ok = true;
		if (preview?.export_attempted) {
			ok = false;
			push("P0", "no_final_export", "export_attempted during Image Animatic");
		}
		const bad = events.some((ev) => {
			const name = eventToolName(ev);
			return (
				name.includes("export") ||
				name.includes("final-render") ||
				name.includes("render-final") ||
				name === "render"
			);
		});
		if (bad) {
			ok = false;
			push(
				"P0",
				"no_final_export",
				"final export/render tools used during Image Animatic",
			);
		}
		gates.no_final_export = ok;
	}

	// --- stage_boundary ---
	if (wants("stage_boundary")) {
		let ok = true;
		if (
			!hasStageStop(events, "image-animatic") &&
			!hasStageStop(events, "animatic")
		) {
			// accept stage: image-animatic specifically preferred
			ok = false;
			push(
				"P0",
				"stage_boundary",
				"no stage_stop after Image Animatic handoff",
			);
		}
		// advancing into timed/final without confirmation
		const timedEarly = events.some((ev) => {
			const name = eventToolName(ev);
			const t = String(ev.type || "").toLowerCase();
			return (
				name.includes("generate-tts") ||
				name.includes("transcribe") ||
				(t === "stage_advance" &&
					String(ev.to || "").includes("timed") &&
					!ev.user_confirmed)
			);
		});
		if (timedEarly) {
			ok = false;
			push(
				"P0",
				"stage_boundary",
				"Timed Animatic work or advance without stop/confirmation",
			);
		}
		gates.stage_boundary = ok;
	}

	const p0 = findings.filter((f) => f.level === "P0");
	const expected = caze.expected_result || "pass";
	let verdict;
	if (p0.length === 0) {
		verdict = expected === "fail" ? "unexpected_pass" : "pass";
	} else {
		verdict = expected === "fail" ? "fail_as_expected" : "unexpected_fail";
	}
	const matched =
		(expected === "pass" && verdict === "pass") ||
		(expected === "fail" && verdict === "fail_as_expected");

	return {
		grader: "image-animatic-gates",
		case: options.casePath || null,
		workspace,
		case_id: caze.id || null,
		expected_result: expected,
		verdict,
		matched,
		p0_count: p0.length,
		gate_failures: [...gateFailures],
		gates,
		findings,
	};
}

function main() {
	const args = parseArgs(process.argv);
	if (!args.case || !args.workspace) {
		console.error(
			"Usage: node image-animatic-gates.mjs --case <yaml> --workspace <dir>",
		);
		process.exit(2);
	}
	const casePath = path.isAbsolute(args.case)
		? args.case
		: path.join(process.cwd(), args.case);
	const workspace = path.isAbsolute(args.workspace)
		? args.workspace
		: path.join(process.cwd(), args.workspace);
	if (!exists(casePath) || !exists(workspace)) {
		console.error("case or workspace not found");
		process.exit(2);
	}
	const caze = loadCaseFile(casePath, fs.readFileSync);
	const result = gradeImageAnimaticWorkspace(workspace, caze, {
		casePath: path.relative(process.cwd(), casePath),
		evalsRoot: EVALS_ROOT,
	});
	console.log(JSON.stringify(result, null, 2));
	process.exit(result.matched ? 0 : 1);
}

const isDirectRun =
	process.argv[1] &&
	path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
	main();
}
