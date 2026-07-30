# HyperFrames 在图片主导视频中的导演使用方式

## 这份 reference 的位置

HyperFrames 是 FrameSpine 的**视觉制作环境**，不是新的创意架构层。

```text
Attention Spine
        ↓
决定观众理解什么

Image Storytelling
        ↓
决定图片表达什么

HyperFrames Production
        ↓
决定图片如何在时间中被理解
```

FrameSpine 负责内容判断、图片任务和观看路径；HyperFrames 负责将已经成立的图片、字幕、声音和场景实现为可播放的 composition。单集的实际字幕只从 Episode 根目录的 `captions.json` 读取；不要在 Composition 中重切 `SCRIPT.md` 或 `STORYBOARD.md`。

不要建立平行的 Scene Recipe Library、Animation Pattern System、
Visual Enhancement System、数据协议、Schema 或自动判断层。

## Core Principle

FrameSpine is image-first.

Images carry the story.

HyperFrames does not create meaning by adding effects.

HyperFrames helps viewers:

- notice important parts of an image;
- understand relationships between images;
- feel changes over time;
- follow the intended visual path.

The first question is never:

> What animation should we add?

The first question is:

> What should the viewer understand from this image?

如果答案不清楚，回到 Attention Spine、旁白、图片选择或构图。不要用效果补偿薄弱叙事。

### 新增视觉处理是候选，不是默认合并

原图、字幕和用户在当前任务中明确指定的元素之外，任何视觉处理都先是候选：例如额外动效、编辑文字、装饰图形、遮罩、滤镜、光效、粒子、背景纹理、数据图形、强化转场、强调标记和音效驱动视觉元素。

先在 Studio 中单独展示它解决的观看问题与出现位置；展示后停止。只有用户在后续消息中明确确认，才可把它合并到成片。不能因为它“更有质感”、CLI 可运行或 Agent 认为有效就直接加入。这个对话边界不需要状态文件或批准记录。

## HyperFrames Production Contract

这部分不复制 HyperFrames API，而是规定 FrameSpine Agent 必须怎样使用官方合同；它不创建平行 Schema、Recipe Library 或新的制作架构。

### 先读取正式 Skills

开始创建或修改 `video/` Composition 前，必须读取已安装的 `hyperframes` / `hyperframes-core` Skill；使用 GSAP 或 Motion 时读取对应 Skill，使用正式转场时读取 Transitions，使用字幕时读取 Captions，使用编辑文字时读取 Typography。不得只读 FrameSpine reference 后凭经验实现 Composition。

### Beat Contract

每个 Beat 默认只有一个主要观看任务和一个主要视觉事件，按以下顺序实现：

```text
Hero Frame
→ Entry
→ Development
→ Emphasis
→ Handoff
```

次要运动只能支持主视觉事件，不能与它争夺焦点；“需要静止以便阅读”也是有效实现，不能机械要求每张图都运动。

### Media Fit Contract

全屏叙事图片默认必须以符合 HyperFrames 正式媒体布局的 cover / crop 覆盖竖屏画布：不得直接拉伸；在运动起点、终点和最大偏移时都不得露出画布外空白；安全裁切须保护人物、手、产品、证据和字幕区。`contain`、留黑、画中画或上下框只在明确的叙事构图中使用，并在 `STORYBOARD.md` 写明原因。非设计性的黑边或大面积空底属于 P0 blocker。

### Scene / Layer Lifecycle

每个 Scene 必须明确哪些层进入、在 Scene 内持续、在 Handoff 时交给下一 Scene，以及在 Scene 结束时必须退出。禁止旧 Scene 图层无限保留、多张全屏图片长期叠放、只用 `z-index + opacity` 模拟场景切换、上一个 Transition 未结束就开启新的主运动，或在 Scene 外维护第二套时间逻辑。

### Transition Contract

每个转场先声明关系，再选择正式 Transition 或同一 Scene 内连续构图：Object Continuity、Movement Continuity、Spatial Continuity、Cause → Effect、Question → Answer、Surface → Reveal、Before → After 或 Emotional Change。若说不清关系，默认使用干净 hard cut 或保持同一 Scene；不得堆 wipe、zoom、glitch、mask 和 shader。

### Timeline Contract

以 Scene、Beat 和正式 cue 组织时间，避免大量 magic offsets 与相互覆盖的绝对时间偏移。Story Flow、Image Animatic、Timed Animatic 和 Final 使用同一条逐步成熟的时间线；Final 只精修已通过的结构，不重建第二套剪辑。Timed Animatic 及其后的实际字幕只读取 `captions.json`；Story Flow 可使用清楚标示的临时字幕占位，但不得把占位文字或时间当作正式字幕时间轴。

### HyperFrames Self-Review

交付预览前，在 Studio 完整播放，并在每个 Scene 的进入前、进入完成、主要揭示时刻、转场重叠区、结束前和下一 Scene 稳定后检查旧层残留、露底、黑帧/空帧、主体越界、多个主运动、转场关系，以及 Timed Animatic 及之后由 `captions.json` 驱动的字幕。再按当前阶段与实际风险运行官方 lint / inspect / validate / preview；工具报告不能替代完整播放。

## 什么时候读取

在以下情况读取本文件：

- 制作 Series Style Calibration；
- 创建或修改单集的 Story Flow、Image Animatic、Timed Animatic 或 Final；
- 判断一张图该保持静止、运动、揭示、强调，还是和下一张图建立关系；
- 用户反馈图片像 PPT、节奏不清、切换突兀或特效过多；
- 需要选择 HyperFrames 的具体 Skill。

先读 `episode-production.md`、`attention-spine.md` 和
`image-storytelling.md`，再进入 HyperFrames 制作。

## 一、Image Motion｜图片运动

### 运动何时有用

让已经成立的静态图片拥有时间感。适合：

- 建立空间；
- 增强情绪；
- 引导视线；
- 让观众从整体走向关键细节，或从细节看见环境。

### 使用原则

先判断图片本身是否已经成立。

如果图片已经能表达，可使用克制的：

- camera movement；
- scale；
- pan；
- parallax。

如果图片不能表达，不要增加运动。回到：

- 文案；
- 图片选择；
- 构图；
- 可见证据。

一张图片的运动应能说明：观众先看什么、随后发现什么，或离开前要把什么交给下一拍。

### 避免

不要：

- 每张图片固定慢推；
- 没有新信息的移动；
- 为了“高级感”而移动；
- 让所有元素持续运动。

重要证据、情绪和核心回报需要阅读时间。保持静止常常比再加一个 Tween 更有力量。

## 二、Image Reveal｜图片揭示

### 揭示何时有用

控制观众发现一张图片内信息的顺序。

适合一张图片包含多个信息层的情况。例如办公室图可以让观众依次看见：

```text
人物压力
→ 手机通知
→ 造成压力的环境关系
```

### 使用原则

不要问“哪里加动画？”，而要问：

> 观众应该先看到什么，再发现什么？

可使用：

- mask；
- crop；
- layered image；
- opacity；
- timing。

揭示必须释放图片中原本就存在、且叙事需要的信息。不要把无关元素逐个飞入，制造虚假的复杂度。

## 三、Image Transition｜图片转场

### 转场何时有用

让相邻图片产生关系，避免：

```text
图片 A
↓
图片 B
↓
图片 C
```

看起来像幻灯片。

### 先判断关系

先说清前后图片的关系，再选择最小的实现方式。

#### Object Continuity

上一张是手机，下一张进入手机里的内容。

#### Movement Continuity

上一张人物向右看，下一张进入右侧空间。

#### Concept Continuity

上一张呈现结果，下一张解释原因。

也可以通过共同物体、方向、动作、轮廓、色块、因果结果或构图延续建立关系。

### 实现

按需要使用：

- transitions；
- matching movement；
- scene continuation；
- 同一 Scene 内的连续构图。

转场不是 Scene 结束后附加的效果，而是两张图片共同完成的视觉交接。不要先选 wipe、glitch 或 shader，再为它编造关系。

## 四、Image Emphasis｜图片强调

### 强调何时有用

帮助观众注意关键区域。

适合：

- 证据；
- 文件；
- 细节；
- 关键人物动作；
- 一个需要命名的核心概念。

### 使用

优先使用最小变化：

- crop；
- focus；
- highlight；
- typography。

强调应帮助读图，而不是取代读图。图片、旁白和字幕已经清楚时，不需要额外强调。

### 限制

不要：

- 每句话都高亮；
- 满屏标签；
- 用文字替代图片表达；
- 同时使用多种强调手段争夺焦点。

## 五、最小的制作循环

### 1. 先做静态英雄帧

每个 Scene 先确定一个静态时刻：信息完整、观看顺序清楚、主体和字幕安全区都正确。

先解决：

- 图片裁切和主体位置；
- 竖屏构图；
- 双语字幕安全区；
- 必要的证据或少量编辑文字；
- 前景、主体与背景层级。

静态画面不成立时，不开始动画。

### 2. 再选择最小的视觉变化

对每个图片节拍依次回答：

1. 这张图片为什么存在？
2. 观众应该先看到什么？
3. 随后需要发现什么？
4. 下一张图片是否需要明确关系？
5. 什么最小变化能帮助理解？

答案可能是 motion、reveal、transition、emphasis，也可能是**不动**。

### 3. 在同一个项目中逐步成熟

单集默认只维护一个 `video/` HyperFrames 项目：

```text
Story Flow
→ Image Animatic
→ Timed Animatic
→ Final Composition
```

- **Story Flow**：用占位图、临时声音和粗略变化检查观看动力；
- **Image Animatic**：检查图片任务、观看顺序、构图和图片交接；
- **Timed Animatic**：加入正式 TTS 与 `captions.json` 的真实字幕时间，重排停留和节奏；
- **Final**：替换最终素材并精修，不重做已经通过预览的内容结构。

Series Style Calibration 同样使用 HyperFrames，但它只验证可复用的视觉、声音和运动身份；不测试主题、Hook、故事或单集镜头。

### 4. 以播放预览沟通

给用户观看实际 HyperFrames Studio URL 与 route，而不是让用户审 HTML、CLI 输出或导出文件。

每轮指出具体观看问题，例如：

> 请重点看这张证据图是否先建立整体，再让关键数字变得可读；以及下一张图是否自然接住这个数字。

用户说“慢”或“太花”时，先判断问题属于内容、图片、构图、信息顺序还是时间，再修改对应层级。不要把反馈自动翻译为全局加速或增加特效。

### Studio 是创意预览的事实来源

创意预览以用户实际打开的 HyperFrames Studio URL 与 route 为准，按以下顺序工作：

```text
启动 Studio
→ 获取用户将打开的 URL 与 route
→ 在该 route 检查真实资源
→ 确认首拍、中段关键拍与结尾拍可见
→ 确认图片和字幕没有空白
→ 再运行 lint / inspect / validate
→ 用户确认 Final Preview 后才 render
```

CLI snapshot、lint、inspect、validate 与 render 只能证明各自的技术结果，不能证明 Studio 中图片可以加载、Storyboard 卡片不是空白、用户访问的是同一路径、字幕与主体关系成立，或视频具备可审片性。

若 Agent 无法亲自查看 Studio UI，必须明确说明无法验证用户实际看到的内容，并先解决真实预览访问；不得从文件存在或 CLI 成功推断 Studio 可见，也不得把未经视觉自审的地址作为阶段预览交付。

### Storyboard Preview Contract

`STORYBOARD.md` 是导演计划，不是可视化 Storyboard，也不构成用户预览。使用 HyperFrames Storyboard 时：

- 每个 Frame 必须有可渲染的 `src` composition；
- 每个主要 Beat 必须在 Studio 中出现实际画面；
- 第一拍、中段关键拍与结尾拍必须逐一检查；
- Markdown、Prompt、资产路径、outline、空白卡片或只有标题的卡片不能替代 Frame preview；
- 任一关键 Frame 空白、资源加载失败或没有可渲染 `src` 时，停止当前阶段并修复；不得继续 TTS、字幕或 Final。

## 六、HyperFrames Skill 引用策略

HyperFrames 的技术合同由其自身 Skills 和官方 references 维护；本文件不复制平行实现规则。

| 使用频率 | 能力 | 何时使用 |
| --- | --- | --- |
| Required｜必需 | `hyperframes` / `hyperframes-core` | composition、Scene、媒体、预览和 render。 |
| Required｜必需 | GSAP / Motion | 图片运动与时间节奏。 |
| Common｜常用 | Transitions | 相邻图片需要明确关系时。 |
| Common｜常用 | Typography | 少量编辑文字和字幕层级。 |
| Basic｜基础 | Captions | 稳定的中英文字幕。 |
| Conditional｜条件使用 | Data visualization | 内容需要解释数据、数字或机制时。 |
| Conditional｜条件使用 | Audio reactive | 音乐确实驱动画面节奏时。 |
| Conditional｜条件使用 | Shader / advanced effects | 视觉世界转换或核心内容确实需要时。 |
| Execution｜执行 | `hyperframes-cli` | 初始化、检查、预览、转写和渲染。 |

不要为了“最大化使用工具”而加载所有能力。尤其不要默认使用数据图、音频响应、shader 或高级特效。

## 七、技术检查的边界

迭代中按需运行：

```bash
npx hyperframes lint
npx hyperframes inspect --at <关键时刻>
npx hyperframes preview
```

Final Preview 前按需运行：

```bash
npx hyperframes lint
npx hyperframes validate
npx hyperframes inspect --samples 15
```

只有用户在观看 Final Preview 后于后续消息明确允许导出，才运行：

```bash
npx hyperframes render --quality high --output final.mp4
```

工具可以发现布局溢出、媒体路径、时间线、字幕和渲染问题；它们不判断 Hook 是否成立、图片是否有意义，或用户是否喜欢。报告时只能说“lint 通过”“validate 未发现时间线错误”“render 命令成功”或“资源文件存在”；不得因此说视频已完成、Storyboard 已通过、图片叙事已成立、用户可以验收或视觉方向已经确认。

最终约束：

> **FrameSpine 用 HyperFrames 让图片更容易被理解，而不是用 HyperFrames 制造更多视觉效果。**
