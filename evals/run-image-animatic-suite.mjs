#!/usr/bin/env node
/**
 * Image Animatic suite entry — thin wrapper over shared suite-runner.
 */

import { runStageSuite } from "./graders/lib/suite-runner.mjs";

runStageSuite({
	suite: "image-animatic-v1",
	summaryPrefix: "image-animatic-suite",
	matrixLabel: "Image Animatic gate matrix",
	casesDir: "evals/cases/animatic",
	caseCountKey: "image_animatic_case_count",
	matrixPath: "evals/runs/synthetic-animatic/matrix.json",
	humanRubric: "evals/rubrics/image-animatic.md",
	stepResultKeys: [
		"cases_validated",
		"synthetic_built",
		"synthetic_graded",
	],
	steps: [
		{
			label: "Validate cases",
			script: "evals/graders/deterministic/validate-cases.mjs",
		},
		{
			label: "Build synthetic Image Animatic trials",
			script: "evals/graders/deterministic/build-synthetic-animatic.mjs",
		},
		{
			label: "Grade synthetic Image Animatic trials",
			script: "evals/graders/deterministic/grade-synthetic-animatic.mjs",
		},
	],
	next: [
		"Live agent Image Animatic trial after Story Flow confirmation",
		"Human review of dwell / handoff / not-slideshow using human sheet",
		"Use eval:harness:* for multi-trial aggregation",
	],
});
