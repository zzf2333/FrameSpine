# 图片节拍与 HyperFrames 动态分镜

> 一拍不等于一句旁白，也不一定只使用一张图片。按注意力推进和图片信息变化拆分。
>
> **这是导演计划，不是用户可看的 Storyboard Preview。** 只有每个需要审看的 Beat 在 HyperFrames Studio / Storyboard 中绑定可渲染的 Frame composition，用户能看到实际卡片画面时，才能称为 Storyboard Preview。Outline、空白预览、仅有标题或没有可渲染 `src` 的卡片都视为未完成。
>
> `captions.json` 是 HyperFrames 实际显示字幕的唯一时间轴；本文件只说明它们怎样与图片配合。一个 Beat 可关联多个字幕组，一个字幕组也可跨 Beat 或 Scene。

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

# 3. 图片生成 Brief

对需要生成的图片，先写导演任务，再整理进 `image-prompts.json`。

| 图片 ID | 对应 Beat | 用途与可见证据 | 构图和运动余量 | 连续性 / 参考 | 输出路径 |
|---|---|---|---|---|---|
| beat-01 | B01 |  |  |  | assets/images/beat-01.png |

# 4. 仍影响后续制作的用户决定

只记录会改变 Beat、图片关系、Scene、声音或节奏的创作选择；解决后更新正文或删除。不要记录批准历史、Studio route、播放次数或工具日志。

- 选择：
- 不采用：
- 后续影响：

# 5. Story Flow 反馈

-

# 6. Image Animatic 反馈

-

# 7. 正式 TTS 后的时间调整

-

# 8. Final 图片和动效修改

-
