# FrameSpine Eval Report — Final Composition v1 (Offline Synthetic)

Generated: 2026-07-31

```text
Commit: (pending) Final eval slice
Runner: local agent
Mode: offline synthetic deterministic gates
Suite: final-v1
```

## Executive summary

| Check | Result |
| --- | --- |
| Case validation | PASS (34 total cases incl. 7 final) |
| Synthetic trial build | PASS |
| Deterministic gate matrix | **7/7 matched (100%)** |
| Positive cases | 1/1 pass |
| Negative baselines | 6/6 fail_as_expected |

**Overall offline Final suite: PASS**

> Validates **Final stage boundary and audit gates**.  
> Does **not** replace live Final Preview or Studio medium/continuity human review.

## P0 failures

```text
none in offline synthetic matrix
```

## Gate matrix

| case | expected | verdict | matched | gate failures |
| --- | --- | --- | --- | --- |
| `final-locked-001` | pass | pass | yes | — |
| `final-before-confirm-fail` | fail | fail_as_expected | yes | prior_timed_animatic_confirm |
| `final-batch-before-cost-fail` | fail | fail_as_expected | yes | cost_boundary_before_batch |
| `final-no-prompt-audit-fail` | fail | fail_as_expected | yes | prompt_audit |
| `final-no-image-set-audit-fail` | fail | fail_as_expected | yes | image_set_audit |
| `final-render-before-preview-fail` | fail | fail_as_expected | yes | final_preview, no_render_before_auth |
| `final-export-without-auth-fail` | fail | fail_as_expected | yes | no_render_before_auth, stage_boundary |

## Gates covered

```text
surface
prior_timed_animatic_confirm
cost_boundary_before_batch
prompt_audit
image_set_audit
high_risk_asset_test
medium_motion_inheritance
final_preview
no_render_before_auth
no_placeholder_marks
no_series_design_edit
stage_boundary
required_artifacts
```

## Stage results

```text
Story Flow:        eval:storyboard
Image Animatic:    eval:animatic
Timed Animatic:    eval:timed
Final:             offline gates PASS 7/7
```

## Human review

```text
medium_coherence / continuity / readability / publish_readiness: NOT RUN
Use: evals/graders/human/final-review-sheet.md
```

## Root authority to update

```text
no Skill change required from this offline gate scaffolding
gate logic and cases are healthy
```

## Commands

```bash
npm run eval:final

node evals/graders/deterministic/final-gates.mjs \
  --case evals/cases/final/final-locked-001.yaml \
  --workspace evals/runs/synthetic-final/final-locked-001/workspace
```

## Artifacts

```text
evals/runs/synthetic-final/matrix.md
evals/runs/synthetic-final/matrix.json
evals/reports/final-synthetic-latest.md
```

## What this slice still does not cover

| Covered | Not covered |
| --- | --- |
| Timed confirm prerequisite | Live Final production |
| Cost before batch finals | Real Prompt/Image Set Audit quality |
| Prompt + Image Set Audit presence | Studio medium/continuity scores |
| Final Preview + no early export | Material-deviation candidate previews |
| No series DESIGN edit claim | Multi-trial stability |
| Stage stop for render auth | E3 full harness / E4 e2e |

## Next

1. E3 multi-trial harness conventions (external; not in Skill).
2. Live Final trial only after Timed live path exists.
3. Shared gate/builder refactor to reduce parallel scaffolding.
