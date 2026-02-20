/**
 * 技能模板工作流模块（中文）
 *
 * 由旧版单体模板拆分而来。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getContinueChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-continue-change',
    description: '继续推进一个 OpenSpec 变更，创建下一个工件。当用户希望推进变更、生成下一个工件或继续流程时使用。',
    instructions: `通过创建下一个工件继续推进变更。

**输入**：可选指定变更名称。如果省略，先从对话上下文判断能否推断；若模糊或有歧义，必须提示用户选择可用变更。

**步骤**

1. **未提供变更名称时，提示选择**

   运行 \`openspec list --json\` 获取按最近修改排序的变更列表。然后使用 **AskUserQuestion 工具**让用户选择要继续的变更。

   提供最近 3-4 个变更作为选项，展示：
   - 变更名称
   - Schema（若有 \`schema\` 字段则用其值，否则为 “spec-driven”）
   - 状态（例如 “0/5 tasks”、“complete”、“no tasks”）
   - 最近修改时间（来自 \`lastModified\` 字段）

   将最近修改的变更标记为 “(Recommended)”，这通常是用户要继续的内容。

   **重要**：不要猜测或自动选择，必须让用户做选择。

2. **检查当前状态**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON，了解当前状态。响应包含：
   - \`schemaName\`：当前使用的工作流 schema（例如 “spec-driven”）
   - \`artifacts\`：工件数组及其状态（“done”、“ready”、“blocked”）
   - \`isComplete\`：是否全部完成

3. **根据状态执行**：

   ---

   **若全部工件完成（\`isComplete: true\`）**：
   - 祝贺用户
   - 展示最终状态及使用的 schema
   - 建议：“所有工件都已创建！你可以开始实现该变更，或将其归档。”
   - 停止

   ---

   **若有就绪工件**（状态中存在 \`status: "ready"\`）：
   - 从状态输出中选择第一个 \`status: "ready"\` 的工件
   - 获取其指令：
     \`\`\`bash
     openspec instructions <artifact-id> --change "<name>" --json
     \`\`\`
   - 解析 JSON，关键字段：
     - \`context\`：项目背景（约束条件，不要写入输出）
     - \`rules\`：工件规则（约束条件，不要写入输出）
     - \`template\`：输出文件的结构
     - \`instruction\`：schema 特定的指导
     - \`outputPath\`：写入路径
     - \`dependencies\`：已完成的依赖工件，用于上下文
   - **创建工件文件**：
     - 阅读已完成的依赖工件获取上下文
     - 使用 \`template\` 作为结构，填写各节内容
     - 将 \`context\` 与 \`rules\` 作为约束，但不要复制进文件
     - 写入指令指定的输出路径
   - 展示已创建内容及解锁的新工件
   - 创建一个工件后停止

   ---

   **若没有就绪工件（全部阻塞）**：
   - 正常 schema 不应出现这种情况
   - 展示状态并建议检查问题

4. **创建工件后显示进度**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`

**输出**

每次执行后输出：
- 创建了哪个工件
- 正在使用的 schema 工作流
- 当前进度（N/M 完成）
- 解锁了哪些工件
- 提示语：“想继续吗？告诉我继续或下一步要做什么。”

**工件创建指南**

工件类型与用途取决于 schema。使用指令输出中的 \`instruction\` 字段了解应创建的内容。

常见模式：

**spec-driven schema**（proposal → specs → design → tasks）：
- **proposal.md**：若不清晰，向用户询问。填写 Why、What Changes、Capabilities、Impact。
  - Capabilities 关键：列出的每项能力都需要对应的 spec 文件。
- **specs/<capability>/spec.md**：为 proposal 的 Capabilities 列表中的每个能力创建一个 spec（使用能力名称，而不是变更名）。
- **design.md**：记录技术决策、架构、实现方案。
- **tasks.md**：将实现拆分为带复选框的任务。

其他 schema 按 CLI 输出的 \`instruction\` 来。

**护栏**
- 每次只创建一个工件
- 创建前总是读取依赖工件
- 不要跳过工件或乱序创建
- 若上下文不清晰，先询问用户
- 写入后确认工件文件存在，再更新进度
- 使用 schema 的工件序列，不要假设具体名称
- **重要**：\`context\` 和 \`rules\` 是给你的约束，不是文件内容
  - 不要把 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制进工件
  - 它们用于指导写作，但不应出现在输出里`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxContinueCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Continue',
    description: '继续推进变更并创建下一个工件（实验性）',
    category: 'Workflow',
    tags: ['workflow', 'artifacts', 'experimental'],
    content: `通过创建下一个工件继续推进变更。

**输入**：可在 \`/opsx:continue\` 后指定变更名称（例如 \`/opsx:continue add-auth\`）。若省略，先从对话上下文判断能否推断；若模糊或有歧义，必须提示用户选择可用变更。

**步骤**

1. **未提供变更名称时，提示选择**

   运行 \`openspec list --json\` 获取按最近修改排序的变更列表。然后使用 **AskUserQuestion 工具**让用户选择要继续的变更。

   提供最近 3-4 个变更作为选项，展示：
   - 变更名称
   - Schema（若有 \`schema\` 字段则用其值，否则为 “spec-driven”）
   - 状态（例如 “0/5 tasks”、“complete”、“no tasks”）
   - 最近修改时间（来自 \`lastModified\` 字段）

   将最近修改的变更标记为 “(Recommended)”，这通常是用户要继续的内容。

   **重要**：不要猜测或自动选择，必须让用户做选择。

2. **检查当前状态**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON，了解当前状态。响应包含：
   - \`schemaName\`：当前使用的工作流 schema（例如 “spec-driven”）
   - \`artifacts\`：工件数组及其状态（“done”、“ready”、“blocked”）
   - \`isComplete\`：是否全部完成

3. **根据状态执行**：

   ---

   **若全部工件完成（\`isComplete: true\`）**：
   - 祝贺用户
   - 展示最终状态及使用的 schema
   - 建议：“所有工件都已创建！现在可以用 \`/opsx:apply\` 实现该变更，或用 \`/opsx:archive\` 归档。”
   - 停止

   ---

   **若有就绪工件**（状态中存在 \`status: "ready"\`）：
   - 从状态输出中选择第一个 \`status: "ready"\` 的工件
   - 获取其指令：
     \`\`\`bash
     openspec instructions <artifact-id> --change "<name>" --json
     \`\`\`
   - 解析 JSON，关键字段：
     - \`context\`：项目背景（约束条件，不要写入输出）
     - \`rules\`：工件规则（约束条件，不要写入输出）
     - \`template\`：输出文件的结构
     - \`instruction\`：schema 特定的指导
     - \`outputPath\`：写入路径
     - \`dependencies\`：已完成的依赖工件，用于上下文
   - **创建工件文件**：
     - 阅读已完成的依赖工件获取上下文
     - 使用 \`template\` 作为结构，填写各节内容
     - 将 \`context\` 与 \`rules\` 作为约束，但不要复制进文件
     - 写入指令指定的输出路径
   - 展示已创建内容及解锁的新工件
   - 创建一个工件后停止

   ---

   **若没有就绪工件（全部阻塞）**：
   - 正常 schema 不应出现这种情况
   - 展示状态并建议检查问题

4. **创建工件后显示进度**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`

**输出**

每次执行后输出：
- 创建了哪个工件
- 正在使用的 schema 工作流
- 当前进度（N/M 完成）
- 解锁了哪些工件
- 提示语：“想继续吗？告诉我继续或下一步要做什么。”

**工件创建指南**

工件类型与用途取决于 schema。使用指令输出中的 \`instruction\` 字段了解应创建的内容。

**护栏**
- 每次只创建一个工件
- 创建前总是读取依赖工件
- 不要跳过工件或乱序创建
- 若上下文不清晰，先询问用户
- 写入后确认工件文件存在，再更新进度
- 使用 schema 的工件序列，不要假设具体名称
- **重要**：\`context\` 和 \`rules\` 是给你的约束，不是文件内容
  - 不要把 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制进工件
  - 它们用于指导写作，但不应出现在输出里`
  };
}
