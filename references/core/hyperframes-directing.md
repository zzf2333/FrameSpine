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

### Motion Affordances 来自系列配方

HyperFrames 不默认使用摄影式推拉、平移或视差。每次实现前读取 `DESIGN.md` 的 `Motion Affordances`：摄影媒介可以使用推拉、平移和空间视差；漫画可以使用分格揭示、黑白面积变化和连续构图；剪纸可以使用纸层滑动、翻折、抬起和层间投影；其他媒介按自身结构执行。

FrameSpine 只要求 Entry / Development / Emphasis / Handoff 成立，不规定它们必须通过摄影式运动完成。`Motion Affordances` 是媒介能力边界；`Motion Language` 才是系列对这些能力的实际取舍。

### 实质偏离才作为候选单独预览

在已确认的当前阶段方向、`DESIGN.md`、`Motion Language`、素材 Brief 与用户明确要求范围内，Agent 可以正常实现并自审普通制作动作；用户审的是方向和阶段成果，不是每一个 Tween、遮罩或标记。

以下普通处理不需要逐项重新请求确认，只要它们服务既有观看任务且不改变已确认方向：cover / crop、必要遮罩、已计划的 Reveal、字幕安全处理、证据标记、当前 `Motion Language` 内的运动，以及 Scene / Layer 生命周期修复。

只有新增处理会**实质改变**以下任一项时，才先在 Studio 作为候选单独展示其观看问题、出现位置与代价，并停止等待用户在后续消息决定是否合并：

- 已确认的 Visual Medium 或媒介配方；
- 叙事意义、Attention Path 或主要视觉事件；
- 长期系列基线；
- 可复用组件或会被后续多期继承的处理；
- 明显提高返工成本的方向变化。

不能因为它“更有质感”、CLI 可运行或 Agent 主观偏好，就把实质方向变化直接并入。这个对话边界不需要状态文件或批准记录，也不替代每个成熟阶段完成后必须展示真实 Studio Preview 并等待后续用户消息的停止边界。

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

### Storyboard Surface 与 Composition Surface

两种官方审查表面承担不同任务，不得互相代替：

- **Storyboard Surface**：只用于 Story Flow，按顺序审查 Scene / Beat / Frame、对应原文、图片任务、图片角色、连续性、风险、占位状态和前后关系。每个 item 必须有可渲染 `src`，但不要求组成时间播放。
- **Composition Surface**：从 Image Animatic 开始，用于审查时长、停留、运动、Reveal、转场、字幕、声音与从头到尾的完整播放。

不得用自定义说明网页、名为“Storyboard”的普通 Composition、Player 粗视频、`STORYBOARD.md` 文本、outline 或空白卡片替代官方 Storyboard surface；也不得用 Storyboard contact sheet 替代 Image Animatic 及之后的 Composition 播放。

### Timeline Contract

Story Flow 先在官方 Storyboard surface 确认 Scene / Beat / Frame 结构，不建立完整播放时间线。用户确认后，Image Animatic 才把 Storyboard Cards 转为以 Scene、Beat 和 cue 组织的第一条完整时间线；Timed Animatic 和 Final 在这条时间线上逐步成熟，避免大量 magic offsets 与相互覆盖的绝对时间偏移。Final 只精修已通过的结构，不重建第二套剪辑。Timed Animatic 及其后的实际字幕只读取 `captions.json`；Image Animatic 可以使用清楚标示的临时字幕或时间占位，但不得把它们当作正式字幕时间轴。

### HyperFrames Self-Review

Story Flow 交付前，在官方 Storyboard surface 从上到下检查全部 item 的顺序、可渲染 `src`、实际 Frame、缺失、重复、连续性、占位与高风险状态，不要求完整播放。Image Animatic 及之后才在 Studio 完整播放，并在每个 Scene 的进入前、进入完成、主要揭示时刻、转场重叠区、结束前和下一 Scene 稳定后检查旧层残留、露底、黑帧/空帧、主体越界、多个主运动、转场关系，以及 Timed Animatic 及之后由 `captions.json` 驱动的字幕。再按当前阶段与实际风险运行官方工具；工具报告不能替代对应 surface 的视觉检查。

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

如果图片已经能表达，按 `DESIGN.md` 的 `Motion Affordances` 和 `Motion Language` 选择最小、媒介相符的实现。例如可以是摄影式推拉、平移与空间视差，也可以是漫画分格揭示、黑白面积变化、连续构图，或剪纸纸层滑动、翻折与投影变化。

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

- **Story Flow**：在官方 Storyboard surface 用按序、可渲染的低成本 Frame Cards 检查 Scene / Beat、图片任务、连续性和前后关系；不制作完整时间播放；
- **Image Animatic**：把已确认 Cards 转为第一次从头到尾可播放的 Composition，检查停留、观看动力、粗略运动、Reveal、构图和图片交接；
- **Timed Animatic**：加入正式 TTS 与 `captions.json` 的真实字幕时间，重排停留和节奏；
- **Final**：替换最终素材并精修，不重做已经通过预览的内容结构。

Series Style Calibration 同样使用 HyperFrames，但它只验证可复用的视觉、声音和运动身份；不测试主题、Hook、故事或单集镜头。

### 4. 以匹配阶段的官方 surface 沟通

Story Flow 给用户浏览实际 HyperFrames Storyboard URL 与 route；Image Animatic、Timed Animatic 和 Final 给用户观看实际 Composition URL 与 route。不要让用户审 HTML、CLI 输出、导出文件或自定义说明页面。

每轮指出具体观看问题，例如：

> 请重点看这张证据图是否先建立整体，再让关键数字变得可读；以及下一张图是否自然接住这个数字。

用户说“慢”或“太花”时，先判断问题属于内容、图片、构图、信息顺序还是时间，再修改对应层级。不要把反馈自动翻译为全局加速或增加特效。

### Studio 是创意预览的事实来源

创意预览以用户实际打开的 HyperFrames Studio URL 与 route 为准。Story Flow 使用 Storyboard route，逐卡检查顺序、`src`、实际 Frame、连续性和占位；Image Animatic 及之后使用 Composition route，检查完整时间播放：

```text
启动 Studio
→ 获取用户将打开的 Storyboard / Composition URL 与 route
→ 在匹配当前阶段的官方 surface 检查真实资源
→ Story Flow：逐卡确认首拍、中段关键拍、结尾拍与全部主要 Beat
→ Image Animatic 及之后：确认首拍、中段关键拍、结尾拍、图片和字幕没有空白
→ 按当前阶段运行必要的官方检查
→ 用户确认 Final Preview 后才 render
```

CLI snapshot、lint、inspect、validate 与 render 只能证明各自的技术结果，不能证明 Studio 中图片可以加载、Storyboard 卡片不是空白、用户访问的是同一路径、字幕与主体关系成立，或视频具备可审片性。

若 Agent 无法亲自查看 Studio UI，必须明确说明无法验证用户实际看到的内容，并先解决真实预览访问；不得从文件存在或 CLI 成功推断 Studio 可见，也不得把未经视觉自审的地址作为阶段预览交付。

### Storyboard Preview Contract

`STORYBOARD.md` 是导演计划，不是可视化 Storyboard，也不构成用户预览。Story Flow 必须使用 HyperFrames 官方 Storyboard surface：

- 将全部需要审查的 Scene / Beat 注册为按序 Storyboard items；
- 每个 Frame 必须有可渲染的 `src` composition；
- 每个主要 Beat 必须在 Studio 卡片中出现低成本实际画面；
- 卡片主体是视觉 Frame，核心导演任务直接可见或可查，详细字段可留在 Markdown / 展开内容；
- 第一拍、中段关键拍与结尾拍必须逐一检查；
- 自定义说明网页、普通 Composition、Player 粗视频、Markdown、Prompt、资产路径、outline、空白卡片或只有标题的卡片不能替代官方 Storyboard Preview；
- Story Flow 卡片不提前实现完整动画、正式声音或最终图片；
- 任一关键 Frame 空白、资源加载失败或没有可渲染 `src` 时，停止当前阶段并修复；不得进入 Image Animatic、TTS、字幕或 Final。

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
