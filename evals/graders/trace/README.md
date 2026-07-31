# Trace Graders（E3）

Agent trial harness 应写入完整轨迹，供阶段边界与协作检查。  
**仅离线**；不进入运行时 Skill。

**Multi-trial 合同与 CLI：** [`HARNESS.md`](./HARNESS.md)

## Trial 布局

```text
evals/runs/<case-id>/
  suite-manifest.json
  trial-1/
    trial-manifest.json
    workspace/                 # episode project
      eval-artifacts/
        tool-trace.json
        preview-manifest.json
        board-manifest.json | composition-manifest.json | timed-manifest.json | final-manifest.json
        storyboard-route.txt | composition-route.txt
        file-diff.patch        # optional
        conversation.md        # optional
    human/
      review-sheet.md
    grades/
      deterministic.json
      vision.json              # optional
      human.json               # optional
      summary.json
  trial-2/
  aggregate.json
  aggregate.md
```

## tool-trace.json 最小约定

```json
{
  "case_id": "storyboard-locked-001",
  "trial": 1,
  "events": [
    { "type": "tool", "tool": "read", "path": "SCRIPT.md" },
    { "type": "stage_stop", "stage": "story-flow", "route": "https://..." },
    {
      "type": "user_confirmation",
      "stage": "story-flow",
      "next": "image-animatic",
      "story_flow_confirmed": true
    },
    { "type": "cost_boundary", "stage": "timed-animatic", "cost_boundary_explained": true },
    { "type": "tool", "tool": "generate-tts", "formal_tts": true }
  ]
}
```

## 必须能从轨迹判断的设计问题（DESIGN §4 E3）

- 用户确认前跨阶段
- 错误 surface（自定义网页 / 过早 Composition）
- Story Flow 时调用 TTS
- 静默改稿
- 虚构 Provider 能力 / 假装已上传 reference
- 修改多个权威位置修同一问题
- Final Preview 前 export

## CLI

```bash
npm run eval:harness:init -- --case evals/cases/storyboard/storyboard-locked-001.yaml
npm run eval:harness:validate -- --trial-dir evals/runs/storyboard-locked-001/trial-1
npm run eval:harness:grade -- --case-id storyboard-locked-001
npm run eval:harness:aggregate -- --case-id storyboard-locked-001
```

## 当前实现

| 能力 | 状态 |
| --- | --- |
| 布局约定 + init/validate/grade/aggregate | **可跑** |
| Stage gates 读 tool-trace | **已有**（E2） |
| 外部 Agent 自动驱动 | **不做**（外部 runner） |
| 独立全文 conversation scorer | 后续 |
| Vision 批跑 | 后续 |

## preview-manifest 最小约定

Story Flow：

```json
{
  "surface": "hyperframes-storyboard",
  "storyboard_route": "https://...",
  "full_composition_playback": false,
  "custom_storyboard_page": false
}
```

其他阶段：见 `fixtures/trial-schema/`。
