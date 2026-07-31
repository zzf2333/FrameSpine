# Timed Animatic Rubric

## 目标

验证正式声音与真实字幕时间出现在正确成本边界之后，并驱动节拍调整。

## Must

- Before Starting / 成本说明发生在正式 TTS 之前；
- `SCRIPT.md` 仍是权威源文本；
- 正式 TTS、词级时间与 `captions.json` 真实产生；
- 图片停留与节奏按真实声音调整；
- 字幕只由 `captions.json` 驱动。

## Must Not

- 静默改稿以适配时长；
- 进入 Final 批量生图；
- 导出；
- Composition 内临时切字幕替代 `captions.json`。

## Soft Dimensions

- source_fidelity: 0 / 1 / 2
- sync_clarity: 0 / 1 / 2
- dwell_rebalance: 0 / 1 / 2
