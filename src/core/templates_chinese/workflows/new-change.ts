/**
 * 技能模板工作流模块（中文）
 *
 * 由旧版单体模板拆分而来。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getNewChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-new-change',
    description: '使用实验性的工件工作流创建新的 OpenSpec 变更。当用户希望以结构化步骤创建新功能、修复或修改时使用。',
    instructions: `使用实验性的工件驱动方式创建新变更。

**输入**：用户请求应包含一个变更名称（kebab-case），或描述他们想要构建的内容。

**步骤**

1. **如果输入不清晰，先问他们要做什么**

   使用 **AskUserQuestion 工具**（开放式，不设选项）询问：
   > “你想做哪个变更？请描述你要构建或修复的内容。”

   从描述中生成 kebab-case 名称（例如：“add user authentication” → \`add-user-auth\`）。

   **重要**：在理解用户要做什么之前不要继续。

2. **确定工作流 schema**

   默认使用系统默认 schema（不传 \`--schema\`），除非用户明确要求其他工作流。

   **只有在以下情况才使用不同 schema：**
   - 用户提到具体 schema 名 → 使用 \`--schema <name>\`
   - 用户问“有哪些 workflow”/“有哪些工作流” → 运行 \`openspec schemas --json\` 并让他们选择

   **否则**：省略 \`--schema\` 使用默认。

3. **创建变更目录**
   \`\`\`bash
   openspec new change "<name>"
   \`\`\`
   仅当用户指定其他工作流时才加 \`--schema <name>\`。
   这会在 \`openspec/changes/<name>/\` 下创建所选 schema 的脚手架。

4. **查看工件状态**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`
   这会显示哪些工件需要创建、哪些已就绪（依赖满足）。

5. **获取第一个工件的创建指令**
   第一个工件取决于 schema（例如 spec-driven 中是 \`proposal\`）。
   查看状态输出，找到状态为 “ready” 的第一个工件。
   \`\`\`bash
   openspec instructions <first-artifact-id> --change "<name>"
   \`\`\`
   这会输出创建第一个工件所需的模板与上下文。

6. **停止并等待用户指示**

**输出**

完成上述步骤后，总结：
- 变更名称与路径
- 使用的 schema/工作流及其工件序列
- 当前状态（已完成 0/N 个工件）
- 第一个工件的模板
- 提示语：“准备好创建第一个工件了吗？描述这个变更的背景，我来帮你起草，或让我继续。”

**护栏**
- 还不要创建任何工件 - 只展示指令
- 不要超出展示第一个工件模板
- 如果名称无效（不是 kebab-case），要求有效名称
- 如果同名变更已存在，建议继续该变更
- 使用非默认工作流时才传 \`--schema\``,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxNewCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: New',
    description: '使用实验性工件工作流创建新变更（OPSX）',
    category: 'Workflow',
    tags: ['workflow', 'artifacts', 'experimental'],
    content: `使用实验性的工件驱动方式创建新变更。

**输入**：\`/opsx:new\` 后的参数是变更名称（kebab-case），或对要构建内容的描述。

**步骤**

1. **如果没有输入，先问要做什么**

   使用 **AskUserQuestion 工具**（开放式，不设选项）询问：
   > “你想做哪个变更？请描述你要构建或修复的内容。”

   从描述中生成 kebab-case 名称（例如：“add user authentication” → \`add-user-auth\`）。

   **重要**：在理解用户要做什么之前不要继续。

2. **确定工作流 schema**

   默认使用系统默认 schema（不传 \`--schema\`），除非用户明确要求其他工作流。

   **只有在以下情况才使用不同 schema：**
   - 用户提到具体 schema 名 → 使用 \`--schema <name>\`
   - 用户问“有哪些 workflow”/“有哪些工作流” → 运行 \`openspec schemas --json\` 并让他们选择

   **否则**：省略 \`--schema\` 使用默认。

3. **创建变更目录**
   \`\`\`bash
   openspec new change "<name>"
   \`\`\`
   仅当用户指定其他工作流时才加 \`--schema <name>\`。
   这会在 \`openspec/changes/<name>/\` 下创建所选 schema 的脚手架。

4. **查看工件状态**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`
   这会显示哪些工件需要创建、哪些已就绪（依赖满足）。

5. **获取第一个工件的创建指令**
   第一个工件取决于 schema。查看状态输出，找到状态为 “ready” 的第一个工件。
   \`\`\`bash
   openspec instructions <first-artifact-id> --change "<name>"
   \`\`\`
   这会输出创建第一个工件所需的模板与上下文。

6. **停止并等待用户指示**

**输出**

完成上述步骤后，总结：
- 变更名称与路径
- 使用的 schema/工作流及其工件序列
- 当前状态（已完成 0/N 个工件）
- 第一个工件的模板
- 提示语：“准备好创建第一个工件了吗？运行 \`/opsx:continue\` 或描述这个变更的背景，我来帮你起草。”

**护栏**
- 还不要创建任何工件 - 只展示指令
- 不要超出展示第一个工件模板
- 如果名称无效（不是 kebab-case），要求有效名称
- 如果同名变更已存在，建议使用 \`/opsx:continue\` 继续
- 使用非默认工作流时才传 \`--schema\``
  };
}
