# FrameSpine Eval Suite

**Skill 负责生产视频；Eval 负责验证 Skill 有没有按照设计生产。**

设计权威：[`DESIGN.md`](./DESIGN.md)  
本文件是**运行入口与实现状态**；与设计冲突时以 `DESIGN.md` 为准，并修正实现或更新设计版本说明。

评分器、测试案例、失败样例与报告只存在于 `evals/`，不得写回：

```text
SKILL.md
references/
templates/
scripts/
```

运行时 Skill 继续由真实用户预览验收；离线 Eval 可以评分，两者不冲突。

## 六层结构

```text
E0  静态合同检查
E1  单能力测试
E2  阶段产物测试
E3  Agent 轨迹测试
E4  端到端生产测试
E5  鲁棒性与回归测试
```

正式报告输出（**不要**一个掩盖问题的总分）：

```text
硬性违规
各阶段通过情况
不同能力切片表现
人工审片结果
失败根因与唯一修复位置
```

## 目录

```text
evals/
├── DESIGN.md                 # 第一版设计权威
├── README.md                 # 本文件
├── cases/
│   ├── series/               # E1/E4
│   ├── locked-script/        # E1
│   ├── development/          # E1
│   ├── revision/             # E1
│   ├── storyboard/           # E2 Story Flow（v1 优先）
│   ├── animatic/             # E2 Image Animatic
│   ├── timed/                # E2 Timed Animatic
│   ├── final/                # E2 Final Composition
│   ├── providers/            # E1
│   └── adversarial/          # E5
├── fixtures/
├── rubrics/
├── graders/
│   ├── deterministic/
│   ├── trace/
│   ├── visual/
│   └── human/
├── baselines/
├── runs/                     # gitignored
└── reports/
```

## 原则

1. **Eval 不污染 Skill** — 具体故事、错误样例、评分标准只在本目录。  
2. **沿真实阶段测试** — Locked / Development / Revision + 四成熟阶段，不只看最终导出。  
3. **轨迹与产物并重** — 跨阶段、错误 surface、虚构 Provider、静默改稿必须可抓。  
4. **硬门禁与软质量分离** — P0 不可被高分抵消；软质量 0/1/2，先看切片。  
5. **同一 case 多 trial** — smoke ≥3；回归 3–5；高风险 5。不挑最好一次。  
6. **失败回写唯一权威位置** — Skill 文档一处，或“只加 regression case”。  
7. **新增 case 来自真实失败** — 不为凑覆盖率线性扩脚手架；稳态约 25–40 稳定 case。

## 实现状态（对照 DESIGN）

| 层 | 状态 | 入口 / 位置 |
| --- | --- | --- |
| **E0** 静态合同 | **可跑** | `npm run eval:e0` |
| **E1** 单能力 | **骨架** | `cases/{locked-script,development,revision,series,providers}/` 多为 README；部分能力嵌在阶段 case |
| **E2** Story Flow | **已稳** | `npm run eval:storyboard`；live trial 有限 |
| **E2** Image Animatic | **硬门禁可跑** | `npm run eval:animatic`；soft/Studio 人审不足 |
| **E2** Timed Animatic | **硬门禁可跑** | `npm run eval:timed`；无 live 正式 TTS 套件 |
| **E2** Final | **硬门禁可跑** | `npm run eval:final`；无 live Final Preview 人审 |
| **E3** 轨迹 | **部分** | `graders/trace/` schema；gates 读 tool-trace；无完整多 trial harness |
| **E4** 端到端 | **未建** | — |
| **E5** 对抗/回归 | **部分** | 阶段负例 baseline + `cases/adversarial/` placeholder |

### Storyboard 五门（v1 优先，设计 §5）

```text
Surface Gate
Frame Canvas Gate
Sequence Gate
Source Separation Gate
Stage Boundary Gate
```

主软指标：`Visual-Only Comprehension Rate`（需 Studio 人审，不可仅靠 synthetic）。

## 运行

### E0

```bash
npm run eval:e0
# 或
node evals/graders/deterministic/e0-static-contracts.mjs
```

### Case 校验

```bash
npm run eval:cases
# 或
node evals/graders/deterministic/validate-cases.mjs
```

### E2 阶段套件（当前可自动跑）

```bash
npm run eval:storyboard   # E0 + cases + storyboard synthetic matrix
npm run eval:animatic     # cases + image-animatic synthetic matrix
npm run eval:timed        # cases + timed-animatic synthetic matrix
npm run eval:final        # cases + final synthetic matrix
```

分项：

```bash
npm run eval:synthetic          # storyboard synthetic only
npm run eval:animatic:build
npm run eval:animatic:grade
npm run eval:timed:build
npm run eval:timed:grade
npm run eval:final:build
npm run eval:final:grade
```

### 单 trial workspace

```bash
node evals/graders/deterministic/storyboard-gates.mjs \
  --case evals/cases/storyboard/storyboard-locked-001.yaml \
  --workspace evals/runs/synthetic/storyboard-locked-001/workspace

node evals/graders/deterministic/image-animatic-gates.mjs \
  --case evals/cases/animatic/image-animatic-locked-001.yaml \
  --workspace evals/runs/synthetic-animatic/image-animatic-locked-001/workspace

node evals/graders/deterministic/timed-animatic-gates.mjs \
  --case evals/cases/timed/timed-animatic-locked-001.yaml \
  --workspace evals/runs/synthetic-timed/timed-animatic-locked-001/workspace \
  --source-script evals/fixtures/inputs/locked-script-a.md

node evals/graders/deterministic/final-gates.mjs \
  --case evals/cases/final/final-locked-001.yaml \
  --workspace evals/runs/synthetic-final/final-locked-001/workspace
```

## Trial 产物约定

| 类型 | 路径 | 用途 |
| --- | --- | --- |
| Synthetic Storyboard | `evals/runs/synthetic/<case-id>/` | gate 逻辑回归 |
| Synthetic Image Animatic | `evals/runs/synthetic-animatic/<case-id>/` | gate 逻辑回归 |
| Synthetic Timed | `evals/runs/synthetic-timed/<case-id>/` | gate 逻辑回归 |
| Synthetic Final | `evals/runs/synthetic-final/<case-id>/` | gate 逻辑回归 |
| Live agent | `evals/runs/<case-id>/<trial>/` | 真实 Agent + Studio |

### Story Flow

```text
eval-artifacts/preview-manifest.json
eval-artifacts/board-manifest.json
eval-artifacts/tool-trace.json
eval-artifacts/storyboard-route.txt
```

### Image Animatic

```text
eval-artifacts/preview-manifest.json
eval-artifacts/composition-manifest.json
eval-artifacts/tool-trace.json
eval-artifacts/composition-route.txt
```

### Timed Animatic

```text
eval-artifacts/preview-manifest.json
eval-artifacts/timed-manifest.json
eval-artifacts/tool-trace.json
eval-artifacts/composition-route.txt
captions.json
audio/ 或 formal TTS claim
```

### Final

```text
eval-artifacts/preview-manifest.json
eval-artifacts/final-manifest.json
eval-artifacts/tool-trace.json
eval-artifacts/composition-route.txt
video/composition.html
```

`board-manifest.json` 的 `frames[].canvas.kind`：`empty | generic | concrete`。  
Deterministic grader 信任结构化 claim 做回归；Vision / Human 核对与真实 Studio 一致。

完整 harness 布局见 `graders/trace/README.md`。

## 评分与 grader

| Grader | 位置 | 角色 |
| --- | --- | --- |
| Deterministic | `graders/deterministic/` | P0 文件/工具/route/阶段边界 |
| Trace | `graders/trace/` | 轨迹约定与（后续）轨迹规则 |
| Visual / LLM | `graders/visual/` | 离线初筛，非 release 唯一真理 |
| Human | `graders/human/` | Visual-Only、sync、pairwise |

P0 与软维度定义见 `DESIGN.md` §6 与 `rubrics/`。

## 核心指标（10）

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

切片：Locked / Development / Revision × 媒介 × 内容类型 × 阶段 × Provider。

## 报告

- 模板：`reports/REPORT_TEMPLATE.md`
- 错误分类：`reports/ERROR_TAXONOMY.md`
- 阶段 offline 报告：`reports/STORYBOARD_*`、`IMAGE_ANIMATIC_*`、`TIMED_ANIMATIC_*`

## 与 Skill 的边界

| 位置 | 职责 |
| --- | --- |
| Skill / references / templates | 抽象生产工艺与合同 |
| Eval cases | 具体测试内容与金标准 |
| Rubrics | 判断标准 |
| Graders | 离线检查器 |
| Reports | 结果、失败分类、唯一修复位置 |

**Eval 不判断 Agent 有没有“看起来很努力”，而是判断它是否在正确阶段、使用正确表面、生产正确产物、遵守正确边界，并让用户能够做出当前阶段真正应该做的判断。**

## 下一步（按 DESIGN §11，不抢跑）

1. **守住 v1 Storyboard** — 保持 offline 绿；Studio Visual-Only 人审；真实失败再加 case。  
2. **四阶段边界** — Story/Image/Timed/Final 硬门禁均可跑；feedback 返回路径与 live Final 仍待。  
3. **E3 harness** — 外部多 trial 写入 `runs/`；不把 harness 塞进 Skill。  
4. **E4** — 25–40 稳定 case 的高风险交叉，而非全排列。  
5. **瘦身** — 共享 synthetic/gate 脚手架，避免每阶段再复制一套。
