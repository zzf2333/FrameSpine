# FrameSpine Eval Report — E3 Multi-Trial Harness v1

Generated: 2026-07-31

```text
Commit: (pending) E3 harness
Mode: offline harness contract + CLI smoke
```

## Executive summary

| Check | Result |
| --- | --- |
| Contract docs | `evals/graders/trace/HARNESS.md` |
| CLI: init / validate / grade / aggregate | runnable |
| Live retrofit: `storyboard-locked-001` trial-1 | grade pass, aggregate stability=insufficient (N=1) |
| Seed empty trials: `final-locked-001` ×2 | layout fail_as_expected; stability=stable (both fail same way) |
| Skill contamination | none (evals-only) |

**Overall: E3 harness conventions + CLI PASS (no auto Agent loop by design)**

## What shipped

```text
evals/graders/trace/HARNESS.md
evals/graders/trace/trial-layout.mjs
evals/graders/trace/init-trials.mjs
evals/graders/trace/validate-trial.mjs
evals/graders/trace/grade-trials.mjs
evals/graders/trace/aggregate-trials.mjs
evals/graders/trace/README.md (updated)
npm scripts: eval:harness:init|validate|grade|aggregate
```

## Workflow (external Agent)

```text
1. npm run eval:harness:init -- --case <yaml> [--trials N]
2. External Agent fills trial-N/workspace + eval-artifacts
3. npm run eval:harness:validate -- --trial-dir ...
4. npm run eval:harness:grade -- --case-id <id>
5. npm run eval:harness:aggregate -- --case-id <id>
```

## Smoke results

### storyboard-locked-001 (existing live trial-1)

| metric | value |
| --- | --- |
| validate | ok |
| grade | pass, p0=0, matched=true |
| trials_graded | 1 |
| cross_trial_stability | insufficient |

### final-locked-001 (seed only, no production)

| metric | value |
| --- | --- |
| init | 2 trials |
| grade | fail ×2 (layout missing artifacts) |
| matched_rate | 0 |
| cross_trial_stability | stable (consistent fail) |

## Aggregate shape (no single score)

```text
trials_total / trials_graded
p0_free_rate
matched_rate
all_pass / any_fail
fail_as_expected_count / unexpected_pass_count
high_frequency_gate_failures
cross_trial_stability: insufficient | stable | unstable
rows[] per trial
```

## Explicit non-goals (v1)

| Not built | Why |
| --- | --- |
| Auto LLM Agent loop | External runner owns Skill execution |
| Full conversation parser | Stage gates already read tool-trace events |
| Vision batch | Soft quality remains human |
| Cherry-pick best trial | Aggregate reports all trials |

## Root authority

```text
no Skill change required
harness lives only under evals/
```

## Next

1. External multi-trial live: trial-2/3 for `storyboard-locked-001` → stability metric.
2. Optional: shared synthetic builder dedupe (separate ROI).
3. E4 later; do not pad more negative baselines without real failures.
