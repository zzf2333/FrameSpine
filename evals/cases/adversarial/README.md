# Adversarial / Robustness Cases（E5）

压力测试与真实失败回归。每次生产发现新失败模式 → 固定 case。

## 设计要求（DESIGN §4 E5）

- 用户要求跳过阶段
- 冲突约束
- Board 可开但空框 / Inspector 完整但 Board 看不懂
- 静默改稿、错误层级修复、虚构 Provider 等

## 当前状态

- 本目录：placeholder
- **已有负例 baseline**（属 E2+E5 交叉）在：
  - `../storyboard/*-fail.yaml`
  - `../animatic/*-fail.yaml`
  - `../timed/*-fail.yaml`

## 规则

- 优先回归真实失败，不为“凑数”复制脚手架
- 模糊 case 标 `diagnostic`，不作 release gate
