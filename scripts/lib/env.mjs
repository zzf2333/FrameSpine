import { access, readFile } from "node:fs/promises";
import path from "node:path";

export async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

export function parseArgs(argv, booleanFlags = new Set()) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (!flag.startsWith("--")) throw new Error(`未知参数：${flag}`);
    const key = flag.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (booleanFlags.has(flag)) { out[key] = true; continue; }
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) throw new Error(`缺少参数值：${flag}`);
    out[key] = value;
    i += 1;
  }
  return out;
}

export async function findSeriesRoot(start) {
  let current = path.resolve(start || process.cwd());
  while (true) {
    if (await exists(path.join(current, "SERIES.md"))) return current;
    const parent = path.dirname(current);
    if (parent === current) throw new Error("没有找到系列根目录（缺少 SERIES.md）");
    current = parent;
  }
}

export function parseEnv(text) {
  const values = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const at = line.indexOf("=");
    if (at < 1) continue;
    const key = line.slice(0, at).trim();
    let value = line.slice(at + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values[key] = value;
  }
  return values;
}

export async function loadSeriesEnv(seriesPath) {
  const root = await findSeriesRoot(seriesPath);
  const file = path.join(root, ".env");
  const fromFile = await exists(file) ? parseEnv(await readFile(file, "utf8")) : {};
  return { root, env: { ...fromFile, ...process.env } };
}

export function need(env, names) {
  const missing = names.filter((name) => !String(env[name] || "").trim());
  if (missing.length) throw new Error(`系列 .env 缺少：${missing.join(", ")}`);
}

export function numberValue(env, name, fallback) {
  const raw = env[name];
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`${name} 必须是数字`);
  return value;
}
