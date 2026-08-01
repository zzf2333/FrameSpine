/**
 * Offline proof that a Composition handoff used a verified HyperFrames Studio
 * review surface. `video/composition.html` may exist as an implementation
 * artifact; it can never satisfy this check.
 */

const STUDIO_REVIEW_SURFACES = new Set([
	"hyperframes-studio-composition",
	"official-studio-composition",
	"studio-composition",
]);

function eventType(event) {
	return String(event.type || "").toLowerCase();
}

function eventTool(event) {
	return String(event.tool || event.name || event.action || "").toLowerCase();
}

function isHttpUrl(value) {
	try {
		const url = new URL(String(value));
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

function isImplementationPath(value) {
	const text = String(value || "")
		.trim()
		.toLowerCase();
	if (!text) return false;
	if (text.startsWith("file:")) return true;
	if (/\.html(?:$|[?#])/.test(text)) return true;
	return text.includes("/video/") || text.startsWith("video/");
}

function matchesRoute(event, route) {
	if (!route) return true;
	return String(event.route || event.composition_route || "") === route;
}

function matchesUrl(event, url) {
	if (!url) return true;
	return String(event.url || event.studio_url || "") === url;
}

function indexOfEvent(events, predicate, after = -1) {
	for (let index = after + 1; index < events.length; index += 1) {
		if (predicate(events[index])) return index;
	}
	return -1;
}

function isStudioStarted(event) {
	const type = eventType(event);
	const tool = eventTool(event);
	return (
		type === "studio_started" ||
		type === "studio_start" ||
		Boolean(event.studio_started) ||
		tool === "studio" ||
		tool.includes("hyperframes-studio")
	);
}

function isStudioRouteOpened(event, studioUrl, route) {
	const type = eventType(event);
	return (
		(type === "studio_route_opened" ||
			type === "studio_opened" ||
			Boolean(event.studio_route_opened)) &&
		matchesUrl(event, studioUrl) &&
		matchesRoute(event, route)
	);
}

function isFullPlayback(event, route) {
	const type = eventType(event);
	const tool = eventTool(event);
	return (
		(type === "composition_playback" ||
			type === "full_composition_playback" ||
			tool.includes("full_composition_playback") ||
			Boolean(event.full_composition_playback)) &&
		matchesRoute(event, route)
	);
}

function isStageHandoff(event, studioUrl, route) {
	const type = eventType(event);
	return (
		(type === "stage_handoff" ||
			type === "handoff" ||
			Boolean(event.user_handoff)) &&
		matchesUrl(event, studioUrl) &&
		matchesRoute(event, route)
	);
}

function sourceWasMisrepresented(events) {
	return events.some((event) => {
		const type = eventType(event);
		const surface = String(
			event.surface || event.review_surface || "",
		).toLowerCase();
		const target = String(event.url || event.route || event.path || "");
		return (
			(Boolean(event.user_preview) ||
				Boolean(event.user_handoff) ||
				type === "stage_handoff") &&
			(surface.includes("snapshot") ||
				surface.includes("screenshot") ||
				surface.includes("source") ||
				surface.includes("html") ||
				isImplementationPath(target))
		);
	});
}

/**
 * Returns specific failures instead of a creative score. Trace events must be
 * chronological and record the Studio start, route open, full playback, then
 * user handoff.
 */
export function verifyCompositionUserSurface(preview, events = []) {
	const failures = [];
	const studioUrl = String(preview?.studio_url || "").trim();
	const route = String(preview?.composition_route || "").trim();
	const reviewSurface = String(preview?.review_surface || "").toLowerCase();

	if (!STUDIO_REVIEW_SURFACES.has(reviewSurface)) {
		failures.push(
			"review_surface is not an official Studio Composition surface",
		);
	}
	if (!isHttpUrl(studioUrl)) {
		failures.push("missing HTTP(S) studio_url");
	}
	if (!route || isImplementationPath(route)) {
		failures.push(
			"composition_route is missing or points to an implementation file",
		);
	}
	if (sourceWasMisrepresented(events)) {
		failures.push(
			"snapshot, source file, or implementation path was marked as user preview",
		);
	}

	const started = indexOfEvent(events, isStudioStarted);
	const opened = indexOfEvent(
		events,
		(event) => isStudioRouteOpened(event, studioUrl, route),
		started,
	);
	const played = indexOfEvent(
		events,
		(event) => isFullPlayback(event, route),
		opened,
	);
	const handedOff = indexOfEvent(
		events,
		(event) => isStageHandoff(event, studioUrl, route),
		played,
	);

	if (started === -1) failures.push("Studio was not started in the trace");
	if (opened === -1)
		failures.push("Studio route was not opened after Studio start");
	if (played === -1)
		failures.push("Composition was not fully played after route open");
	if (handedOff === -1)
		failures.push("user handoff did not occur after full playback");

	return {
		ok: failures.length === 0,
		failures,
		evidence: {
			studio_url: studioUrl || null,
			composition_route: route || null,
			started,
			opened,
			played,
			handed_off: handedOff,
		},
	};
}
