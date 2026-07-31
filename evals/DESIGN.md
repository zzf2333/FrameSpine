# FrameSpine Eval Design v1

> **Skill 负责生产视频；Eval 负责验证 Skill 有没有按照设计生产。**
>
> 本文件是 `evals/` 的第一版设计权威。实现可以落后于设计，但不得把评分器、测试状态或测试案例写进运行时 Skill。

## 0. 边界（不可协商）

```text
Skill / references / templates / scripts
→ 抽象生产工艺与合同；生产视频

evals/
→ 具体测试内容、金标准、rubric、grader、报告；验证 Skill
```

禁止：

- 把评分器、测试案例、approval 状态写进 `SKILL.md` / `references/` / `templates/`
- 让 runtime Skill import `evals/`
- 用“看起来很努力”代替阶段 / surface / 产物 / 边界检查
- 输出一个容易掩盖问题的单一总分

允许：

- 离线 Eval 评分（与运行时“不做创意评分门禁”不冲突）
- 具体故事、错误样例、fixture 只存在于 `evals/`
- 真实失败模式回写为 regression case

## 1. 六层结构

```text
E0  静态合同检查
E1  单能力测试
E2  阶段产物测试
E3  Agent 轨迹测试
E4  端到端生产测试
E5  鲁棒性与回归测试
```

正式报告输出（不输出易掩盖问题的总分）：

```text
硬性违规
各阶段通过情况
不同能力切片表现
人工审片结果
失败根因与唯一修复位置
```

Agent 会跨多步调用工具、修改文件和改变环境，所以只评最终产物不够；还要保存并检查完整 trajectory（对话、工具调用、文件变更、预览 route、阶段停止位置）。同一任务应运行多次 trial。

## 2. 目录

```text
evals/
├── DESIGN.md                 # 本文件：设计权威
├── README.md                 # 运行入口与实现状态
├── cases/
│   ├── series/               # E1/E4 系列初始化与校准
│   ├── locked-script/        # E1 Locked Script 保真
│   ├── development/          # E1 Development 路由
│   ├── revision/             # E1 Revision 路由
│   ├── storyboard/           # E2 Story Flow（v1 优先）
│   ├── animatic/             # E2 Image Animatic
│   ├── timed/                # E2 Timed Animatic（实现扩展；属四阶段边界）
│   ├── providers/            # E1 Provider 能力边界
│   └── adversarial/          # E5 压力与回归
├── fixtures/
│   ├── series-projects/
│   ├── user-assets/
│   ├── inputs/
│   ├── provider-capabilities/
│   ├── expected-boundaries/
│   └── trial-schema/
├── rubrics/
│   ├── core-compliance.md
│   ├── storyboard.md
│   ├── image-animatic.md
│   ├── timed-animatic.md
│   ├── final.md
│   └── collaboration.md
├── graders/
│   ├── deterministic/
│   ├── trace/
│   ├── visual/
│   ├── human/
│   └── lib/
├── baselines/
├── runs/                     # 本地 trial 产物；gitignored
└── reports/
```

说明：

- 设计原文用 `animatic/` 覆盖动画阶段；实现将 **Image Animatic** 与 **Timed Animatic** 分目录，便于 gate 与成本边界分离。二者都属于 E2 阶段产物测试。
- `must_do` / `must_not_do` 是 **case 金标准**，不进入 FrameSpine Core。

## 3. Case 最小格式

```yaml
id: storyboard-locked-001
suite: storyboard
slice:
  input_mode: locked-script
  visual_medium: supplied-by-fixture
  content_type: character-story
  stage: story-flow

start_state:
  series_fixture: fixtures/series-projects/series-a
  user_input: fixtures/inputs/locked-script-a.md

target_stage: story-flow
expected_result: pass   # pass | fail（负例 baseline）

must_do:
  - preserve authoritative script
  - create official HyperFrames storyboard
  - represent all key visual states
  - stop after storyboard handoff

must_not_do:
  - rewrite source text
  - build a custom storyboard webpage
  - burn narration or director notes into frame canvas
  - start full composition playback
  - call formal TTS
  - generate final images

required_artifacts:
  - EPISODE.md
  - SCRIPT.md
  - STORYBOARD.md
  - official storyboard route
  - renderable frame sources

gates:
  - surface
  - frame_canvas
  - sequence
  - source_separation
  - stage_boundary

human_review:
  - can the visual sequence be understood without inspector text
  - are adjacent frames meaningfully different
  - does the sequence preserve the source narrative
```

可选：

```text
case_kind: negative-baseline | diagnostic
release_gate: true | false
recommended_trials: 3 | 5
```

`diagnostic` case 可保留诊断价值，但不作为 release gate。

## 4. 各层测什么

### E0 静态合同检查

不运行 Agent，直接检查 Skill 仓库。

- 核心文件有没有偷偷写入具体故事内容
- 是否把某一种视觉媒介当默认
- 是否又出现“一句旁白一张图”
- Story Flow 是否仍明确使用官方 Storyboard
- Image Animatic 是否仍是第一次完整播放
- `prompt` 模板是否为空
- scripts 是否开始承担创意判断
- 是否新增审批状态、评分门禁或 Prompt 编译器
- 同一概念是否出现相互矛盾的定义（复杂冲突仍人工）

实现入口：`evals/graders/deterministic/e0-static-contracts.mjs`

### E1 单能力测试

一次只测一个能力，不跑完整视频。

```text
输入路由
Locked Script 保真
Attention Spine 提取 / 构建
系列与单集边界
Visual Medium 中立性
Beat / Frame / Asset 区分
Prompt Assembly
Provider 能力边界
用户反馈根因定位
阶段停止行为
```

目录：`cases/locked-script/`、`development/`、`revision/`、`series/`、`providers/`

### E2 阶段产物测试

分别测试四个成熟阶段，不要求每个 case 都跑到 Final。

| 阶段 | 目录 | 重点 |
| --- | --- | --- |
| Story Flow | `cases/storyboard/` | Surface + Frame + Sequence + Source Separation + Stage Stop |
| Image Animatic | `cases/animatic/` | 已确认 Storyboard → 第一次完整播放；低成本；无 TTS/最终图 |
| Timed Animatic | `cases/timed/` | 成本说明在 TTS 前；正式声音与 `captions.json`；不改稿；不进 Final |
| Final | （后续 `cases/final/` 或扩展） | 确认后生图；Prompt/Image Set Audit；Final Preview 后等待 render 许可 |

### E3 Agent 轨迹测试

即使最终结果看起来不错，也检查是否：

- 用户确认前跨阶段
- 完整 Storyboard 做成普通网页
- Story Flow 时调用 TTS
- 为修图片静默改稿
- 虚构 Provider 能力 / 假装已上传 reference
- 修改多个权威位置修同一问题
- 用户反馈后返回错误层级
- Final Preview 前导出
- 频繁微审批普通制作动作

Harness 产物见 `graders/trace/README.md`。

### E4 端到端生产测试

从干净系列项目跑到指定终点：

```text
Series inheritance
→ Input routing
→ Attention / Narrative
→ Story Flow
→ Image Animatic
→ Timed Animatic
→ Final
```

覆盖维度（高风险交叉，非全排列）：

- 输入：Locked / Development / Revision
- 媒介：摄影型 / 插画漫画 / 实体工艺 / 新媒介 / 主+辅媒介
- 内容：人物故事 / 机制 / 证据密集 / 对比过程 / 情绪 / 混合
- 条件：有无参考素材、Provider 是否支持 reference、精确文字后期、生成失败、中途改方向

目标稳态约 **25–40** 个稳定 case，每个 **3** 次 trial（非无限膨胀）。

### E5 鲁棒性与回归测试

压力与真实失败回写：

- “快一点，直接跳过”
- 冲突约束
- 看似完整但局部改稿
- “太慢 / 不像视频 / 很 AI”
- Board 可开但 Frame 空框
- Inspector 完整但 Board 看不懂
- 图漂亮但不证明内容
- 媒介对但构图重复
- Provider 错误尺寸/素材
- 旧项目残留 Scene
- 单集问题却想改 `DESIGN.md`

目录：`cases/adversarial/` + 各阶段负例 baseline。

## 5. Storyboard 专项（第一优先级）

### 5.1 Surface Gate

```text
官方 HyperFrames Storyboard route
Board Overview 存在
关键 Frame 有可渲染 src
无自定义说明网页冒充 Storyboard
未进入完整 Composition 播放
```

任一项失败 → 整个 Story Flow case 失败。

### 5.2 Frame Canvas Gate

每 Frame：

- 具体可见主体、状态、关系或证据
- 非空框 / 无语义矩形 / 通用图标
- 不把旁白、字幕、导演说明、生产信息烧入画布
- 不依赖右侧说明才能知道发生了什么
- 符合当前 Visual Medium

需要：Vision 初筛 + 人工抽查/正式审片。

### 5.3 Sequence Gate

隐藏 Inspector，只看 Board Overview：

- 能否大致复述视觉进展
- 相邻 Frame 是否有可见变化
- 过程 / 揭示 / 对比 / 重构是否展示足够关键状态
- 是否存在明显重复
- Handoff 是否可见
- 开头、发展、回报是否形成关系

主软指标：

```text
Visual-Only Comprehension Rate
= 不看 Voiceover / Narrative 时，
  评审者正确识别主要视觉进展的测试比例
```

### 5.4 Source Separation Gate

```text
SCRIPT 原文只在 Source Text / Voiceover
字幕不进 Frame Canvas
导演说明不烧入 Frame
Prompt / 资产路径不出现在用户画面
精确证据有真实素材或 HyperFrames 实现计划
```

### 5.5 Stage Boundary Gate

Story Flow 后：

- 交付 Board route
- 说明 Scene / Beat / Frame 与风险
- 停止并等待用户确认
- 未开始 Image Animatic 或 TTS

## 6. 硬门禁与软质量

### P0 Hard Gates（不可被高分抵消）

```text
改写 Locked Script
使用错误预览 surface
Frame Canvas 混入旁白 / 字幕 / 导演说明
关键 Frame 只是空框或无语义占位
未确认就跨阶段
虚构 Provider 能力
正式证据被无说明的生成图替代
Final Preview 前 render
```

出现一个 P0 → 该 trial 失败。

### 软质量维度（0 / 1 / 2）

```text
0  不成立
1  部分成立
2  清楚成立
```

```text
Intent Fidelity
Attention Structure
Visual Narrativity
Sequence Development
Medium Coherence
Continuity
Production Affordance
Collaboration Clarity
Technical Readiness
```

先按维度和切片查看，不要急着加总。

阶段专用 soft dims 见各 `rubrics/*.md`（如 viewing_drive、source_fidelity）。

## 7. Grader 组合

| 类型 | 适合 | 不能 |
| --- | --- | --- |
| Deterministic | 文件、逐字保留、禁止工具、route、提前 TTS/render、空 prompt、src、Frame 数序、阶段停止 | 单独裁定视觉叙事质量 |
| Vision / LLM | 空框、烧字、Inspector 依赖、相邻重复、媒介提示 | 未校准前作 release 唯一真理 |
| Human Expert | Visual-Only、Attention 路径、媒介与运动匹配、是否可交真实用户 | 被“打总分”替代盲比 |

创意质量推荐盲评 pairwise：

```text
当前版本 vs 上一个稳定版本
```

baselines 存于 `evals/baselines/`，不是 Skill 资产。

## 8. 多 trial

```text
开发 Smoke：3 trials
完整回归：3–5 trials
高风险发布项：5 trials
```

分别记录：全部通过 / 至少一次失败 / 高频失败 / 输出波动。不挑最好一次。

## 9. 十个核心指标

```text
1. P0-Free Trial Rate
2. Input Routing Accuracy
3. Locked Script Preservation Rate
4. Correct Preview Surface Rate
5. Storyboard Visual-Only Comprehension Rate
6. Stage Stop Accuracy
7. Medium Transfer Success Rate
8. Root-Cause Repair Accuracy
9. Human Pairwise Preference Win Rate
10. Cross-Trial Stability
```

按切片查看：

```text
Locked / Development / Revision
不同媒介
不同内容类型
不同阶段
不同 Provider 条件
```

## 10. Eval 自身 QA

Case 进入正式套件前检查：

- 目标行为是否明确
- 输入是否充分
- 必需 fixture 是否存在
- gold expectation 是否可实现
- 两位评审者是否理解一致
- 是否把个人审美误写成硬规则
- 是否“无论怎么做都失败”

模糊但有诊断价值 → `diagnostic`，不是 release gate。

## 11. 实施顺序（设计原文）

### 第一版：Storyboard 专项

8–12 个 case，覆盖：

- 三种输入模式
- 单一与混合媒介
- 单状态 Beat / 发展型 Beat
- 证据型 Frame
- 空框 baseline
- 旁白烧入 Frame
- 官方 Storyboard vs 错误自定义页面

### 第二版：四阶段边界

- Image Animatic
- Timed Animatic
- Final
- 用户确认前后禁止动作
- feedback 返回路径

### 第三版：完整端到端

约 25–40 个稳定 case × 3 trials；早期人工审阅一批真实输出以形成 error taxonomy。

## 12. 报告形态

见 `evals/reports/REPORT_TEMPLATE.md`。原则：

> Eval 不判断 Agent 有没有“看起来很努力”，而是判断它是否在正确阶段、使用正确表面、生产正确产物、遵守正确边界，并让用户能够做出当前阶段真正应该做的判断。

## 13. 与实现的关系

| 层 | 设计要求 | 实现状态见 README |
| --- | --- | --- |
| E0 | 必做 | 已可跑 |
| E1 | 目录 + 后续 case | 多为 placeholder；部分能力嵌在 storyboard/timed cases |
| E2 Storyboard | v1 优先 | 已稳（offline + 有限 live） |
| E2 Image / Timed | 第二版 | offline gates 已可跑；软质量/人审不足 |
| E2 Final | 第二版 | offline gates 已可跑（`npm run eval:final`）；无 live 人审 |
| E3 Trace | 关键 | 约定 + init/validate/grade/aggregate CLI；Agent 执行外部；无自动 agent loop |
| E4 E2E | 第三版 | 未建 |
| E5 Adversarial | 持续 | 负例 baseline 已有；目录待充实 |

**新增 case 规则：** 优先来自真实生产/试跑失败；禁止为“凑覆盖率”线性复制脚手架。稳态目标 25–40 稳定 case，不是无限增长。
