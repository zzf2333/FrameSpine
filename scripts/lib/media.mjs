import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function ensureParent(file) {
  await mkdir(path.dirname(file), { recursive: true });
}

export async function fetchJson(url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error(`接口返回的不是 JSON（HTTP ${response.status}）`);
    }
    if (!response.ok) {
      const message = payload?.error?.message || payload?.message || payload?.msg || "";
      throw new Error(`接口请求失败（HTTP ${response.status}）${message ? `：${message}` : ""}`);
    }
    return { response, payload };
  } finally {
    clearTimeout(timer);
  }
}

export async function imageBufferFromPayload(payload, baseUrl, apiKey, timeoutMs) {
  const item = Array.isArray(payload?.data) && payload.data.length
    ? payload.data[0]
    : Array.isArray(payload?.output) && payload.output.length
      ? payload.output[0]
      : payload?.image || payload;

  const encoded = item?.b64_json || item?.base64 || item?.image_base64 || payload?.b64_json;
  if (typeof encoded === "string" && encoded.length) {
    return Buffer.from(encoded.replace(/^data:image\/[^;]+;base64,/, ""), "base64");
  }

  const value = item?.url || item?.image_url || payload?.url;
  if (typeof value !== "string" || !value) throw new Error("图片接口没有返回 Base64 或 URL");

  const target = new URL(value, baseUrl);
  const headers = target.host === new URL(baseUrl).host ? { Authorization: `Bearer ${apiKey}` } : {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(target, { headers, signal: controller.signal });
    if (!response.ok) throw new Error(`下载图片失败（HTTP ${response.status}）`);
    return Buffer.from(await response.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

export async function saveBuffer(file, buffer) {
  await ensureParent(file);
  await writeFile(file, buffer);
}

export function wavInfo(buffer) {
  if (buffer.length < 44 || buffer.subarray(0, 4).toString("ascii") !== "RIFF" || buffer.subarray(8, 12).toString("ascii") !== "WAVE") {
    throw new Error("火山 TTS 没有返回有效 WAV");
  }
  let offset = 12;
  let format = null;
  let data = null;
  while (offset + 8 <= buffer.length) {
    const id = buffer.subarray(offset, offset + 4).toString("ascii");
    const size = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (start + size > buffer.length) throw new Error("WAV 文件损坏");
    if (id === "fmt ") {
      format = {
        audioFormat: buffer.readUInt16LE(start),
        channels: buffer.readUInt16LE(start + 2),
        sampleRate: buffer.readUInt32LE(start + 4),
        byteRate: buffer.readUInt32LE(start + 8),
        blockAlign: buffer.readUInt16LE(start + 12),
        bitsPerSample: buffer.readUInt16LE(start + 14),
        raw: buffer.subarray(start, start + size),
      };
    }
    if (id === "data") data = buffer.subarray(start, start + size);
    offset = start + size + (size % 2);
  }
  if (!format || !data || !format.byteRate) throw new Error("WAV 缺少音频数据");
  return { ...format, data, durationMs: Math.round(data.length / format.byteRate * 1000) };
}

function buildWav(format, data) {
  const fmtSize = format.raw.length;
  const pad = data.length % 2;
  const total = 12 + 8 + fmtSize + 8 + data.length + pad;
  const output = Buffer.alloc(total);
  output.write("RIFF", 0, "ascii");
  output.writeUInt32LE(total - 8, 4);
  output.write("WAVE", 8, "ascii");
  output.write("fmt ", 12, "ascii");
  output.writeUInt32LE(fmtSize, 16);
  format.raw.copy(output, 20);
  const dataHeader = 20 + fmtSize;
  output.write("data", dataHeader, "ascii");
  output.writeUInt32LE(data.length, dataHeader + 4);
  data.copy(output, dataHeader + 8);
  return output;
}

export function concatWavs(buffers, pauseMs = 0) {
  const parsed = buffers.map(wavInfo);
  const base = parsed[0];
  const keys = ["audioFormat", "channels", "sampleRate", "byteRate", "blockAlign", "bitsPerSample"];
  if (!parsed.every((item) => keys.every((key) => item[key] === base[key]))) {
    throw new Error("不同语音段的 WAV 格式不一致");
  }
  const silenceBytes = Math.round((pauseMs / 1000) * base.byteRate / base.blockAlign) * base.blockAlign;
  const silence = silenceBytes > 0 ? Buffer.alloc(silenceBytes) : null;
  const parts = [];
  parsed.forEach((item, index) => {
    if (index > 0 && silence) parts.push(silence);
    parts.push(item.data);
  });
  return buildWav(base, Buffer.concat(parts));
}
