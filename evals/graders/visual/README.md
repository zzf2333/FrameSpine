# Visual / LLM Graders

Offline only. Never wire these into runtime Skill production.

## 用途

初筛：

- empty or generic frames
- text burned into canvas
- inspector dependency
- adjacent frame repetition
- medium mismatch hints

## 规则

1. 必须先用人工标签校准；
2. 不能单独作为 release gate 的最终真理；
3. P0 视觉问题仍以 Human Expert 或高置信 Vision + Human 抽查为准；
4. 输出写入 `evals/runs/.../grades/vision.json`，不写回 Skill。

## 建议输出

```json
{
  "case_id": "storyboard-locked-001",
  "trial": 1,
  "frames": [
    {
      "id": "B08-F1",
      "empty_or_generic": false,
      "text_burned": false,
      "inspector_dependency_likely": false,
      "notes": ""
    }
  ],
  "sequence": {
    "adjacent_repetition": false,
    "development_visible": true
  }
}
```
