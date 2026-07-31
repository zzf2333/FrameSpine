# FrameSpine Eval Suite

**Skill 负责生产视频；Eval 负责验证 Skill 有没有按照设计生产。**

本目录独立于 FrameSpine 运行时 Skill。评分器、测试案例、失败样例与报告只存在于 `evals/`，不得写回：

```text
SKILL.md
references/
templates/
scripts/
```

运行时 Skill 继续由真实用户预览验收；离线 Eval 可以评分，两者不冲突。

## 总结构

```text
E0  静态合同检查
E1  单能力测试
E2  阶段产物测试
E3  Agent 轨迹测试
E4  端到端生产测试
E5  鲁棒性与回归测试
```

不输出一个容易掩盖问题的总分。正式报告输出：

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
├── README.md
├── cases/
│   ├── series/
│   ├── locked-script/
│   ├── development/
│   ├── revision/
│   ├── storyboard/          # v1 优先
│   ├── animatic/
│   ├── providers/
│   └── adversarial/
├── fixtures/
│   ├── series-projects/
│   ├── user-assets/
│   ├── inputs/
│   ├── provider-capabilities/
│   └── expected-boundaries/
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
│   └── human/
├── baselines/
├── runs/                    # 本地运行产物，不提交
└── reports/
```

## 原则

1. **Eval 不污染 Skill**  
   具体故事、错误样例、评分标准和测试状态只放在本目录。

2. **沿真实阶段测试**  
   按 Locked / Development / Revision 输入路由，以及 Story Flow → Image Animatic → Timed Animatic → Final 四个成熟阶段检查，不只看最终导出视频。

3. **轨迹与产物并重**  
   即使最终产物看起来不错，也要检查是否跨阶段、是否错误 surface、是否虚构 Provider 能力、是否静默改稿。

4. **硬门禁与软质量分离**  
   P0 不能被高分抵消。软质量用 0 / 1 / 2 维度记录，先看切片，不要急着加总。

5. **同一 case 多 trial**  
   开发 smoke 至少 3 次；完整回归 3–5 次；高风险发布项 5 次。不挑最好一次。

6. **失败回写唯一权威位置**  
   报告必须指出应更新 `SKILL.md`、某个 core reference、模板，还是“无需改 Skill，只加 regression case”。

## 运行

### E0 静态合同检查

```bash
node evals/graders/deterministic/e0-static-contracts.mjs
```

### 校验 case 文件格式

```bash
node evals/graders/deterministic/validate-cases.mjs
```

### 一次性跑 v1 Storyboard 套件入口

```bash
npm run eval:storyboard
```

当前 v1 自动跑：

```text
E0 静态合同
→ case 校验
→ 合成 trial 构建
→ deterministic Storyboard gate matrix
```

### Image Animatic 套件（v2 slice）

```bash
npm run eval:animatic
```

自动跑：

```text
case 校验
→ Image Animatic 合成 trial 构建
→ deterministic Image Animatic gate matrix
```

```bash
npm run eval:e0
npm run eval:cases
npm run eval:synthetic
npm run eval:animatic
```

对单个 trial workspace：

```bash
node evals/graders/deterministic/storyboard-gates.mjs \
  --case evals/cases/storyboard/storyboard-locked-001.yaml \
  --workspace evals/runs/synthetic/storyboard-locked-001/workspace

node evals/graders/deterministic/image-animatic-gates.mjs \
  --case evals/cases/animatic/image-animatic-locked-001.yaml \
  --workspace evals/runs/synthetic-animatic/image-animatic-locked-001/workspace
```

### 合成 trial 与真实 trial

| 类型 | 路径 | 用途 |
| --- | --- | --- |
| Synthetic Storyboard | `evals/runs/synthetic/<case-id>/` | 验证 Storyboard gate 逻辑 |
| Synthetic Animatic | `evals/runs/synthetic-animatic/<case-id>/` | 验证 Image Animatic gate 逻辑 |
| Live agent | `evals/runs/<case-id>/<trial>/` | 真实 Agent 产物 + Studio 预览 |

Story Flow trial 需写入：

```text
eval-artifacts/preview-manifest.json
eval-artifacts/board-manifest.json
eval-artifacts/tool-trace.json
eval-artifacts/storyboard-route.txt
```

Image Animatic trial 需写入：

```text
eval-artifacts/preview-manifest.json
eval-artifacts/composition-manifest.json
eval-artifacts/tool-trace.json
eval-artifacts/composition-route.txt
```

`board-manifest.json` 的 `frames[].canvas.kind` 取值：`empty | generic | concrete`。  
Vision / Human 负责核对 manifest 与真实 Studio 一致；deterministic grader 信任结构化 claim 做回归。

需要 Agent trajectory、Vision 初筛与 Human Expert 的部分，按 `rubrics/` 与 `graders/human/` 执行，结果写入 `runs/` 与 `reports/`。

## 当前范围

### v1 Story Flow Storyboard Eval（已稳）

```text
Surface Gate
Frame Canvas Gate
Sequence Gate
Source Separation Gate
Stage Boundary Gate
```

### v2 Image Animatic Eval（已可跑）

```text
Composition Surface Gate
Prior Story Confirm Gate
Full Playback Gate
Inherits Storyboard Gate
Low-Cost Media Gate
Motion Structure Gate
No Formal TTS / Captions / Export
Stage Boundary Gate
```

仍未覆盖：Timed Animatic、Final、Series Calibration、端到端多 trial harness。

## 核心指标

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

## 与 Skill 的边界

| 位置 | 职责 |
| --- | --- |
| Skill / references / templates | 抽象生产工艺与合同 |
| Eval cases | 具体测试内容与金标准 |
| Rubrics | 判断标准 |
| Graders | 离线检查器 |
| Reports | 结果、失败分类、唯一修复位置 |

**Eval 不判断 Agent 有没有“看起来很努力”，而是判断它是否在正确阶段、使用正确表面、生产正确产物、遵守正确边界，并让用户能够做出当前阶段真正应该做的判断。**
