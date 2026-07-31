# Provider Boundary Cases（E1）

单能力：Provider 能力诚实与 prompt 边界。

## 设计要求

- 仅 `prompt` + 确认支持的 `extra` 到达 Provider
- 不支持 reference 时不假装已上传 / Base64
- 空 prompt 被脚本拒绝
- 不虚构能力

## 当前状态

- Placeholder
- Fixtures：`fixtures/provider-capabilities/{no-reference-upload,reference-supported}.json`

## 后续

真实“声称支持 reference 却未上传”→ E3 轨迹 + 本目录 case。
