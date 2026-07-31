# FrameSpine v0.2.0 Director Edition

图片主导的抖音系列短视频制作 Skill。

```text
一个核心：注意力主干
两个流程：系列初始化与视觉校准、单集视频制作
一个底座：HyperFrames 全套 Skills 与 CLI
```

本版本把主要能力放在 `references/`：它们指导 Agent 建立可复用的 Series Configuration（观众、叙事契约、图片/视觉/声音身份与制作环境），再在 Episode 中构建短视频注意力、把用户内容翻译成图片、直接使用 HyperFrames 创作，并根据用户观看反馈持续提高质量。

字幕和 Provider 脚本只是基础执行能力。

## 初始化系列

一个项目只容纳一个系列，项目根目录就是系列根目录。初始化命令直接在当前项目中创建 `SERIES.md`、`DESIGN.md`、`CALIBRATION.md`、`calibration/` 和 `episodes/`，不会再创建系列名子目录。

```bash
cd /path/to/my-project
node /path/to/FrameSpine/scripts/init-series.mjs \
  --name "我的系列" \
  --slug my-series
```

项目中可以已经存在 `.agents/` 等工具配置；如果系列文件或目录已经存在，初始化会停止并列出冲突项。

Agent 先阅读 `references/core/series-initialization.md`。达到 Series Ready 后停止追问，在 `calibration/` 用 HyperFrames 做不依赖具体选题的动态风格校准；主题、Hook 和故事留给 Episode。

## 初始化单集

```bash
node scripts/init-episode.mjs \
  --series /path/to/my-series \
  --slug episode-001 \
  --title "第一期"
```

在单集目录创建 HyperFrames 项目：

```bash
npx hyperframes init video --non-interactive
```

同一个 `video/` 项目持续演进：

```text
Hook / Story Flow
→ Image Animatic
→ 正式 TTS 定时预览
→ Final Composition
```

### 单集文案输入

- 用户交付完整文案时，默认使用 **Locked Script Mode**：将原文放入 `SCRIPT.md`，先提取其叙事与 Attention Spine，再按原文导演图片；不默认改 Hook、结尾、句子、顺序、互动或停顿。
- 用户只给选题、文章或资料时，使用 **Development Mode**：确定最终回报、构建 Attention Spine、发展旁白。
- 只有明确要求改稿时使用 **Revision Mode**。

`SCRIPT.md → narration.txt → TTS`：`SCRIPT.md` 是唯一源文本，默认 TTS 命令会同步生成 `narration.txt`；不要独立编辑后者。

## 生成声音和图片

```bash
node scripts/generate-tts.mjs --project /path/to/episode-001
node scripts/generate-images.mjs --project /path/to/episode-001
```

## HyperFrames

```bash
cd /path/to/episode-001/video
npx hyperframes lint
npx hyperframes inspect
npx hyperframes preview
npx hyperframes validate
npx hyperframes render --quality high --output final.mp4
```

技术工具发现实现问题；内容、图片、节奏和风格由用户观看真实预览后判断。

## Eval（离线，不进入运行时）

**Skill 负责生产视频；Eval 负责验证 Skill 有没有按照设计生产。**

`evals/` 独立于运行时：评分器、测试案例与报告不得写回 `SKILL.md` / `references/` / `templates/` / `scripts/`。
设计权威：`evals/DESIGN.md`；运行说明：`evals/README.md`。

```bash
npm run eval:e0
npm run eval:cases
npm run eval:storyboard
npm run eval:animatic
npm run eval:timed
```

当前可跑：E0 静态合同 + Storyboard / Image Animatic / Timed Animatic 硬门禁。Final、E3 完整 harness、E4 端到端仍按设计后续推进。
