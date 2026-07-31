# Final Composition Cases（E2 · 四阶段边界）

设计：`evals/DESIGN.md` §4 E2 Final + `evals/rubrics/final.md`。

## 硬门禁

```text
surface
prior_timed_animatic_confirm
cost_boundary_before_batch
prompt_audit
image_set_audit
high_risk_asset_test
medium_motion_inheritance
final_preview
no_render_before_auth
no_placeholder_marks
no_series_design_edit
stage_boundary
required_artifacts
```

## 运行

```bash
npm run eval:final
```

## 范围

- Timed Animatic 确认后才开始 Final
- 批量最终图前成本说明
- Prompt Audit / Image Set Audit / 高风险素材试测
- Final Preview 后等待明确 render 许可
- 不擅自改长期 `DESIGN.md`

Human：`evals/graders/human/final-review-sheet.md`  
软质量（medium_coherence 等）需 Studio 人审，不可仅靠 synthetic。
