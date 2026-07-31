#!/usr/bin/env node
/**
 * Timed Animatic suite entry — thin wrapper over shared suite-runner.
 */

import { runStageSuite } from "./graders/lib/suite-runner.mjs";

runStageSuite({
	suite: "timed-animatic-v1",
	summaryPrefix: "timed-animatic-suite",
	matrixLabel: "Timed Animatic gate matrix",
	casesDir: "evals/cases/timed",
	caseCountKey: "timed_animatic_case_count",
	matrixPath: "evals/runs/synthetic-timed/matrix.json",
	humanRubric: "evals/rubrics/timed-animatic.md",
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
			label: "Build synthetic Timed Animatic trials",
			script: "evals/graders/deterministic/build-synthetic-timed.mjs",
		},
		{
			label: "Grade synthetic Timed Animatic trials",
			script: "evals/graders/deterministic/grade-synthetic-timed.mjs",
		},
	],
	next: [
		"Live agent Timed Animatic trial after Image Animatic confirmation",
		"Human review of source fidelity / sync / dwell rebalance",
		"Use eval:harness:* for multi-trial aggregation",
	],
});
