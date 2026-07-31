# Storyboard / Story Flow Rubric

第一优先级离线 Eval。验证 Story Flow 是否生产可审查的视觉设计，而不是“有可渲染 src 的说明卡”。

## Gates

### 1. Surface Gate

确定性检查：

```text
是否是官方 HyperFrames Storyboard route / surface
是否存在 Board Overview
是否所有关键 Frame 有可渲染 src
是否没有自定义说明网页冒充 Storyboard
是否未进入完整 Composition 播放
是否未调用正式 TTS / captions.json / 批量最终图
```

任一失败 → 整个 Story Flow case 失败。

### 2. Frame Canvas Gate

每个 Frame 检查：

- 是否有具体可见主体、状态、关系或证据；
- 是否只是空框、无语义矩形或通用图标；
- 是否把旁白、字幕、导演说明或生产信息烧进画布；
- 是否必须依赖右侧说明才知道发生什么；
- 是否符合当前 Visual Medium。

**低保真表示美术完成度低，不表示视觉设计没有完成。**

文字例外只有两类：

1. 故事中的真实对象或证据；
2. 已确定进入最终成片的少量 Editorial Text。

### 3. Sequence Gate

隐藏 Inspector 的 Voiceover / Narrative，只看 Board Overview。

评审者回答：

- 能否大致复述视觉进展；
- 相邻 Frame 是否有可见变化；
- 过程、揭示、对比或重构是否展示了足够关键状态；
- 是否存在明显重复；
- Handoff 是否可见；
- 开头、发展和回报是否形成关系。

主指标：

```text
Visual-Only Comprehension Rate
= 不看 Voiceover / Narrative 时，
  评审者正确识别主要视觉进展的比例
```

### 4. Source Separation Gate

```text
SCRIPT 原文只出现在 Source Text / Voiceover
字幕没有进入 Frame Canvas
导演说明没有烧入 Frame
Prompt 与资产路径没有出现在用户画面
精确证据具有明确的真实素材或 HyperFrames 实现计划
```

### 5. Stage Boundary Gate

Story Flow 后：

- 是否交付官方 Board route；
- 是否说明 Scene / Beat / Frame 与风险；
- 是否停止；
- 是否等待用户确认；
- 是否没有开始 Image Animatic 或 TTS。

## Beat / Frame 期望

```text
Beat = 一次主要观众发现
Storyboard Frame = 发现过程中的一个关键视觉状态
```

- 简单静态发现 → 1 Frame；
- Reveal / 累积 / 对比 / 状态改变 → 通常 2–3 Frames；
- 关键重构或回收 → 至少前后两态。

B08 回归期望：

```text
B08-F1 小店持续经营
B08-F2 好评与用户范围累积
B08-F3 结果回报与结尾 Handoff
```

禁止一个空泛结果 Frame + 大段右侧解释。

## 评分记录

### Deterministic

- surface_ok
- src_present_for_all_key_frames
- no_custom_storyboard_page
- no_full_composition_playback
- no_tts_or_final_images
- stop_after_handoff

### Vision / LLM 初筛

- empty_or_generic_frame
- text_burned_into_canvas
- inspector_dependency
- adjacent_frame_repetition

### Human Expert

- visual_only_comprehension: 0 / 1 / 2
- sequence_development: 0 / 1 / 2
- evidence_readability: 0 / 1 / 2
- medium_coherence: 0 / 1 / 2
- collaboration_clarity: 0 / 1 / 2

## Pairwise 盲比

高风险改动后：

```text
当前版本
vs
上一个稳定版本
```

评审者不知道哪个是新版本，只判断哪个更符合本 rubric。
