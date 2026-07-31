# Timed Animatic Cases

Timed Animatic stage product tests (suite v3 slice).

## Runnable now

```bash
npm run eval:timed
```

Cases live in this directory as YAML. Deterministic gates:

```text
surface
prior_image_animatic_confirm
cost_boundary_before_tts
formal_tts
formal_captions
captions_sole_timeline
script_preservation
dwell_rebalance
full_playback
no_final_export
stage_boundary
required_artifacts
```

## Scope

Timed Animatic verifies formal audio and real subtitle timing after confirmed Image Animatic:

- cost-boundary explanation before formal TTS
- formal TTS + word-level timing
- `captions.json` as sole subtitle timeline
- image dwells rebalanced to real audio
- Locked Script preserved
- stop before Final batch images / export

## Not in this slice

- Final Composition polish and export authorization
- Soft Studio sync quality without human review
- Multi-provider TTS fidelity scoring

## Human review

`evals/graders/human/timed-animatic-review-sheet.md`
