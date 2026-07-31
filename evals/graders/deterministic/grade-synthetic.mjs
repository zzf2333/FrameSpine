#!/usr/bin/env node
/**
 * Grade all synthetic storyboard trials and emit a matrix report.
 */

import path from "node:path";
import { EVALS_ROOT } from "../lib/paths.mjs";
import { gradeSyntheticSuite } from "../lib/grade-synthetic-suite.mjs";
import { gradeStoryboardWorkspace } from "./storyboard-gates.mjs";

gradeSyntheticSuite({
	synRoot: path.join(EVALS_ROOT, "runs/synthetic"),
	buildHint: "node evals/graders/deterministic/build-synthetic-trials.mjs",
	graderName: "grade-synthetic",
	gradeFn: gradeStoryboardWorkspace,
	title: "Storyboard Synthetic Gate Matrix",
	latestReportName: "storyboard-synthetic-latest.md",
	notes: [
		"Synthetic trials validate **gate logic**, not agent creativity.",
		"Real agent trials still need Studio previews + human Visual-Only review.",
		"`fail_as_expected` is success for negative baselines.",
	],
});
