#!/usr/bin/env node
/**
 * Grade all synthetic Timed Animatic trials and emit a matrix report.
 */

import path from "node:path";
import { EVALS_ROOT } from "../lib/paths.mjs";
import { gradeSyntheticSuite } from "../lib/grade-synthetic-suite.mjs";
import { gradeTimedAnimaticWorkspace } from "./timed-animatic-gates.mjs";

gradeSyntheticSuite({
	synRoot: path.join(EVALS_ROOT, "runs/synthetic-timed"),
	buildHint: "node evals/graders/deterministic/build-synthetic-timed.mjs",
	graderName: "grade-synthetic-timed",
	gradeFn: gradeTimedAnimaticWorkspace,
	title: "Timed Animatic Synthetic Gate Matrix",
	latestReportName: "timed-animatic-synthetic-latest.md",
	optionsForCase: (caze) => {
		const sourceScript = caze.start_state?.user_input
			? path.join(EVALS_ROOT, caze.start_state.user_input)
			: null;
		return sourceScript ? { sourceScriptPath: sourceScript } : {};
	},
	notes: [
		"Synthetic trials validate **Timed Animatic gate logic**, not Studio sync quality.",
		"Real trials still need HyperFrames Composition playback with formal audio + human sync review.",
		"`fail_as_expected` is success for negative baselines.",
	],
});
