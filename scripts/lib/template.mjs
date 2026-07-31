import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

async function replaceFile(file, tokens) {
    const buffer = await readFile(file);
    if (buffer.includes(0)) return;
    let text = buffer.toString("utf8");
    for (const [token, value] of Object.entries(tokens)) text = text.split(token).join(value);
    await writeFile(file, text);
}

export async function replaceTokens(target, tokens) {
    if ((await stat(target)).isFile()) { await replaceFile(target, tokens); return; }
    for (const entry of await readdir(target, { withFileTypes: true })) {
        const file = path.join(target, entry.name);
        if (entry.isDirectory()) { await replaceTokens(file, tokens); continue; }
        await replaceFile(file, tokens);
    }
}