# Trace Graders（E3）

Agent trial harness 应写入完整轨迹，供阶段边界与协作检查。  
**仅离线**；不进入运行时 Skill。

## Trial 布局

```text
evals/runs/<case-id>/<trial>/
  workspace/                 # episode project
  eval-artifacts/
    tool-trace.json
    preview-manifest.json
    board-manifest.json      # Story Flow
    composition-manifest.json  # Image Animatic
    timed-manifest.json      # Timed Animatic
    storyboard-route.txt | composition-route.txt
    file-diff.patch          # optional
    conversation.md          # optional
  human/
    review-sheet.md
  grades/
    deterministic.json
    vision.json
    human.json
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
- Story Flow 时 TTS / 正式 captions
- 静默改稿
- 虚构 Provider 能力
- 多权威位置重复修复
- Final Preview 前 export

## 当前实现

- Deterministic stage gates **已读取** `tool-trace.json` 中的 `stage_stop` / `user_confirmation` / 禁止工具名
- **尚未**：独立 trace scorer、完整 conversation 解析、自动多 trial harness

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

Image / Timed：见 `fixtures/trial-schema/` 示例。
