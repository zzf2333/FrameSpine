# HyperFrames 单集项目

在此目录初始化：

```bash
npx hyperframes init . --non-interactive
```

同一项目持续演进：

```text
Story Flow：官方 Storyboard surface / 可渲染 Frame Cards
→ Image Animatic：第一次完整 Composition 时间播放
→ Timed Animatic
→ Final Composition
```

Story Flow 不创建自定义说明网页、名为 Storyboard 的普通 Composition 或粗视频 Player；它使用 Studio 自带 Storyboard view。用户确认 Cards 后才建立 Image Animatic 时间线。不要为每个成熟度阶段复制一整套项目。需要保留审阅历史时使用版本控制；导出短 MP4 只适用于已有 Composition 时间线的阶段。
