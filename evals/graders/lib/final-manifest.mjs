/**
 * Final Composition preview / final-manifest helpers for deterministic gates.
 *
 * Harness writes under workspace/eval-artifacts/:
 *   preview-manifest.json
 *   final-manifest.json
 *   tool-trace.json
 *   composition-route.txt
 */

export const COMPOSITION_SURFACES = new Set([
	"hyperframes-composition",
	"official-composition",
	"composition",
]);

export function normalizeFinalPreview(raw = {}) {
	return {
		// `surface` is technical classification; only review_surface + studio_url
		// can prove a user-facing Studio handoff.
		surface: raw.surface || raw.preview_surface || null,
		review_surface: raw.review_surface || raw.user_review_surface || null,
		studio_url: raw.studio_url || raw.url || null,
		stage: raw.stage || null,
		composition_route: raw.composition_route || raw.route || null,
		full_composition_playback: Boolean(raw.full_composition_playback),
		final_preview: Boolean(raw.final_preview),
		cost_boundary_explained_before_batch_images: Boolean(
			raw.cost_boundary_explained_before_batch_images ??
				raw.cost_boundary_before_batch_images ??
				raw.cost_boundary_before_finals,
		),
		prompt_audit: Boolean(raw.prompt_audit ?? raw.prompt_audit_done),
		image_set_audit: Boolean(raw.image_set_audit ?? raw.image_set_audit_done),
		high_risk_asset_tested: Boolean(
			raw.high_risk_asset_tested ?? raw.high_risk_tested,
		),
		batch_final_images: Boolean(raw.batch_final_images),
		medium_motion_inherited: Boolean(
			raw.medium_motion_inherited ?? raw.inherits_medium_motion,
		),
		placeholder_marks_present: Boolean(raw.placeholder_marks_present),
		export_attempted: Boolean(raw.export_attempted),
		render_attempted: Boolean(raw.render_attempted),
		render_authorized: Boolean(raw.render_authorized),
		series_design_edited: Boolean(raw.series_design_edited),
	};
}

export function normalizeFinalManifest(raw = {}) {
	return {
		prompt_audit_done: Boolean(raw.prompt_audit_done ?? raw.prompt_audit),
		image_set_audit_done: Boolean(
			raw.image_set_audit_done ?? raw.image_set_audit,
		),
		high_risk_asset_tested: Boolean(
			raw.high_risk_asset_tested ?? raw.high_risk_tested,
		),
		batch_final_images: Boolean(raw.batch_final_images),
		medium_motion_inherited: Boolean(
			raw.medium_motion_inherited ?? raw.inherits_medium_motion,
		),
		final_preview_shown: Boolean(
			raw.final_preview_shown ?? raw.final_preview,
		),
		placeholder_marks_present: Boolean(raw.placeholder_marks_present),
		export_or_render_before_auth: Boolean(
			raw.export_or_render_before_auth ??
				raw.render_before_preview ??
				raw.export_before_auth,
		),
		series_design_edited: Boolean(raw.series_design_edited),
		inherits_timed_animatic: Boolean(raw.inherits_timed_animatic),
	};
}
