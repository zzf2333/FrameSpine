# FrameSpine Eval Report — Live Story Flow Trial

```text
Commit: 2e8eac9 (+ uncommitted live trial artifacts under evals/runs/)
Model / configuration: this-session coding agent
Eval suite version: storyboard-v1
Case: storyboard-locked-001
Trial: 1
Mode: live production in-session (not synthetic template clone)
Fixture input: evals/fixtures/inputs/locked-script-a.md
Series fixture: evals/fixtures/series-projects/series-a
Workspace: evals/runs/storyboard-locked-001/trial-1/workspace
```

## Executive summary

| Check | Result |
| --- | --- |
| Locked Script Mode | PASS — `SCRIPT.md` preserves fixture narration |
| Official Storyboard surface | PASS — no custom page / no full composition playback |
| Renderable Frame srcs | PASS — 8 built HTML frames |
| Multi-frame development | PASS — B04 (2), B05 (2) |
| Source separation | PASS — empty `captions.json`; no narration burned as labels |
| Stage stop | PASS — stop after Story Flow handoff |
| Deterministic gates | **PASS** (`matched=true`, `p0_count=0`) |
| Board claim check | **PASS** (`issues=0`) |
| Human Studio Visual-Only | **NOT RUN** (provisional agent self-review only) |

**Overall live trial (deterministic): PASS**

> This is a real in-session Story Flow production into a trial workspace, then graded by offline gates.  
> It is **not** a HyperFrames Studio pixel review and **not** a multi-trial stability study.

## P0 failures

```text
none
```

## Gate results

```text
surface:                  true
frame_canvas:             true
sequence:                 true
source_separation:        true
stage_boundary:           true
required_artifacts:       true
script_preservation:      true
multi_frame_development:  null (case does not require B08-style forced multi-frame gate)
verdict:                  pass
matched:                  true
p0_count:                 0
```

Artifacts:

```text
evals/runs/storyboard-locked-001/trial-1/grades/deterministic.json
evals/runs/storyboard-locked-001/trial-1/grades/vision-claim.json
evals/runs/storyboard-locked-001/trial-1/human/review-sheet.md
```

## Produced Story Flow sequence

| Frame | Visual event |
| --- | --- |
| B01-F1 | 巷口清晨门脸 |
| B02-F1 | 擦净核心商品后开门 |
| B03-F1 | 安静店内只有熟客 |
| B04-F1 | 用户手机拍摄商品 |
| B04-F2 | 评论区城市名扩散 |
| B05-F1 | 柜台后本子记满回头客 |
| B05-F2 | 核心商品未换 + 全国订单标签 |
| B06-F1 | 稳定收束，留给互动旁白 |

Visual-Only self-retell:

```text
巷口小店 → 擦商品开门 → 只有熟客 → 有人拍摄
→ 城市名扩散 → 本子记满 → 全国标签环绕未换商品 → 提问收束
```

## Slice results

```text
Locked Script:     PASS (trial-1)
Development:       not this case
Revision:          not this case
medium transfer:   not this case (series-a cinematic realism fixture)
provider limits:   no reference upload assumed; no Provider calls made
```

## Stage results

```text
Story Flow:        PASS (this trial)
Image Animatic:    not entered (correct stage stop)
Timed Animatic:    not entered
Final:             not entered
```

## Storyboard-specific

```text
Correct Preview Surface:           PASS
Stage Stop Accuracy:               PASS
Empty/Generic Frame Fail:          not injected (happy path)
Burned Text Fail:                  not injected (happy path)
Visual-Only Comprehension Rate:    provisional agent self-score 2/2;
                                   official human Studio rate: NOT RUN
```

## Human review

```text
visual-only comprehension:  provisional PASS (agent self-review)
sequence quality:           provisional PASS (diffusion/payoff multi-frame)
pairwise preference:        NOT RUN
Studio Board pixels:        NOT RUN
```

Use remaining steps:

1. Import workspace Storyboard into HyperFrames Studio.
2. Hide Inspector Voiceover / Narrative.
3. Blind-score Visual-Only with `evals/graders/human/storyboard-review-sheet.md`.

## Top recurring failures

```text
none in this single happy-path trial
```

## Root authority to update

```text
no Skill change required from trial-1
keep storyboard-locked-001 as regression case
optional later: add live-harness helper to scaffold trial dirs from fixtures
```

## New regression cases

```text
none required
```

## What was intentionally not done

```text
- no TTS / generate-tts
- no formal captions timeline
- no batch final image generation
- no full Composition playback / Image Animatic assembly
- no Provider image requests
- no Final render
```

## How to re-grade this trial

```bash
node evals/graders/deterministic/storyboard-gates.mjs \
  --case evals/cases/storyboard/storyboard-locked-001.yaml \
  --workspace evals/runs/storyboard-locked-001/trial-1/workspace \
  --source-script evals/fixtures/inputs/locked-script-a.md

node evals/graders/visual/board-claim-check.mjs \
  --workspace evals/runs/storyboard-locked-001/trial-1/workspace
```

## Notes

```text
Eval 不判断 Agent 有没有“看起来很努力”，
而是判断它是否在正确阶段、使用正确表面、生产正确产物、
遵守正确边界，并让用户能够做出当前阶段真正应该做的判断。

本 trial 证明：在本 agent 会话内可以直接
1) 从 fixture 生产 Story Flow 工作区
2) 跑 deterministic gates
3) 出 live 报告

仍不能替代：Studio 真 Board 人工 Visual-Only 盲评、多 trial 稳定性。
```
