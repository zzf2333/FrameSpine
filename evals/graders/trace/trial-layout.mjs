/**
 * E3 trial layout helpers — offline only.
 */

import fs from "node:fs";
import path from "node:path";

export const STAGE_ARTIFACTS = {
	"story-flow": {
		required: [
			"eval-artifacts/preview-manifest.json",
			"eval-artifacts/board-manifest.json",
			"eval-artifacts/tool-trace.json",
			"eval-artifacts/storyboard-route.txt",
		],
		workspaceFiles: ["EPISODE.md", "SCRIPT.md"],
	},
	"image-animatic": {
		required: [
			"eval-artifacts/preview-manifest.json",
			"eval-artifacts/composition-manifest.json",
			"eval-artifacts/tool-trace.json",
			"eval-artifacts/composition-route.txt",
		],
		workspaceFiles: ["EPISODE.md", "SCRIPT.md"],
	},
	"timed-animatic": {
		required: [
			"eval-artifacts/preview-manifest.json",
			"eval-artifacts/timed-manifest.json",
			"eval-artifacts/tool-trace.json",
			"eval-artifacts/composition-route.txt",
		],
		workspaceFiles: ["EPISODE.md", "SCRIPT.md", "captions.json"],
	},
	final: {
		required: [
			"eval-artifacts/preview-manifest.json",
			"eval-artifacts/final-manifest.json",
			"eval-artifacts/tool-trace.json",
			"eval-artifacts/composition-route.txt",
		],
		workspaceFiles: ["EPISODE.md", "SCRIPT.md", "video/composition.html"],
	},
};

export function normalizeStage(stage) {
	const s = String(stage || "")
		.toLowerCase()
		.replace(/_/g, "-");
	if (s.includes("story")) return "story-flow";
	if (s.includes("image") || s === "animatic") return "image-animatic";
	if (s.includes("timed")) return "timed-animatic";
	if (s.includes("final")) return "final";
	return s || "story-flow";
}

export function stageGateModule(stage) {
	const s = normalizeStage(stage);
	if (s === "story-flow") {
		return {
			path: "evals/graders/deterministic/storyboard-gates.mjs",
			exportName: "gradeStoryboardWorkspace",
			needsSourceScript: true,
		};
	}
	if (s === "image-animatic") {
		return {
			path: "evals/graders/deterministic/image-animatic-gates.mjs",
			exportName: "gradeImageAnimaticWorkspace",
			needsSourceScript: false,
		};
	}
	if (s === "timed-animatic") {
		return {
			path: "evals/graders/deterministic/timed-animatic-gates.mjs",
			exportName: "gradeTimedAnimaticWorkspace",
			needsSourceScript: true,
		};
	}
	if (s === "final") {
		return {
			path: "evals/graders/deterministic/final-gates.mjs",
			exportName: "gradeFinalWorkspace",
			needsSourceScript: false,
		};
	}
	return null;
}

export function validateTrialLayout(trialDir, targetStage) {
	const issues = [];
	const stage = normalizeStage(targetStage);
	const spec = STAGE_ARTIFACTS[stage];
	if (!spec) {
		issues.push({
			level: "P0",
			code: "layout.unknown_stage",
			message: `unknown target_stage: ${targetStage}`,
		});
		return { ok: false, stage, issues };
	}

	const workspace = path.join(trialDir, "workspace");
	if (!fs.existsSync(workspace)) {
		issues.push({
			level: "P0",
			code: "layout.missing_workspace",
			message: "missing workspace/",
		});
		return { ok: false, stage, issues };
	}

	for (const rel of spec.workspaceFiles) {
		const p = path.join(workspace, rel);
		if (!fs.existsSync(p)) {
			issues.push({
				level: "P0",
				code: "layout.missing_file",
				message: `missing workspace/${rel}`,
			});
		}
	}

	for (const rel of spec.required) {
		const p = path.join(workspace, rel);
		if (!fs.existsSync(p)) {
			issues.push({
				level: "P0",
				code: "layout.missing_artifact",
				message: `missing workspace/${rel}`,
			});
		}
	}

	// tool-trace must parse and have events when present
	const tracePath = path.join(workspace, "eval-artifacts/tool-trace.json");
	if (fs.existsSync(tracePath)) {
		try {
			const raw = JSON.parse(fs.readFileSync(tracePath, "utf8"));
			const events = Array.isArray(raw) ? raw : raw.events || [];
			if (!events.length) {
				issues.push({
					level: "P0",
					code: "layout.empty_trace",
					message: "tool-trace.json has no events",
				});
			}
		} catch (err) {
			issues.push({
				level: "P0",
				code: "layout.invalid_trace",
				message: `tool-trace.json invalid: ${err.message}`,
			});
		}
	}

	const ok = issues.filter((i) => i.level === "P0").length === 0;
	return { ok, stage, issues };
}

export function listTrialDirs(caseRunDir) {
	if (!fs.existsSync(caseRunDir)) return [];
	return fs
		.readdirSync(caseRunDir, { withFileTypes: true })
		.filter((d) => d.isDirectory() && /^trial-\d+$/i.test(d.name))
		.map((d) => path.join(caseRunDir, d.name))
		.sort((a, b) => {
			const na = Number(path.basename(a).split("-")[1]);
			const nb = Number(path.basename(b).split("-")[1]);
			return na - nb;
		});
}

export function readJsonSafe(file) {
	if (!fs.existsSync(file)) return null;
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return null;
	}
}

export function writeJson(file, data) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
