/**
 * 技能模板工作流模块（中文）
 *
 * 由旧版单体模板拆分而来。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getBulkArchiveChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-bulk-archive-change',
    description: '批量归档多个已完成变更。适用于并行完成多个变更后的集中归档。',
    instructions: `一次性归档多个已完成的变更。

该技能允许批量归档，并通过检查代码库来智能处理规范冲突，从而判断哪些内容已经实际实现。

**输入**：无需输入（会提示选择）

**步骤**

1. **获取活跃变更**

   运行 \`openspec list --json\` 获取所有活跃变更。

   若不存在活跃变更，告知用户并停止。

2. **提示选择要归档的变更**

   使用 **AskUserQuestion 工具**（多选）让用户选择：
   - 展示每个变更及其 schema
   - 提供 “All changes” 选项
   - 允许任意数量选择（1+ 可用，典型为 2+）

   **重要**：不要自动选择，必须让用户选。

3. **批量验证 - 汇总每个变更的状态**

   对每个选中的变更，收集：

   a. **工件状态** - 运行 \`openspec status --change "<name>" --json\`
      - 解析 \`schemaName\` 和 \`artifacts\` 列表
      - 标记哪些为 \`done\`，哪些不是

   b. **任务完成情况** - 读取 \`openspec/changes/<name>/tasks.md\`
      - 统计 \`- [ ]\`（未完成）与 \`- [x]\`（已完成）
      - 若不存在 tasks 文件，标记为 “No tasks”

   c. **增量规范** - 检查 \`openspec/changes/<name>/specs/\` 目录
      - 列出哪些 capability 的 spec 存在
      - 对每个 spec，提取需求名称（匹配 \`### Requirement: <name>\`）

4. **检测规范冲突**

   构建 \`capability -> [涉及该 capability 的变更]\` 的映射：

   \`\`\`
   auth -> [change-a, change-b]  <- CONFLICT (2+ changes)
   api  -> [change-c]            <- OK (only 1 change)
   \`\`\`

   当 2+ 个选中变更的增量规范涉及同一 capability 时，判定冲突。

5. **智能解决冲突**

   **对每个冲突**，调查代码库：

   a. **读取冲突变更的增量规范**，理解各自声称的新增/修改内容

   b. **搜索代码库**寻找实现证据：
      - 查找实现增量规范需求的代码
      - 查找相关文件、函数或测试

   c. **确定解决方案**：
      - 仅有一个变更真正实现 → 仅同步该变更规范
      - 两个都实现 → 按时间顺序应用（先旧后新，新覆盖）
      - 两个都未实现 → 跳过规范同步并警告

   d. **记录每个冲突的解决结果**：
      - 应用哪个变更的规范
      - 应用顺序（如有多个）
      - 依据（代码库证据）

6. **展示汇总状态表**

   展示所有变更的汇总表：

   \`\`\`
   | Change               | Artifacts | Tasks | Specs   | Conflicts | Status |
   |---------------------|-----------|-------|---------|-----------|--------|
   | schema-management   | Done      | 5/5   | 2 delta | None      | Ready  |
   | project-config      | Done      | 3/3   | 1 delta | None      | Ready  |
   | add-oauth           | Done      | 4/4   | 1 delta | auth (!)  | Ready* |
   | add-verify-skill    | 1 left    | 2/5   | None    | None      | Warn   |
   \`\`\`

   对冲突，展示解决方案：
   \`\`\`
   * Conflict resolution:
     - auth spec: Will apply add-oauth then add-jwt (both implemented, chronological order)
   \`\`\`

   对未完成的变更，展示警告：
   \`\`\`
   Warnings:
   - add-verify-skill: 1 incomplete artifact, 3 incomplete tasks
   \`\`\`

7. **确认批量操作**

   使用 **AskUserQuestion 工具**给出单次确认：

   - “Archive N changes?” 并根据状态提供选项
   - 选项示例：
     - “Archive all N changes”
     - “Archive only N ready changes (skip incomplete)”
     - “Cancel”

   若存在未完成变更，需明确其将带警告归档。

8. **对确认的变更逐个归档**

   按确定的顺序处理（遵循冲突解决顺序）：

   a. **同步规范**（若存在增量规范）：
      - 使用 openspec-sync-specs 的方式（agent-driven 智能合并）
      - 若有冲突，按已解析的顺序应用
      - 记录是否已同步

   b. **执行归档**：
      \`\`\`bash
      mkdir -p openspec/changes/archive
      mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
      \`\`\`

   c. **记录每个变更的结果**：
      - 成功：已归档
      - 失败：归档错误（记录错误信息）
      - 跳过：用户选择不归档（若适用）

9. **展示最终摘要**

   展示最终结果：

   \`\`\`
   ## Bulk Archive Complete

   Archived 3 changes:
   - schema-management-cli -> archive/2026-01-19-schema-management-cli/
   - project-config -> archive/2026-01-19-project-config/
   - add-oauth -> archive/2026-01-19-add-oauth/

   Skipped 1 change:
   - add-verify-skill (user chose not to archive incomplete)

   Spec sync summary:
   - 4 delta specs synced to main specs
   - 1 conflict resolved (auth: applied both in chronological order)
   \`\`\`

   若有失败：
   \`\`\`
   Failed 1 change:
   - some-change: Archive directory already exists
   \`\`\`

**冲突解决示例**

示例 1：仅一个实现
\`\`\`
Conflict: specs/auth/spec.md touched by [add-oauth, add-jwt]

Checking add-oauth:
- Delta adds "OAuth Provider Integration" requirement
- Searching codebase... found src/auth/oauth.ts implementing OAuth flow

Checking add-jwt:
- Delta adds "JWT Token Handling" requirement
- Searching codebase... no JWT implementation found

Resolution: Only add-oauth is implemented. Will sync add-oauth specs only.
\`\`\`

示例 2：两个都实现
\`\`\`
Conflict: specs/api/spec.md touched by [add-rest-api, add-graphql]

Checking add-rest-api (created 2026-01-10):
- Delta adds "REST Endpoints" requirement
- Searching codebase... found src/api/rest.ts

Checking add-graphql (created 2026-01-15):
- Delta adds "GraphQL Schema" requirement
- Searching codebase... found src/api/graphql.ts

Resolution: Both implemented. Will apply add-rest-api specs first,
then add-graphql specs (chronological order, newer takes precedence).
\`\`\`

**成功输出**

\`\`\`
## Bulk Archive Complete

Archived N changes:
- <change-1> -> archive/YYYY-MM-DD-<change-1>/
- <change-2> -> archive/YYYY-MM-DD-<change-2>/

Spec sync summary:
- N delta specs synced to main specs
- No conflicts (or: M conflicts resolved)
\`\`\`

**部分成功输出**

\`\`\`
## Bulk Archive Complete (partial)

Archived N changes:
- <change-1> -> archive/YYYY-MM-DD-<change-1>/

Skipped M changes:
- <change-2> (user chose not to archive incomplete)

Failed K changes:
- <change-3>: Archive directory already exists
\`\`\`

**无可归档变更时输出**

\`\`\`
## No Changes to Archive

No active changes found. Use \`/opsx:new\` to create a new change.
\`\`\`

**护栏**
- 允许任意数量变更（1+ 可用，2+ 常见）
- 始终提示选择，绝不自动选择
- 提前检测规范冲突并通过代码库解决
- 若两个变更都实现，按时间顺序应用规范
- 仅在缺少实现时跳过同步（并提示）
- 确认前展示清晰的逐项状态
- 整体批量只需一次确认
- 追踪并报告所有结果（成功/跳过/失败）
- 移动归档时保留 .openspec.yaml
- 归档目录名使用当前日期：YYYY-MM-DD-<name>
- 若归档目标已存在，该变更失败但继续处理其他`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxBulkArchiveCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Bulk Archive',
    description: '一次性归档多个已完成变更',
    category: 'Workflow',
    tags: ['workflow', 'archive', 'experimental', 'bulk'],
    content: `一次性归档多个已完成的变更。

该技能允许批量归档，并通过检查代码库来智能处理规范冲突，从而判断哪些内容已经实际实现。

**输入**：无需输入（会提示选择）

**步骤**

1. **获取活跃变更**

   运行 \`openspec list --json\` 获取所有活跃变更。

   若不存在活跃变更，告知用户并停止。

2. **提示选择要归档的变更**

   使用 **AskUserQuestion 工具**（多选）让用户选择：
   - 展示每个变更及其 schema
   - 提供 “All changes” 选项
   - 允许任意数量选择（1+ 可用，2+ 常见）

   **重要**：不要自动选择，必须让用户选。

3. **批量验证 - 汇总每个变更的状态**

   对每个选中的变更，收集：

   a. **工件状态** - 运行 \`openspec status --change "<name>" --json\`
      - 解析 \`schemaName\` 和 \`artifacts\` 列表
      - 标记哪些为 \`done\`，哪些不是

   b. **任务完成情况** - 读取 \`openspec/changes/<name>/tasks.md\`
      - 统计 \`- [ ]\`（未完成）与 \`- [x]\`（已完成）
      - 若不存在 tasks 文件，标记为 “No tasks”

   c. **增量规范** - 检查 \`openspec/changes/<name>/specs/\` 目录
      - 列出哪些 capability 的 spec 存在
      - 对每个 spec，提取需求名称（匹配 \`### Requirement: <name>\`）

4. **检测规范冲突**

   构建 \`capability -> [涉及该 capability 的变更]\` 的映射：

   \`\`\`
   auth -> [change-a, change-b]  <- CONFLICT (2+ changes)
   api  -> [change-c]            <- OK (only 1 change)
   \`\`\`

   当 2+ 个选中变更的增量规范涉及同一 capability 时，判定冲突。

5. **智能解决冲突**

   **对每个冲突**，调查代码库：

   a. **读取冲突变更的增量规范**，理解各自声称的新增/修改内容

   b. **搜索代码库**寻找实现证据：
      - 查找实现增量规范需求的代码
      - 查找相关文件、函数或测试

   c. **确定解决方案**：
      - 仅有一个变更真正实现 → 仅同步该变更规范
      - 两个都实现 → 按时间顺序应用（先旧后新，新覆盖）
      - 两个都未实现 → 跳过规范同步并警告

   d. **记录每个冲突的解决结果**：
      - 应用哪个变更的规范
      - 应用顺序（如有多个）
      - 依据（代码库证据）

6. **展示汇总状态表**

   展示所有变更的汇总表（同上）。

7. **确认批量操作**

   使用 **AskUserQuestion 工具**给出单次确认，选项同上。

8. **对确认的变更逐个归档**

   按确定的顺序处理（遵循冲突解决顺序）：

   a. **同步规范**（若存在增量规范）：
      - 使用 openspec-sync-specs 的方式（agent-driven 智能合并）
      - 若有冲突，按已解析的顺序应用
      - 记录是否已同步

   b. **执行归档**：
      \`\`\`bash
      mkdir -p openspec/changes/archive
      mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
      \`\`\`

   c. **记录每个变更的结果**：
      - 成功：已归档
      - 失败：归档错误（记录错误信息）
      - 跳过：用户选择不归档（若适用）

9. **展示最终摘要**

   展示最终结果（同上示例）。

**护栏**
- 允许任意数量变更（1+ 可用，2+ 常见）
- 始终提示选择，绝不自动选择
- 提前检测规范冲突并通过代码库解决
- 若两个变更都实现，按时间顺序应用规范
- 仅在缺少实现时跳过同步（并提示）
- 确认前展示清晰的逐项状态
- 整体批量只需一次确认
- 追踪并报告所有结果（成功/跳过/失败）
- 移动归档时保留 .openspec.yaml
- 归档目录名使用当前日期：YYYY-MM-DD-<name>
- 若归档目标已存在，该变更失败但继续处理其他`,
  };
}
