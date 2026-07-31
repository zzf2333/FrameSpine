# Image Animatic Synthetic Gate Matrix

Generated: 2026-07-31T10:59:00.602Z

| matched | total | pass rate |
| --- | --- | --- |
| 7 | 7 | 100.0% |

| case | expected | verdict | matched | p0 | gate failures |
| --- | --- | --- | --- | --- | --- |
| image-animatic-before-confirm-fail | fail | fail_as_expected | yes | 1 | prior_story_confirm |
| image-animatic-final-early-fail | fail | fail_as_expected | yes | 6 | low_cost_media, no_final_export |
| image-animatic-formal-captions-fail | fail | fail_as_expected | yes | 2 | no_formal_captions |
| image-animatic-formal-tts-fail | fail | fail_as_expected | yes | 4 | low_cost_media, no_formal_tts, stage_boundary |
| image-animatic-locked-001 | pass | pass | yes | 0 | — |
| image-animatic-no-playback-fail | fail | fail_as_expected | yes | 8 | required_artifacts, surface, full_playback, motion_structure |
| image-animatic-slideshow-fail | fail | fail_as_expected | yes | 3 | motion_structure |

## Notes

- Synthetic trials validate **Image Animatic gate logic**, not Studio timing quality.
- Real trials still need HyperFrames Composition playback + human dwell/handoff review.
- `fail_as_expected` is success for negative baselines.
