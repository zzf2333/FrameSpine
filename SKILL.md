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

### 用户通过真实预览验收

内容、Hook、图片、节奏、声音、风格和动效都由用户观看实际 HyperFrames 预览后判断。不要建立创意审批状态机、自动通关分数或失效传播系统。

技术工具只诊断技术问题，例如媒体损坏、布局溢出、时间线错误、字幕遮挡和渲染失败。

### 先展示，再推进

> **不静默跨阶段。每个创作成熟阶段都必须先产生用户能实际观看的 HyperFrames 预览；展示后立即结束当前回复。只有用户在后续消息中明确同意继续，才能进入下一阶段。**

FrameSpine 默认一次只推进一个创作成熟阶段：

```text
Story Flow
→ Image Animatic
→ Timed Animatic
→ Final Composition
```

Agent 不得在同一轮完成两个成熟阶段。即使用户要求“直接做完整成片”或“跳过中间审片”，也必须先完成当前阶段的真实 Studio Preview、展示后停止，并等待用户在**后续消息**中对下一阶段的明确许可。每个阶段都必须：

1. 在真实 HyperFrames Studio 中形成可完整播放的预览；
2. 验证用户将打开的实际 Studio URL 与 route 能加载该阶段的真实资源；
3. 在回复中给出预览位置、当前完成内容、本轮审片重点与仍未完成/仍为占位的内容；
4. 明确说出本轮不会进入哪些下游工作；
5. **停止当前工作并等待用户下一条消息。**

用户未回复、CLI 通过、Markdown 或文件存在、MP4 成功导出、Agent 自评通过，都不是进入下一阶段的许可。用户最初说“做一个视频”也不等于授权跳过全部中间审片。

**No approval state machine does not mean no review boundary. The boundary lives in the conversation, not in a status file.** 不建立状态文件、`approved=true`、自动评分或跨文件批准记录；但真实对话中的四个停步不能省略。

### Collaborative Stage Handoff｜协作式阶段交接

FrameSpine 不是一次性自动生成器，而是 Agent 与用户通过真实预览共同导演、逐步降低不确定性的视频制作。实现细节由 Agent 承担；会改变视频方向、返工成本或用户判断的创作决定必须对用户透明。

每次进入四个成熟阶段前，Agent 先简洁说明：本阶段目标、会完成的创作工作、明确不会做的下游工作，以及完成后用户需要判断什么。不要汇报普通命令、文件创建、CSS 属性或中间缓存。

完成后，不能只丢链接或说“已完成”。交接必须结合当前阶段，说明实际完成了什么、重要导演选择及其原因（必要时说明代价或备选）、Preview Readiness 自审与修复、仍为占位或未完成的内容、本轮应重点判断的问题、可供选择的少量方向和推荐，以及用户确认后下一阶段会投入什么、仍不会做什么。展示真实 Studio Preview 后立即停止。

这是一套对话行为，不是状态机或审批日志；`EPISODE.md` / `STORYBOARD.md` 只可简洁保留仍会影响后续制作的用户创作决定，不能记录批准历史。

### Agent 自审先于用户审片

用户负责判断创意、表达、节奏与审美是否成立；Agent 负责保证交给用户的预览真实可看、符合当前阶段成熟度，并且没有明显低级错误。每个成熟阶段在 `Required Preview` 前必须完成一次 **Preview Readiness Review**：

```text
制作当前阶段
→ 在真实 Studio 中完整播放
→ 使用 HyperFrames 工具检查关键时刻和技术问题
→ 修复 P0 阻断问题
→ 回到同一 Studio route 重新播放
→ 才能展示给用户
→ 展示后停止
```

仍存在任一与当前成熟阶段相关的 P0 阻断问题时，不得请求用户审片。CLI 通过、文件存在、render 成功或只看单张截图，都不构成 Preview Ready。若 Agent 无法获得真实像素级 Studio 预览，必须说明视觉自审受阻并先解决预览访问；不得猜测画面正确、把用户当作第一轮 QA，或把未自审的地址作为阶段预览交付。

### 新增视觉处理先预览

> **不是原图、字幕或用户在当前任务中明确指定的元素，就先作为候选 Studio Preview；未经用户在后续消息中确认，不得并入成片。**

任何新增视觉处理必须说明它要解决的具体观看问题、出现的位置与仍属候选的状态，展示后立即停止。它包括但不限于：额外动效、编辑文字、装饰图形、遮罩、滤镜、光效、粒子、背景纹理、数据图形、强化转场、强调标记和音效驱动视觉元素。

原图、字幕和用户在当前任务中明确指定的元素不受此规则限制。此规则不建立批准记录；候选是否合并只由用户观看预览后的下一条消息决定。

### 制作能力厚，控制层薄

优先投入：

- 内容设计；
- 图片叙事；
- HyperFrames 导演能力；
- 低成本动态原型；
- 用户反馈后的针对性修改；
- TTS、图片和声音的正式生产。

不要为了第一版提前建设复杂 Schema、跨文件校验、创意评分器或通用 HTML 编译器。薄控制层不是没有边界，而是只保留少量、清晰、可观察的边界：Story Flow 预览、Image Animatic 预览、Timed Animatic 预览与 Final Preview。

### HyperFrames 技术合同不可替代

创建或修改任何 `video/` Composition 前，Agent 必须读取已安装的 `hyperframes` / `hyperframes-core` Skill；并按实际镜头需要读取 Motion / GSAP、Transitions、Captions 或 Typography Skill。FrameSpine 只决定叙事任务、图片任务和观看路径；Composition、Scene、Timeline、Transition、Caption、媒体加载、预览和 render 必须服从 HyperFrames 正式技术合同。

不得只读 FrameSpine reference 后凭经验自行发明平行实现，也不得用缺少明确 Scene / Transition 生命周期的绝对定位图层、透明度堆叠或随意时间偏移模拟 HyperFrames 剪辑。

### 同一个 HyperFrames 项目逐步成熟

每期默认维护一个真实的 `video/` 项目：

```text
Story Flow
→ Image Animatic
→ Timed Animatic
→ Final Composition
```

使用占位图、临时声音和粗略运动尽早播放；方向稳定后再替换正式声音、最终图片和精细动画。不要为每个阶段复制一套平行工程。

### 一个项目只容纳一个系列

项目根目录就是系列根目录，`SERIES.md`、`DESIGN.md`、`CALIBRATION.md`、`calibration/` 和 `episodes/` 直接位于其中。初始化时不要再按系列名称创建一层子目录；项目中已有的 `.agents/` 等工具配置不影响初始化。

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

用户提供完整文案时，额外读 `references/core/narrative-directing.md`：默认进入 Locked Script Mode，将原文保存到 `SCRIPT.md`，提取而不重构其 Attention Spine，保留原句、顺序、互动与停顿。用户只给选题、文章或资料时使用 Development Mode；只有明确要求修改文字时才进入 Revision Mode。

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
- `references/examples/locked-script-directing.md`（定稿文案导演案例）

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

## 1. 按输入进入正确导演路径

先确定用户给的是选题、资料、文章、完整文案、旧视频还是修改要求。提取已知内容，不要求重复输入。

- **Locked Script Mode**：完整用户文案是 `SCRIPT.md` 中的锁定源文本。先读懂讲述者、事件链、好奇、认知/情绪/关系变化，再 Extract Attention Spine、按原文分段、设计图片节拍和 Story Flow。不得默认重写 Hook、结尾、句子或顺序，也不得因为时长删稿。
- **Development Mode**：选题、文章和资料先确定最终回报，再 Build Attention Spine、发展旁白并图片化。
- **Revision Mode**：只在用户明确要求改稿时，在允许范围内修改并保留原稿的讲述者、互动和节奏功能。

## 2. 设计或提取注意力主干

Development Mode 在完整旁白之前设计：

```text
观看承诺
→ 第一层回报
→ 新证据 / 新问题 / 意义升级
→ 认知变化
→ 核心兑现
→ 开头回收或行动
```

注意力推进可以来自异常、证据、对比、揭示、升级、重构、局部回报和应用，不要机械使用“但是”和夸张悬念。

开头不确定时，Development Mode 或获授权的 Revision Mode 可在同一 HyperFrames 工程中做最多 3 个结构差异明显的 Hook 候选。Locked Script Mode 只探索第一帧和图片关系，不改动开头原句。

## 3. 发展旁白或导演定稿文案

Development / Revision Mode 的旁白要短、具体、可视化。每个主要段落说明：

- 观众进入时在等待什么；
- 本段新增什么；
- 给出什么局部回报；
- 图片怎样让它成立；
- 通过什么视觉或问题进入下一段。

Development / Revision Mode 找不到图片表达时，可改写文案、引入具体人物、行为、环境、证据或前后差异，不用大段编辑文字补洞。Locked Script Mode 保留文本，改为寻找原文中的人物、动作、物件、环境、证据、情绪和前后状态。

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

用户认可文字和图片方向后：

1. 将权威中文旁白保存在 `SCRIPT.md`，由默认 TTS 命令同步派生的 `narration.txt`；
2. 调用 `scripts/generate-tts.mjs` 生成火山 TTS；
3. 使用 HyperFrames transcribe 获取词级时间参考；
4. 按语义、声音与图片节拍写入 Episode 根目录的 `captions.json`：包含 Display Text、自然英文、时间、人工换行和关联 Beat；
5. 让 HyperFrames 只读取 `captions.json` 显示双语字幕，不在 Composition 中从 `SCRIPT.md`、`STORYBOARD.md` 或固定字数临时重新切分；
6. 将正式声音与 `captions.json` 字幕加入同一 HyperFrames 工程；
7. 依据真实时间重新导演图片停留、运动和转场。

实际 TTS 使某段过长时，Locked Script Mode 先调整节拍、停留、声音分段、目标时长或建议拆集；只有用户明确允许才改稿。Development / Revision Mode 才考虑删减或重写内容；只有语气问题才调整语速。

## 7. 生成最终图片并精修

用户认可 Timed Animatic 后，把图片需求整理到 `image-prompts.json`，再调用 `scripts/generate-images.mjs`。

按实际素材而非 Beat 一一整理 `image-prompts.json`：一个 Beat 可使用多张素材，一张素材也可跨多个 Beat。`purpose`、`role`、`references` 和 `used_in_beats` 只是导演上下文，Provider 不会自动收到；所有影响生成的要求必须实际编入 `prompt`。将素材专属的 Entity / Environment / Medium / Relationship Anchors、构图与观察方式、媒介实现、媒介一致性、制作余量与风险写入逐素材 Brief，不要混在 Beat 的图片组合任务中。Prompt 依次写叙事任务、可见证据、继承锚点、构图与观察方式、媒介实现、材质/世界一致性、字幕安全区与运动余量、相关系列配方和失败约束；不只写表面题材和风格，也不以风格形容词开头。

逐素材完成 Prompt Audit 后，再完成 Image Set Audit，检查整组角色分布、观察方式、主体状态、媒介表现、功能性细节与观看任务不会同质化；这两项是 Agent 的人工导演检查，不是脚本评分或批准状态。`prompt` 留空会令脚本安全报错，绝不在实际字段放教学说明。先生成视觉世界锚点、第一帧、长期主体、核心重构、机制和结尾回收等高风险素材；在同一真实竖屏 HyperFrames Composition 中应用 cover/crop、字幕安全区、推拉与 Handoff 后再判断。用户不满意时，根据问题修改：视觉任务、锚点/参考、构图、连续性、Prompt 或图片方案，而不是反复使用同一个 Prompt 抽卡。不要在这一原则上建设自动 Prompt 编译器。

## 8. 完成、审片与渲染

使用 HyperFrames、GSAP、字幕、转场、声音和音乐能力精修。按 `quality-and-iteration.md` 分轮观看并主动给出导演建议。

先启动 Studio，取得用户实际打开的 URL 与 route，并确认首拍、中段关键拍、结尾拍以及最终图片、声音和字幕均可见、可加载且无遮挡。只有这份 Studio Final Preview 可以交给用户观看。

在 Studio route 已确认后，再运行技术检查：

```bash
npx hyperframes lint
npx hyperframes inspect
npx hyperframes validate
npx hyperframes preview
```

修复后回到同一 Studio route 复查，并展示 Final Preview 后结束当前回复。只有用户在**后续消息**明确允许导出，才运行：

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
