/**
 * 技能模板工作流模块（中文）
 *
 * 由旧版单体模板拆分而来。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getOnboardSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-onboard',
    description: 'OpenSpec 引导式上手——带讲解走完一次完整工作流循环，并在真实代码库中实践。',
    instructions: getOnboardInstructions(),
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

function getOnboardInstructions(): string {
  return `带用户走完首次完整 OpenSpec 工作流循环。这是一次教学体验——你会在他们的代码库中做真实工作，同时解释每一步。

---

## 预检查

开始前检查 OpenSpec CLI 是否安装：

\`\`\`bash
# Unix/macOS
openspec --version 2>&1 || echo "CLI_NOT_INSTALLED"
# Windows (PowerShell)
# if (Get-Command openspec -ErrorAction SilentlyContinue) { openspec --version } else { echo "CLI_NOT_INSTALLED" }
\`\`\`

**若未安装 CLI：**
> OpenSpec CLI 未安装。请先安装，再回来使用 \`/opsx:onboard\`。

若未安装，停止。

---

## 阶段 1：欢迎

展示：

\`\`\`
## Welcome to OpenSpec!

I'll walk you through a complete change cycle—from idea to implementation—using a real task in your codebase. Along the way, you'll learn the workflow by doing it.

**What we'll do:**
1. Pick a small, real task in your codebase
2. Explore the problem briefly
3. Create a change (the container for our work)
4. Build the artifacts: proposal → specs → design → tasks
5. Implement the tasks
6. Archive the completed change

**Time:** ~15-20 minutes

Let's start by finding something to work on.
\`\`\`

---

## 阶段 2：任务选择

### 代码库分析

扫描代码库中的小型改进机会，重点关注：

1. **TODO/FIXME 注释** - 在代码中搜索 \`TODO\`、\`FIXME\`、\`HACK\`、\`XXX\`
2. **缺失异常处理** - 吞掉错误的 \`catch\`、高风险操作无 try-catch
3. **无测试的函数** - 对照 \`src/\` 与测试目录
4. **类型问题** - TypeScript 中的 \`any\`（\`: any\`、\`as any\`）
5. **调试残留** - 非调试代码中的 \`console.log\`、\`console.debug\`、\`debugger\`
6. **缺少校验** - 处理用户输入但无验证

同时检查最近 git 活动：
\`\`\`bash
# Unix/macOS
git log --oneline -10 2>/dev/null || echo "No git history"
# Windows (PowerShell)
# git log --oneline -10 2>$null; if ($LASTEXITCODE -ne 0) { echo "No git history" }
\`\`\`

### 提出建议

基于分析提出 3-4 个具体建议：

\`\`\`
## Task Suggestions

Based on scanning your codebase, here are some good starter tasks:

**1. [Most promising task]**
   Location: \`src/path/to/file.ts:42\`
   Scope: ~1-2 files, ~20-30 lines
   Why it's good: [brief reason]

**2. [Second task]**
   Location: \`src/another/file.ts\`
   Scope: ~1 file, ~15 lines
   Why it's good: [brief reason]

**3. [Third task]**
   Location: [location]
   Scope: [estimate]
   Why it's good: [brief reason]

**4. Something else?**
   Tell me what you'd like to work on.

Which task interests you? (Pick a number or describe your own)
\`\`\`

**若未发现明显任务：**
> 我没有在代码库里发现明显的 quick wins。你有什么一直想加或修的小东西吗？

### 范围护栏

若用户选择的任务过大（大型功能/多日工作）：

\`\`\`
That's a valuable task, but it's probably larger than ideal for your first OpenSpec run-through.

For learning the workflow, smaller is better—it lets you see the full cycle without getting stuck in implementation details.

**Options:**
1. **Slice it smaller** - What's the smallest useful piece of [their task]? Maybe just [specific slice]?
2. **Pick something else** - One of the other suggestions, or a different small task?
3. **Do it anyway** - If you really want to tackle this, we can. Just know it'll take longer.

What would you prefer?
\`\`\`

若用户坚持，允许继续——这是软护栏。

---

## 阶段 3：探索演示

任务选定后，简要演示探索模式：

\`\`\`
Before we create a change, let me quickly show you **explore mode**—it's how you think through problems before committing to a direction.
\`\`\`

花 1-2 分钟调查相关代码：
- 阅读相关文件
- 若有帮助，画 ASCII 图
- 记录关键考虑点

\`\`\`
## Quick Exploration

[Your brief analysis—what you found, any considerations]

┌─────────────────────────────────────────┐
│   [Optional: ASCII diagram if helpful]  │
└─────────────────────────────────────────┘

Explore mode (\`/opsx:explore\`) is for this kind of thinking—investigating before implementing. You can use it anytime you need to think through a problem.

Now let's create a change to hold our work.
\`\`\`

**暂停** - 等用户确认后继续。

---

## 阶段 4：创建变更

**说明：**
\`\`\`
## Creating a Change

A "change" in OpenSpec is a container for all the thinking and planning around a piece of work. It lives in \`openspec/changes/<name>/\` and holds your artifacts—proposal, specs, design, tasks.

Let me create one for our task.
\`\`\`

**执行：**用 kebab-case 名称创建变更：
\`\`\`bash
openspec new change "<derived-name>"
\`\`\`

**展示：**
\`\`\`
Created: \`openspec/changes/<name>/\`

The folder structure:
\`\`\`
openspec/changes/<name>/
├── proposal.md    ← Why we're doing this (empty, we'll fill it)
├── design.md      ← How we'll build it (empty)
├── specs/         ← Detailed requirements (empty)
└── tasks.md       ← Implementation checklist (empty)
\`\`\`
\`\`\`

\`\`\`

Now let's fill in the first artifact—the proposal.
\`\`\`

---

## 阶段 5：Proposal

**说明：**
\`\`\`
## The Proposal

The proposal captures **why** we're making this change and **what** it involves at a high level. It's the "elevator pitch" for the work.

I'll draft one based on our task.
\`\`\`

**执行：**起草 proposal 内容（先不保存）：

\`\`\`
Here's a draft proposal:

---

## Why

[1-2 sentences explaining the problem/opportunity]

## What Changes

[Bullet points of what will be different]

## Capabilities

### New Capabilities
- \`<capability-name>\`: [brief description]

### Modified Capabilities
<!-- If modifying existing behavior -->

## Impact

- \`src/path/to/file.ts\`: [what changes]
- [other files if applicable]

---

Does this capture the intent? I can adjust before we save it.
\`\`\`

**暂停** - 等用户确认/反馈。

确认后保存 proposal：
\`\`\`bash
openspec instructions proposal --change "<name>" --json
\`\`\`
然后将内容写入 \`openspec/changes/<name>/proposal.md\`。

\`\`\`
Proposal saved. This is your "why" document—you can always come back and refine it as understanding evolves.

Next up: specs.
\`\`\`

---

## 阶段 6：Specs

**说明：**
\`\`\`
## Specs

Specs define **what** we're building in precise, testable terms. They use a requirement/scenario format that makes expected behavior crystal clear.

For a small task like this, we might only need one spec file.
\`\`\`

**执行：**创建 spec 文件：
\`\`\`bash
# Unix/macOS
mkdir -p openspec/changes/<name>/specs/<capability-name>
# Windows (PowerShell)
# New-Item -ItemType Directory -Force -Path "openspec/changes/<name>/specs/<capability-name>"
\`\`\`

起草 spec 内容：

\`\`\`
Here's the spec:

---

## ADDED Requirements

### Requirement: <Name>

<Description of what the system should do>

#### Scenario: <Scenario name>

- **WHEN** <trigger condition>
- **THEN** <expected outcome>
- **AND** <additional outcome if needed>

---

This format—WHEN/THEN/AND—makes requirements testable. You can literally read them as test cases.
\`\`\`

保存到 \`openspec/changes/<name>/specs/<capability>/spec.md\`。

---

## 阶段 7：Design

**说明：**
\`\`\`
## Design

The design captures **how** we'll build it—technical decisions, tradeoffs, approach.

For small changes, this might be brief. That's fine—not every change needs deep design discussion.
\`\`\`

**执行：**起草 design.md：

\`\`\`
Here's the design:

---

## Context

[Brief context about the current state]

## Goals / Non-Goals

**Goals:**
- [What we're trying to achieve]

**Non-Goals:**
- [What's explicitly out of scope]

## Decisions

### Decision 1: [Key decision]

[Explanation of approach and rationale]

---

For a small task, this captures the key decisions without over-engineering.
\`\`\`

保存到 \`openspec/changes/<name>/design.md\`。

---

## 阶段 8：Tasks

**说明：**
\`\`\`
## Tasks

Finally, we break the work into implementation tasks—checkboxes that drive the apply phase.

These should be small, clear, and in logical order.
\`\`\`

**执行：**根据 specs 与 design 生成任务：

\`\`\`
Here are the implementation tasks:

---

## 1. [Category or file]

- [ ] 1.1 [Specific task]
- [ ] 1.2 [Specific task]

## 2. Verify

- [ ] 2.1 [Verification step]

---

Each checkbox becomes a unit of work in the apply phase. Ready to implement?
\`\`\`

**暂停** - 等用户确认准备实现。

保存到 \`openspec/changes/<name>/tasks.md\`。

---

## 阶段 9：Apply（实现）

**说明：**
\`\`\`
## Implementation

Now we implement each task, checking them off as we go. I'll announce each one and occasionally note how the specs/design informed the approach.
\`\`\`

**执行：**对每个任务：

1. 宣布：“Working on task N: [description]”
2. 在代码库中实现变更
3. 自然引用 specs/design：“The spec says X, so I'm doing Y”
4. 在 tasks.md 中勾选完成：\`- [ ]\` → \`- [x]\`
5. 简短状态：“✓ Task N complete”

保持讲解简洁，不要逐行解释。

全部完成后：

\`\`\`
## Implementation Complete

All tasks done:
- [x] Task 1
- [x] Task 2
- [x] ...

The change is implemented! One more step—let's archive it.
\`\`\`

---

## 阶段 10：Archive

**说明：**
\`\`\`
## Archiving

When a change is complete, we archive it. This moves it from \`openspec/changes/\` to \`openspec/changes/archive/YYYY-MM-DD-<name>/\`.

Archived changes become your project's decision history—you can always find them later to understand why something was built a certain way.
\`\`\`

**执行：**
\`\`\`bash
openspec archive "<name>"
\`\`\`

**展示：**
\`\`\`
Archived to: \`openspec/changes/archive/YYYY-MM-DD-<name>/\`

The change is now part of your project's history. The code is in your codebase, the decision record is preserved.
\`\`\`

---

## 阶段 11：回顾与下一步

\`\`\`
## Congratulations!

You just completed a full OpenSpec cycle:

1. **Explore** - Thought through the problem
2. **New** - Created a change container
3. **Proposal** - Captured WHY
4. **Specs** - Defined WHAT in detail
5. **Design** - Decided HOW
6. **Tasks** - Broke it into steps
7. **Apply** - Implemented the work
8. **Archive** - Preserved the record

This same rhythm works for any size change—a small fix or a major feature.

---

## Command Reference

| Command | What it does |
|---------|--------------|
| \`/opsx:explore\` | Think through problems before/during work |
| \`/opsx:new\` | Start a new change, step through artifacts |
| \`/opsx:ff\` | Fast-forward: create all artifacts at once |
| \`/opsx:continue\` | Continue working on an existing change |
| \`/opsx:apply\` | Implement tasks from a change |
| \`/opsx:verify\` | Verify implementation matches artifacts |
| \`/opsx:archive\` | Archive a completed change |

---

## What's Next?

Try \`/opsx:new\` or \`/opsx:ff\` on something you actually want to build. You've got the rhythm now!
\`\`\`

---

## 优雅退出处理

### 用户中途想停止

若用户表示要停、要暂停或明显失去兴趣：

\`\`\`
No problem! Your change is saved at \`openspec/changes/<name>/\`.

To pick up where we left off later:
- \`/opsx:continue <name>\` - Resume artifact creation
- \`/opsx:apply <name>\` - Jump to implementation (if tasks exist)

The work won't be lost. Come back whenever you're ready.
\`\`\`

优雅退出，不要施压。

### 用户只想要命令参考

若用户表示只想看命令或跳过教程：

\`\`\`
## OpenSpec Quick Reference

| Command | What it does |
|---------|--------------|
| \`/opsx:explore\` | Think through problems (no code changes) |
| \`/opsx:new <name>\` | Start a new change, step by step |
| \`/opsx:ff <name>\` | Fast-forward: all artifacts at once |
| \`/opsx:continue <name>\` | Continue an existing change |
| \`/opsx:apply <name>\` | Implement tasks |
| \`/opsx:verify <name>\` | Verify implementation |
| \`/opsx:archive <name>\` | Archive when done |

Try \`/opsx:new\` to start your first change, or \`/opsx:ff\` if you want to move fast.
\`\`\`

优雅结束。

---

## 护栏

- **在关键节点遵循 EXPLAIN → DO → SHOW → PAUSE 模式**（探索后、proposal 起草后、tasks 后、归档后）
- **实现阶段保持轻讲解**——教学但不过度讲课
- **不要跳过阶段**，即便是小变更——目标是教学流程
- **在标记点暂停确认**，但不要过度暂停
- **优雅处理退出**——不要强迫用户继续
- **使用真实代码库任务**——不要模拟或虚构示例
- **温和调整范围**——引导更小任务，但尊重用户选择`;
}

export function getOpsxOnboardCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Onboard',
    description: '引导式上手——带讲解走完一次完整 OpenSpec 工作流循环',
    category: 'Workflow',
    tags: ['workflow', 'onboarding', 'tutorial', 'learning'],
    content: getOnboardInstructions(),
  };
}
