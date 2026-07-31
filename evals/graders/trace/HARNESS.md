# E3 Multi-Trial Harness Contract

> **Skill 负责生产视频；本 harness 只负责开 trial 目录、收轨迹、跑离线 grader、聚合稳定性。**  
> 不写回 `SKILL.md` / `references/` / `templates/` / `scripts/`。  
> Agent 执行本身由**外部** runner（人工会话 / CI / 自有 agent loop）完成。

设计权威：`evals/DESIGN.md` §4 E3、§8 多 trial。

## 1. 边界

| 组件 | 职责 |
| --- | --- |
| FrameSpine Skill | 生产 episode / Storyboard / Composition |
| 外部 Agent runner | 按 case 输入驱动 Skill，写 workspace |
| 本 harness（`evals/`） | 初始化目录、校验布局、调用 stage gates、聚合 multi-trial |
| Human / Vision | 软质量；不作为 synthetic 唯一真理 |

禁止：

- 在 Skill 内 import harness
- 把 trial 状态机写进运行时文档
- 只挑最好一次 trial 报通过

## 2. 目录布局

```text
evals/runs/<case-id>/
  suite-manifest.json           # multi-trial 套件元数据
  trial-1/
    trial-manifest.json
    workspace/                  # episode 工程（Agent 写入）
      ... episode files ...
      eval-artifacts/           # 见 fixtures/trial-schema/
    human/
      review-sheet.md           # 可选，人审时填
    grades/
      deterministic.json        # harness 写入
      vision.json               # 可选
      human.json                # 可选
      summary.json              # harness 写入
  trial-2/
  trial-N/
  aggregate.json                # harness 聚合
  aggregate.md
```

`evals/runs/**` 默认 gitignored；报告摘要可提交到 `evals/reports/`。

## 3. suite-manifest.json

```json
{
  "case_id": "storyboard-locked-001",
  "case_path": "evals/cases/storyboard/storyboard-locked-001.yaml",
  "target_stage": "story-flow",
  "recommended_trials": 3,
  "trial_count": 3,
  "model": "optional-label",
  "created_at": "ISO-8601",
  "mode": "live-agent",
  "notes": "external runner fills workspaces; harness grades"
}
```

## 4. trial-manifest.json

```json
{
  "case_id": "storyboard-locked-001",
  "trial": 1,
  "target_stage": "story-flow",
  "status": "pending",
  "model": "optional",
  "started_at": null,
  "completed_at": null,
  "workspace_ready": false,
  "artifacts_claimed": false,
  "notes": ""
}
```

`status`：`pending | running | complete | partial | aborted`  
（仅 eval harness 元数据，不是 Skill 生产状态机。）

## 5. 必需 eval-artifacts（按阶段）

| target_stage | 最少 artifacts |
| --- | --- |
| `story-flow` | preview-manifest, board-manifest, tool-trace, storyboard-route |
| `image-animatic` | preview-manifest, composition-manifest, tool-trace, composition-route |
| `timed-animatic` | preview-manifest, timed-manifest, tool-trace, composition-route + formal captions |
| `final` | preview-manifest, final-manifest, tool-trace, composition-route |

完整约定：`evals/fixtures/trial-schema/README.md`、`evals/graders/trace/README.md`。

## 6. tool-trace 必须可判定的 E3 问题

- 用户确认前跨阶段
- 错误 surface
- 过早 TTS / captions / batch final / export
- 静默改稿迹象（配合 SCRIPT 对照）
- 虚构 Provider 能力（配合 fixture + 声明）
- stage_stop 是否发生

事件类型最小集：

```text
tool | user_confirmation | cost_boundary | stage_stop
composition_playback | final_preview | export | render
prompt_audit | image_set_audit | high_risk_test
```

## 7. 推荐 trial 次数

```text
开发 Smoke：3
完整回归：3–5
高风险发布：5
```

Case YAML 的 `recommended_trials` 优先；否则默认 3。

## 8. 聚合指标（不做单一总分）

```text
trials_total
trials_complete
p0_free_count / p0_free_rate
all_pass
any_fail
fail_as_expected_count   # 负例 baseline
unexpected_pass_count
high_frequency_gate_failures  # 出现 ≥ ceil(N/2) 的 gate
cross_trial_stability    # stable | unstable | insufficient
verdicts[] per trial
```

`cross_trial_stability`：

- `insufficient` — complete trials < 2
- `stable` — 所有 complete trial 的 `matched` 一致且无意外
- `unstable` — complete trial 之间 matched/verdict 不一致

## 9. 外部 runner 工作流

```text
1. npm run eval:harness:init -- --case <yaml> [--trials N]
2. 外部 Agent 对每个 trial-k/workspace 执行 Skill 生产
3. Agent/harness 写入 eval-artifacts + 更新 trial-manifest status=complete
4. npm run eval:harness:grade -- --case-id <id>
5. npm run eval:harness:aggregate -- --case-id <id>
6. 人审 soft dims → human/ + grades/human.json（可选）
7. 摘要写入 evals/reports/ 如需提交
```

## 10. 命令

```bash
# 初始化 multi-trial 目录（不跑 Agent）
npm run eval:harness:init -- --case evals/cases/storyboard/storyboard-locked-001.yaml

# 校验单个 trial 布局
npm run eval:harness:validate -- --trial-dir evals/runs/storyboard-locked-001/trial-1

# 对已有 workspace 跑对应 stage deterministic gates
npm run eval:harness:grade -- --case-id storyboard-locked-001

# 聚合 multi-trial 稳定性
npm run eval:harness:aggregate -- --case-id storyboard-locked-001
```

## 11. 与 E2 synthetic 的关系

| | Synthetic | Live multi-trial |
| --- | --- | --- |
| 路径 | `evals/runs/synthetic-*/` | `evals/runs/<case-id>/trial-N/` |
| 目的 | gate 逻辑回归 | Agent 轨迹 + 稳定性 |
| Agent | 无 | 外部 runner |
| 人审 | 不需要 | Visual-Only / soft dims 需要 |

Synthetic **不能**替代 multi-trial live 稳定性。

## 12. 实现状态

| 能力 | 状态 |
| --- | --- |
| 布局约定 | 本文 + trial-schema |
| init / validate / grade / aggregate CLI | 本目录脚本 |
| 自动调用 LLM Agent | **不做**（外部） |
| 独立 trace scorer 全文对话解析 | 后续 |
| Vision 自动批跑 | 后续 |
