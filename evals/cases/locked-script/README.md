# Locked Script Cases（E1）

单能力：权威文案保真。不跑完整视频。

## 设计要求（DESIGN §4 E1）

- `SCRIPT.md` 逐字保留
- 不改标点、顺序、互动、停顿
- 提取 Attention Spine，不重写
- 图片困难时先改导演方案，不改稿

## 当前状态

- **专用 YAML**：尚未独立成套（placeholder）
- **已覆盖**：`../storyboard/` 与 `../timed/` 中的 locked-script 切片 case 已嵌套保真门禁

## 后续

真实生产出现静默改稿时，在此目录新增独立 E1 case，并挂 `script_preservation` gate。  
`must_do` / `must_not_do` 只属于 case 金标准，不写回 Skill Core。
