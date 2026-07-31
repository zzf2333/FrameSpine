# FrameSpine Eval Report — Image Animatic v1 (Offline Synthetic)

Generated: 2026-07-31

```text
Commit: (pending) Image Animatic eval slice
Runner: local agent
Mode: offline synthetic deterministic gates
Suite: image-animatic-v1
```

## Executive summary

| Check | Result |
| --- | --- |
| Case validation | PASS (20 total cases incl. 7 animatic) |
| Synthetic trial build | PASS |
| Deterministic gate matrix | **7/7 matched (100%)** |
| Positive cases | 1/1 pass |
| Negative baselines | 6/6 fail_as_expected |

**Overall offline Image Animatic suite: PASS**

> Validates **Image Animatic gate logic and stage boundaries**.  
> Does **not** replace live Composition Studio review of dwell / handoff / not-slideshow quality.

## P0 failures

```text
none in offline synthetic matrix
```

## Gate matrix

| case | expected | verdict | matched | gate failures |
| --- | --- | --- | --- | --- |
| `image-animatic-locked-001` | pass | pass | yes | — |
| `image-animatic-before-confirm-fail` | fail | fail_as_expected | yes | prior_story_confirm |
| `image-animatic-no-playback-fail` | fail | fail_as_expected | yes | surface, full_playback, motion_structure, required_artifacts |
| `image-animatic-formal-tts-fail` | fail | fail_as_expected | yes | no_formal_tts, low_cost_media, stage_boundary |
| `image-animatic-formal-captions-fail` | fail | fail_as_expected | yes | no_formal_captions |
| `image-animatic-final-early-fail` | fail | fail_as_expected | yes | low_cost_media, no_final_export |
| `image-animatic-slideshow-fail` | fail | fail_as_expected | yes | motion_structure |

## Gates covered

```text
surface
prior_story_confirm
full_playback
inherits_storyboard
low_cost_media
motion_structure
no_formal_tts
no_formal_captions
no_final_export
stage_boundary
required_artifacts
```

## Stage results

```text
Story Flow:        covered by eval:storyboard (separate suite)
Image Animatic:    offline gates PASS 7/7
Timed Animatic:    not automated
Final:             not automated
```

## Human review

```text
viewing_drive / beat_dwell / handoff_clarity / not_slideshow: NOT RUN
Use: evals/graders/human/image-animatic-review-sheet.md
```

## Root authority to update

```text
no Skill change required from this offline gate scaffolding
gate logic and cases are healthy
```

## Commands

```bash
npm run eval:animatic

node evals/graders/deterministic/image-animatic-gates.mjs \
  --case evals/cases/animatic/image-animatic-locked-001.yaml \
  --workspace evals/runs/synthetic-animatic/image-animatic-locked-001/workspace
```

## Artifacts

```text
evals/runs/synthetic-animatic/matrix.md
evals/runs/synthetic-animatic/matrix.json
evals/reports/image-animatic-synthetic-latest.md
```

## What this slice still does not cover

| Covered | Not covered |
| --- | --- |
| Composition surface vs Storyboard | Live agent Image Animatic production |
| Story Flow confirmation prerequisite | Studio dwell / handoff soft scores |
| Full playback claim | Real motion quality |
| No TTS / captions / final / export | Timed Animatic suite |
| Slideshow / default-camera catch | Final export authorization |

## Next

1. Live Image Animatic trial after Story Flow confirmation.
2. Human Composition review sheet for 3 trials.
3. Timed Animatic deterministic slice.
