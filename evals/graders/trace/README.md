# Trace Graders

Agent trial harness should write:

```text
evals/runs/<case-id>/<trial>/
  workspace/                 # episode project
  eval-artifacts/
    tool-trace.json
    preview-manifest.json
    storyboard-route.txt
    file-diff.patch
    conversation.md
  human/
    review-sheet.md
  grades/
    deterministic.json
    vision.json
    human.json
```

## tool-trace.json 最小约定

```json
{
  "case_id": "storyboard-locked-001",
  "trial": 1,
  "events": [
    { "type": "tool", "tool": "read", "path": "SCRIPT.md" },
    { "type": "stage_stop", "stage": "story-flow", "route": "https://..." },
    { "type": "user_confirmation", "stage": "image-animatic", "authorized": false }
  ]
}
```

## preview-manifest.json 最小约定

```json
{
  "surface": "hyperframes-storyboard",
  "storyboard_route": "https://...",
  "full_composition_playback": false,
  "custom_storyboard_page": false
}
```

Deterministic stage/surface gates read these files. Vision and human graders consume workspace frames and the review sheet.
