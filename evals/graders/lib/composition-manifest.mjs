/**
 * Composition / Image Animatic preview helpers for deterministic gates.
 *
 * Harness writes under workspace/eval-artifacts/:
 *   preview-manifest.json
 *   composition-manifest.json
 *   tool-trace.json
 *
 * Image Animatic surface is HyperFrames Composition playback, not Storyboard.
 */

export const COMPOSITION_SURFACES = new Set([
  'hyperframes-composition',
  'official-composition',
  'composition',
]);

export const STORYBOARD_SURFACES = new Set([
  'hyperframes-storyboard',
  'official-storyboard',
]);

export function normalizePreviewManifest(raw = {}) {
  return {
    // `surface` is legacy technical classification. `review_surface` and
    // `studio_url` prove the user-facing Studio surface separately.
    surface: raw.surface || raw.preview_surface || null,
    review_surface: raw.review_surface || raw.user_review_surface || null,
    studio_url: raw.studio_url || raw.url || null,
    stage: raw.stage || null,
    storyboard_route: raw.storyboard_route || null,
    composition_route: raw.composition_route || raw.route || null,
    full_composition_playback: Boolean(raw.full_composition_playback),
    custom_storyboard_page: Boolean(raw.custom_storyboard_page),
    formal_tts: Boolean(raw.formal_tts),
    formal_captions: Boolean(raw.formal_captions),
    batch_final_images: Boolean(raw.batch_final_images),
    export_attempted: Boolean(raw.export_attempted),
    temporary_audio_or_estimated_duration: Boolean(
      raw.temporary_audio_or_estimated_duration ??
        raw.estimated_duration_or_temp_audio,
    ),
  };
}

export function normalizeCompositionManifest(raw = {}) {
  const beats = Array.isArray(raw.beats)
    ? raw.beats.map((b, i) => normalizeBeat(b, i))
    : [];
  return {
    inherits_confirmed_storyboard_frames:
      typeof raw.inherits_confirmed_storyboard_frames === 'boolean'
        ? raw.inherits_confirmed_storyboard_frames
        : null,
    low_cost_media:
      typeof raw.low_cost_media === 'boolean' ? raw.low_cost_media : null,
    estimated_duration_or_temp_audio:
      typeof raw.estimated_duration_or_temp_audio === 'boolean'
        ? raw.estimated_duration_or_temp_audio
        : typeof raw.temporary_audio_or_estimated_duration === 'boolean'
          ? raw.temporary_audio_or_estimated_duration
          : null,
    motion_source: raw.motion_source || null,
    default_camera_on_all: Boolean(raw.default_camera_on_all),
    slideshow_risk: Boolean(raw.slideshow_risk),
    final_polish: Boolean(raw.final_polish),
    beats,
  };
}

function normalizeBeat(b, i) {
  return {
    id: b.id || `beat-${i + 1}`,
    frame_ids: Array.isArray(b.frame_ids) ? b.frame_ids : [],
    entry: Boolean(b.entry),
    development: Boolean(b.development),
    emphasis: Boolean(b.emphasis),
    handoff: Boolean(b.handoff),
    visible_media: b.visible_media !== false,
  };
}
