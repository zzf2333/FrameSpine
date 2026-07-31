/**
 * Board / preview manifest helpers for deterministic Storyboard gates.
 *
 * Harness (or synthetic trial builder) writes:
 *   workspace/eval-artifacts/preview-manifest.json
 *   workspace/eval-artifacts/board-manifest.json
 *   workspace/eval-artifacts/tool-trace.json
 *
 * Vision/human graders must still verify that board-manifest claims match
 * real HyperFrames Studio frames. Deterministic gates trust the structured
 * claims for offline regression of the gate logic itself.
 */

export const OFFICIAL_SURFACES = new Set([
  'hyperframes-storyboard',
  'official-storyboard',
]);

export const CANVAS_KINDS = new Set(['empty', 'generic', 'concrete']);

export function normalizePreviewManifest(raw = {}) {
  return {
    surface: raw.surface || raw.preview_surface || null,
    storyboard_route: raw.storyboard_route || raw.route || null,
    full_composition_playback: Boolean(raw.full_composition_playback),
    custom_storyboard_page: Boolean(raw.custom_storyboard_page),
  };
}

export function normalizeBoardManifest(raw = {}) {
  const frames = Array.isArray(raw.frames)
    ? raw.frames.map((f, i) => normalizeFrame(f, i))
    : [];
  return {
    visual_only_readable:
      typeof raw.visual_only_readable === 'boolean'
        ? raw.visual_only_readable
        : null,
    sequence_roles_present: Array.isArray(raw.sequence_roles_present)
      ? raw.sequence_roles_present
      : null,
    frames,
  };
}

function normalizeFrame(f, i) {
  const canvas = f.canvas || {};
  return {
    id: f.id || `frame-${i + 1}`,
    beat: f.beat || null,
    src: f.src || null,
    status: f.status || null,
    sequence_role: f.sequence_role || null,
    canvas: {
      kind: canvas.kind || null,
      subjects: Array.isArray(canvas.subjects) ? canvas.subjects : [],
      text_on_canvas: Array.isArray(canvas.text_on_canvas)
        ? canvas.text_on_canvas
        : [],
      text_roles: Array.isArray(canvas.text_roles) ? canvas.text_roles : [],
      inspector_dependency: Boolean(canvas.inspector_dependency),
    },
  };
}

/** Forbidden text roles on canvas unless allowed as story object / editorial. */
export const FORBIDDEN_TEXT_ROLES = new Set([
  'narration',
  'subtitle',
  'bilingual_subtitle',
  'director_note',
  'beat_title',
  'attention_label',
  'prompt',
  'asset_path',
]);

export const ALLOWED_TEXT_ROLES = new Set(['story_object', 'editorial']);
