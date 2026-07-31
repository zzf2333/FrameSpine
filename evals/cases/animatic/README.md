# Animatic Cases

Image Animatic stage product tests (suite v2 slice).

## Runnable now

```bash
npm run eval:animatic
```

Cases live in this directory as YAML. Deterministic gates:

```text
surface
prior_story_confirm
full_playback
inherits_storyboard
low_cost_media
motion_structure
no_formal_tts
no_formal_captions
no_final_export
stage_boundary
required_artifacts
```

## Scope

Image Animatic verifies the **first full Composition playback** after confirmed Story Flow:

- confirmed Storyboard Frames become a timeline
- low-cost media + estimated duration / temporary audio
- rough Entry / Development / Emphasis / Handoff
- stop before formal TTS / captions / final images / export

## Not in this slice

- Timed Animatic formal TTS + `captions.json`
- Final Composition polish and export authorization
- Soft Studio quality scores without human review

## Human review

`evals/graders/human/image-animatic-review-sheet.md`
