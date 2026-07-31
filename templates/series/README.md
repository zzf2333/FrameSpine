# 系列工作区

当前项目根目录就是系列根目录；一个项目只容纳一个系列，不再额外创建系列名子目录。

1. Agent 阅读 `references/core/series-initialization.md`，先建立长期可复用的系列配置，不策划第一期。
2. 分析用户已有账号、品牌、参考和资产；用推荐先行、一次一问的方式确认长期决定。
3. 将 Series Identity、Audience Profile、Narrative Contract、Visual Medium / Image Language / Voice Identity 与 Production Configuration 整理到 `SERIES.md`。
4. 将媒介中立的 Visual Expression Contract 与 HyperFrames 可执行视觉身份写入 `DESIGN.md`。
5. 在 `CALIBRATION.md` 定义 Series Style Calibration：只测试图片风格、字幕、动效、声音、转场和组件，不测试主题、Hook、故事或图片节拍。
6. 复制 `.env.example` 为 `.env` 并填写 Provider 配置。
7. 在 `calibration/` 使用 HyperFrames 制作非 Episode 的动态风格测试。
8. 用户观看后更新长期系列基线；然后由用户提供具体内容，才创建 `episodes/` 中的单集。
