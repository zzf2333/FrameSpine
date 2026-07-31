# 图片节拍与 HyperFrames 动态分镜

> 一拍不等于一句旁白，也不一定只使用一张图片。按注意力推进和图片信息变化拆分。
>
> **这是导演计划，不是用户可看的 Storyboard Preview。** Story Flow 必须把每个关键视觉状态实现为具体可审查的 Frame composition。可渲染 `src` 只是技术前提；如果 Board 上的画面序列脱离 Inspector 文字后无法基本表达人物、问题、过程、转折与回报，仍视为未完成。
>
> `captions.json` 是 HyperFrames 实际显示字幕的唯一时间轴；本文件只说明它们怎样与图片配合。一个 Beat 可关联多个字幕组，一个字幕组也可跨 Beat 或 Scene。

# Episode Visual Anchors｜单集视觉锚点

先定义需要跨素材保持一致的视觉世界，再写资产 Prompt。锚点是导演上下文，不是 Provider 自动读取的内容；每张生成素材必须在 `prompt` 中写入实际需要继承的锚点信息，或在 Provider 确认支持时通过 `extra` 映射参考图。以下是媒介中立类别，不是为每一种风格增加专属栏目。

## Entity Anchors

- 需要跨素材一致的人物、物件、符号或主体：
- 身份、造型、形态、状态与不可变化的特征：

## Environment Anchors

- 需要保持一致的空间、场景、世界或背景结构：
- 功能、比例、时间、氛围或世界规则：

## Medium Anchors

- 本期必须稳定的线条、形状、材质、表面、层次或渲染规则：
- 造型、边缘、光影、深度或媒介手感：

## Relationship Anchors

- 主体之间必须保持的比例、位置、动作、因果或阅读关系：
- 哪些关系可在本期发生变化：

## Reference Assets

- 已选定、可供继承、编辑或比较的素材：
- Provider 实际可使用的参考图参数（若已确认支持）：

> 每张素材可声明继承哪些 Anchor，并明确允许改变什么。先生成高风险视觉世界锚点，获得用户方向确认后，再扩展同一世界中的观察方式、过程、证据细节与回收图。

# Story Flow / HyperFrames Storyboard 映射

```text
Beat = 一次主要观众发现
Storyboard Frame = 这个发现过程中的一个关键视觉状态
```

简单静态发现通常使用 1 个 Frame；包含 Reveal、累积、对比或状态改变时使用 2–3 个 Frame；关键重构或回收至少展示前后两个状态。使用 `B08-F1`、`B08-F2`、`B08-F3`，或 `B08-entry`、`B08-development`、`B08-handoff` 表示同一 Beat 内的发展，不要把它们误写成新 Beat，也不代表最终剪辑必须产生同样数量的镜头。

Story Flow 将下面全部关键视觉状态按 Scene / Beat 从属和叙事顺序注册为官方 Storyboard items。每个 item 必须绑定具体可审查的视觉 Frame；Board Overview 是主要审查表面，Inspector 只是补充。不要另做自定义说明网页或普通 Composition 冒充 Storyboard。

映射合同：

```text
Frame title → Frame ID + 一个具体视觉动作
scene → Scene 名称或极短上下文；不写导演说明段落
voiceover → 只放对应 SCRIPT.md 原文范围；不改写、不总结
narrative → 最多三项：Audience Discovery / Visual Event / Handoff
src → 具体可渲染的视觉 Frame composition
status → built（官方技术状态：具体低保真 Frame composition 已存在）
```

> HyperFrames 官方 manifest 的技术 `status` 只使用既有 `outline / built / animated` 语义；Story Flow 的 Frame 有具体低保真画面后写 `built`。素材尚未确定、证据方案待验证或其他高风险写在 Frame 下方的普通 Narrative 文本中；不要创建新的 metadata key、状态枚举或 Schema，也不要占用 `scene` 存放内部状态。

Inspector 推荐只显示：

```text
VOICEOVER
AUDIENCE DISCOVERY
VISUAL EVENT
HANDOFF
PLACEHOLDER / RISK
```

完整 Narrative Contract 分析、全部 Anchors、Asset Brief、Provider 参数、Prompt、图层生命周期细节、完整失败条件和技术实现说明只留在本文件，不塞进 Inspector。Inspector 是审片辅助，不是 Agent 的数据库面板。

# Storyboard Frame Canvas Contract

**低保真表示美术完成度低，不表示视觉设计没有完成。** Frame 必须直接呈现具体主体、动作 / 状态 / 关系、视觉事实或证据、相邻变化和交给下一帧的视觉元素。用户只看 Frame 时应能准确说出发生了什么。

允许：粗略人物与空间剪影、有效参考图裁切、具体场景拼贴、灰阶分镜草图、用户素材、真实截图、以简单形状准确构成的人物 / 物件 / 因果关系、少量低成本生成图，以及明确的后续 HyperFrames 图形层位置。

禁止：旁白全文、双语字幕、导演说明、Beat 标题、Attention 标签、解释性文字、Prompt、素材路径、解释空画面的段落、无语义矩形 / 线框 / 重复容器、装饰性系列预览图。文字只有两个例外：故事中的真实对象 / 证据，或已确定进入成片的少量 Editorial Text。

# 1. Scene 索引

| Scene | 承担的图片节拍 | 空间 / 视觉问题 | 为什么保持或切换 Scene | 计划转场 |
|---|---|---|---|---|
| S01 | B01–B02 |  |  |  |

> 每个 Scene 还要说明：哪些层进入、哪些持续、哪些在 Handoff 交给下一 Scene、哪些必须退出。不要用长期全屏叠层或仅靠 `z-index + opacity` 模拟剪辑。

# 2. 图片节拍

## Beat B01 —

### Frame B01-F1 — 具体视觉动作

- status: built
- src: compositions/frames/01-b01-f1.html
- scene: Scene 名称或极短上下文
- voiceover: `SCRIPT.md` 对应原文范围；逐字，不总结

**Audience Discovery**：这一帧让观众新理解什么。

**Visual Event**：画面具体发生什么。

**Handoff**：哪个物件、动作、方向、关系或构图交给下一帧。

**Placeholder / Risk**（仅在有实际未确定项时填写）：素材、证据方案或高风险的自然语言说明。

### Frame B01-F2 — 若本 Beat 有 Reveal / 累积 / 对比 / 状态改变

- status: built
- src: compositions/frames/02-b01-f2.html
- scene:
- voiceover:

**Audience Discovery**：

**Visual Event**：

**Handoff**：

**Placeholder / Risk**（可选）：

#### Beat 导演计划（不塞进 Inspector）

- 注意力作用：Hook / Reveal / Evidence / Contrast / Reframe / Payoff / Callback / 其他
- 对应 `SCRIPT.md` 原文范围：
- 图片要让观众理解：
- 图片要让观众感受：
- 图片让观众接下来期待：
- 要承接的互动 / 停顿 / 情绪 / 关系功能：
- 图片具体证明：
- 主体、动作与环境：
- 第一眼焦点：
- 后续揭示：
- Narrative Contract 角色：evidence / representation / metaphor / emotional environment / imagined world；本拍继承或覆盖的 Reality Level / Story License；怎样服务本期 Meaning Anchor：
- 图片组合：本拍需要哪些素材类型、它们一起怎样完成发现；不要假设一拍只用一张图
- 图片角色分布：场景建立 / 人物处境 / 行为过程 / 对比 / 证据 / 机制 / 后果 / 情绪承载 / 过渡 / 回收
- 图片结构：单图揭示 / 同构替换 / 多图累积 / 证据放大 / 拼贴 / 图形层 / 其他
- 主视觉事件：本拍唯一主要变化；次要运动只服务它
- 媒体适配：full-bleed cover / intentional frame；若留黑或不铺满，说明叙事原因
- Scene / Transition 关系：同一 Scene / hard cut / 官方 transition；前后关系是什么
- 图层生命周期：本拍进入什么、持续什么、退出什么、交给下一拍什么
- Entry：
- Development：
- Emphasis：
- Handoff：
- 关联字幕：`C01–C03`；写明各组与本拍的关系，例如 `C02` 出现时开始推近，`C03` 出现时揭示第一笔收入；具体文本、时间和组内换行只写入 `captions.json`
- 字幕安全区与主体保护：
- 编辑文字：默认无；如需要，写内容、唯一作用和持续时间
- 素材策略：GPT Image 2 / 用户素材 / 截图 / 系列资产 / HyperFrames 图形 / 混合
- HyperFrames 实现提示：
- 失败条件：什么样的画面会变成普通配图或无法证明内容

## Beat B02 —

按 B01 结构继续：先列本 Beat 的一个或多个 Frame，再写 Beat 导演计划。

# 3. 图片素材 Brief

按实际生成素材而非 Beat 一一整理。一个 Beat 可用多张素材；一张素材也可跨多个 Beat、通过裁切、Reveal 或 Handoff 重复使用。每项先写导演任务与锚点，再整理进 `image-prompts.json`。以下是人类导演 Brief，不是新 Schema：它的每个实际生成要求都必须由 Agent 写入该素材的最终 `prompt`。

## Asset `img-world-anchor`

- 使用 Beat：`B01–B03`
- 图片角色：world-anchor / 场景建立
- 叙事任务：
- 必须可见的事实和证据：
- 继承锚点 / 参考：Entity / Environment / Medium / Relationship Anchor：
- 允许变化：观察方式 / 动作 / 时间状态 / 空间或世界状态；具体为：
- 构图与观察方式：距离、方向、构图、第一眼和第二层发现：
- 媒介实现与材质 / 世界一致性：
- 字幕、裁切、运动、分层与 Handoff 余量：
- 媒介一致性与生成风险：身份漂移 / 材质漂移 / 边缘规则漂移 / 空间规则矛盾 / 媒介混杂 / 关键事实不可读 / Provider 常见生成错误；本素材具体为：
- 失败条件：
- 输出路径：`assets/images/world-anchor.png`

## Asset `img-…`

按上面字段继续添加。不要把某张素材专属的锚点、构图/观察方式、媒介实现、一致性、制作余量或风险写回 Beat；Beat 只定义图片组合的观看任务。

# 4. Image Set Audit｜整组图片导演检查

在素材 Brief 完成、调用 Provider 前，作为人工导演检查整组素材；不评分、不记录批准状态，也不由脚本自动执行。

```text
- 场景建立、证据、过程、情绪、回报 / 回收的分布是否足以支撑故事？
- 观察方式、主体状态、构图和完成状态是否过度重复？
- 是否所有素材都落入同一种默认 AI 表现、媒介手感或“完整英雄构图”？
- 是否有足够与当前媒介相符的局部证据、过程、关系和状态变化，而不全是封面图？
- 前后素材是否属于同一世界，同时各自完成不同观看任务？
- 哪些素材需要先作为高风险候选放入真实竖屏 Composition 测试？
```

> Prompt Audit 保证单张素材成立；Image Set Audit 防止整条视频变成同一批 AI 图库。

# 5. 仍影响后续制作的用户决定

只记录会改变 Beat、图片关系、Scene、声音或节奏的创作选择；解决后更新正文或删除。不要记录批准历史、Studio route、播放次数或工具日志。

- 选择：
- 不采用：
- 后续影响：

# 6. Story Flow 反馈

-

# 7. Image Animatic 反馈

-

# 8. 正式 TTS 后的时间调整

-

# 9. Final 图片和动效修改

-
