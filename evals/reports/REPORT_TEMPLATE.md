# FrameSpine Eval Report

```text
Commit:
Model / configuration:
Eval suite version:          # design v1 + implemented slices
Cases:
Trials:
Mode:                        # offline-synthetic | live-agent | human-studio
```

## Executive summary

```text
Overall (no single score):
P0-Free Trial Rate:
Hard gates:
Soft quality:
Human Studio:
```

## P0 failures（硬性违规）

```text
-
```

任一 P0 使该 trial 失败，不可被软质量高分抵消。  
P0 清单见 `evals/DESIGN.md` §6。

## Slice results（能力切片）

```text
Locked Script:
Development:
Revision:
medium transfer:
provider limitations:
content types:
```

不要只报总平均；切片低分必须可见。

## Stage results（各阶段）

```text
Story Flow:
Image Animatic:
Timed Animatic:
Final:
```

## Storyboard-specific（v1 优先）

```text
Correct Preview Surface Rate:
Visual-Only Comprehension Rate:
Stage Stop Accuracy:
Empty/Generic Frame Fail Catch Rate:
Burned Text Fail Catch Rate:
```

## Trace / collaboration（E3）

```text
Stage Stop Accuracy:
Premature TTS / captions / final:
Wrong surface:
Silent script rewrite:
Provider capability honesty:
Root-cause layer accuracy:
```

## Human review

```text
visual-only comprehension:
sequence quality:
sync / dwell (timed):
pairwise preference (vs baseline):
```

## Soft dimensions（0/1/2，勿急着加总）

```text
Intent Fidelity:
Attention Structure:
Visual Narrativity:
Sequence Development:
Medium Coherence:
Continuity:
Production Affordance:
Collaboration Clarity:
Technical Readiness:
```

## Top recurring failures

```text
1.
2.
3.
```

## Root authority to update（唯一修复位置）

```text
问题：
发生在哪个阶段：
属于哪一层：
是单集问题还是长期系列问题：
修复后应该更新哪个唯一权威位置：
  - SKILL.md
  - episode-production.md
  - STORYBOARD.md / templates
  - hyperframes-directing.md
  - quality-and-iteration.md
  - narrative-directing.md / subtitles.md
  - no change required; add regression case only
```

## New regression cases

```text
-
```

## Eval QA notes

```text
case gold expectations valid?:
fixtures complete?:
diagnostic-only cases excluded from release gate?:
grader false positive/negative?:
```

## Notes

```text
Eval 不判断 Agent 有没有“看起来很努力”，
而是判断它是否在正确阶段、使用正确表面、生产正确产物、
遵守正确边界，并让用户能够做出当前阶段真正应该做的判断。
```
