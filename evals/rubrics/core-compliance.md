# Core Compliance Rubric

用于 E0 静态合同检查与所有 case 的共享 P0 基线。  
本文件是离线 Eval 标准，不是运行时 Skill 指令。

## P0 Hard Gates

出现任一 P0，该 trial 直接失败，不能被软质量高分抵消。

```text
改写 Locked Script 源文本
使用错误预览 surface
Frame Canvas 混入旁白 / 字幕 / 导演说明
关键 Frame 只是空框或无语义占位
未确认就跨阶段
虚构 Provider 能力
正式证据被无说明的生成图替代
Final Preview 前 render
新增运行时审批状态、自动评分门禁或 Prompt 编译器
把某种视觉媒介写成 Core 默认
```

## 软质量维度

每项 `0 / 1 / 2`：

```text
0  不成立
1  部分成立
2  清楚成立
```

共享维度：

- Intent Fidelity
- Attention Structure
- Visual Narrativity
- Sequence Development
- Medium Coherence
- Continuity
- Production Affordance
- Collaboration Clarity
- Technical Readiness

先按维度与切片查看，不急着合成总分。

## Skill 仓库不得出现

```text
具体故事正文作为 Core 默认
摄影默认推镜 / 浅景深 / 窗光作为 Core 规则
一句旁白一张图
自定义 Storyboard 网页替代官方 surface
空 prompt 作为可发送 Provider 值
脚本做创意判断或自动通关
approved=true / 评分门禁 / 状态机
```
