# FrameSpine Eval（精简）

离线工具，**不进入运行时 Skill**。

```text
Skill 负责生产
Eval  只做两件事：
  1. E0：文档合同有没有漂
  2. 对真实 episode workspace 跑阶段硬门禁（尸检）
```

**不解决**：对话里 Agent 是否守流程。那要靠 Skill 写法与人工阶段确认。

## 保留内容

```text
evals/
├── README.md
├── cases/                 # 4 个 happy-path 金标准（给 gate 对照）
│   ├── storyboard/storyboard-locked-001.yaml
│   ├── animatic/image-animatic-locked-001.yaml
│   ├── timed/timed-animatic-locked-001.yaml
│   └── final/final-locked-001.yaml
├── fixtures/              # 最小 series + locked script
├── graders/
│   ├── deterministic/
│   │   ├── e0-static-contracts.mjs
│   │   ├── storyboard-gates.mjs
│   │   ├── image-animatic-gates.mjs
│   │   ├── timed-animatic-gates.mjs
│   │   └── final-gates.mjs
│   ├── lib/               # manifest / case yaml / paths
│   └── visual/board-claim-check.mjs
└── runs/                  # gitignored 本地产物
```

已删除：synthetic suite、multi-trial harness、负例矩阵、长报告、rubrics、human sheets、骨架 case 区。

## 日常命令

```bash
# 改 Skill / references 后：文档合同
npm run eval:e0

# 对真实单集 workspace 尸检（按阶段选一个）
npm run eval:gates -- \
  --case evals/cases/storyboard/storyboard-locked-001.yaml \
  --workspace /path/to/episode \
  --source-script evals/fixtures/inputs/locked-script-a.md

npm run eval:gates:animatic -- \
  --case evals/cases/animatic/image-animatic-locked-001.yaml \
  --workspace /path/to/episode

npm run eval:gates:timed -- \
  --case evals/cases/timed/timed-animatic-locked-001.yaml \
  --workspace /path/to/episode \
  --source-script /path/to/SCRIPT.md

npm run eval:gates:final -- \
  --case evals/cases/final/final-locked-001.yaml \
  --workspace /path/to/episode

# Story Flow 画布 claim 粗检（非 Studio 像素）
node evals/graders/visual/board-claim-check.mjs --workspace /path/to/episode
```

Workspace 需含阶段 `eval-artifacts/`（preview / board|composition|timed|final manifest、tool-trace 等）。没有 artifacts 时 gate 可能 `inconclusive`——那说明 Agent 没按可验方式落盘，不是“质量高”。

## 原则

1. Eval 不污染 `SKILL.md` / `references/` / `templates/` / `scripts/`
2. 不为覆盖率堆 case；真实反复翻车再加 1 个回归
3. 全绿 ≠ 单集好用；只表示合同/门禁没漂、或该 workspace 硬边界过了
