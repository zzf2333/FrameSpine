#!/usr/bin/env node
import { cp, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findSeriesRoot, exists, parseArgs } from "./lib/env.mjs";
import { replaceTokens } from "./lib/template.mjs";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.series || !args.slug || !args.title) throw new Error("用法：init-episode --series <系列目录> --slug <episode-id> --title <标题>");
  const series = await findSeriesRoot(args.series);
  const target = path.join(series, "episodes", args.slug);
  if (await exists(target) && (await readdir(target)).length) throw new Error(`单集目录已存在且非空：${target}`);
  await mkdir(target, { recursive: true });
  await cp(path.join(skillRoot, "templates/episode"), target, { recursive: true });
  await replaceTokens(target, { "__EPISODE_TITLE__": args.title, "__EPISODE_SLUG__": args.slug });
  console.log(target);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
