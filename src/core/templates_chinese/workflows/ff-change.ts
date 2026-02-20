/**
 * 技能模板工作流模块（中文）
 *
 * 由旧版单体模板拆分而来。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getFfChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-ff-change',
    description: '快速创建 OpenSpec 工件。当用户希望跳过逐个工件、一次性生成所有实现所需工件时使用。',
    instructions: `快速生成工件——一次性生成实现所需的一切。

**输入**：用户请求应包含变更名称（kebab-case），或描述他们想要构建的内容。

**步骤**

1. **若输入不清晰，先问要做什么**

   使用 **AskUserQuestion 工具**（开放式，不设选项）询问：
   > “你想做哪个变更？请描述你要构建或修复的内容。”

   从描述中生成 kebab-case 名称（例如：“add user authentication” → \`add-user-auth\`）。

   **重要**：在理解用户要做什么之前不要继续。

2. **创建变更目录**
   \`\`\`bash
   openspec new change "<name>"
   \`\`\`
   这会在 \`openspec/changes/<name>/\` 下创建脚手架。

3. **获取工件构建顺序**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON，获取：
   - \`applyRequires\`：实现前必须完成的工件 ID 数组（例如 \`["tasks"]\`）
   - \`artifacts\`：所有工件及其状态/依赖

4. **按顺序创建工件直到可实现**

   使用 **TodoWrite 工具**跟踪工件创建进度。

   按依赖顺序循环工件（先处理没有未完成依赖的工件）：

   a. **对每个状态为 \`ready\` 的工件（依赖已满足）：**
      - 获取指令：
        \`\`\`bash
        openspec instructions <artifact-id> --change "<name>" --json
        \`\`\`
      - 指令 JSON 包含：
        - \`context\`：项目背景（约束条件，不要写入输出）
        - \`rules\`：工件规则（约束条件，不要写入输出）
        - \`template\`：输出文件结构
        - \`instruction\`：该工件类型的 schema 指导
        - \`outputPath\`：写入路径
        - \`dependencies\`：已完成的依赖工件，用于上下文
      - 读取已完成的依赖工件获取上下文
      - 使用 \`template\` 作为结构创建工件文件
      - 将 \`context\` 与 \`rules\` 作为约束，但不要复制进文件
      - 简要展示进度：“✓ 已创建 <artifact-id>”

   b. **持续直到所有 \`applyRequires\` 工件完成**
      - 每创建一个工件后重新运行 \`openspec status --change "<name>" --json\`
      - 检查 \`applyRequires\` 中每个工件在 artifacts 列表里是否为 \`status: "done"\`
      - 全部完成后停止

   c. **若某个工件需要用户输入**（上下文不清晰）：
      - 使用 **AskUserQuestion 工具**澄清
      - 然后继续创建

5. **展示最终状态**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`

**输出**

完成全部工件后，总结：
- 变更名称与路径
- 已创建的工件列表及简述
- 当前状态：“所有工件已创建！可开始实现。”
- 提示语：“运行 \`/opsx:apply\` 或让我开始实现这些任务。”

**工件创建指南**

- 按 \`openspec instructions\` 的 \`instruction\` 字段执行
- schema 定义每个工件应该包含的内容——按它来
- 创建新工件前先读依赖工件获取上下文
- 使用 \`template\` 作为结构填充各节
- **重要**：\`context\` 和 \`rules\` 是给你的约束，不是文件内容
  - 不要把 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制进工件
  - 它们用于指导写作，但不应出现在输出里

**护栏**
- 创建实现所需的全部工件（由 schema 的 \`apply.requires\` 定义）
- 创建前总是读取依赖工件
- 若上下文关键不清晰，询问用户，但尽量做合理决策保持进度
- 若同名变更已存在，建议继续该变更
- 写入后确认工件文件存在，再创建下一个`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxFfCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Fast Forward',
    description: '创建变更并一次性生成所有实现所需工件',
    category: 'Workflow',
    tags: ['workflow', 'artifacts', 'experimental'],
    content: `快速生成工件——一次性生成实现所需的一切。

**输入**：\`/opsx:ff\` 后的参数是变更名称（kebab-case），或对要构建内容的描述。

**步骤**

1. **若未提供输入，先问要做什么**

   使用 **AskUserQuestion 工具**（开放式，不设选项）询问：
   > “你想做哪个变更？请描述你要构建或修复的内容。”

   从描述中生成 kebab-case 名称（例如：“add user authentication” → \`add-user-auth\`）。

   **重要**：在理解用户要做什么之前不要继续。

2. **创建变更目录**
   \`\`\`bash
   openspec new change "<name>"
   \`\`\`
   这会在 \`openspec/changes/<name>/\` 下创建脚手架。

3. **获取工件构建顺序**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON，获取：
   - \`applyRequires\`：实现前必须完成的工件 ID 数组（例如 \`["tasks"]\`）
   - \`artifacts\`：所有工件及其状态/依赖

4. **按顺序创建工件直到可实现**

   使用 **TodoWrite 工具**跟踪工件创建进度。

   按依赖顺序循环工件（先处理没有未完成依赖的工件）：

   a. **对每个状态为 \`ready\` 的工件（依赖已满足）：**
      - 获取指令：
        \`\`\`bash
        openspec instructions <artifact-id> --change "<name>" --json
        \`\`\`
      - 指令 JSON 包含：
        - \`context\`：项目背景（约束条件，不要写入输出）
        - \`rules\`：工件规则（约束条件，不要写入输出）
        - \`template\`：输出文件结构
        - \`instruction\`：该工件类型的 schema 指导
        - \`outputPath\`：写入路径
        - \`dependencies\`：已完成的依赖工件，用于上下文
      - 读取已完成的依赖工件获取上下文
      - 使用 \`template\` 作为结构创建工件文件
      - 将 \`context\` 与 \`rules\` 作为约束，但不要复制进文件
      - 简要展示进度：“✓ 已创建 <artifact-id>”

   b. **持续直到所有 \`applyRequires\` 工件完成**
      - 每创建一个工件后重新运行 \`openspec status --change "<name>" --json\`
      - 检查 \`applyRequires\` 中每个工件在 artifacts 列表里是否为 \`status: "done"\`
      - 全部完成后停止

   c. **若某个工件需要用户输入**（上下文不清晰）：
      - 使用 **AskUserQuestion 工具**澄清
      - 然后继续创建

5. **展示最终状态**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`

**输出**

完成全部工件后，总结：
- 变更名称与路径
- 已创建的工件列表及简述
- 当前状态：“所有工件已创建！可开始实现。”
- 提示语：“运行 \`/opsx:apply\` 开始实现。”

**工件创建指南**

- 按 \`openspec instructions\` 的 \`instruction\` 字段执行
- schema 定义每个工件应该包含的内容——按它来
- 创建新工件前先读依赖工件获取上下文
- 使用 \`template\` 作为结构填充各节
- **重要**：\`context\` 和 \`rules\` 是给你的约束，不是文件内容
  - 不要把 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制进工件
  - 它们用于指导写作，但不应出现在输出里

**护栏**
- 创建实现所需的全部工件（由 schema 的 \`apply.requires\` 定义）
- 创建前总是读取依赖工件
- 若上下文关键不清晰，询问用户，但尽量做合理决策保持进度
- 若同名变更已存在，建议继续该变更
- 写入后确认工件文件存在，再创建下一个`,
  };
}
