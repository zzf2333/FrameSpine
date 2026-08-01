# 单集视频制作：从选题到可发布成片

## 目录

1. [核心思路](#核心思路)
2. [先判断用户给了什么](#先判断用户给了什么)
3. [生产成本阶梯](#生产成本阶梯)
4. [阶段一：单集意图与最终回报](#阶段一单集意图与最终回报)
5. [阶段二：注意力主干与 Hook Lab](#阶段二注意力主干与-hook-lab)
6. [阶段三：旁白与故事段落](#阶段三旁白与故事段落)
7. [阶段四：Story Flow / Storyboard Preview](#阶段四story-flow--storyboard-preview)
8. [阶段五：图片节拍与 Image Animatic](#阶段五图片节拍与-image-animatic)
9. [阶段六：正式 TTS 与双语字幕](#阶段六正式-tts-与双语字幕)
10. [阶段七：Timed Animatic](#阶段七timed-animatic)
11. [Final Composition：最终图片生产与成片精修](#final-composition最终图片生产与成片精修)
12. [用户反馈后的返回路径](#用户反馈后的返回路径)
13. [Agent 的主动导演职责](#agent-的主动导演职责)
14. [常见失败模式](#常见失败模式)
15. [单集完成后的沉淀](#单集完成后的沉淀)

## 核心思路

### Episode inherits Series

开始单集前先读取 `SERIES.md` 与 `DESIGN.md`。它们是本期的长期约束：系列身份、Audience Profile、Narrative Contract、图片/视觉/声音身份和生产配置。

不要因为一条视频的选题、Hook、故事结构、图片节拍或偶然成功，就改写系列配置。若发现可复用的长期规律，记录为候选，留给后续 Series Style Calibration 或用户明确要求时再更新。

以下只属于 Episode：主题、文案、Hook、Attention Spine、故事结构、段落、图片节拍、Storyboard、TTS、图片生成和 HyperFrames Composition。

单集制作不是“写完文案 → 批量生图 → 自动合成”。

正确过程取决于输入，但都逐步提高确定性：

```text
Locked Script Mode：用户定稿文案
→ 叙事阅读
→ Extract Attention Spine
→ 按原文分段
→ 图片节拍
→ HyperFrames Story Flow

Development Mode：选题、文章或资料
→ 确定最终回报
→ Build Attention Spine
→ 发展旁白
→ 图片化与动态预演

Revision Mode：用户明确要求改稿
→ 在允许范围内修改
→ 重新导演受影响部分
```

每个阶段都产生一个用户可以理解和反馈的实际产物。用户通过观看做决定，Agent 根据反馈修改正确层级。

## 先判断用户给了什么

不要让所有用户从空白 Brief 开始。Locked Script / Development / Revision 只是输入路由词，不是新架构层、状态机、Schema、审批记录或自动判断系统。

一旦某期已有文字，将它保存到 `SCRIPT.md`。它是唯一权威源文本；默认 TTS 会将其逐字同步到派生的 `narration.txt`。

### 用户只有一个选题

例如：

> 为什么越努力规划越容易拖延？

Agent 应：

1. 识别潜在观众价值；
2. 找出需要核实的事实或机制；
3. 提出 2–3 个可讲角度；
4. 帮用户选择最终回报；
5. 再进入注意力主干。

### 用户给了一篇文章或研究资料

Agent 应：

1. 提取最有价值的结论、证据和例子；
2. 区分必须保留与可以删除的背景；
3. 找最适合短视频的一个主问题；
4. 识别哪些内容难以图片化；
5. 不把文章按段落压缩成旁白。

### 用户给了完整文案：Locked Script Mode

完整用户文案默认是锁定的叙事源文本。先写入 `SCRIPT.md`，读取 `narrative-directing.md`，再：

1. 读懂讲述者、事件链、好奇与局部回报；
2. 提取既有 Attention Spine，以及认知、情绪和观众关系变化；
3. 按原文顺序划分叙事段落；
4. 为原文设计图片节拍和 HyperFrames Story Flow。

不得默认重写 Hook、调整结尾、删除互动句或停顿句、改变句子顺序、因为时长删稿，或把人物故事摘要成商业结论。发现逻辑、图片或时长风险时，先用导演方案承接并向用户说明；需要改稿时，请用户明确进入 Revision Mode 并说明允许范围。

### 用户给了旧视频

Agent 应：

1. 看完整视频；
2. 区分内容问题与视觉问题；
3. 标出最强和最弱的时段；
4. 复用有效旁白、图片或结构；
5. 在原 HyperFrames 项目中修改，除非结构已经完全不适用。

### 用户明确要求改稿：Revision Mode

例如：

> 第二段太慢，图片也不够有力，请删掉重复解释。

只有用户明确要求修改文字时进入 Revision Mode。先确认允许修改的范围；在范围内保留讲述者、事件链、互动、情绪和节奏功能，再重新导演受影响部分。若用户只说“第二段太慢”，先诊断图片、节奏、声音或结构，不把它自动理解为删稿请求。

## 生产成本阶梯

让昂贵工作尽可能晚发生：

```text
低成本
主题、回报、结构、旁白草稿

中低成本
占位 Story Flow、Hook 候选、简单图形

中成本
Image Animatic、少量样图、临时 TTS

中高成本
正式火山 TTS、双语字幕、真实定时

高成本
最终图片、连续性修复、精细动画、音乐和渲染
```

任何阶段暴露方向错误时，返回上游。不要因为已经生成了资产就保护错误结构。

## 阶段一：单集意图与最终回报

### 目标

确定这条视频为什么值得存在。Development Mode 定义最终回报；Locked Script Mode 从原文提取已经存在的观看承诺、最终回报和叙事终点，不用新的结论覆盖它。

### Agent 需要整理

- 主题；
- 目标观众；
- 观众当前误解、困惑或需求；
- 系列的 Narrative Contract：观众应进入的现实、故事自由度与意义锚点；
- 本期是否需要补充来源、案例或虚构/象征表达的语境；
- 目标时长；
- 该系列的相关规则；
- 用户特别要求；
- 最终回报。

### 先检查 Narrative Contract

在写 Hook、人物与事实性措辞前，读取 `SERIES.md` 中的 Narrative Contract。

每个故事决定都要匹配系列的 Narrative Mode、Reality Level、Story License 与 Meaning Anchor。

例如：

- **Educational Narrative**：可以写“很多创业者都会经历这样的阶段”，或让综合人物承载机制；除非有可用来源，不要把合成场景说成“2024 年某创业者真实经历”。
- **Cinematic Storytelling**：可以从“一个年轻创业者发现……”进入虚构人物和戏剧冲突，但不要把它包装成纪实事件。
- **Documentary Reality**：事件、人物、数据和来源是重要的意义承载；图片与叙事应优先让证据可见。
- **Conceptual Fantasy**：允许创造世界与规则，但每个幻想元素仍应服务已经定义的观念、问题或体验。

这不是审核步骤。目标是让观众从第一帧就进入系列承诺的现实，而不是在叙事方式上被误导或打断。

### 最终回报写法

避免：

> 让观众了解拖延。

更好：

> 让观众理解“复杂计划本身会制造提前完成感与选择成本”，从而不再把问题只归因于自律。

### 图片可呈现性检查

在进入 Hook 前，至少能描述最终回报的视觉结局：

- 人物处境发生了什么变化；
- 证据链怎样闭合；
- 对比如何完成；
- 机制关系如何被看见；
- 开头画面如何被重新理解。

如果完全无法想象视觉结局，回报可能过于抽象或内容范围过大。

### 用户沟通

给用户一份简短建议，而不是一张表：

> 这期最有价值的不是“教人做计划”，而是解释为什么复杂计划会让行动更难。我建议把最终回报定为“计划应该减少当下选择，而不是安排完未来”。这样开头、图片和结尾都可以围绕同一变化。你希望保留这个角度吗？

## 阶段二：注意力主干与 Hook Lab

阅读 `attention-spine.md`。Locked Script Mode 额外阅读 `narrative-directing.md`，使用 Extract Mode；Development Mode 使用 Build Mode。

### 先设计或提取主干

Development Mode 写下：

```text
开头承诺
第一层回报
中间最重要的证据
观众的核心认知变化
最终兑现
开头回收
```

再添加必要的局部问题和升级。

### Hook 候选

仅在 Development Mode 或用户允许改开头的 Revision Mode 中，当方向不确定时设计最多 3 个结构差异明显的版本：

- 结果先行；
- 具体异常；
- 证据或人物先行。

每个候选写：

- 第一帧；
- 第一段旁白；
- 承诺；
- 第一层回报；
- 为什么适合该系列；
- 潜在风险。

### 用 HyperFrames 而不是只看文字

快速制作 3–8 秒候选：

- 使用相同最终回报；
- 可使用占位图；
- 加入临时中文声音和双语字幕占位；
- 演示第一层图片变化；
- 切换比较。

用户可以组合方案。获胜后折回主 composition，丢弃无用候选。

### 何时不做 Hook Lab

- Locked Script Mode：默认关闭；可以探索第一帧和图片关系，但不得改动开头原句；
- 用户已经有明确且有效的开头；
- 系列已有稳定 Hook 语言；
- 修改任务与开头无关；
- 内容本身只有一个明显最强入口。

不要把每一期都变成强制 A/B 流程。

## 阶段三：旁白与故事段落

### Locked Script Mode：先读，不重写

按原句顺序阅读 `SCRIPT.md`，识别讲述者、事件链、好奇、认知/情绪/关系变化，以及信息、情绪、互动和节奏句。按叙事运动分段，但不改动原句、标点、停顿或顺序。图片难表达时，回到人物、行为、物件、环境、证据和前后状态；不要把原文改成更容易配图的版本。

### Development / Revision Mode：旁白的角色

旁白负责：

- 建立问题；
- 连接图片；
- 解释不可见关系；
- 控制信息顺序；
- 给图片无法独立表达的精确意义；
- 带领回报和重构。

旁白不应：

- 把屏幕上已经清楚的细节逐项读一遍；
- 用长句塞入多个因果；
- 连续给抽象定义；
- 依赖编辑大字补充核心内容；
- 在开头先讲背景和栏目介绍。

### Development / Revision Mode：可图片化写作

将抽象句改成可见事件。

抽象：

> 计划会增加认知负担。

可图片化：

> 任务还没开始，他先花了二十分钟决定先做哪一项。

然后再解释：

> 计划没有减少选择，反而把行动变成了另一场选择题。

### 故事段落

按观众状态变化拆，不按换行拆。Locked Script Mode 可以标出段落边界，但保留原文换行、文字和顺序。

每段记录：

```text
进入时观众在等待什么
本段完成什么叙事任务
新增事实 / 证据 / 理解是什么
局部回报是什么
离开时观众如何理解
怎样通过问题、物体、动作或构图进入下一段
```

### 段落数量

不规定固定三段式。常见 25–45 秒视频可能有 3–5 个主要段落，每段内部有多个图片节拍。

### 旁白初读

在正式 TTS 前，先用自然语速朗读：

- 是否像人在说话；
- 是否有过长句；
- 是否有连续背景；
- 核心回报是否被埋没；
- 开头是否直接进入；
- 结尾是否重复。

可以用临时 TTS，但不要因临时声音参数过度调整内容。

## 阶段四：Story Flow / Storyboard Preview

### 目的

让用户在投入时间播放、声音和后续资产前，审查 Agent 是否正确理解整条内容，并设计出成立的 Scene / Beat / Asset 与图片叙事路径。Story Flow 审的是**节拍设计**，不是一条粗视频的播放效果。

### Before Starting｜进入阶段前说明

向用户说明：Story Flow 会把整条视频的 Scene、Beat 和每个发现过程中的关键视觉状态整理到 HyperFrames 官方 Board。每个 Frame 都会完成具体的低保真视觉导演设计；用户只浏览画面序列，也能基本审查人物、问题、过程、转折、回报与 Handoff。本阶段不会制作完整时间播放、临时 TTS、字幕时间轴、完整动画、最终图片或导出。

### 建立官方 HyperFrames Storyboard

在单集 `video/` 中：

- 读取系列 `DESIGN.md` 与 Episode 的 Attention Spine、段落和 Visual Anchors；
- 完成整条视频的 Scene、Beat、Frame 与 Asset 关系；
- 区分：`Beat = 一次主要观众发现`；`Storyboard Frame = 发现过程中的一个关键视觉状态`；
- 简单静态发现使用 1 个 Frame；Reveal、累积、对比或状态改变通常使用 2–3 个 Frame；关键重构或回收至少展示前后两个状态；
- 使用 `B08-F1`、`B08-F2`、`B08-F3` 等 ID 表示同一 Beat 内的发展，不把它们误写成新 Beat，也不强制最终剪辑逐帧切换；
- 例如同一结果 Beat 可以依次展示：`B08-F1` 继承已建立的小店与核心商品；`B08-F2` 让订单、用户作品或地区关系持续扩散；`B08-F3` 回到核心商品，以真实证据或明确证据方案形成“一万条好评 / 全国领先”的回报与结尾 Handoff。不能只做一个空泛结果 Frame，再靠右侧说明解释这三步；
- 将全部关键视觉状态按 Scene / Beat 从属和叙事顺序注册为 HyperFrames Storyboard items；
- 每个 item 必须绑定项目内真正可渲染的 Frame composition `src`，但可渲染只是技术前提；
- Frame Canvas 必须具体呈现主体、动作 / 状态 / 关系、视觉事实或证据、相邻变化与 Handoff；
- Board Overview 是主要审查表面，Inspector 只补充对应原文、Audience Discovery、Visual Event、Handoff 和 Placeholder / Risk。

#### Storyboard Frame Contract

Storyboard Frame 是关键视觉状态，不是说明页、版式占位或未来素材容器。**低保真表示美术完成度低，不表示视觉设计没有完成。** 用户看到 Frame 时，应能准确说出发生了什么，而不必先读右侧 Narrative。

允许使用粗略人物与空间剪影、参考图片的有效裁切、具体场景拼贴、灰阶草图、用户素材、真实截图、用简单形状准确表达的人物 / 物件 / 因果关系，以及少量低成本生成图。Frame Canvas 可以呈现人物、物件、环境、动作、状态、关系、因果、累积、对比、真实证据或明确的证据占位、有叙事意义的草图 / 拼贴 / 剪影，以及后续 HyperFrames 图形层的清楚位置。

禁止把旁白全文、双语字幕、导演说明、Beat 标题、Attention 标签、解释性标签、Prompt、素材路径、解释空画面的段落、无语义矩形 / 线框 / 重复容器或装饰性系列预览图烧进 Frame。文字只有两种例外：它是故事中的真实对象或证据；或已明确属于最终成片的少量 Editorial Text。三个等宽框、一个圆、一排方块或空卡片不能形式化代替具体结果、人物、数据与关系，除非这些形状本身已准确表达内容。

#### Storyboard Sequence Contract

官方 Board Overview 必须按 Scene 与叙事顺序展示全部关键 Frame，清楚显示 Beat / Frame 从属，让相邻变化与 Handoff 可比较，并以自然语言 Placeholder / Risk 说明尚未确定的素材、证据方案或高风险；不新增第二套状态枚举，也不占用 `scene` caption 存放内部状态。用户不应逐个打开 Inspector 才能理解设计。隐藏或忽略右侧 Voiceover 和 Narrative，只浏览 Frame 顺序时，仍应大致看懂人物、问题、过程、转折和回报。

### 两种 surface 不可互相代替

Story Flow 的正式产物是 **HyperFrames 官方 Storyboard URL / route**。不得用以下方式代替：

- 创建一个自定义网页，把文案和设计说明排在页面上；
- 创建一个叫“Storyboard”的普通 Composition；
- 直接进入 Player / Preview 页面播放整条粗视频；
- 只展示 `STORYBOARD.md` 文本；
- 只展示 Beat 标题、outline、空白卡片或没有可渲染 `src` 的 item；
- 在卡片里提前实现完整动画、正式声音或最终图片。

正确要求是：使用 HyperFrames 官方 Storyboard surface，把全部关键视觉状态注册为按序、视觉具体的 Storyboard Frames；Board 上的画面序列承担叙事，Inspector 只补充导演意图。

### 这一轮审什么

- Scene 划分和 Beat 顺序是否合理；
- 每拍是否对应正确的原文范围与 Attention 作用；
- 每拍具体让观众看见、理解和感受什么；
- 场景、证据、过程、机制、情绪、回报等图片角色是否分布合理；
- 前一拍怎样交给后一拍；
- Entity / Environment / Medium / Relationship 连续性是否清楚；
- 哪些 Frame 仍是占位，哪些素材风险最高；
- 开头承诺、局部回报、核心重构和结尾回收是否在节拍设计上闭合。

不审：动画流畅度、TTS、字幕精确同步、转场精度、最终图片质感或完整播放节奏。

### 用户反馈后

内容理解问题在 Development / Revision Mode 回到 Attention Spine 或旁白；Locked Script Mode 报告源文本风险并调整图片任务、证据、Scene / Beat 关系，不静默改稿。节拍问题回到 Scene、Beat、图片角色、连续性或 Handoff；不要在 Story Flow 阶段用时间线、动画或自定义说明页面掩盖设计问题。

### Preview Readiness Review｜交付前自审

Story Flow 不要求完整播放次数或时间点检查，但必须完成三遍人工自审；任何一遍失败都不能交付：

#### 1. Visual-Only Pass

隐藏或忽略全部右侧文字，只看 Frame：每帧是否有具体主体、动作、状态和关系；是否存在空框、泛化图标或无语义形状；每帧是否自己提供视觉信息；关键数字或证据是否有明确实现方案。

#### 2. Sequence Pass

在 Board Overview 连续浏览：相邻 Frame 是否真的发生变化；是否连续多帧使用同一种构图；Scene / Beat / Frame 从属是否清楚；Entry、发展、重构、回报是否可见；Handoff 是否通过物件、动作、方向、关系或构图成立。

#### 3. Source-Separation Pass

检查 `SCRIPT.md` 原文只在 Voiceover；字幕不进入 Frame；导演说明不烧进画面；精确数据使用真实证据或明确的后续 HyperFrames 层；最终成片文字和内部工作说明已分开。

修复后回到同一 Storyboard route 重做三遍检查。

### Required Preview｜必须可见

必须交付 HyperFrames 官方 Storyboard URL / route。每个关键视觉状态都必须绑定一个具体可审查的 Frame `src`。“可渲染”本身不代表完成；空白或近似空白、通用矩形 / 圆点 / 条形占位、只有版式没有具体主体与关系、需要阅读右侧 Narrative 才知道发生什么、把旁白 / 导演说明 / 字幕烧进画面补足信息，或一个包含明显发展过程的 Beat 只展示结果占位帧，均视为未完成。

交付前必须确认：**只看 Frame 序列，内容进展可以被基本理解；右侧信息只帮助判断导演意图，不负责替画面讲故事。** Markdown、Prompt、资产路径、outline、自定义说明网页或普通 Composition 均不能替代。

### Stage Handoff｜阶段交接

交接时说明 Storyboard URL / route、Scene / Beat / Frame 数量、同一 Beat 使用多个 Frame 的关键发展、主要导演选择、仍有未确定素材 / 证据方案或高风险的 Frame，以及三遍自审修复。请用户先浏览 Board Overview 判断画面序列是否已直接表达人物、问题、过程、转折、回报和 Handoff；Inspector 只用于补充原文、Audience Discovery 与风险。若有实质方向分歧，给出少量选项、取舍与推荐。用户确认后才会把已确认 Storyboard Frames 转为 Image Animatic 时间线；仍不会进入正式 TTS、`captions.json`、批量最终图、Final 精修或导出。

### Stop Here｜在此停止

展示官方 Storyboard URL / route，完成上述协作式交接后，**结束当前回复**，等待用户在后续消息中明确同意进入 Image Animatic。用户未确认前，禁止开始完整 Composition 时间播放、临时或正式 TTS、正式 `captions.json`、批量最终图片、Final 精修与最终 render。

## 阶段五：图片节拍与 Image Animatic

阅读 `image-storytelling.md`。

### Before Starting｜进入阶段前说明

向用户说明：Image Animatic 是本期**第一次从头播放到尾的动态 Composition**。它会把已确认的 Storyboard Frames 转成 Scene / Beat 时间关系，用样图、参考图、低成本图或用户素材，加上临时声音或估计时长以及粗略 Entry / Development / Emphasis / Handoff，验证时间中的观看动力；不会生成正式 TTS、最终字幕时间轴、批量最终图片、精细动画或导出。完成后请用户判断节拍停留、图片切换、故事流动、中段是否变平、Reveal / Handoff 是否有效，以及整体是否像视频而不是幻灯片。

### 图片节拍不是一句一图

图片节拍是一段可见信息发生变化的时间单位。它可以：

- 使用一张图；
- 使用多张图；
- 在同一张图中连续揭示；
- 跨越一句旁白；
- 与多句旁白共享场景。

### 每个节拍要设计

1. 注意力和叙事任务；
2. 图片具体证明什么；
3. 第一眼焦点；
4. 随后出现的新信息；
5. 构图与主体；
6. 进入、发展、强调、交接；
7. 双语字幕安全区；
8. 编辑文字是否必要；
9. 与上一拍、下一拍的关系。

### HyperFrames Decision

每个图片节拍先设计：

- 图片为什么存在；
- 观众应该理解什么；
- 构图怎样让这个理解成立。

然后才判断：

- 是否需要 motion；
- 是否需要 reveal；
- 是否需要 transition；
- 是否需要 emphasis。

永远不要从动画开始。图片或构图本身不成立时，回到文案、图片任务或构图，而不是追加效果。

### Image Animatic：第一次完整时间播放

从已确认的 Storyboard Frames 建立时间线，使用：

- 用户参考图；
- 草图；
- 网页截图；
- 低成本生成图；
- 简单图形；
- 粗略裁切；
- 接近真实的图片运动。

这是第一次从头到尾完整播放。除图片任务外，这一轮还要暴露：

- 节拍停留是否足够；
- 图片切换是否机械；
- 故事是否在时间中流动；
- 中段是否变平；
- Reveal 与 Handoff 是否有效；
- 整体是否像视频而不是幻灯片；
- 图片是否只是气氛；
- 反转是否有画面证明；
- 一张图是否塞入过多任务；
- 图片是否重复；
- 镜头交接是否顺；
- 字幕是否遮挡；
- 编辑文字是否过多。

### 用户选择图片方向

用户可以要求：

- 保留当前构图；
- 换具体场景；
- 改成证据图片；
- 合并两个节拍；
- 一张图多揭示一层；
- 删除无用镜头；
- 换人物、情绪或图片风格。

在这一轮解决方向，再生成昂贵最终图。

### Preview Readiness Review｜交付前自审

完整播放并确认每个主要 Beat 都有实际画面；全屏图片在 Hero Frame、运动起点/终点和最大位移时正确覆盖画布，没有非设计性黑边、空洞或错误裁切；每拍有一个清楚的主视觉事件，Entry / Development / Emphasis / Handoff 可被看见；相邻 Beat 关系明确，并具备当前需要的最小 Motion / Reveal / Handoff。还须检查字幕安全区、图层残留、无意重叠与 Scene 边界。修复 P0 问题后，在同一 Studio route 再完整播放。

### Required Preview｜必须可见

Image Animatic 必须是 Studio 中可从头播放到尾的 Composition，也是本期第一次完整时间播放。每个主要图片 Beat 都要有实际可见画面，能够判断停留、构图、观看顺序、粗略 Motion / Reveal / Handoff 与图片交接；低成本样图、参考图或少量风险图可以使用。Storyboard contact sheet、图片 Prompt、资产路径、静态列表或 outline 不能替代 Image Animatic Preview。

### Stage Handoff｜阶段交接

交接时列出实际落地的主要 Beat、图片任务、贯穿人物/物件、Scene 关系、Reveal / Motion 与关键交接；说明重要导演选择为何采用该图片关系而非备选，并报告自审修复的裁切、露底、字幕安全区或图层问题。请用户重点判断图片是否真正承担叙事、人物与物件是否连续、镜头交接是否自然、情绪变化是否可见。若关键段落有合理替代，给出少量选项、各自取舍与推荐。用户确认后才会生成正式 TTS、取得真实词级时间、写入 `captions.json`，并按真实声音调整时间线；仍不会批量最终生图、Final 精修或导出。

### Stop Here｜在此停止

展示实际 Studio URL 与 route，完成上述协作式交接后，**结束当前回复**，等待用户在后续消息中明确同意进入 Timed Animatic。用户未确认前，禁止正式 TTS、正式 `captions.json`、批量最终图片、Final 精修与最终 render。

### Timed Animatic Before Starting｜正式投入前说明

> 此说明必须在正式 TTS、转写和 `captions.json` 工作**之前**向用户给出；不能在它们完成后补报。它不新增成熟阶段，只把既有 Timed Animatic 的成本边界放在实际投入之前。

向用户说明：Timed Animatic 要把确认的图片结构置入正式声音、真实时长和 `captions.json`，验证声画同步、字幕语义、停留、回报与停顿的重量；会生成正式 TTS、获取词级时间、制作 `captions.json` 并重导演图片时长；不会批量生成所有最终图片、进行最终精细动效或导出。完成后请用户判断声音方向、字幕断句、声画同步、快慢与阅读时间。

## 阶段六：正式 TTS 与双语字幕

### 什么时候生成正式声音

满足：

- Locked Script Mode：用户确认原文可进入制作，原句和顺序保持锁定；
- Development / Revision Mode：用户认可当前旁白；
- Hook、观看承诺和图片节拍大体稳定。

### 火山 TTS

将权威中文旁白保存在 `SCRIPT.md`。默认命令从它同步生成 `narration.txt`；单换行和空行都保留原稿节奏。默认每个空行段落只请求一次 TTS，以保持连续语调；不要为了 TTS 或字幕断句独立编辑派生文件。

运行：

```bash
node <skill>/scripts/generate-tts.mjs --project <episode-dir>
```

需要调整单段语气时，先调整 Voice、段落停顿或图片停留。Development / Revision Mode
可在允许范围内改文字；Locked Script Mode 保持源文本不变。默认按空行段落生成语音单元，避免短行被切成反复起调的播报片段；只有真实听感确认短行需要独立交付节拍时，才设置 `TTS_REQUEST_UNIT=line`。字幕组、源文短行和 TTS 请求单元不是同一个概念。

### 时间参考与字幕组

使用：

```bash
npx hyperframes transcribe <episode-dir>/assets/audio/narration.wav
```

先获取正式声音的词级时间，再由 Agent 按语义组成字幕组，并与 `STORYBOARD.md` 的图片节拍对齐：

```text
词级时间
→ 中文语义字幕组
→ 图片节拍对齐
→ Display Text 标点清理与组内换行
→ 同区间自然英文
→ 写入 `captions.json`
→ HyperFrames 读取 `captions.json`
→ Timed Animatic 审看
```

时间是导演素材，不是自动镜头决策；不要按逗号、句号或固定字数自动切字幕。

### 双语字幕

- 正式 TTS 和转写后，将所有实际显示的字幕组写入 Episode 根目录的 `captions.json`；它是 HyperFrames 唯一读取的字幕时间轴，不能在 Composition 中临时按标点、字数或 `SCRIPT.md` 重新切分；
- 中文先按自然意义、声音停顿与图片推进分组；一个短语只在它真正被说出并由画面推进时出现；
- 中文 Display Text 忠实对应旁白，但默认隐藏句法标点；不反向修改 `SCRIPT.md` 或 `narration.txt`，并保留数字、单位、产品名和技术表达中的必要符号；
- 英文为同一中文语义组写自然表达，默认和中文共享开始/结束时间；不按英文自己的字数额外拆成时间组。确实来不及阅读时，只能在同一 `captions.json` 项中用可选 `en_end` 略晚隐藏，不能独立推进信息；
- `zh` / `en` 内的 `\n` 只表示同一字幕组的人工视觉换行；它不创建新的时间组、TTS 停顿或叙事事件；
- `STORYBOARD.md` 只用字幕 ID 说明字幕和图片如何配合。一个 Beat 可关联多个字幕组；一个字幕组也可跨 Beat 或 Scene；
- 一次只显示一个字幕组；不要提前展示后半句、答案或下一件事；
- 关键字幕切换尽量与图片揭示同步，并提前考虑图片主体和安全区。

字幕时间轴格式、推荐尺度和审看细则见 `references/technical/subtitles.md`。

## 阶段七：Timed Animatic

### 目的

把预计节奏变成真实音频节奏。

### 重新导演，而不是简单拉伸

检查：

- Hook 是否说得太慢；
- 第一层回报是否被长句拖后；
- 图片是否没有阅读时间；
- `captions.json` 是否是 Composition 唯一字幕来源，且每个字幕组都能追溯到原文和正式声音；
- 双语字幕是否按语义切分、会不会提前泄露后文或切得太快；
- 字幕切换是否和图片揭示同步，组内换行没有被误做时间切换，数字与专有名词是否被错误清理；
- 复杂图片是否需要停顿；
- 是否要合并或拆分节拍；
- 转场是否抢旁白；
- 结尾是否被 CTA 挤压。

### 修改顺序

Locked Script Mode 若总时长过长：

1. 调整图片密度、停留、段落分段和声音停顿；
2. 用更合适的目标时长或建议拆成多集；
3. 向用户报告文字与时长的取舍；
4. 只有用户明确允许后，才进入 Revision Mode 修改文字。

Development / Revision Mode 才可以删除重复解释、合并相似内容、调整证据位置，最后才小幅提高语速。不要把一篇过长文案用 1.5 倍速压进视频。

### Preview Readiness Review｜交付前自审

完整播放并确认正式 TTS 与 `captions.json` 使用同一实际时间轴，Composition 只读取 `captions.json`，图片停留可读，语义字幕不提前泄露，组内换行没有变成新时间组。检查转场、字幕和图片揭示没有同时争抢注意力，Scene 边界没有跳帧、黑帧或残留层，且声画同步；真实声音加入后中段没有变成剪辑混乱。修复 P0 问题后，在同一 Studio route 再完整播放。

### Required Preview｜必须可见

Timed Animatic 必须在 Studio 中将正式声音、`captions.json`、真实时长、实际图片与粗略运动一起播放；WAV 文件存在、字幕 JSON 写完或 transcribe 成功都不能替代它。

### Stage Handoff｜阶段交接

交接时说明实际声音、字幕组和图片停留怎样改变了节奏；哪些段落被延长、压缩、合并或保留停顿，以及为什么；报告自审修复的声画、字幕、Scene 边界或转场问题。请用户重点判断正式声音是否符合系列、字幕是否自然、图片停留是否足够、哪里太快/太慢、回报与停顿是否有重量。若节奏方向存在实质取舍，提供少量选项与推荐。用户确认后才会批量替换最终图片并做 Final Composition 精修；仍不会导出。

### Stop Here｜在此停止

展示实际 Studio URL 与 route，完成上述协作式交接后，**结束当前回复**，等待用户在后续消息中明确同意进入最终图片生产。用户未确认前，禁止批量最终图片、最终精细动画、Final Composition 精修与最终 render。

## Final Composition：最终图片生产与成片精修

最终图片生产和 Final Composition 是同一个用户成熟阶段中的连续内部工作，不是两个独立的用户审片节点。图片生成后的单张图片、资产目录、内部快照、Composition 源文件或技术检查页面都不得作为本阶段交付。

本阶段唯一正常的用户交付是：最终素材已经放回当前 Composition、完成精修并通过真实 Studio 自审后的 **HyperFrames Studio Final Preview**。内部循环固定为：

```text
Generate
→ Integrate into the current Composition
→ Studio Self-Review
→ Revise Prompt / Asset / Composition
→ Continue
```

禁止使用 `Generate → Send HTML → 等用户发现不对 → 再打开 Studio`。高风险素材测试默认属于此内部循环；只有测试暴露会实质改变已确认视觉方向的候选时，才在官方 Studio 中展示候选并等待用户决定。普通素材替换不新增中间用户确认。

### Final Composition Before Starting｜正式投入前说明

> 此说明必须在批量最终图片生产**之前**向用户给出；不能在图片已经生成、替换或精修后补报。它不新增成熟阶段，只把既有 Final Composition 的成本边界放在实际投入之前。

向用户说明：Final Composition 要生成并替换已确认方向的最终资产，统一图片与声音风格、精修已通过的镜头语言，并验证可发布的完整体验；会进行最终图片生产、素材替换、克制动效、字幕/主体安全区和声音精修。在已确认方向内的普通制作处理会由 Agent 正常执行并自审；只有实质改变媒介配方、叙事 / Attention Path、主要视觉事件、长期基线、可复用组件或返工成本的新增处理，才作为候选单独展示并等待后续消息决定是否合并；不会在 Final Preview 前导出。完成后请用户判断整体统一性、镜头感、字幕舒适度、音乐/声音与发布准备度。

### 先整理图片请求

`image-prompts.json` 中每项应来自已验证的图片节拍和 Episode Visual Anchors，但按实际**素材**而非 Beat 一一组织：一个 Beat 可用多个素材，一个素材也可跨 Beat 复用。`purpose`、`role`、`used_in_beats` 与 `references` 只保留导演上下文，Provider 不会自动看到；真正影响生成的内容必须进入 `prompt`。

Prompt 按以下顺序写：

- 叙事任务；
- 画面中必须可见的事实、动作、关系与证据；
- 继承的 Entity、Environment、Medium、Relationship 与 Reference Asset Anchors，以及允许变化什么；
- 构图与观察方式、第一眼/随后发现；
- 媒介实现，以及造型、边缘、材质、表面、空间或世界规则怎样保持当前系列的媒介一致性；
- 双语字幕安全区、cover/crop、当前媒介允许的 Motion Affordances、分层和 Handoff 余量；
- 相关系列基线；
- 必须避免的错误。

先说发生了什么，最后才说风格；不要只写：

> 高级感办公室，电影感，竖屏。

生成前先完成逐素材 Prompt Audit，再完成整组 Image Set Audit，检查图片角色分布、观察方式、主体状态、媒介表现、功能性细节和观看任务不被同质化；这两者都是 Agent 的导演检查，不是脚本评分或批准状态。先测试视觉世界锚点、第一帧、长期主体、核心重构、机制和回收等高风险素材。

### 生成策略

- 先生成最关键、风险最高的图片；
- 用户确认视觉世界中的主体、环境、媒介配方和关键关系后再扩展；
- 对长期人物或物件优先使用已确认支持的参考图能力；当前脚本不会自动读取或上传本地 Anchor，必须由 `extra` 提供具体 Provider 已接受的远程 URL、Base64 或其他字段；
- 对准确文字、界面和数字，优先在 HyperFrames 中叠加；
- 用户现有素材优先于重新生成；
- 漂亮但不能证明内容的图片应重做。

### 调用脚本

```bash
node <skill>/scripts/generate-images.mjs --project <episode-dir>
```

指定重做：

```bash
node <skill>/scripts/generate-images.mjs \
  --project <episode-dir> \
  --only img-job-search-wide,img-shop-price-change \
  --overwrite
```

### 放回当前 Composition 并在 Studio 内部自审

不要把图片生成视为结束，也不要把生成结果交给用户。将高风险素材立即放入**同一个当前 Final Composition**，应用实际 `cover` / crop、字幕安全区、当前媒介允许的 Motion Affordances 与前后 Handoff；在官方 Studio 的当前 route 内检查裁切、字幕、连续性和运动。原图漂亮但主体被裁掉、证据看不清、没有运动余量、字幕遮挡或无法交接时，不是可用素材；修改 Prompt、锚点 / 参考、构图、素材或 Composition 后重做。

单张图片、资产列表、HTML 源文件、截图、snapshot 与检查页面只供 Agent 内部自审，不是新的用户阶段交付。这个内部检查服从当前阶段已有的 Studio Preview、Preview Readiness 与协作式交接边界，不替代它们。

继续：

- 重新裁切；
- 调整运动路径；
- 分层前景与背景；
- 添加遮罩、证据标记和图形连接；
- 检查字幕覆盖；
- 修改不成立的镜头。

### Final Composition 精修

在当前 Composition 内完成最终素材替换与精修；不要建立第二条“最终图片预览”路径或额外审片节点。

### 精修内容

- 确认 Hook、回报和证据仍然成立；
- 替换所有占位资产；
- 删除审核标注和废弃候选；
- 保持编辑文字克制；
- 确保开头和结尾完整。

### 精修 HyperFrames

- 每个场景先确认英雄帧布局；
- 用 GSAP 建立观看顺序；
- 动画速度和 easing 与语义匹配；
- 同一视频有主转场和少量强调转场；
- 避免所有场景重复同一种运动；
- 处理字幕、图片主体和平台 UI 安全区；
- 音乐和音效服务内容，不盖过 TTS。

在已确认的当前阶段方向、`DESIGN.md`、`Motion Language`、素材 Brief 与用户明确要求范围内，Agent 可直接完成并自审正常精修：cover / crop、必要遮罩、已计划 Reveal、字幕安全处理、证据标记、当前 `Motion Language` 内的运动，以及 Scene / Layer 生命周期修复。不要把这些普通制作动作变成逐项微审批。

只有新增处理会实质改变已确认的 Visual Medium / 媒介配方、叙事意义、Attention Path、主要视觉事件、长期系列基线、可复用组件 / 后续多期继承处理，或明显提高返工成本的方向变化时，才先在 Studio 作为候选展示它解决的问题、出现位置与代价，展示后停止，等待用户在后续消息决定是否合并。不能因为“更有质感”、技术可运行或 Agent 偏好而直接并入实质方向变化；这一规则不替代 Final Preview 后等待用户后续消息允许导出的停止边界。

### Preview Readiness Review｜交付前自审

完成正常观看、静音观看、只听声音与手机尺寸观看；再执行 Scene boundary pass（每个 Scene 进入前、交接中、结束前和下一 Scene 稳定后）以及 Media coverage pass（所有全屏媒体的运动起点、终点和最大位移）。确认不存在占位/审核标记、生成错误、露底、错误裁切、图层残留、重叠转场、黑帧、空帧、字幕错位或不可播放区间。

### Studio-first 预览验证

按 `hyperframes-directing.md` 的 Studio Preview Verification：使用官方方式启动 Studio，获得实际 HTTP / HTTPS Studio URL，打开当前 Episode 的准确 Final Composition route，并在该 route 从头到尾完整播放。检查首拍、中段关键拍、结尾拍、最终素材、字幕、声音与 Scene 交接均能加载，没有空白资源、断裂路径、不可播放区间或字幕遮挡。

只有这份已加载、已完整播放并由 Agent 自审的 Studio Composition Surface 才是 Final Preview。Studio server 启动、URL 生成、浏览器打开、lint 全绿、snapshot、MP4 存在或 `video/composition.html` 存在均不能替代它，也不得被交给用户作为 Preview。

### 技术检查

在 Studio route 已确认可见后，再按需运行：

```bash
npx hyperframes lint
npx hyperframes inspect
npx hyperframes validate
npx hyperframes preview
```

根据报告修复文字溢出、主体出画、低对比度、场景空白、媒体路径错误与时间线注册/动画冲突。修复后回到同一 Studio route 重新确认首拍、中段关键拍和结尾拍。技术工具不判断内容是否抓人，也不能替代用户观看。

### Required Preview｜必须可见

Final Composition 必须在官方 Studio 中的准确 Composition route 完整播放最终素材、字幕、声音与动效。交付必须给出可直接打开的 HTTP / HTTPS Studio URL 与准确 route；不得交付 HTML 文件地址、本地文件路径、源代码链接、CLI snapshot 路径、截图或“渲染检查通过”的文字代替实际 Studio URL。

### Stage Handoff｜阶段交接

交接前先完成 Studio Preview Verification；任一 URL 不是 Studio HTTP / HTTPS URL、route 指向源文件 / 错误 Composition、播放器不能完整播放、资源断裂、画面空白 / 报错，或用户仍需自行运行命令才能观看时，都是 P0 blocker：停止交付，修复 Studio / route / asset loading，重新完整播放后再交付。

交接时必须包含：

```text
Surface：Studio Composition
Studio URL：
Route：
Composition：
Stage：Final Composition
完整播放自审：已完成
本轮实际替换 / 精修：
请重点观看：
下一步：等待是否导出的明确授权
```

随后说明已替换和统一的最终资产、为保持镜头感而做的关键精修、候选视觉处理是否仍未合并，以及自审修复的连续性 / 字幕 / 安全区 / 播放问题。请用户重点判断最终风格是否统一、动效是否克制且有镜头感、字幕和主体是否舒服、声音是否合适、整体是否可以发布。若仍有发布前的方向选择，给出少量选项、取舍与推荐。用户在后续消息确认时，下一步只会导出已观看的 Final Preview，并检查导出文件与该预览一致；不会借导出再改变创意方向。

### Stop Here｜在此停止

展示 Final Preview 后，完成上述协作式交接并**结束当前回复**，等待用户在后续消息中明确允许导出。只有这条后续确认才可调用最终 render；不得把先前“做一个视频”的请求、沉默或技术检查通过解释为导出许可。

### 渲染

用户在观看 Final Preview 后于后续消息明确确认时：

```bash
npx hyperframes render --quality high --output final.mp4
```

## 用户反馈后的返回路径

### “开头没感觉”

返回：最终回报、Hook、第一帧和第一层回报。Locked Script Mode 保留开头原句，优先修改第一帧、图片关系、声音进入与原文承诺的可见性。

### “中间太平”

返回：注意力主干和段落；检查是否缺证据、局部回报、认知/情绪/关系变化。Locked Script Mode 先增强图片揭示、事件承接和停留，不删原句。

### “说得太多”

返回：旁白与真实时长。Locked Script Mode 先调整分段、镜头密度、目标时长或拆集，并报告取舍；Development / Revision Mode 才删除重复解释，不先加速。

### “图片不准确”

返回：图片任务与 Prompt；明确需要证明的内容。

### “图片漂亮但空”

返回：图片节拍；把气氛图改为场景、证据、对比或机制。

### “字幕挡住了”

返回：构图、运动终点和字幕位置；不要只缩小字幕。

### “动效太花”

返回：运动语义和转场系统；减少无意义动作，保留观看引导。

### “整体太慢”

先区分内容回报、旁白、图片变化和动画速度，再修改正确层。

### “风格不统一”

返回：系列 `DESIGN.md` 与图片语言；判断是图片模型、构图、色彩还是运动漂移。

## Agent 的主动导演职责

不要只问：

> 满意吗？

在展示预览时，先给出自己的导演判断：

```text
我认为 0–8 秒已经成立：第一帧和第一层答案形成了清楚的异常。
18–25 秒仍然偏平，因为旁白增加了第二个原因，但图片只重复既有运动，没有新的证据。
我建议优先采用 A：让选择路径逐步增加；若为 Locked Script Mode，用停留和结果图承接第二句解释。
只有用户允许 Revision Mode 时，备选 B 才是删除第二句并提前结果图。
```

### 每次展示至少说明

- 这版主要解决了什么问题；
- Agent 认为最强的部分；
- 仍然最不确定的一个或两个部分；
- 推荐的下一步；
- 用户最值得关注什么。

### 不要防御自己的方案

用户不喜欢时，先理解具体原因。原型存在的意义就是允许推翻。

### 不要把所有选择交给用户

Agent 应提供专业选项和推荐。用户负责目标与审美判断，不需要亲自设计所有 easing、构图和转场。

## 常见失败模式

### 1. 一次性生产完所有资产

没有动态预演就生成几十张图，返工成本高。

### 2. 文案通过后直接生图

中间缺少 Story Flow 和 Image Animatic，图片任务没有验证。

### 3. 一句旁白一张图

导致节奏机械、图片关系弱、画面重复。

### 4. 用文字解释图片做不到的内容

Development / Revision Mode 可以同时改写文案和图片表达。Locked Script Mode 优先寻找原文中的人物、行动、物件、环境、证据、停顿和前后变化；不能擅自删改文本。

### 5. 用动画修复内容平坦

画面更忙，但没有新的回报。

### 6. TTS 后只做时间拉伸

实际声音暴露结构问题时，先重新导演镜头、节拍、停留和目标时长。Development / Revision Mode 可删改内容；Locked Script Mode 只能在用户明确许可后改稿。

### 7. 图片生成只看风格

Prompt 没有叙事任务、字幕安全区和运动需求。

### 8. 每次反馈都全局重做

应定位问题层级，只修改相关部分。

### 9. 技术检查替代用户观看

lint 全绿不等于视频好看或留得住人。

### 10. 最终工程残留大量原型

获胜方案折回真实 composition，删除无用候选、标注和占位。

## 单集完成后的沉淀

完成后只记录真正可复用的发现：

- 某种 Hook 在该系列特别有效；
- 某类图片风格稳定或不稳定；
- TTS 某种语速和停顿更合适；
- 某个字幕位置更安全；
- 某种转场适合核心重构；
- 某个角色或场景需要作为系列资产保留。

这些发现先记录为候选，不要因为一次偶然成功就更新 `SERIES.md` 或 `DESIGN.md`。只有重复出现、用户明确要求，或经过 Series Style Calibration 确认后，才更新长期系列配置。
