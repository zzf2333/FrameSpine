#!/usr/bin/env node
/**
 * Grade all synthetic Final Composition trials and emit a matrix report.
 */

import path from "node:path";
import { EVALS_ROOT } from "../lib/paths.mjs";
import { gradeSyntheticSuite } from "../lib/grade-synthetic-suite.mjs";
import { gradeFinalWorkspace } from "./final-gates.mjs";

gradeSyntheticSuite({
	synRoot: path.join(EVALS_ROOT, "runs/synthetic-final"),
	buildHint: "node evals/graders/deterministic/build-synthetic-final.mjs",
	graderName: "grade-synthetic-final",
	gradeFn: gradeFinalWorkspace,
	title: "Final Composition Synthetic Gate Matrix",
	latestReportName: "final-synthetic-latest.md",
	notes: [
		"Synthetic trials validate **Final gate logic**, not Studio visual quality.",
		"Real trials still need Final Preview + human medium/continuity review.",
		"`fail_as_expected` is success for negative baselines.",
	],
});
