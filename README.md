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
