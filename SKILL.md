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
- 在单集阶段把用户提供的内容设计为观看承诺、注意力主干、图片节拍和 HyperFrames 视频；
- 用 HyperFrames 对系列风格进行动态校准，并对单集进行 Story Flow、Animatic 和成片预览；
- 根据用户观看反馈持续修改，而不是用自动评分替用户验收；
- 在单集方向稳定后调用火山 TTS 和 GPT Image 2，完成正式制作。

## 工作原则

### 用户通过真实预览验收

内容、Hook、图片、节奏、声音、风格和动效都由用户观看实际 HyperFrames 预览后判断。不要建立创意审批状态机、自动通关分数或失效传播系统。

技术工具只诊断技术问题，例如媒体损坏、布局溢出、时间线错误、字幕遮挡和渲染失败。

### 制作能力厚，控制层薄

优先投入：

- 内容设计；
- 图片叙事；
- HyperFrames 导演能力；
- 低成本动态原型；
- 用户反馈后的针对性修改；
- TTS、图片和声音的正式生产。

不要为了第一版提前建设复杂 Schema、跨文件校验、创意评分器或通用 HTML 编译器。

### 同一个 HyperFrames 项目逐步成熟

每期默认维护一个真实的 `video/` 项目：

```text
Story Flow
→ Image Animatic
→ Timed Animatic
→ Final Composition
```

使用占位图、临时声音和粗略运动尽早播放；方向稳定后再替换正式声音、最终图片和精细动画。不要为每个阶段复制一套平行工程。

### 图片承担主要视觉表达

图片、图片关系与图片运动应承接绝大多数内容。中文字幕和英文字幕是语言同步基础层，不计入图片表达，也不是核心卖点。

字幕之外的编辑文字默认不出现；只有在命名概念、锁定数字、标注证据、人物或地点、重大转折与 CTA 时才考虑使用。

判断图片是否成立时问：

> 去掉字幕之外的编辑文字，核心事实、变化、证据、关系和结论是否仍然能从图片中被看见？

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

当用户只给一个选题、一篇文章、已有文案、资料包或旧视频时，按 `episode-production.md` 中对应的输入类型开始，不要求用户重新填写整套表格。

### 用户正在观看预览并反馈

读：

- `references/core/quality-and-iteration.md`

先判断反馈属于内容、注意力、图片表达、节奏、声音、视觉风格还是技术实现，再修改正确层级。不要把“慢”一律翻译成全局加速，也不要把“高级一点”只翻译成换颜色。

### 生成 TTS、图片或字幕

按需读：

- `references/technical/providers.md`
- `references/technical/subtitles.md`

这些是执行附录，不是创作主流程。

### 需要完整参考

按需读 worked examples：

- `references/examples/knowledge-explainer.md`
- `references/examples/character-story.md`

案例用于理解方法，不要机械复制其结构或画面。

# Series vs Episode Boundary

Series initialization 定义可复用的长期决定。

它应回答：

- 这个系列是什么？
- 给谁看？
- 长期提供什么价值？
- 使用什么叙事、图片、视觉与声音身份？
- 如何保持长期一致？

它不应决定：

- 下一条视频讲什么；
- 某一期 Hook；
- 某一期故事结构；
- 某一期图片节拍；
- 某一期 HyperFrames 镜头。

这些全部属于 Episode Production。

# 流程一：系列初始化与视觉校准

## 1. 先读取已有信息

在提问前，查看用户已经提供的：

- 现有视频、文案和账号内容；
- 品牌手册、Logo、字体、颜色和素材；
- 喜欢与不喜欢的参考；
- 当前项目中的 `SERIES.md`、`DESIGN.md` 和旧校准片；
- 对话中已经决定的事项。

能从资料中得到的事实不要再问。提问只用于用户拥有决定权、且答案会明显影响长期系列配置或风格校准的事项。

## 2. 使用收敛式系列共创

一次只问一个问题，并给出 Agent 的推荐答案和理由。不要一次发送大型问卷。

每个问题应回答：

```text
为什么现在需要这个决定
基于现有信息，Agent 推荐什么
只问一个清晰问题
答案会改变哪项长期系列配置或风格校准
```

不要无休止追问。不要连续向用户提出超过四个问题而不进行一次总结、方案比较或小样转向。

## 3. 在 Series Ready 时停止追问

当以下信息足以支撑未来单集继承的长期配置时，停止纯访谈：

- 系列身份、观众与长期价值清楚；
- Narrative Contract 与 Meaning Anchor 清楚；
- 图片、视觉与声音身份可以复用；
- 品牌、来源、版权、隐私和生产配置清楚；
- 剩余未知只涉及未来题材例外或可通过风格校准判断的制作感受。

不要追问到“所有事情都确定”。颜色细差、运动速度、转场手感、TTS 细微语速等体验问题应通过无具体选题的 Series Style Calibration 解决。

## 4. 形成系列工作文件

由 Agent 根据对话整理，而不是让用户填写：

```text
SERIES.md
DESIGN.md
CALIBRATION.md
.env
```

`SERIES.md` 保存 Series Identity、Audience Profile、Narrative Contract、Image / Visual / Voice Identity 与 Production Configuration；`DESIGN.md` 是 HyperFrames 的可复用视觉身份；`CALIBRATION.md` 定义无具体选题的风格校准。Narrative Contract 用来设计观看现实，不承担真实性评分、AI 披露门或虚构检测。

## 5. 制作 HyperFrames 系列风格校准

Series Style Calibration 测试动态视觉身份，不是第一条视频样片。它只验证：

- 图片风格与处理方式；
- 竖屏布局和双语字幕；
- 运动与转场语言；
- TTS、音乐和声音气质；
- 可复用 HyperFrames 组件；
- Narrative Contract 在视觉世界中的一致性。

可使用抽象关系、通用素材、占位文本或组件演示；不得测试某个主题、Hook、故事结构、图片节拍或单集镜头。用户选中、混合或否定方向后，只更新 `SERIES.md`、`DESIGN.md` 和 calibration composition。

# 流程二：单集视频制作

## 1. 理解输入和最终回报

先确定用户给的是选题、资料、文章、完整文案、旧视频还是修改要求。提取已知内容，不要求重复输入。

在写 Hook 前先回答：

> 观众看完后，具体多获得了什么？

最终回报必须足以兑现开头承诺，并能由图片或图片关系呈现。

## 2. 设计注意力主干

在完整旁白之前设计：

```text
观看承诺
→ 第一层回报
→ 新证据 / 新问题 / 意义升级
→ 认知变化
→ 核心兑现
→ 开头回收或行动
```

注意力推进可以来自异常、证据、对比、揭示、升级、重构、局部回报和应用，不要机械使用“但是”和夸张悬念。

开头不确定时，在同一 HyperFrames 工程中做最多 3 个结构差异明显的 Hook 候选。候选必须在第一帧、图片关系或观看承诺上真正不同，而不只是换一句文案。

## 3. 写中文旁白并拆故事

旁白要短、具体、可视化。每个主要段落说明：

- 观众进入时在等待什么；
- 本段新增什么；
- 给出什么局部回报；
- 图片怎样让它成立；
- 通过什么视觉或问题进入下一段。

找不到图片表达时，优先改写文案、引入具体人物、行为、环境、证据或前后差异，不用大段编辑文字补洞。

## 4. 尽早做 Story Flow

使用占位图、参考图、简单图形和临时声音直接创建 HyperFrames Story Flow。先搭静态英雄帧，再加入粗略运动和语义转场。

让用户观看整条视频的观看动力：第一层回报是否太晚、中段是否变平、反转是否有证据、结尾是否兑现。

## 5. 设计图片节拍并升级为 Animatic

在 `STORYBOARD.md` 中设计每个图片节拍：

- 这一拍完成什么注意力与叙事任务；
- 图片具体证明什么；
- 第一眼看什么，随后发现什么；
- 图片怎样进入、发展、强调和交接；
- 双语字幕安全区；
- 是否需要编辑文字。

同一张图片可以通过裁切、拉远、局部揭示、层级变化和图形连接承担多个节拍。不要默认一句旁白配一张图，也不要让所有画面都慢推近。

把占位画面升级为 Image Animatic，再交给用户观看。

## 6. 生成正式声音并制作 Timed Animatic

用户认可文案和图片方向后：

1. 将最终中文旁白写入 `narration.txt`；
2. 调用 `scripts/generate-tts.mjs` 生成火山 TTS；
3. 使用 HyperFrames transcribe 获取时间参考；
4. 生成自然英文字幕；
5. 将正式声音与双语字幕加入同一 HyperFrames 工程；
6. 依据真实时间重新导演图片停留、运动和转场。

实际 TTS 使某段过长时，优先删减或重写内容；只有语气问题才调整语速。

## 7. 生成最终图片并精修

用户认可 Timed Animatic 后，把图片需求整理到 `image-prompts.json`，再调用 `scripts/generate-images.mjs`。

Prompt 应包含图片的叙事任务、可见证据、构图、字幕安全区、运动余量和前后衔接，不只写表面题材和风格。

把生成结果放回 HyperFrames。用户不满意时，根据问题修改：视觉任务、构图、连续性、Prompt 或图片方案，而不是反复使用同一个 Prompt 抽卡。

## 8. 完成、审片与渲染

使用 HyperFrames、GSAP、字幕、转场、声音和音乐能力精修。按 `quality-and-iteration.md` 分轮观看并主动给出导演建议。

技术检查：

```bash
npx hyperframes lint
npx hyperframes inspect
npx hyperframes validate
npx hyperframes preview
```

用户观看并确认后：

```bash
npx hyperframes render --quality high --output final.mp4
```

# HyperFrames 能力路由

HyperFrames 是制作环境，不是 FrameSpine 之外的新创意体系。先由 Attention Spine 和 Image Storytelling 决定图片要表达什么，再按实际制作需要读取已安装的 HyperFrames 能力。

| 使用频率 | 能力 | 用途 |
| --- | --- | --- |
| Required｜必需 | `hyperframes` / `hyperframes-core` | composition、Scene、预览与渲染的技术合同。 |
| Required｜必需 | GSAP / Motion | 图片运动与时间节奏。 |
| Common｜常用 | Transitions | 建立前后图片的关系。 |
| Common｜常用 | Typography | 少量编辑文字与字幕层级。 |
| Basic｜基础 | Captions | 稳定的中英文字幕。 |
| Conditional｜条件使用 | Data visualization、Audio reactive、Shader、advanced effects | 仅当内容确实需要时使用。 |
| Execution｜执行 | `hyperframes-cli` | 初始化、检查、预览、转写与渲染。 |

`references/core/hyperframes-directing.md` 只说明这些能力在图片主导视频中的导演用途；HyperFrames 自身 Skill 仍是 composition 技术规则的唯一来源。不要为此发明新的协议、Schema、Pattern 系统或自动判断层。

# 配套脚本边界

首版脚本只负责执行：

```text
init-series.mjs      创建系列工作区
init-episode.mjs     创建单集工作区
generate-tts.mjs     调用火山 TTS
generate-images.mjs  调用第三方 GPT Image 2
```

脚本不判断 Hook、图片、节奏或风格是否合格，不记录用户批准，不自动推进阶段，也不生成通用 HyperFrames composition。
