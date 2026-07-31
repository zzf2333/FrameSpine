# Final Composition Synthetic Gate Matrix

Generated: 2026-07-31T11:28:22.189Z

| matched | total | pass rate |
| --- | --- | --- |
| 7 | 7 | 100.0% |

| case | expected | verdict | matched | p0 | gate failures |
| --- | --- | --- | --- | --- | --- |
| final-batch-before-cost-fail | fail | fail_as_expected | yes | 1 | cost_boundary_before_batch |
| final-before-confirm-fail | fail | fail_as_expected | yes | 1 | prior_timed_animatic_confirm |
| final-export-without-auth-fail | fail | fail_as_expected | yes | 3 | no_render_before_auth, stage_boundary |
| final-locked-001 | pass | pass | yes | 0 | — |
| final-no-image-set-audit-fail | fail | fail_as_expected | yes | 1 | image_set_audit |
| final-no-prompt-audit-fail | fail | fail_as_expected | yes | 1 | prompt_audit |
| final-render-before-preview-fail | fail | fail_as_expected | yes | 3 | final_preview, no_render_before_auth |

## Notes

- Synthetic trials validate **Final gate logic**, not Studio visual quality.
- Real trials still need Final Preview + human medium/continuity review.
- `fail_as_expected` is success for negative baselines.
