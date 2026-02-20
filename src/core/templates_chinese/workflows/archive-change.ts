/**
 * 技能模板工作流模块（中文）
 *
 * 由旧版单体模板拆分而来。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getArchiveChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-archive-change',
    description: '在实验性工作流中归档已完成的变更。适用于实现完成后的收尾归档。',
    instructions: `在实验性工作流中归档已完成的变更。

**输入**：可选指定变更名称。如果省略，先从对话上下文判断能否推断；若模糊或有歧义，必须提示用户选择可用变更。

**步骤**

1. **未提供变更名称时，提示选择**

   运行 \`openspec list --json\` 获取可用变更。使用 **AskUserQuestion 工具**让用户选择。

   仅展示仍处于活跃状态的变更（未归档）。
   若可用，包含每个变更的 schema。

   **重要**：不要猜测或自动选择，必须让用户做选择。

2. **检查工件完成情况**

   运行 \`openspec status --change "<name>" --json\` 检查工件完成情况。

   解析 JSON，了解：
   - \`schemaName\`：正在使用的工作流
   - \`artifacts\`：工件列表及其状态（\`done\` 或其他）

   **若有工件未完成（不是 \`done\`）：**
   - 展示警告并列出未完成工件
   - 使用 **AskUserQuestion 工具**确认是否继续
   - 用户确认后继续

3. **检查任务完成情况**

   读取 tasks 文件（通常为 \`tasks.md\`）检查未完成任务。

   统计 \`- [ ]\`（未完成）与 \`- [x]\`（已完成）。

   **若发现未完成任务：**
   - 展示警告并显示未完成数量
   - 使用 **AskUserQuestion 工具**确认是否继续
   - 用户确认后继续

   **若不存在 tasks 文件：**不做任务警告，直接继续。

4. **评估增量规范的同步状态**

   检查 \`openspec/changes/<name>/specs/\` 下的增量规范。若不存在，则跳过同步提示。

   **若存在增量规范：**
   - 将每个增量规范与主规范 \`openspec/specs/<capability>/spec.md\` 对比
   - 判断会产生的变更（新增/修改/删除/重命名）
   - 在提示前给出合并摘要

   **提示选项：**
   - 若需要同步：“现在同步（推荐）”、“直接归档（不同步）”
   - 若已同步：“现在归档”、“仍然同步”、“取消”

   若用户选择同步，使用 Task 工具（subagent_type: "general-purpose", prompt: "Use Skill tool to invoke openspec-sync-specs for change '<name>'. Delta spec analysis: <include the analyzed delta spec summary>"）。无论选择如何，最终继续归档。

5. **执行归档**

   若不存在归档目录，先创建：
   \`\`\`bash
   mkdir -p openspec/changes/archive
   \`\`\`

   使用当前日期生成目标名：\`YYYY-MM-DD-<change-name>\`

   **若目标已存在：**
   - 报错并建议重命名现有归档或改用其他日期
   **若不存在：**将变更目录移动到归档

   \`\`\`bash
   mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
   \`\`\`

6. **展示摘要**

   归档完成后展示：
   - 变更名称
   - 使用的 schema
   - 归档位置
   - 规范是否已同步（若适用）
   - 是否存在未完成工件/任务的警告提示

**成功输出示例**

\`\`\`
## Archive Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** openspec/changes/archive/YYYY-MM-DD-<name>/
**Specs:** ✓ Synced to main specs (or "No delta specs" or "Sync skipped")

All artifacts complete. All tasks complete.
\`\`\`

**护栏**
- 若未提供名称，必须让用户选择
- 使用 artifact graph（openspec status --json）检查完成情况
- 不因警告阻止归档，只需提示并确认
- 移动归档时保留 .openspec.yaml（随目录一同移动）
- 展示清晰的操作摘要
- 若请求同步，使用 openspec-sync-specs 流程（agent-driven）
- 若存在增量规范，必须先做同步评估并展示摘要再提示`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxArchiveCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Archive',
    description: '在实验性工作流中归档已完成的变更',
    category: 'Workflow',
    tags: ['workflow', 'archive', 'experimental'],
    content: `在实验性工作流中归档已完成的变更。

**输入**：可在 \`/opsx:archive\` 后指定变更名称（例如 \`/opsx:archive add-auth\`）。若省略，先从对话上下文判断能否推断；若模糊或有歧义，必须提示用户选择可用变更。

**步骤**

1. **未提供变更名称时，提示选择**

   运行 \`openspec list --json\` 获取可用变更。使用 **AskUserQuestion 工具**让用户选择。

   仅展示仍处于活跃状态的变更（未归档）。
   若可用，包含每个变更的 schema。

   **重要**：不要猜测或自动选择，必须让用户做选择。

2. **检查工件完成情况**

   运行 \`openspec status --change "<name>" --json\` 检查工件完成情况。

   解析 JSON，了解：
   - \`schemaName\`：正在使用的工作流
   - \`artifacts\`：工件列表及其状态（\`done\` 或其他）

   **若有工件未完成（不是 \`done\`）：**
   - 展示警告并列出未完成工件
   - 提示用户确认是否继续
   - 用户确认后继续

3. **检查任务完成情况**

   读取 tasks 文件（通常为 \`tasks.md\`）检查未完成任务。

   统计 \`- [ ]\`（未完成）与 \`- [x]\`（已完成）。

   **若发现未完成任务：**
   - 展示警告并显示未完成数量
   - 提示用户确认是否继续
   - 用户确认后继续

   **若不存在 tasks 文件：**不做任务警告，直接继续。

4. **评估增量规范的同步状态**

   检查 \`openspec/changes/<name>/specs/\` 下的增量规范。若不存在，则跳过同步提示。

   **若存在增量规范：**
   - 将每个增量规范与主规范 \`openspec/specs/<capability>/spec.md\` 对比
   - 判断会产生的变更（新增/修改/删除/重命名）
   - 在提示前给出合并摘要

   **提示选项：**
   - 若需要同步：“现在同步（推荐）”、“直接归档（不同步）”
   - 若已同步：“现在归档”、“仍然同步”、“取消”

   若用户选择同步，使用 Task 工具（subagent_type: "general-purpose", prompt: "Use Skill tool to invoke openspec-sync-specs for change '<name>'. Delta spec analysis: <include the analyzed delta spec summary>"）。无论选择如何，最终继续归档。

5. **执行归档**

   若不存在归档目录，先创建：
   \`\`\`bash
   mkdir -p openspec/changes/archive
   \`\`\`

   使用当前日期生成目标名：\`YYYY-MM-DD-<change-name>\`

   **若目标已存在：**
   - 报错并建议重命名现有归档或改用其他日期
   **若不存在：**将变更目录移动到归档

   \`\`\`bash
   mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
   \`\`\`

6. **展示摘要**

   归档完成后展示：
   - 变更名称
   - 使用的 schema
   - 归档位置
   - 规范是否已同步（若适用）
   - 是否存在未完成工件/任务的警告提示

**护栏**
- 若未提供名称，必须让用户选择
- 使用 artifact graph（openspec status --json）检查完成情况
- 不因警告阻止归档，只需提示并确认
- 移动归档时保留 .openspec.yaml（随目录一同移动）
- 展示清晰的操作摘要
- 若请求同步，使用 openspec-sync-specs 流程（agent-driven）
- 若存在增量规范，必须先做同步评估并展示摘要再提示`,
  };
}
