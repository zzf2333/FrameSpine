# 图片节拍与 HyperFrames 动态分镜

> 一拍不等于一句旁白，也不一定只使用一张图片。按注意力推进和图片信息变化拆分。
>
> **这是导演计划，不是用户可看的 Storyboard Preview。** 只有每个需要审看的 Beat 在 HyperFrames Studio / Storyboard 中绑定可渲染的 Frame composition，用户能看到实际卡片画面时，才能称为 Storyboard Preview。Outline、空白预览、仅有标题或没有可渲染 `src` 的卡片都视为未完成。
>
> `captions.json` 是 HyperFrames 实际显示字幕的唯一时间轴；本文件只说明它们怎样与图片配合。一个 Beat 可关联多个字幕组，一个字幕组也可跨 Beat 或 Scene。

# Episode Visual Anchors｜单集视觉锚点

先定义需要跨素材保持一致的真实世界，再写资产 Prompt。锚点是导演上下文，不是 Provider 自动读取的内容；每张生成素材必须在 `prompt` 中写入实际需要继承的锚点信息，或在 Provider 确认支持时通过 `extra` 映射参考图。

## Character Anchor

- 外貌、年龄与状态：
- 服装、姿态与不可变化的特征：
- 参考图片 / 已选锚点素材：

## Space Anchor

- 主要空间与功能：
- 窗户、光线方向、桌面 / 家具 / 墙面：
- 参考图片 / 已选锚点素材：

## Object Anchors

- 反复出现的物件、形态、位置与使用关系：
- 参考图片 / 已选锚点素材：

> 每张素材可声明继承哪些 Anchor，并只允许改变机位、动作、时间状态或空间累积程度。先生成高风险世界锚点，获得用户方向确认后，再扩展同一世界中的机位、过程、证据和回收图。

# 1. Scene 索引

| Scene | 承担的图片节拍 | 空间 / 视觉问题 | 为什么保持或切换 Scene | 计划转场 |
|---|---|---|---|---|
| S01 | B01–B02 |  |  |  |

> 每个 Scene 还要说明：哪些层进入、哪些持续、哪些在 Handoff 交给下一 Scene、哪些必须退出。不要用长期全屏叠层或仅靠 `z-index + opacity` 模拟剪辑。

# 2. 图片节拍

## Beat B01 —

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

# 3. 图片素材 Brief

按实际生成素材而非 Beat 一一整理。一个 Beat 可用多张素材；一张素材也可跨多个 Beat、通过裁切、Reveal 或 Handoff 重复使用。每项先写导演任务与锚点，再整理进 `image-prompts.json`。以下是人类导演 Brief，不是新 Schema：它的每个实际生成要求都必须由 Agent 写入该素材的最终 `prompt`。

## Asset `img-world-anchor`

- 使用 Beat：`B01–B03`
- 图片角色：world-anchor / 场景建立
- 叙事任务：
- 必须可见的事实和证据：
- 继承锚点 / 参考：Character Anchor 01、Space Anchor 01、
- 允许变化：机位 / 动作 / 时间状态 / 空间累积程度；具体为：
- 镜头设计：景别、机位、构图、第一眼和第二层发现：
- 物理真实细节 / 概念世界的一致性：
- 字幕、裁切、运动、分层与 Handoff 余量：
- AI 味 / 世界规则风险：
- 失败条件：
- 输出路径：`assets/images/world-anchor.png`

## Asset `img-…`

按上面字段继续添加。不要把某张素材专属的锚点、镜头、真实细节、制作余量或 AI 风险写回 Beat；Beat 只定义图片组合的观看任务。

# 4. Image Set Audit｜整组图片导演检查

在素材 Brief 完成、调用 Provider 前，作为人工导演检查整组素材；不评分、不记录批准状态，也不由脚本自动执行。

```text
- 场景建立、证据、过程、情绪、回报 / 回收的分布是否足以支撑故事？
- 景别、机位、人物姿态、构图和完成状态是否过度重复？
- 是否所有素材都落入同一种暖光、浅景深或“完整英雄构图”？
- 是否有足够桌面、手部、物件、界面、局部证据和过程镜头，而不全是封面图？
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
