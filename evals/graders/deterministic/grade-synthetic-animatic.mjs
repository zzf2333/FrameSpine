#!/usr/bin/env node
/**
 * Grade all synthetic Image Animatic trials and emit a matrix report.
 */

import path from "node:path";
import { EVALS_ROOT } from "../lib/paths.mjs";
import { gradeSyntheticSuite } from "../lib/grade-synthetic-suite.mjs";
import { gradeImageAnimaticWorkspace } from "./image-animatic-gates.mjs";

gradeSyntheticSuite({
	synRoot: path.join(EVALS_ROOT, "runs/synthetic-animatic"),
	buildHint: "node evals/graders/deterministic/build-synthetic-animatic.mjs",
	graderName: "grade-synthetic-animatic",
	gradeFn: gradeImageAnimaticWorkspace,
	title: "Image Animatic Synthetic Gate Matrix",
	latestReportName: "image-animatic-synthetic-latest.md",
	notes: [
		"Synthetic trials validate **Image Animatic gate logic**, not Studio timing quality.",
		"Real trials still need HyperFrames Composition playback + human dwell/handoff review.",
		"`fail_as_expected` is success for negative baselines.",
	],
});
