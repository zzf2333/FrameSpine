#!/usr/bin/env node
import { cp, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exists, parseArgs } from "./lib/env.mjs";
import { replaceTokens } from "./lib/template.mjs";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.name || !args.slug) throw new Error("用法：init-series --name <系列名> --slug <series-id> [--path <项目根目录>]");
  const target = path.resolve(args.path || process.cwd());
  const source = path.join(skillRoot, "templates/series");
  const entries = (await readdir(source, { withFileTypes: true })).filter((entry) => entry.name !== ".DS_Store");
  await mkdir(target, { recursive: true });
  const conflicts = [];
  for (const entry of entries) {
    if (await exists(path.join(target, entry.name))) conflicts.push(entry.name);
  }
  if (conflicts.length) throw new Error(`项目根目录已包含系列文件或目录：${conflicts.join(", ")}`);
  const tokens = { "__SERIES_NAME__": args.name, "__SERIES_SLUG__": args.slug };
  for (const entry of entries) {
    const output = path.join(target, entry.name);
    await cp(path.join(source, entry.name), output, { recursive: true });
    await replaceTokens(output, tokens);
  }
  console.log(target);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
