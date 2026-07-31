# Live Trial Artifact Schema

Agent harnesses should write these under each trial workspace:

```text
evals/runs/<case-id>/<trial>/workspace/
  EPISODE.md
  SCRIPT.md
  STORYBOARD.md
  captions.json                 # empty [] during story-flow
  video/compositions/frames/    # renderable frame sources
  eval-artifacts/
    preview-manifest.json
    board-manifest.json
    tool-trace.json
    storyboard-route.txt
```

See the `*.example.json` files in this directory.

## canvas.kind

```text
empty     → blank / no subjects
generic   → equal boxes, circles, placeholder shapes without specific story content
concrete  → specific subjects, actions, relationships, evidence, or state change
```

## text_roles

Forbidden on canvas unless story object / editorial:

```text
narration
subtitle
bilingual_subtitle
director_note
beat_title
attention_label
prompt
asset_path
```

Allowed:

```text
story_object
editorial
```

## Deterministic vs Human

Deterministic graders trust structured manifests for offline regression.  
Human Visual-Only review must confirm the real Studio Board matches the claims.
