#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadSeriesEnv, need, numberValue, parseArgs } from "./lib/env.mjs";
import { concatWavs, ensureParent, fetchJson, wavInfo } from "./lib/media.mjs";

function sourceBody(source, ignoreLegacyComments = false) {
	const withoutHtmlComments = source.replace(/<!--[\s\S]*?(?:-->|$)/g, "");
	return withoutHtmlComments
		.split(/\r?\n/)
		.filter((line) => !(ignoreLegacyComments && line.trim().startsWith("#")))
		.join("\n")
		.replace(/^\s+|\s+$/g, "");
}

function paragraphs(source) {
	return source
		.split(/\n\s*\n+/)
		.map((part) => part.replace(/\s+/g, " ").trim())
		.filter(Boolean);
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const project = path.resolve(args.project || process.cwd());
	const explicitInput = args.input;
	const input = path.resolve(project, explicitInput || "SCRIPT.md");
	const output = path.resolve(
		project,
		args.output || "assets/audio/narration.wav",
	);
	const { env } = await loadSeriesEnv(project);
	need(env, [
		"VOLCENGINE_TTS_APP_ID",
		"VOLCENGINE_TTS_ACCESS_TOKEN",
		"VOLCENGINE_TTS_VOICE_TYPE",
	]);

	const source = sourceBody(
		await readFile(input, "utf8"),
		Boolean(explicitInput),
	);
	if (!source) throw new Error(`${explicitInput || "SCRIPT.md"} 里没有旁白`);
	if (!explicitInput)
		await writeFile(path.join(project, "narration.txt"), `${source}\n`);
	const units = paragraphs(source);
	if (!units.length)
		throw new Error(`${explicitInput || "SCRIPT.md"} 里没有可生成的旁白段落`);

	const endpoint =
		env.VOLCENGINE_TTS_ENDPOINT ||
		"https://openspeech.bytedance.com/api/v1/tts";
	const timeout = numberValue(env, "VOLCENGINE_TTS_TIMEOUT_MS", 120000);
	const pauseMs = numberValue(env, "TTS_PARAGRAPH_PAUSE_MS", 120);
	const unitDir = path.join(path.dirname(output), "units");
	await mkdir(unitDir, { recursive: true });

	const audioBuffers = [];
	const report = [];
	let cursorMs = 0;

	for (let index = 0; index < units.length; index += 1) {
		const text = units[index];
		const requestId = randomUUID();
		const { payload } = await fetchJson(
			endpoint,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer;${env.VOLCENGINE_TTS_ACCESS_TOKEN}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					app: {
						appid: env.VOLCENGINE_TTS_APP_ID,
						token: env.VOLCENGINE_TTS_ACCESS_TOKEN,
						cluster: env.VOLCENGINE_TTS_CLUSTER || "volcano_tts",
					},
					user: { uid: `series-video-${path.basename(project)}` },
					audio: {
						voice_type: env.VOLCENGINE_TTS_VOICE_TYPE,
						encoding: "wav",
						speed_ratio: numberValue(env, "VOLCENGINE_TTS_SPEED_RATIO", 1.1),
						volume_ratio: numberValue(env, "VOLCENGINE_TTS_VOLUME_RATIO", 1),
						pitch_ratio: numberValue(env, "VOLCENGINE_TTS_PITCH_RATIO", 1),
					},
					request: {
						reqid: requestId,
						text,
						text_type: "plain",
						operation: "query",
					},
				}),
			},
			timeout,
		);

		if (Number(payload?.code) !== 3000 || typeof payload?.data !== "string") {
			throw new Error(`火山 TTS 返回失败，code=${payload?.code ?? "unknown"}`);
		}

		const audio = Buffer.from(payload.data, "base64");
		const info = wavInfo(audio);
		const file = path.join(
			unitDir,
			`${String(index + 1).padStart(2, "0")}.wav`,
		);
		await writeFile(file, audio);
		audioBuffers.push(audio);

		const startMs = cursorMs + (index > 0 ? pauseMs : 0);
		const endMs = startMs + info.durationMs;
		report.push({
			index: index + 1,
			text,
			file: path.relative(project, file).split(path.sep).join("/"),
			start_s: Number((startMs / 1000).toFixed(3)),
			end_s: Number((endMs / 1000).toFixed(3)),
			duration_s: Number((info.durationMs / 1000).toFixed(3)),
		});
		cursorMs = endMs;
		console.log(`generated ${index + 1}/${units.length}`);
	}

	const narration = concatWavs(audioBuffers, pauseMs);
	await ensureParent(output);
	await writeFile(output, narration);
	const narrationInfo = wavInfo(narration);
	await writeFile(
		output.replace(/\.[^.]+$/, ".json"),
		`${JSON.stringify(
			{
				provider: "volcengine",
				voice_type: env.VOLCENGINE_TTS_VOICE_TYPE,
				duration_s: Number((narrationInfo.durationMs / 1000).toFixed(3)),
				units: report,
			},
			null,
			2,
		)}\n`,
	);
	console.log(output);
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
