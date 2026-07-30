# 单集工作区

- `SCRIPT.md`：本期唯一的权威中文旁白源文本；完整用户文案默认保持原句、顺序、互动与停顿。
- `EPISODE.md`：Source Script 状态、Narrative Reading、Brief、Attention Spine 和导演笔记，不存第二份旁白。
- `STORYBOARD.md`：图片节拍、语义字幕组、素材策略和 HyperFrames 导演设计。
- `narration.txt`：从 `SCRIPT.md` 同步的 TTS 派生文件，不独立编辑。
- `image-prompts.json`：交给 GPT Image 2 的最终图片请求。
- `assets/`：声音、图片和参考素材。
- `video/`：同一个 HyperFrames 项目，从 Story Flow 持续演进到 Final。

开始制作时按需阅读核心 references；需要用户审片和修改时读取 `references/core/quality-and-iteration.md`。
