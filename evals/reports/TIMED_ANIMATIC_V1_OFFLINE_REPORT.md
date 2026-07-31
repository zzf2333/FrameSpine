# FrameSpine Eval Report — Timed Animatic v1 (Offline Synthetic)

Generated: 2026-07-31

```text
Commit: (pending) Timed Animatic eval slice
Runner: local agent
Mode: offline synthetic deterministic gates
Suite: timed-animatic-v1
```

## Executive summary

| Check | Result |
| --- | --- |
| Case validation | PASS (27 total cases incl. 7 timed) |
| Synthetic trial build | PASS |
| Deterministic gate matrix | **7/7 matched (100%)** |
| Positive cases | 1/1 pass |
| Negative baselines | 6/6 fail_as_expected |

**Overall offline Timed Animatic suite: PASS**

> Validates **Timed Animatic gate logic and cost/stage boundaries**.  
> Does **not** replace live formal TTS production or Studio sync human review.

## P0 failures

```text
none in offline synthetic matrix
```

## Gate matrix

| case | expected | verdict | matched | gate failures |
| --- | --- | --- | --- | --- |
| `timed-animatic-locked-001` | pass | pass | yes | — |
| `timed-animatic-before-confirm-fail` | fail | fail_as_expected | yes | prior_image_animatic_confirm |
| `timed-animatic-tts-before-cost-fail` | fail | fail_as_expected | yes | cost_boundary_before_tts |
| `timed-animatic-empty-captions-fail` | fail | fail_as_expected | yes | formal_captions |
| `timed-animatic-script-rewrite-fail` | fail | fail_as_expected | yes | script_preservation |
| `timed-animatic-temp-subtitle-fail` | fail | fail_as_expected | yes | captions_sole_timeline |
| `timed-animatic-final-early-fail` | fail | fail_as_expected | yes | no_final_export, stage_boundary |

## Gates covered

```text
surface
prior_image_animatic_confirm
cost_boundary_before_tts
formal_tts
formal_captions
captions_sole_timeline
script_preservation
dwell_rebalance
full_playback
no_final_export
stage_boundary
required_artifacts
```

## Stage results

```text
Story Flow:        eval:storyboard
Image Animatic:    eval:animatic
Timed Animatic:    offline gates PASS 7/7
Final:             not automated
```

## Human review

```text
source_fidelity / sync_clarity / dwell_rebalance: NOT RUN
Use: evals/graders/human/timed-animatic-review-sheet.md
```

## Root authority to update

```text
no Skill change required from this offline gate scaffolding
gate logic and cases are healthy
```

## Commands

```bash
npm run eval:timed

node evals/graders/deterministic/timed-animatic-gates.mjs \
  --case evals/cases/timed/timed-animatic-locked-001.yaml \
  --workspace evals/runs/synthetic-timed/timed-animatic-locked-001/workspace \
  --source-script evals/fixtures/inputs/locked-script-a.md
```

## Artifacts

```text
evals/runs/synthetic-timed/matrix.md
evals/runs/synthetic-timed/matrix.json
evals/reports/timed-animatic-synthetic-latest.md
```

## What this slice still does not cover

| Covered | Not covered |
| --- | --- |
| Image Animatic confirmation prerequisite | Live formal TTS generation |
| Cost boundary before TTS | Real word-level timing quality |
| Formal captions required | Studio sync human scores |
| Captions sole timeline | Multi-provider TTS fidelity |
| Locked script preservation | Final export authorization |
| No final/export early | Series calibration |

## Next

1. Live Timed Animatic trial after Image Animatic confirmation.
2. Human Composition review sheet for sync / source fidelity.
3. Final Composition deterministic slice.
