# FrameSpine Eval Report — Live Image Animatic Trial

```text
Commit: 25abeab (+ live trial artifacts under evals/runs/)
Model / configuration: this-session coding agent
Eval suite version: image-animatic-v1
Case: image-animatic-locked-001
Trial: 1
Mode: live production in-session (not synthetic template clone)
Prior Story Flow: evals/runs/storyboard-locked-001/trial-1
Fixture input: evals/fixtures/inputs/locked-script-a.md
Series fixture: evals/fixtures/series-projects/series-a
Workspace: evals/runs/image-animatic-locked-001/trial-1/workspace
```

## Executive summary

| Check | Result |
| --- | --- |
| Prior Story Flow confirmation | PASS — explicit progression after trial-1 |
| Composition surface | PASS — `hyperframes-composition`, not Storyboard |
| Full composition playback claim | PASS — `video/composition.html` ~55s estimated |
| Inherits confirmed frames | PASS — 8 Storyboard frames on timeline |
| Low-cost media | PASS — no formal TTS / captions / batch finals |
| Motion structure | PASS — entry-settle / local-emphasis / object-handoff |
| Stage stop | PASS — stop before Timed Animatic |
| Deterministic gates | **PASS** (`matched=true`, `p0_count=0`) |
| Human Studio soft dimensions | **NOT RUN** (provisional agent self-review only) |

**Overall live trial (deterministic): PASS**

> This is a real in-session Image Animatic composition built on the confirmed Story Flow trial-1 workspace, then graded by offline gates.  
> It is **not** a HyperFrames Studio timing/dwell human review and **not** a multi-trial stability study.

## P0 failures

```text
none
```

## Gate results

```text
surface:              true
prior_story_confirm:  true
full_playback:        true
inherits_storyboard:  true
low_cost_media:       true
motion_structure:     true
no_formal_tts:        true
no_formal_captions:   true
no_final_export:      true
stage_boundary:       true
required_artifacts:   true
verdict:              pass
matched:              true
p0_count:             0
```

Artifacts:

```text
evals/runs/image-animatic-locked-001/trial-1/grades/deterministic.json
evals/runs/image-animatic-locked-001/trial-1/grades/summary.json
evals/runs/image-animatic-locked-001/trial-1/human/review-sheet.md
```

## Produced Image Animatic sequence

| Time (est.) | Frame | Motion |
| --- | --- | --- |
| 0–6s | B01-F1 巷口门脸 | entry-settle |
| 5.5–12.5s | B02-F1 擦商品开门 | local-emphasis |
| 12–18s | B03-F1 安静熟客 | entry-settle |
| 17.5–24s | B04-F1 手机拍摄 | local-emphasis |
| 23.5–30.5s | B04-F2 城市名扩散 | object-handoff |
| 30–36.5s | B05-F1 本子记满 | local-emphasis |
| 36–44s | B05-F2 全国标签回收 | object-handoff |
| 43.5–55s | B06-F1 互动收束 | hold-handoff |

## Cost / stage boundaries observed

```text
formal TTS:           not called
captions.json:        []
batch final images:   not called
export:               not attempted
next stage:           awaits user confirmation before Timed Animatic
```

## Soft dimensions (provisional only)

| dim | self-score | Studio human |
| --- | --- | --- |
| viewing_drive | 1 | NOT RUN |
| beat_dwell | 1 | NOT RUN |
| handoff_clarity | 2 | NOT RUN |
| not_slideshow | 1 | NOT RUN |

## What this trial proves

1. Live Image Animatic can be produced after Story Flow confirmation without collapsing back to Storyboard surface.
2. Deterministic gates catch the right stage boundaries on a real workspace, not only synthetic fixtures.
3. Confirmed Storyboard Frames can be sequenced with medium-native rough motion and temporary timing.

## What this trial does **not** prove

1. HyperFrames Studio pixel/timing quality.
2. Multi-trial model stability.
3. Timed Animatic TTS / captions correctness.
4. Final export readiness.

## Root authority to update

```text
no Skill change required from this live trial
soft quality still needs Studio human with image-animatic-review-sheet.md
```

## Commands re-run

```bash
node evals/graders/deterministic/image-animatic-gates.mjs \
  --case evals/cases/animatic/image-animatic-locked-001.yaml \
  --workspace evals/runs/image-animatic-locked-001/trial-1/workspace
```

## Next

1. Import `video/composition.html` into HyperFrames Studio and score soft dims.
2. Optional live negative: formal-tts injection on a copy workspace.
3. Timed Animatic offline suite scaffold.
