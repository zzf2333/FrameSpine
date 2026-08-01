/**
 * Timed Animatic preview / timing helpers for deterministic gates.
 *
 * Harness writes under workspace/eval-artifacts/:
 *   preview-manifest.json
 *   timed-manifest.json
 *   tool-trace.json
 *   composition-route.txt
 *
 * captions.json at episode root is the sole subtitle timeline.
 */

export const COMPOSITION_SURFACES = new Set([
	"hyperframes-composition",
	"official-composition",
	"composition",
]);

export function normalizeTimedPreview(raw = {}) {
	return {
		// `surface` is technical classification; only review_surface + studio_url
		// can prove a user-facing Studio handoff.
		surface: raw.surface || raw.preview_surface || null,
		review_surface: raw.review_surface || raw.user_review_surface || null,
		studio_url: raw.studio_url || raw.url || null,
		stage: raw.stage || null,
		composition_route: raw.composition_route || raw.route || null,
		full_composition_playback: Boolean(raw.full_composition_playback),
		cost_boundary_explained_before_tts: Boolean(
			raw.cost_boundary_explained_before_tts ?? raw.cost_boundary_before_tts,
		),
		formal_tts: Boolean(raw.formal_tts),
		formal_captions: Boolean(raw.formal_captions),
		word_level_timing: Boolean(raw.word_level_timing),
		captions_sole_timeline:
			typeof raw.captions_sole_timeline === "boolean"
				? raw.captions_sole_timeline
				: null,
		dwell_rebalanced_to_audio:
			typeof raw.dwell_rebalanced_to_audio === "boolean"
				? raw.dwell_rebalanced_to_audio
				: null,
		batch_final_images: Boolean(raw.batch_final_images),
		export_attempted: Boolean(raw.export_attempted),
		composition_temp_subtitle_split: Boolean(
			raw.composition_temp_subtitle_split,
		),
	};
}

export function normalizeTimedManifest(raw = {}) {
	return {
		formal_tts_generated: Boolean(raw.formal_tts_generated ?? raw.formal_tts),
		word_level_timing: Boolean(raw.word_level_timing),
		captions_path: raw.captions_path || "captions.json",
		captions_cue_count:
			typeof raw.captions_cue_count === "number"
				? raw.captions_cue_count
				: null,
		captions_sole_timeline:
			typeof raw.captions_sole_timeline === "boolean"
				? raw.captions_sole_timeline
				: null,
		dwell_rebalanced_to_audio:
			typeof raw.dwell_rebalanced_to_audio === "boolean"
				? raw.dwell_rebalanced_to_audio
				: null,
		script_source: raw.script_source || "SCRIPT.md",
		narration_synced_from_script:
			typeof raw.narration_synced_from_script === "boolean"
				? raw.narration_synced_from_script
				: null,
		audio_path: raw.audio_path || null,
		estimated_only: Boolean(raw.estimated_only),
	};
}

export function captionsCueCount(raw) {
	if (raw == null) return 0;
	if (Array.isArray(raw)) return raw.length;
	if (Array.isArray(raw.cues)) return raw.cues.length;
	if (Array.isArray(raw.segments)) return raw.segments.length;
	if (Array.isArray(raw.subtitles)) return raw.subtitles.length;
	return 0;
}

export function captionsLooksFormal(raw) {
	return captionsCueCount(raw) > 0;
}
