# Storyboard Error Taxonomy

Use these labels when filing failures. One root cause → one authority update.

## Surface

| code | meaning |
| --- | --- |
| `surface.custom_page` | custom webpage used instead of official Storyboard |
| `surface.composition_playback` | full Composition playback during Story Flow |
| `surface.missing_route` | no official Board route delivered |
| `surface.missing_src` | key frames lack renderable src |

## Frame Canvas

| code | meaning |
| --- | --- |
| `canvas.empty` | blank frame |
| `canvas.generic` | equal boxes / generic icons without story content |
| `canvas.burned_narration` | narration on canvas |
| `canvas.burned_subtitle` | subtitle blocks on canvas |
| `canvas.burned_director` | director notes / beat titles / attention labels on canvas |
| `canvas.inspector_dependency` | frame only readable with Inspector prose |
| `canvas.medium_mismatch` | violates series Visual Medium recipe |

## Sequence

| code | meaning |
| --- | --- |
| `sequence.visual_only_fail` | Board not understandable without Inspector |
| `sequence.no_development` | process beat collapsed to one result card |
| `sequence.adjacent_repeat` | adjacent frames show no meaningful change |
| `sequence.missing_handoff` | no visible handoff / payoff state |

## Source Separation

| code | meaning |
| --- | --- |
| `source.script_rewrite` | Locked Script silently altered |
| `source.captions_early` | formal captions.json during Story Flow |
| `source.prompt_on_canvas` | prompt / asset paths visible to user |

## Stage Boundary

| code | meaning |
| --- | --- |
| `stage.no_stop` | continued after Storyboard without stop |
| `stage.tts_early` | formal TTS before confirmation |
| `stage.images_early` | final/batch images before confirmation |
| `stage.animatic_early` | Image Animatic before confirmation |

## Image Animatic

| code | meaning |
| --- | --- |
| `animatic.surface_storyboard` | still using Storyboard contact sheet as review surface |
| `animatic.no_playback` | missing full start-to-end Composition playback |
| `animatic.before_confirm` | composition work before Story Flow confirmation |
| `animatic.no_inherit` | timeline does not inherit confirmed Storyboard Frames |
| `animatic.final_media` | batch final images / final polish during Image Animatic |
| `animatic.formal_tts` | formal TTS too early |
| `animatic.formal_captions` | formal captions.json too early |
| `animatic.export` | export / final render during Image Animatic |
| `animatic.slideshow` | pure slideshow / no Entry-Development-Emphasis-Handoff |
| `animatic.default_camera` | same default camera motion on every image |
| `animatic.no_stop` | no stage_stop before Timed Animatic |

## Repair authority

| failure pattern | update |
| --- | --- |
| repeated across episodes | Skill / core references / templates |
| single episode content | Episode STORYBOARD / assets / Composition |
| gate false positive/negative | `evals/` only |
| unclear contract | one core doc only, not all files |
