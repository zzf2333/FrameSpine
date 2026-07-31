# Live Trial Artifact Schema

Agent harnesses should write these under each trial workspace.

## Story Flow

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

## Image Animatic

```text
evals/runs/<case-id>/<trial>/workspace/
  EPISODE.md
  SCRIPT.md
  STORYBOARD.md                 # confirmed prior stage
  captions.json                 # still empty []
  video/composition.html        # or composition route target
  video/compositions/frames/
  eval-artifacts/
    preview-manifest.json       # surface=hyperframes-composition, full_composition_playback=true
    composition-manifest.json
    tool-trace.json             # must include story-flow user_confirmation first
    composition-route.txt
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
