# FrameSpine Eval Report — storyboard-locked-001 Multi-Trial Live

Generated: 2026-07-31

```text
Case: storyboard-locked-001
Stage: Story Flow
Trials: 3
Mode: live multi-trial (in-session production)
Harness: eval:harness:grade + aggregate
```

## Executive summary

| metric | value |
| --- | --- |
| trials_total | 3 |
| trials_graded | 3 |
| p0_free_rate | **100%** |
| matched_rate | **100%** |
| all_pass | **true** |
| cross_trial_stability | **stable** |
| high_frequency_gate_failures | none |
| board-claim issues | 0 / 0 / 0 |
| Studio Visual-Only (human) | **NOT RUN** |

**Deterministic multi-trial: PASS + stable**  
Soft Visual-Only comprehension still requires HyperFrames Studio blind review.

## Per trial

| trial | variant | verdict | p0 | board-claim | locked lines |
| --- | --- | --- | --- | --- | --- |
| 1 | original warm low-fi (prior live) | pass | 0 | pass | present |
| 2 | cooler tight-crop stills | pass | 0 | pass | exact fixture |
| 3 | warm dusk block stills | pass | 0 | pass | exact fixture |

Trial-2/3 used **independent frame HTML** (not copied from trial-1): same Attention Spine and 8-frame Beat map, different palette/layout recipes under series-a Motion Language.

## What each trial produced

```text
evals/runs/storyboard-locked-001/
  suite-manifest.json          # trial_count=3
  trial-{1,2,3}/
    workspace/
      SCRIPT.md / EPISODE.md / STORYBOARD.md
      captions.json = []
      video/compositions/frames/b0{1..6}-f*.html  (8 frames)
      eval-artifacts/
        preview-manifest.json   # hyperframes-storyboard
        board-manifest.json
        tool-trace.json         # stage_stop story-flow
        storyboard-route.txt
    grades/{deterministic,summary}.json
    human/review-sheet.md
  aggregate.json
  aggregate.md
```

## Gates (all trials)

```text
surface / frame_canvas / sequence / source_separation / stage_boundary
→ pass, p0_count=0
```

## Aggregate (no single score)

```text
p0_free_rate: 100%
matched_rate: 100%
cross_trial_stability: stable
```

## Honesty limits

| Claim | Status |
| --- | --- |
| Deterministic Story Flow hard gates ×3 | **PASS** |
| Independent composition variants | **yes** (t2/t3 not byte-copies of t1) |
| Separate model / temperature trials | **no** — same in-session agent |
| Studio Visual-Only blind human | **NOT RUN** |
| Cross-trial soft preference | **NOT RUN** |
| Cherry-picked best trial | **no** — all three graded |

## Commands

```bash
npm run eval:harness:grade -- --case-id storyboard-locked-001
npm run eval:harness:aggregate -- --case-id storyboard-locked-001

node evals/graders/visual/board-claim-check.mjs \
  --workspace evals/runs/storyboard-locked-001/trial-2/workspace
```

## Root authority

```text
no Skill change required from this multi-trial
hard gates stable on locked-script Story Flow happy path
```

## Next

1. Studio human Visual-Only on all three boards (soft metric).
2. Optional: different model labels for true cross-model stability.
3. Do not expand negative baselines without real production failures.
