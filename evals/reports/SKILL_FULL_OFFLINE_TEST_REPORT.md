# FrameSpine Skill — Full Offline Test Report

```text
Generated: 2026-07-31T11:52:28Z (UTC)
Repo HEAD: 41e50d5
Subject:   Current FrameSpine Skill implementation (docs + offline eval gates)
Runner:    In-repo npm eval scripts + E3 harness regrade of existing live workspaces
Authority: evals/DESIGN.md (v1) · evals/README.md (runbook)
```

---

## 1. Executive verdict

| Layer | Result |
| --- | --- |
| **Overall hard-gate offline regression** | **PASS** |
| E0 static contracts | **PASS** (0 findings) |
| Case validation | **PASS** (34 cases) |
| E2 Story Flow synthetic | **13/13 matched** |
| E2 Image Animatic synthetic | **7/7 matched** |
| E2 Timed Animatic synthetic | **7/7 matched** |
| E2 Final Composition synthetic | **7/7 matched** |
| Live Story Flow multi-trial (3) | **stable** · p0_free 100% · matched 100% |
| Live Image Animatic trial-1 | **PASS** (11/11 gates) |
| Soft quality / Studio Visual-Only | **NOT RUN** |
| Live Timed / Live Final / E4 e2e | **NOT IN THIS RUN** |

**结论（可对外说的部分）**

当前 Skill 的**离线硬门禁层**与 **Story Flow / Image Animatic 已有 live 样本**一致通过：文档未污染 runtime 评分逻辑；四阶段 boundary gates 与 baseline 全匹配；`storyboard-locked-001` 三 trial 稳定；Image Animatic live trial-1 硬门禁通过。

**不可夸大的部分**

本报告**不是**「整条 Skill 端到端真人 Studio 验收通过」，也**不是** Timed/Final 正式 TTS/批量成片 live 通过。软质量、跨模型稳定性、E4 全链路尚未覆盖。

---

## 2. What was tested

### 2.1 In scope

```text
E0     Skill/docs static contracts (no eval pollution, no forbidden systems as prescriptions)
E1/E2  34 YAML cases (structure validation)
E2     Synthetic gate matrices for Story / Image Animatic / Timed / Final
E3     Re-grade + aggregate existing storyboard-locked-001 trial-1..3
Live   Re-grade storyboard trial-1 + image-animatic trial-1 workspaces
Visual board-claim-check on storyboard trial-1
```

### 2.2 Out of scope (explicit)

```text
- HyperFrames Studio pixel / timing human review
- Formal TTS generation in this session
- Live Timed Animatic / Live Final Composition production
- E4 end-to-end multi-episode factory
- Cross-model / multi-temperature Agent fleet
- Provider image generation quality
- Soft dims: Visual-Only, dwell, handoff, medium_coherence, publish_readiness
```

### 2.3 Commands executed

```bash
npm run eval:e0
npm run eval:cases
npm run eval:storyboard
npm run eval:animatic
npm run eval:timed
npm run eval:final
npm run eval:harness:grade -- --case-id storyboard-locked-001
npm run eval:harness:aggregate -- --case-id storyboard-locked-001

node evals/graders/deterministic/storyboard-gates.mjs \
  --case evals/cases/storyboard/storyboard-locked-001.yaml \
  --workspace evals/runs/storyboard-locked-001/trial-1/workspace \
  --source-script evals/fixtures/inputs/locked-script-a.md

node evals/graders/visual/board-claim-check.mjs \
  --workspace evals/runs/storyboard-locked-001/trial-1/workspace

node evals/graders/deterministic/image-animatic-gates.mjs \
  --case evals/cases/animatic/image-animatic-locked-001.yaml \
  --workspace evals/runs/image-animatic-locked-001/trial-1/workspace
```

All commands exited **0**.

---

## 3. Hard failures (P0)

```text
None in this run.
```

No unexpected fail, no unexpected pass, no E0 finding, no live gate failure on graded workspaces.

---

## 4. Layer results

### 4.1 E0 — Static contracts

| field | value |
| --- | --- |
| grader | `e0-static-contracts` |
| passed | **true** |
| p0_count | 0 |
| info_count | 0 |
| findings | `[]` |

**含义**：`SKILL.md` / core references / templates 未把 eval case、评分器、审批状态机等以**肯定式**写进 runtime 生产路径；禁止系统的「不要做成…」表述被正确放过。

### 4.2 Case catalog

| suite | cases |
| --- | --- |
| storyboard | 13 |
| image-animatic | 7 |
| timed-animatic | 7 |
| final | 7 |
| **total** | **34** |

Validation: **PASSED**.

Happy-path release-oriented positives are sparse by design (one primary happy per stage + several storyboard positives); most cases are **negative baselines** that must fail specific gates.

### 4.3 E2 synthetic matrices (gate logic)

| Stage | matched | mismatched | pass_rate |
| --- | --- | --- | --- |
| Story Flow | 13/13 | 0 | 100% |
| Image Animatic | 7/7 | 0 | 100% |
| Timed Animatic | 7/7 | 0 | 100% |
| Final Composition | 7/7 | 0 | 100% |
| **Total synthetic** | **34/34** | **0** | **100%** |

Local artifacts (gitignored):

```text
evals/runs/synthetic/matrix.md
evals/runs/synthetic-animatic/matrix.md
evals/runs/synthetic-timed/matrix.md
evals/runs/synthetic-final/matrix.md
```

#### Story Flow rows

| id | expected | verdict | gate_failures (when fail) |
| --- | --- | --- | --- |
| storyboard-locked-001 | pass | pass | — |
| storyboard-development-001 | pass | pass | — |
| storyboard-locked-b08-development | pass | pass | — |
| storyboard-evidence-001 | pass | pass | — |
| storyboard-hybrid-medium-001 | pass | pass | — |
| storyboard-medium-transfer-paper-cut | pass | pass | — |
| storyboard-revision-001 | pass | pass | — |
| storyboard-burned-text-fail | fail | fail_as_expected | frame_canvas, source_separation |
| storyboard-custom-page-fail | fail | fail_as_expected | surface |
| storyboard-empty-frame-fail | fail | fail_as_expected | frame_canvas, sequence |
| storyboard-inspector-complete-board-unreadable | fail | fail_as_expected | frame_canvas, sequence |
| storyboard-script-rewrite-fail | fail | fail_as_expected | script_preservation |
| storyboard-stage-skip-fail | fail | fail_as_expected | stage_boundary |

#### Image Animatic rows

| id | expected | verdict | gate_failures (when fail) |
| --- | --- | --- | --- |
| image-animatic-locked-001 | pass | pass | — |
| image-animatic-before-confirm-fail | fail | fail_as_expected | prior_story_confirm |
| image-animatic-no-playback-fail | fail | fail_as_expected | required_artifacts, surface, full_playback, motion_structure |
| image-animatic-formal-tts-fail | fail | fail_as_expected | low_cost_media, no_formal_tts, stage_boundary |
| image-animatic-formal-captions-fail | fail | fail_as_expected | no_formal_captions |
| image-animatic-final-early-fail | fail | fail_as_expected | low_cost_media, no_final_export |
| image-animatic-slideshow-fail | fail | fail_as_expected | motion_structure |

#### Timed Animatic rows

| id | expected | verdict | gate_failures (when fail) |
| --- | --- | --- | --- |
| timed-animatic-locked-001 | pass | pass | — |
| timed-animatic-before-confirm-fail | fail | fail_as_expected | prior_image_animatic_confirm |
| timed-animatic-tts-before-cost-fail | fail | fail_as_expected | cost_boundary_before_tts |
| timed-animatic-empty-captions-fail | fail | fail_as_expected | formal_captions |
| timed-animatic-script-rewrite-fail | fail | fail_as_expected | script_preservation |
| timed-animatic-temp-subtitle-fail | fail | fail_as_expected | captions_sole_timeline |
| timed-animatic-final-early-fail | fail | fail_as_expected | no_final_export, stage_boundary |

#### Final rows

| id | expected | verdict | gate_failures (when fail) |
| --- | --- | --- | --- |
| final-locked-001 | pass | pass | — |
| final-before-confirm-fail | fail | fail_as_expected | prior_timed_animatic_confirm |
| final-batch-before-cost-fail | fail | fail_as_expected | cost_boundary_before_batch |
| final-no-prompt-audit-fail | fail | fail_as_expected | prompt_audit |
| final-no-image-set-audit-fail | fail | fail_as_expected | image_set_audit |
| final-render-before-preview-fail | fail | fail_as_expected | final_preview, no_render_before_auth |
| final-export-without-auth-fail | fail | fail_as_expected | no_render_before_auth, stage_boundary |

**含义**：阶段边界、Locked Script 保护、surface 选择、成本边界、audit 要求等 **gate 实现与 case 金标准一致**。这验证的是 **Eval 能抓住约定失败**，不是单独一次新的 Agent 从零生产。

### 4.4 Live workspaces (existing)

#### Story Flow — `storyboard-locked-001` × 3

| trial | verdict | matched | p0 | board-claim (t1 recheck) |
| --- | --- | --- | --- | --- |
| 1 | pass | true | 0 | pass (issue_count=0) |
| 2 | pass | true | 0 | (not re-run; prior suite green) |
| 3 | pass | true | 0 | (not re-run; prior suite green) |

Trial-1 gate detail (re-graded this run):

```text
surface ✓
frame_canvas ✓
sequence ✓
source_separation ✓
stage_boundary ✓
required_artifacts ✓
script_preservation ✓
```

Aggregate:

| metric | value |
| --- | --- |
| trials_graded | 3 |
| p0_free_rate | 100% |
| matched_rate | 100% |
| all_pass | true |
| cross_trial_stability | **stable** |
| high_frequency_gate_failures | none |

#### Image Animatic — `image-animatic-locked-001` trial-1

```text
surface ✓
prior_story_confirm ✓
full_playback ✓
inherits_storyboard ✓
low_cost_media ✓
motion_structure ✓
no_formal_tts ✓
no_formal_captions ✓
no_final_export ✓
stage_boundary ✓
required_artifacts ✓
→ verdict pass · p0_count 0 · matched true
```

#### Timed / Final live

```text
No live Timed or Final workspace graded in this run.
```

---

## 5. Soft quality / human review

| Dimension | Status |
| --- | --- |
| Story Flow Visual-Only (Studio, Inspector hidden) | **NOT RUN** |
| Image Animatic viewing_drive / beat_dwell / handoff / not_slideshow | **NOT RUN** |
| Timed source_fidelity / sync / dwell_rebalance | **NOT RUN** |
| Final medium_coherence / continuity / publish_readiness | **NOT RUN** |
| Human pairwise preference | **NOT RUN** |

Sheets (for when you run Studio):

```text
evals/graders/human/storyboard-review-sheet.md
evals/graders/human/image-animatic-review-sheet.md
evals/graders/human/timed-animatic-review-sheet.md
evals/graders/human/final-review-sheet.md
```

Agent self-review or board-claim heuristics **must not** be treated as release truth for soft dims.

---

## 6. Coverage map (implementation honesty)

| DESIGN layer | This run | Residual risk |
| --- | --- | --- |
| E0 static | Covered · PASS | Future doc edits can reintroduce pollution |
| E1 single-capability | Partial (embedded in stage cases) | Dedicated locked-script/provider dirs still skeleton |
| E2 Story Flow | Synthetic + 3 live trials | Soft Visual-Only missing |
| E2 Image Animatic | Synthetic + 1 live | Soft timing dims missing |
| E2 Timed Animatic | Synthetic only | No formal TTS live |
| E2 Final | Synthetic only | No Final Preview live |
| E3 trajectory | Harness + 3-trial aggregate | Same agent family; not multi-model |
| E4 e2e | Not built | Full pipeline unproven under eval |
| E5 adversarial | Stage negative baselines only | Real production failures not yet promoted |

Rough hard-boundary confidence after this run: **~75%** of intended offline contract surface.  
Full Skill “can ship beautiful episodes” confidence: **not claimed**.

---

## 7. Metrics snapshot (design §10 — partial)

| Metric | Observed here |
| --- | --- |
| P0-Free Trial Rate | Story Flow 3/3 = **100%**; Image Animatic 1/1 = **100%** |
| Input Routing Accuracy | Not separately instrumented |
| Locked Script Preservation Rate | Live t1 script_preservation **true**; synthetic rewrite fails **caught** |
| Correct Preview Surface Rate | Synthetic surface fails **caught**; live surfaces correct |
| Storyboard Visual-Only Comprehension Rate | **NOT MEASURED** (needs Studio human) |
| Stage Stop Accuracy | Live stage_boundary **true**; synthetic stage-skip **caught** |
| Medium Transfer Success Rate | Synthetic paper-cut/hybrid **pass** only (synthetic) |
| Root-Cause Repair Accuracy | N/A (no new failures to repair) |
| Human Pairwise Preference Win Rate | **NOT RUN** |
| Cross-Trial Stability | storyboard-locked-001 = **stable** |

**No single total score** is emitted by design.

---

## 8. Root authority / action items

| Finding | Severity | Root authority | Action |
| --- | --- | --- | --- |
| All hard gates green | — | — | No Skill change required from this run |
| Soft quality unknown | Process | Human + Studio | Run Visual-Only on 3 storyboard trials + animatic sheet |
| Timed/Final only synthetic | Coverage | External live production | Produce live Timed then Final workspaces; grade with gates |
| E4 missing | Coverage | evals/ only | Defer until real multi-stage failure demand |
| Multi-trial same agent | Stability nuance | Harness notes | Optional: re-run trials with different models |

---

## 9. Reproduction

```bash
cd /path/to/FrameSpine
git rev-parse --short HEAD   # expect 41e50d5 or later with same eval tree

npm run eval:e0
npm run eval:cases
npm run eval:storyboard
npm run eval:animatic
npm run eval:timed
npm run eval:final
npm run eval:harness:grade -- --case-id storyboard-locked-001
npm run eval:harness:aggregate -- --case-id storyboard-locked-001
```

Related prior reports:

```text
evals/reports/STORYBOARD_V1_OFFLINE_REPORT.md
evals/reports/STORYBOARD_LOCKED_001_TRIAL1_LIVE_REPORT.md
evals/reports/STORYBOARD_LOCKED_001_MULTI_TRIAL_LIVE_REPORT.md
evals/reports/IMAGE_ANIMATIC_V1_OFFLINE_REPORT.md
evals/reports/IMAGE_ANIMATIC_LOCKED_001_TRIAL1_LIVE_REPORT.md
evals/reports/TIMED_ANIMATIC_V1_OFFLINE_REPORT.md
evals/reports/FINAL_V1_OFFLINE_REPORT.md
evals/reports/E3_HARNESS_V1_OFFLINE_REPORT.md
```

---

## 10. Bottom line

```text
离线 Skill 合同 + 四阶段硬门禁：全部通过
Story Flow live ×3：稳定通过
Image Animatic live ×1：硬门禁通过
Timed / Final live：未测
Studio 软质量：未测
E4 端到端：未建

→ 当前实现的「边界与合同」层可信
→ 当前实现的「成片观感与完整生产链路」层仍需 Studio + live Timed/Final
```

**Release recommendation for eval infrastructure**: keep green; do not expand synthetic baselines without real failures.  
**Release recommendation for Skill creative quality**: **insufficient evidence** from this report alone — complete human Visual-Only before claiming Story Flow quality; complete live Timed/Final before claiming production pipeline.
