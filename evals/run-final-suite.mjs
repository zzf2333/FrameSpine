#!/usr/bin/env node
/**
 * Final Composition suite entry — thin wrapper over shared suite-runner.
 */

import { runStageSuite } from "./graders/lib/suite-runner.mjs";

runStageSuite({
	suite: "final-v1",
	summaryPrefix: "final-suite",
	matrixLabel: "Final gate matrix",
	casesDir: "evals/cases/final",
	caseCountKey: "final_case_count",
	matrixPath: "evals/runs/synthetic-final/matrix.json",
	humanRubric: "evals/rubrics/final.md",
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
			label: "Build synthetic Final trials",
			script: "evals/graders/deterministic/build-synthetic-final.mjs",
		},
		{
			label: "Grade synthetic Final trials",
			script: "evals/graders/deterministic/grade-synthetic-final.mjs",
		},
	],
	next: [
		"Live agent Final trial after Timed Animatic confirmation",
		"Human Final Preview review (medium / continuity / publish readiness)",
		"Use eval:harness:* for multi-trial aggregation",
	],
});
