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
TTS_REQUEST_UNIT=paragraph
TTS_SOFT_BREAK_MS=80
TTS_PARAGRAPH_PAUSE_MS=240

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

默认输入是单集根目录的 `SCRIPT.md`，它是权威旁白源文本：

- 空行保留为较长的段落停顿；单换行保留在源文中，既不为字幕分组服务，也不默认拆成新的 TTS 请求；
- 模板中的 HTML 注释会被忽略；
- 默认脚本会将其逐字同步到 `narration.txt`，再用相同文字请求 TTS；
- `narration.txt` 是派生文件，不独立编辑；
- Locked Script Mode 必须保留原句、标点、顺序、互动和停顿；
- Development / Revision Mode 在文本确认后也应以 `SCRIPT.md` 为唯一来源。

已有旧项目或自定义输入可显式传入 `--input narration.txt`；显式输入不会覆盖 `SCRIPT.md`。

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

默认不需要 `--input`，会从 `SCRIPT.md` 同步 `narration.txt`。

输出：

```text
assets/audio/narration.wav
assets/audio/narration.json
assets/audio/units/*.wav
```

`narration.json` 记录实际请求单元、时间与时长，帮助排片。字幕的词级或短语时间使用 HyperFrames transcribe；HyperFrames 实际显示的字幕只读取 Episode 根目录的 `captions.json`。

## TTS 制作建议

- 系列初始化阶段先做短声线试听；
- Hook、解释、证据和结尾可以使用不同分段与停顿；
- 用户不满意时只重做对应段；
- `TTS_REQUEST_UNIT=paragraph`（默认）每个空行段落只请求一次 TTS，保留连续语调；此模式下单换行仍保留在源文和 `narration.txt` 中，但不额外拼接停顿。
- 只有实际听感确认短行需要独立交付节拍时才设为 `TTS_REQUEST_UNIT=line`；此模式每个非空短行单独请求 TTS，`TTS_SOFT_BREAK_MS` 控制单换行间隔（默认 80ms），`TTS_PARAGRAPH_PAUSE_MS` 控制空行段落间隔（默认 240ms）。
- 字幕组、源文短行和 TTS 请求单元是三个不同概念；不要为了其中一个自动改写另一个。
- TTS 太慢先检查真实时长、段落、图片停留和目标时长；Locked Script Mode 未获用户许可时不缩短文案；
- 声音选择与系列旁白角色一致。

# 三、GPT Image 2

## 输入格式

`image-prompts.json` 是简单数组：

```json
[
  {
    "id": "img-world-anchor",
    "used_in_beats": ["B01", "B02"],
    "role": "world-anchor",
    "purpose": "这张图片在故事中承担什么",
    "references": ["Character Anchor 01", "Space Anchor 01"],
    "prompt": "完整镜头生产指令：叙事任务、可见事实、连续性、镜头、真实细节、制作余量、系列基线与失败约束",
    "output": "assets/images/world-anchor.png",
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

`purpose`、`role`、`used_in_beats` 与 `references` 是 Agent 的导演上下文，脚本会忽略；Provider 也不会自动看到 `STORYBOARD.md`、`DESIGN.md` 或这些字段。因此，真正影响生成的叙事任务、可见事实、连续性锚点、镜头、物理真实细节、制作余量、系列基线和失败约束必须写进 `prompt`。

`extra` 原样并入第三方请求体，用于第三方 API 的特有参数。仅在第三方接口已确认支持时，用它映射参考图、编辑或变体参数；不要假定所有 Provider 都支持。

当前脚本不会读取本地参考图、转为 Base64、上传文件，或将 `references` 中的 Anchor 名称解析为图片路径。因此 `references` 只帮助 Agent 写 Prompt；若某个 Provider 需要参考图，调用方必须在 `extra` 中提供该接口**已经接受**的远程 URL、Base64 或其他预备字段。只有确认具体第三方接口后，才考虑增加相应的 Provider adapter；不要为此建设通用参考图适配层。

## 运行

全部生成：

```bash
node <skill>/scripts/generate-images.mjs --project <episode-dir>
```

只生成指定图片：

```bash
node <skill>/scripts/generate-images.mjs \
  --project <episode-dir> \
  --only img-world-anchor,img-job-search-wide
```

已有文件默认跳过。重新生成：

```bash
node <skill>/scripts/generate-images.mjs \
  --project <episode-dir> \
  --only img-world-anchor \
  --overwrite
```

## 图片制作建议

- Prompt 来自 `STORYBOARD.md` 的图片任务和 Episode Visual Anchors，不从旁白直接临时生成；
- 按实际素材而非 Beat 一一命名；一个素材可跨多个 Beat，一个 Beat 可使用多个素材；
- 先生成世界锚点、第一帧、长期人物、核心重构、机制和结尾回收等高风险素材；
- 候选放入真实竖屏 HyperFrames Composition，应用实际裁切、字幕安全区、运动与 Handoff 后再选择；
- 生成前完成 Prompt Audit；随后完成 Image Set Audit，检查整组素材的角色分布、景别/机位、姿态、完成状态、光线、功能性细节和镜头任务是否过度重复；
- `prompt` 为空时脚本会拒绝请求；不要在该字段放教学说明或元指令；
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
