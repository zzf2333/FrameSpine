# 系列初始化：建立可复用的生产配置

## 目的

Series initialization creates a reusable creative system. It does not create an
episode.

它的输出是未来所有单集继承的稳定系列身份，而不是第一条视频的策划案。

一个项目只容纳一个系列。项目根目录就是系列根目录，系列配置、风格校准与 `episodes/` 直接放在项目根目录，不再创建系列名称子目录。

```text
Series
= 长期世界观 + 制作规范

Episode
= 某一期具体怎样讲
```

系列初始化只回答：

- 这个系列是什么、为谁存在、长期提供什么价值？
- 它采用什么叙事体验、图片语言、视觉身份和声音身份？
- 它如何在长期生产中保持一致？

它不决定：

- 下一条视频讲什么；
- 某一期的 Hook、最终回报或故事结构；
- 某一期的图片节拍、分镜、旁白或 HyperFrames 镜头；
- 任何代表性内容、校准选题或样片故事。

这些属于 `episode-production.md`。

## 系列初始化流程

```text
Step 1  Series Identity
    ↓
Step 2  Audience Profile
    ↓
Step 3  Narrative Contract
    ↓
Step 4  Image Language
    ↓
Step 5  Visual Identity
    ↓
Step 6  Voice Identity
    ↓
Step 7  Production Configuration
    ↓
Step 8  Series Style Calibration
    ↓
Series Ready
```

不要按表格机械盘问。一次只确认会改变长期系列配置的决定；先分析用户已有账号、参考、品牌资产和已发布内容，再提出带理由的推荐。

## Step 1：Series Identity

确定系列长期存在的理由，而不是列出未来视频题目。

记录：

- 系列名称；
- 内容领域；
- 长期价值；
- 目标方向；
- 内容范围；
- 明确不做什么。

使用这句话收敛：

```text
为 [长期观众]
通过 [内容视角]
持续提供 [稳定价值]
帮助他们从 [常见理解]
到达 [长期理解或能力]。
```

例如，不写“每期讲财富案例”，而写：

> 帮助普通人理解财富积累背后的行为和商业机制。

## Step 2：Audience Profile

建立长期观众理解，而不是为某一期生成 Hook。

### Who

目标观众是谁？哪些人不优先服务？

### Situation

他们在什么生活、工作或刷视频情境下观看？

### Motivation

他们为什么会持续关注这个系列？

### Expected Reward

他们通常期待获得什么：知识、观点、情绪、方法或启发？

## Step 3：Narrative Contract｜叙事契约

Narrative Contract 定义这个系列希望观众进入什么叙事体验、创作自由如何服务主题，以及长期要保持什么**意义锚点（Meaning Anchor）**。

它不是事实核验模块，也不是“允许不允许虚构”的开关；不把它做成 Reality Verification System、AI Disclosure Gate 或 Fiction Detection。

### Narrative Mode

默认选择一个主模式；只有混合确实能提升长期理解时才增加次模式，并写清各自承担的内容。

- **Documentary Reality｜纪录现实**：真实对象、事件与证据优先；
- **Educational Narrative｜知识故事**：用故事和图片帮助理解真实机制；这是 FrameSpine 的默认推荐；
- **Cinematic Storytelling｜电影叙事**：以情绪、冲突和体验传递主题；
- **Conceptual Fantasy｜概念幻想**：通过创造的世界与规则探索观念。

### Reality Level

记录系列的主要视觉现实程度：

1. 真实记录；
2. 现实增强；
3. 故事化现实；
4. 概念视觉；
5. 幻想世界。

### Story License

记录系列通常如何使用故事材料：

- Case Based｜真实案例；
- Composite｜综合案例；
- Fictional｜虚构人物；
- Symbolic｜象征故事；
- Speculative｜未来推演。

### Meaning Anchor

Meaning Anchor 是观众最终要带走、且系列必须长期保持一致的意义，不把“意义一致”误写为“每个画面都必须是事实记录”。

例如：

- 商业系列：商业机制、行为逻辑与因果关系成立；
- 情绪系列：情绪体验、人物冲突与心理变化成立；
- 品牌系列：价值表达与品牌立场成立；
- 纪录系列：事件、人物、数据与来源仍是重要的意义承载。

单集可以因题材改变 Reality Level 或 Story License，但不得因为一条视频就改写系列契约；单集需要在 `EPISODE.md` 说明例外及它如何仍服务 Meaning Anchor。

## Step 4：Image Language

这是长期图片规则，不是某一期的分镜。

确定：

- 图片世界、质感和主要类型；
- 构图倾向与字幕安全区；
- 人物、环境、物件、证据、机制图和视觉隐喻的长期分工；
- 图片主要承担人物处境、环境关系、机制解释或视觉隐喻中的哪些角色；
- 允许的图片结构与明确避免的方式；
- 如何让图片语言自然表达 Narrative Contract。

不要在这里选择某期具体使用什么图、什么人物或什么 Beat。那些属于 Storyboard。

## Step 5：Visual Identity

把系列方向编译到 `DESIGN.md`，成为 HyperFrames 可复用的视觉身份：

- 色彩角色；
- 字体与排版；
- 竖屏布局；
- 双语字幕基础样式；
- 运动气质；
- 转场语言；
- 可复用组件；
- What NOT to Do。

视觉身份定义系列如何被看见，不定义某一期的场景、镜头或故事节奏。

## Step 6：Voice Identity

建立系列的声音身份，而不是为某一期写旁白：

- 火山 TTS 声线；
- 叙述角色；
- 语气、节奏、停顿与情绪范围；
- 音乐方向；
- 音效密度；
- 不适合该系列的声音方式。

## Step 7：Production Configuration

记录长期可复用的生产约定：

- 平台、画幅、默认分辨率与时长范围；
- HyperFrames 项目约定与资产目录；
- Volcengine TTS、GPT Image 2 与其他 Provider 的可用性；
- 品牌资产、Logo、字体和用户素材；
- 来源、引用、版权、隐私与敏感题材的长期约束；
- 成本、速度、质量与用户参与预览的偏好；
- 最终交付约定。

## Step 8：Series Style Calibration｜系列风格校准

校准是**动态视觉身份测试**，不是第一条视频样片，也不测试选题、故事、Hook 或 Attention Spine。

在 `calibration/` 中用非叙事化的短动态试验验证：

- 图片风格与图像处理；
- 竖屏布局与字幕；
- 运动和转场语言；
- 声音身份；
- HyperFrames 组件与可播放手感；
- Narrative Contract 在视觉世界中的一致性。

可以用抽象关系、通用素材、占位文本或无具体主题的组件演示；不要把它包装成“即将发布的第一期”。校准结果只更新 `SERIES.md`、`DESIGN.md` 和生产约定。

## Series Ready

当以下内容已有工作答案，就停止系列访谈，等待用户提供具体内容后再进入 Episode Production：

1. 系列身份、内容范围与长期价值清楚；
2. Audience Profile 可指导长期取舍；
3. Narrative Contract 与 Meaning Anchor 清楚；
4. Image、Visual 与 Voice Identity 可以复用；
5. Production Configuration 和长期照护约束明确；
6. 风格校准已解决需要通过观看判断的视觉与声音问题。

不必等到所有颜色数值、全部组件或未来例外题材确定。把未知记录到 `SERIES.md` 的 Future Decisions；不要用某一期的需要倒逼系列初始化进入内容策划。

## 对话原则

每次只问一个长期决定，并给出推荐。例如：

> 你提供的内容都在解释个人选择背后的商业机制。我建议把长期承诺定义为“帮助普通人理解财富积累背后的行为和商业机制”，而非做案例新闻。这个系列更应该稳定提供机制理解，还是可执行方法？

不要问：

> 下一条视频要讲什么？

也不要为了校准而推荐“最适合测试的选题”。用户想制作具体内容时，切换到 `episode-production.md`。

## 最终项目产物

```text
project-root/
├── SERIES.md
├── DESIGN.md
├── CALIBRATION.md
├── .env
├── calibration/
└── episodes/
```

### `SERIES.md`

长期系列配置：Series Identity、Audience Profile、Narrative Contract、Image / Visual / Voice Identity、Production Configuration、Style Calibration Notes 与 Future Decisions。

### `DESIGN.md`

供 HyperFrames 与未来 Episodes 继承的视觉身份和可复用组件。

### `CALIBRATION.md`

记录系列风格校准的假设、测试素材/组件、用户反馈和最终保留的长期视觉、声音与运动决定。

### `.env`

Provider 与本地生产环境配置。

这些是人可读的工作材料，不是审批数据库或自动化创意评分系统。
