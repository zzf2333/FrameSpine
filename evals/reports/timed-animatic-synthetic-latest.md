# Timed Animatic Synthetic Gate Matrix

Generated: 2026-07-31T11:13:02.444Z

| matched | total | pass rate |
| --- | --- | --- |
| 7 | 7 | 100.0% |

| case | expected | verdict | matched | p0 | gate failures |
| --- | --- | --- | --- | --- | --- |
| timed-animatic-before-confirm-fail | fail | fail_as_expected | yes | 1 | prior_image_animatic_confirm |
| timed-animatic-empty-captions-fail | fail | fail_as_expected | yes | 1 | formal_captions |
| timed-animatic-final-early-fail | fail | fail_as_expected | yes | 3 | no_final_export, stage_boundary |
| timed-animatic-locked-001 | pass | pass | yes | 0 | — |
| timed-animatic-script-rewrite-fail | fail | fail_as_expected | yes | 1 | script_preservation |
| timed-animatic-temp-subtitle-fail | fail | fail_as_expected | yes | 3 | captions_sole_timeline |
| timed-animatic-tts-before-cost-fail | fail | fail_as_expected | yes | 1 | cost_boundary_before_tts |

## Notes

- Synthetic trials validate **Timed Animatic gate logic**, not Studio sync quality.
- Real trials still need HyperFrames Composition playback with formal audio + human sync review.
- `fail_as_expected` is success for negative baselines.
