#!/usr/bin/env node
/**
 * v1 Storyboard suite entry — thin wrapper over shared suite-runner.
 */

import { runStageSuite } from "./graders/lib/suite-runner.mjs";

runStageSuite({
	suite: "storyboard-v1",
	summaryPrefix: "storyboard-suite",
	matrixLabel: "Synthetic gate matrix",
	casesDir: "evals/cases/storyboard",
	caseCountKey: "storyboard_case_count",
	matrixPath: "evals/runs/synthetic/matrix.json",
	humanRubric: "evals/rubrics/storyboard.md",
	stepResultKeys: [
		"e0_passed",
		"cases_validated",
		"synthetic_built",
		"synthetic_graded",
	],
	steps: [
		{
			label: "E0 static contracts",
			script: "evals/graders/deterministic/e0-static-contracts.mjs",
		},
		{
			label: "Validate cases",
			script: "evals/graders/deterministic/validate-cases.mjs",
		},
		{
			label: "Build synthetic trials",
			script: "evals/graders/deterministic/build-synthetic-trials.mjs",
		},
		{
			label: "Grade synthetic trials",
			script: "evals/graders/deterministic/grade-synthetic.mjs",
		},
	],
	next: [
		"Human Visual-Only review using evals/graders/human/storyboard-review-sheet.md",
		"Live agent trials into evals/runs/<case-id>/<trial>/ with preview-manifest + board-manifest + tool-trace",
		"Use eval:harness:* for multi-trial aggregation",
	],
});
