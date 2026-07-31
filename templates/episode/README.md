# 单集工作区

- `SCRIPT.md`：本期唯一的权威中文旁白源文本；完整用户文案默认保持原句、顺序、互动与停顿。
- `EPISODE.md`：Source Script 状态、Narrative Reading、Brief、Attention Spine 和导演笔记，不存第二份旁白。
- `STORYBOARD.md`：图片节拍、字幕与图片如何配合、素材策略和 HyperFrames 导演设计；它通过字幕 ID 引用 `captions.json`，不维护第二份字幕时间轴。
- `captions.json`：正式 TTS 和转写后由 Agent 编写的字幕时间轴；HyperFrames 只从此文件读取实际显示的中英文字幕、时间、组内换行及关联 Beat。
- `narration.txt`：从 `SCRIPT.md` 同步的 TTS 派生文件，不独立编辑。
- `image-prompts.json`：按实际图片素材组织的 GPT Image 2 请求；只有 `prompt` 与 Provider 支持的 `extra` 会影响生成，其他字段保留导演上下文。
- `assets/`：声音、图片和参考素材。
- `video/`：同一个 HyperFrames 项目，从 Story Flow 持续演进到 Final。

开始制作时按需阅读核心 references；需要用户审片和修改时读取 `references/core/quality-and-iteration.md`。
