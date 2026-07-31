# FrameSpine Eval Report — Storyboard v1 (Offline Synthetic)

Generated: 2026-07-31 10:25:45 UTC

```text
Commit: 94bb222 test: harden storyboard eval gates with synthetic matrix
Runner: local agent (this session)
Mode: offline synthetic + E0 static contracts
Suite: storyboard-v1
```

## Executive summary

| Check | Result |
| --- | --- |
| E0 static contracts | PASS |
| Case validation | PASS (13 cases) |
| Synthetic trial build | PASS |
| Deterministic gate matrix | **13/13 matched (100%)** |
| Positive cases | 7/7 pass |
| Negative baselines | 6/6 fail_as_expected |

**Overall offline suite: PASS**

> This report validates **gate logic and Skill static contracts**.
> It does **not** replace live Agent trials or human Visual-Only Studio review.

## P0 failures

```text
none in offline synthetic matrix
```

## Gate matrix

| case | expected | verdict | matched | p0 | gate failures |
| --- | --- | --- | --- | --- | --- |
| `storyboard-burned-text-fail` | fail | fail_as_expected | yes | 7 | frame_canvas, source_separation |
| `storyboard-custom-page-fail` | fail | fail_as_expected | yes | 2 | surface |
| `storyboard-development-001` | pass | pass | yes | 0 | — |
| `storyboard-empty-frame-fail` | fail | fail_as_expected | yes | 10 | frame_canvas, sequence |
| `storyboard-evidence-001` | pass | pass | yes | 0 | — |
| `storyboard-hybrid-medium-001` | pass | pass | yes | 0 | — |
| `storyboard-inspector-complete-board-unreadable` | fail | fail_as_expected | yes | 7 | frame_canvas, sequence |
| `storyboard-locked-001` | pass | pass | yes | 0 | — |
| `storyboard-locked-b08-development` | pass | pass | yes | 0 | — |
| `storyboard-medium-transfer-paper-cut` | pass | pass | yes | 0 | — |
| `storyboard-revision-001` | pass | pass | yes | 0 | — |
| `storyboard-script-rewrite-fail` | fail | fail_as_expected | yes | 1 | script_preservation |
| `storyboard-stage-skip-fail` | fail | fail_as_expected | yes | 3 | stage_boundary |

## Slice results

```text
Locked Script:     pass (locked-001, b08, evidence) + fail_as_expected negatives
Development:       pass (development-001)
Revision:          pass (revision-001)
Medium transfer:   pass (paper-cut, hybrid)
Provider limits:   covered via fixture no-reference-upload (happy path)
Source integrity:  fail_as_expected (script-rewrite-fail)
```

## Stage results

```text
Story Flow:        offline gates PASS (13/13)
Image Animatic:    not in v1 automated suite
Timed Animatic:    not in v1 automated suite
Final:             not in v1 automated suite
```

## Storyboard-specific metrics (synthetic)

```text
Correct Preview Surface catch (custom-page):     fail_as_expected
Empty/Generic Frame Fail Catch Rate:            1/1
Burned Text Fail Catch Rate:                    1/1
Stage Stop / skip catch:                        1/1
Inspector-only board catch:                     1/1
Locked script rewrite catch:                    1/1
B08 multi-frame development (synthetic pass):   pass
Visual-Only Comprehension Rate (human):         NOT RUN (requires Studio + human)
```

## Spot checks this run

### board-claim-check

- happy `storyboard-locked-001`: **PASS** (issues=0)
- negative `storyboard-empty-frame-fail`: **caught** (issues=3)

### B08 multi-frame gate

- verdict: `pass`
- multi_frame_development: `True`
- p0_count: 0

## Negative baseline evidence (what gates caught)

### `storyboard-burned-text-fail`

- gate failures: `frame_canvas, source_separation`
- sample P0:
  - B01-F1: forbidden canvas text role 'narration'
  - B01-F1: forbidden canvas text role 'director_note'
  - B01-F1: HTML likely burns role-labeled production text

### `storyboard-custom-page-fail`

- gate failures: `surface`
- sample P0:
  - incorrect or missing official storyboard surface: custom-html-page
  - custom storyboard page used

### `storyboard-empty-frame-fail`

- gate failures: `frame_canvas, sequence`
- sample P0:
  - B01-F1: canvas kind is empty (incomplete visual design)
  - B01-F1: marked inspector_dependency=true
  - B01-F1: HTML canvas appears empty/generic

### `storyboard-inspector-complete-board-unreadable`

- gate failures: `frame_canvas, sequence`
- sample P0:
  - B01-F1: canvas kind is empty (incomplete visual design)
  - B01-F1: marked inspector_dependency=true
  - B01-F1: HTML canvas appears empty/generic

### `storyboard-script-rewrite-fail`

- gate failures: `script_preservation`
- sample P0:
  - SCRIPT.md does not preserve locked source narration

### `storyboard-stage-skip-fail`

- gate failures: `stage_boundary`
- sample P0:
  - forbidden pre-confirmation actions: generate-tts, generate-images, full_composition_playback
  - no stage_stop after storyboard handoff
  - composition playback before confirmation

## Human review

```text
visual-only comprehension:  NOT RUN
sequence quality:           NOT RUN
pairwise preference:        NOT RUN
```

Use: `evals/graders/human/storyboard-review-sheet.md`

## Root authority to update

```text
no Skill change required from this offline run
gate logic and cases are healthy
```

## What this run did / did not cover

| Covered now | Not covered yet |
| --- | --- |
| Skill doc/script static contracts (E0) | Live Agent trajectory production |
| Case YAML validity | Real HyperFrames Studio Board pixels |
| Deterministic gate logic on synthetic workspaces | Human Visual-Only comprehension rate |
| Negative baselines fail correctly | Image Animatic / Timed / Final stages |
| Locked script preservation check | Multi-trial stability across models |

## Artifacts

```text
evals/runs/synthetic/matrix.md
evals/runs/synthetic/matrix.json
evals/runs/synthetic/<case-id>/workspace/
evals/runs/synthetic/<case-id>/grades/deterministic.json
evals/runs/storyboard-suite-1785493513469.json
```

## Next recommended live step

1. Initialize a real episode from `fixtures/inputs/locked-script-a.md` + `series-a`.
2. Run Agent to Story Flow only; write trial artifacts under `evals/runs/storyboard-locked-001/trial-1/`.
3. Grade with `storyboard-gates.mjs` + human review sheet.
4. Repeat 3–5 trials; fill Visual-Only Comprehension Rate.
