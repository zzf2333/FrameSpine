#!/usr/bin/env node
import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exists, parseArgs } from "./lib/env.mjs";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function replace(root, tokens) {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) { await replace(file, tokens); continue; }
    const buffer = await readFile(file);
    if (buffer.includes(0)) continue;
    let text = buffer.toString("utf8");
    for (const [token, value] of Object.entries(tokens)) text = text.split(token).join(value);
    await writeFile(file, text);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.path || !args.name || !args.slug) throw new Error("用法：init-series --path <目录> --name <系列名> --slug <series-id>");
  const target = path.resolve(args.path);
  if (await exists(target) && (await readdir(target)).length) throw new Error(`目标目录不是空目录：${target}`);
  await mkdir(target, { recursive: true });
  await cp(path.join(skillRoot, "templates/series"), target, { recursive: true });
  await replace(target, { "__SERIES_NAME__": args.name, "__SERIES_SLUG__": args.slug });
  console.log(target);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
