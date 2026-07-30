# 技术附录：火山 TTS 与 GPT Image 2

配套脚本只负责调用 Provider 和保存媒体，不决定创意，也不记录用户批准。

# 一、系列 `.env`

每个系列根目录拥有自己的 `.env`。

脚本从单集目录向上查找 `SERIES.md`，然后读取系列 `.env`。Shell 环境变量覆盖同名配置。

```dotenv
# Volcengine TTS
VOLCENGINE_TTS_ENDPOINT=https://openspeech.bytedance.com/api/v1/tts
VOLCENGINE_TTS_APP_ID=
VOLCENGINE_TTS_ACCESS_TOKEN=
VOLCENGINE_TTS_CLUSTER=volcano_tts
VOLCENGINE_TTS_VOICE_TYPE=
VOLCENGINE_TTS_SPEED_RATIO=1.10
VOLCENGINE_TTS_VOLUME_RATIO=1.00
VOLCENGINE_TTS_PITCH_RATIO=1.00
VOLCENGINE_TTS_TIMEOUT_MS=120000
TTS_PARAGRAPH_PAUSE_MS=120

# Third-party GPT Image 2
GPT_IMAGE2_BASE_URL=
GPT_IMAGE2_API_KEY=
GPT_IMAGE2_MODEL=gpt-image-2
GPT_IMAGE2_GENERATION_PATH=/v1/images/generations
GPT_IMAGE2_RESPONSE_FORMAT=b64_json
GPT_IMAGE2_DEFAULT_SIZE=1024x1536
GPT_IMAGE2_DEFAULT_QUALITY=high
GPT_IMAGE2_TIMEOUT_MS=180000
```

`.env`：

- 不提交版本控制；
- 不复制到单集；
- 不放进交付 ZIP；
- 不粘贴到对话；
- 错误日志不应打印 Token 或 API Key。

# 二、火山 TTS

## 输入

单集根目录的 `narration.txt`：

- 用空行分隔独立语音段；
- 以 `#` 开头的行被忽略；
- 建议按可单独重做的语义段落拆分；
- 不要把一整条 60 秒旁白只作为一个超长段。

运行：

```bash
node <skill>/scripts/generate-tts.mjs --project <episode-dir>
```

可覆盖路径：

```bash
node <skill>/scripts/generate-tts.mjs \
  --project <episode-dir> \
  --input narration.txt \
  --output assets/audio/narration.wav
```

输出：

```text
assets/audio/narration.wav
assets/audio/narration.json
assets/audio/units/*.wav
```

`narration.json` 记录段落实际时长，帮助排片。字幕的词级或短语时间使用 HyperFrames transcribe。

## TTS 制作建议

- 系列初始化阶段先做短声线试听；
- Hook、解释、证据和结尾可以使用不同分段与停顿；
- 用户不满意时只重做对应段；
- TTS 太慢先检查文案，不只提高速度；
- 声音选择与系列旁白角色一致。

# 三、GPT Image 2

## 输入格式

`image-prompts.json` 是简单数组：

```json
[
  {
    "id": "beat-01",
    "purpose": "这张图片在故事中承担什么",
    "prompt": "完整图片提示词",
    "output": "assets/images/beat-01.png",
    "size": "1024x1536",
    "quality": "high",
    "extra": {}
  }
]
```

脚本必需字段：

```text
id
prompt
output
```

`purpose` 供 Agent 和用户理解，脚本会忽略。

`extra` 原样并入第三方请求体，用于第三方 API 的特有参数。

## 运行

全部生成：

```bash
node <skill>/scripts/generate-images.mjs --project <episode-dir>
```

只生成指定图片：

```bash
node <skill>/scripts/generate-images.mjs \
  --project <episode-dir> \
  --only beat-01,beat-02
```

已有文件默认跳过。重新生成：

```bash
node <skill>/scripts/generate-images.mjs \
  --project <episode-dir> \
  --only beat-01 \
  --overwrite
```

## 图片制作建议

- Prompt 来自 `STORYBOARD.md` 的图片任务，不从旁白直接临时生成；
- 对高风险镜头先生成少量候选；
- 候选放入 HyperFrames 真实裁切和运动后再选择；
- 用户不喜欢时先修改导演任务或构图，再改风格形容词；
- 准确中文、英文和界面文字优先在 HyperFrames 中叠加；
- 第三方 API 的参考图、编辑和变体参数只有在接口确认支持后通过 `extra` 使用。

# 四、Provider 与创作边界

Provider 返回成功不代表素材合格。

脚本只回答：

```text
请求是否成功
文件是否保存
```

用户和 Agent 通过 HyperFrames 预览判断：

```text
声音是否适合
图片是否讲内容
构图是否可用
是否需要重做
```
