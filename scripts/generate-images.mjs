#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { exists, loadSeriesEnv, need, numberValue, parseArgs } from "./lib/env.mjs";
import { fetchJson, imageBufferFromPayload, saveBuffer } from "./lib/media.mjs";

async function main() {
  const args = parseArgs(process.argv.slice(2), new Set(["--overwrite"]));
  const project = path.resolve(args.project || process.cwd());
  const planFile = path.resolve(project, args.plan || "image-prompts.json");
  const { env } = await loadSeriesEnv(project);
  need(env, ["GPT_IMAGE2_BASE_URL", "GPT_IMAGE2_API_KEY", "GPT_IMAGE2_MODEL"]);

  let items = JSON.parse(await readFile(planFile, "utf8"));
  if (!Array.isArray(items) || !items.length) throw new Error("image-prompts.json 需要是非空数组");

  if (args.only) {
    const wanted = new Set(args.only.split(",").map((value) => value.trim()).filter(Boolean));
    items = items.filter((item) => wanted.has(item.id));
    if (!items.length) throw new Error(`没有找到图片请求：${args.only}`);
  }

  const baseUrl = env.GPT_IMAGE2_BASE_URL.replace(/\/$/, "");
  const endpoint = `${baseUrl}${env.GPT_IMAGE2_GENERATION_PATH || "/v1/images/generations"}`;
  const timeout = numberValue(env, "GPT_IMAGE2_TIMEOUT_MS", 180000);

  for (const item of items) {
    if (!item.id || !item.prompt || !item.output) throw new Error("每张图片需要 id、prompt 和 output");
    const output = path.resolve(project, item.output);
    if (!args.overwrite && await exists(output)) {
      console.log(`skip ${item.id}`);
      continue;
    }

    const body = {
      ...(item.extra || {}),
      model: env.GPT_IMAGE2_MODEL,
      prompt: item.prompt,
      size: item.size || env.GPT_IMAGE2_DEFAULT_SIZE || "1024x1536",
      quality: item.quality || env.GPT_IMAGE2_DEFAULT_QUALITY || "high",
      n: 1,
      response_format: env.GPT_IMAGE2_RESPONSE_FORMAT || "b64_json",
    };

    const { payload } = await fetchJson(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GPT_IMAGE2_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }, timeout);

    const buffer = await imageBufferFromPayload(payload, baseUrl, env.GPT_IMAGE2_API_KEY, timeout);
    await saveBuffer(output, buffer);
    console.log(`generated ${item.id}: ${item.output}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
