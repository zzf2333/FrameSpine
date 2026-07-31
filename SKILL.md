---
name: frame-spine
description: Co-design, direct, preview, revise, and produce image-first Douyin short-video series with users. Use when a user wants to initialize a repeatable video series, define its attention and visual language, develop a short-video topic into hooks and an attention spine, turn narration into image-led visual beats, create HyperFrames story previews or animatics, generate Chinese narration with Volcengine TTS, generate images through a third-party GPT Image 2 API, or refine an existing episode through user review. The videos use Chinese narration, Chinese-English subtitles as a baseline feature, sparse editorial text, and HyperFrames as the primary directing, animation, preview, and rendering environment.
---

# 图片主导的抖音系列短视频制作

以一个核心、两个流程组织工作：

```text
核心：注意力主干

流程一：系列初始化与视觉校准
流程二：单集视频制作

主表达：图片叙事
制作底座：HyperFrames 全套 Skill、GSAP 与 CLI
```

## HyperFrames Role

HyperFrames is the visual production environment of FrameSpine.

FrameSpine decides:

- what the audience should understand;
- what the image should communicate;
- what visual change helps comprehension.

HyperFrames decides:

- how images move;
- how scenes transition;
- how typography appears;
- how the final composition is implemented.

Do not use HyperFrames effects to compensate for weak storytelling.

这个 Skill 的价值不在于自动把文案拼成视频，而在于帮助 Agent：

- 建立长期可复用的视频系列生产配置，包括内容定位、观众、叙事契约、图片语言、视觉身份、声音身份和制作环境；
- 在单集阶段根据输入类型，发展或提取观看承诺与注意力主干；完整文案默认作为锁定源文本被导演成图片视频；
- 用 HyperFrames 对系列风格进行动态校准，并对单集进行 Story Flow、Animatic 和成片预览；
- 根据用户观看反馈持续修改，而不是用自动评分替用户验收；
- 在单集方向稳定后调用火山 TTS 和 GPT Image 2，完成正式制作。

## 工作原则

以下为核心行为规则。各原则的详细协议、检查清单和模板见对应 reference 文件（`episode-production.md`、`quality-and-iteration.md`、`hyperframes-directing.md`）。

### 用户通过真实预览验收

内容、Hook、图片、节奏、声音、风格和动效都由用户观看实际 HyperFrames 预览后判断。不建立创意审批状态机、自动通关分数或失效传播系统。技术工具只诊断技术问题。

### 先展示，再推进

不静默跨阶段。FrameSpine 默认一次只推进一个创作成熟阶段：

```text
Story Flow → Image Animatic → Timed Animatic → Final Composition
```

每个阶段必须先产生用户能实际观看的 HyperFrames 预览，展示后立即结束当前回复，等待用户在后续消息中明确同意才能进入下一阶段。详细的阶段边界协议见 `references/core/episode-production.md`。

### 协作式阶段交接

FrameSpine 是 Agent 与用户通过真实预览共同导演的视频制作。实现细节由 Agent 承担；会改变视频方向、返工成本或用户判断的创作决定必须对用户透明。交接模板与反馈翻译见 `references/core/quality-and-iteration.md`。

### Agent 自审先于用户审片

每个成熟阶段在展示给用户前必须完成 Preview Readiness Review：在真实 Studio 中完整播放、检查关键时刻和技术问题、修复 P0 阻断后才展示。详细的自审流程见 `references/core/episode-production.md`。

### 实质偏离才单独预览

在已确认方向范围内的常规制作动作不需要逐项请求确认。仅当新增处理会实质改变 Visual Medium、叙事意义、Attention Path 或长期系列基线时，才单独展示并等待用户决定。详见 `references/core/hyperframes-directing.md`。

### 制作能力厚，控制层薄

优先投入内容设计、图片叙事、HyperFrames 导演能力、低成本动态原型、用户反馈后的针对性修改、TTS / 图片和声音的正式生产。不要为第一版建设复杂 Schema、跨文件校验、创意评分器或通用 HTML 编译器。

### HyperFrames 技术合同不可替代

创建或修改任何 `video/` Composition 前，Agent 必须读取已安装的 HyperFrames Skill。FrameSpine 只决定叙事任务、图片任务和观看路径；Composition 技术实现必须服从 HyperFrames 正式技术合同。不得凭经验发明平行实现。

### 同一个 HyperFrames 项目逐步成熟

每期默认维护一个 `video/` 项目，从 Story Flow 占位图逐步替换为正式素材和精细动画。不要为每个阶段复制一套平行工程。

### 一个项目只容纳一个系列

项目根目录就是系列根目录，`SERIES.md`、`DESIGN.md`、`CALIBRATION.md`、`calibration/` 和 `episodes/` 直接位于其中。初始化时不要再按系列名称创建一层子目录。

### 图片承担主要视觉表达

图片、图片关系与图片运动应承接绝大多数内容。中文字幕和英文字幕是语言同步基础层。字幕之外的编辑文字默认不出现；只有在命名概念、锁定数字、标注证据、人物或地点、重大转折与 CTA 时才考虑使用。

## 任务路由

先判断当前任务属于哪一类，再读取对应 references。不要一次加载所有文件。

### 新系列或系列方向不清楚

先读：

1. `references/core/series-initialization.md`
2. `references/core/hyperframes-directing.md` 的「最小的制作循环」与「HyperFrames Skill 引用策略」

目标是建立未来单集可继承的 Series Configuration，并完成不依赖具体选题的 Series Style Calibration。不要在此阶段读取 `attention-spine.md`，也不要设计第一期的主题、Hook、故事或分镜。

### 新单集、改写选题或制作一期视频

先读：

1. `references/core/episode-production.md`
2. `references/core/attention-spine.md`
3. `references/core/image-storytelling.md`
4. `references/core/hyperframes-directing.md`

用户提供完整文案时，额外读 `references/core/narrative-directing.md`：默认进入 Locked Script Mode，将原文保存到 `SCRIPT.md`，提取而不重构其 Attention Spine，保留原句、顺序、互动与停顿。用户只给选题、文章或资料时使用 Development Mode；只有明确要求修改文字时才进入 Revision Mode。

### 用户正在观看预览并反馈

读：

- `references/core/quality-and-iteration.md`

先判断反馈属于内容、注意力、图片表达、节奏、声音、视觉风格还是技术实现，再修改正确层级。

### 生成 TTS、图片或字幕

按需读：

- `references/technical/providers.md`
- `references/technical/subtitles.md`

### 需要完整参考

按需读 worked examples：

- `references/examples/knowledge-explainer.md`
- `references/examples/character-story.md`
- `references/examples/locked-script-directing.md`（定稿文案导演案例）

案例用于理解方法，不要机械复制其结构或画面。

# Series vs Episode Boundary

Series initialization 定义可复用的长期决定（系列身份、观众、叙事契约、图片 / 视觉 / 声音身份、制作配置）。它不决定某一期的选题、Hook、故事结构、图片节拍或镜头——这些全部属于 Episode Production。

# 流程一：系列初始化与视觉校准

详细流程见 `references/core/series-initialization.md`。核心步骤：

1. **先读取已有信息** — 视频、文案、品牌手册、参考、已有 `SERIES.md` / `DESIGN.md`。能从资料中得到的事实不要再问。
2. **收敛式共创** — 一次只问一个问题并给出推荐。不发送大型问卷，不连续超过四个问题而不总结。
3. **Series Ready 时停止追问** — 系列身份、Narrative Contract、图片 / 视觉 / 声音身份可复用时停止纯访谈。颜色细差、运动速度等体验问题通过 Series Style Calibration 解决。
4. **形成工作文件** — Agent 根据对话整理 `SERIES.md`、`DESIGN.md`、`CALIBRATION.md`、`.env`。
5. **HyperFrames 系列风格校准** — 测试动态视觉身份（图片风格、布局、运动、字幕、TTS、组件），不是第一条视频样片。不测试具体主题或 Hook。

# 流程二：单集视频制作

详细流程见 `references/core/episode-production.md`。核心步骤：

1. **按输入进入正确导演路径** — Locked Script Mode（完整文案）、Development Mode（选题 / 资料）、Revision Mode（明确要求改稿）。
2. **设计或提取注意力主干** — Development Mode 先设计观看承诺和回报链；Locked Script Mode 从原文提取。详见 `references/core/attention-spine.md`。
3. **发展旁白或导演定稿文案** — Development / Revision Mode 写短、具体、可视化的旁白；Locked Script Mode 保留原文，寻找其中的人物、动作、物件、环境和证据。详见 `references/core/narrative-directing.md`。
4. **Story Flow** — 使用占位图和临时声音直接创建 HyperFrames Story Flow，让用户观看整条视频的观看动力。
5. **Image Animatic** — 在 `STORYBOARD.md` 中设计图片节拍，把占位画面升级为 Image Animatic。详见 `references/core/image-storytelling.md`。
6. **Timed Animatic** — 生成正式 TTS、写入 `captions.json`、依据真实时间重新导演图片停留和节奏。详见 `references/technical/providers.md` 和 `references/technical/subtitles.md`。
7. **最终图片与精修** — 整理 `image-prompts.json` 并生成最终图片，完成 Prompt Audit 和 Image Set Audit。详见 `references/core/image-storytelling.md`。
8. **审片与渲染** — HyperFrames Studio Final Preview 后等待用户明确允许导出。

每个阶段边界的交接协议、反馈处理和质量检查见 `references/core/quality-and-iteration.md`。

# HyperFrames 能力路由

先由 Attention Spine 和 Image Storytelling 决定图片要表达什么，再按实际制作需要读取已安装的 HyperFrames 能力。

| 使用频率 | 能力 | 用途 |
| --- | --- | --- |
| Required｜必需 | `hyperframes` / `hyperframes-core` | composition、Scene、预览与渲染的技术合同。 |
| Required｜必需 | GSAP / Motion | 图片运动与时间节奏。 |
| Common｜常用 | Transitions | 建立前后图片的关系。 |
| Common｜常用 | Typography | 少量编辑文字与字幕层级。 |
| Basic｜基础 | Captions | 稳定的中英文字幕。 |
| Conditional｜条件使用 | Data visualization、Audio reactive、Shader、advanced effects | 仅当内容确实需要时使用。 |
| Execution｜执行 | `hyperframes-cli` | 初始化、检查、预览、转写与渲染。 |

`references/core/hyperframes-directing.md` 说明这些能力在图片主导视频中的导演用途；HyperFrames 自身 Skill 仍是 composition 技术规则的唯一来源。

# 配套脚本边界

首版脚本只负责执行：

```text
init-series.mjs      创建系列工作区
init-episode.mjs     创建单集工作区
generate-tts.mjs     调用火山 TTS
generate-images.mjs  调用第三方 GPT Image 2
```

脚本不判断 Hook、图片、节奏或风格是否合格，不记录用户批准，不自动推进阶段，也不生成通用 HyperFrames composition。
