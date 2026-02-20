/**
 * 技能模板工作流模块（中文）
 *
 * 由旧版单体模板拆分而来。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getSyncSpecsSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-sync-specs',
    description: '将某个变更的增量规范同步到主规范。适用于只想更新主规范、但暂不归档变更的情况。',
    instructions: `将变更中的增量规范同步到主规范。

这是一个**代理驱动**的操作——你会读取增量规范并直接编辑主规范来应用变更。这样可以进行智能合并（例如新增一个场景而无需复制整条需求）。

**输入**：可选指定变更名称。如果省略，先从对话上下文判断能否推断；若模糊或有歧义，必须提示用户选择可用变更。

**步骤**

1. **未提供变更名称时，提示选择**

   运行 \`openspec list --json\` 获取可用变更。使用 **AskUserQuestion 工具**让用户选择。

   仅展示包含增量规范（\`specs/\` 目录下）的变更。

   **重要**：不要猜测或自动选择，必须让用户做选择。

2. **查找增量规范**

   查找 \`openspec/changes/<name>/specs/*/spec.md\` 下的增量规范文件。

   每个增量规范包含类似章节：
   - \`## ADDED Requirements\` - 新增需求
   - \`## MODIFIED Requirements\` - 修改需求
   - \`## REMOVED Requirements\` - 删除需求
   - \`## RENAMED Requirements\` - 重命名需求（FROM/TO 格式）

   若找不到增量规范，告知用户并停止。

3. **对每个增量规范应用到主规范**

   对每个 capability 的增量规范 \`openspec/changes/<name>/specs/<capability>/spec.md\`：

   a. **读取增量规范**了解预期变更

   b. **读取主规范** \`openspec/specs/<capability>/spec.md\`（可能还不存在）

   c. **智能应用变更**：

      **ADDED Requirements：**
      - 主规范中不存在 → 直接新增
      - 已存在 → 更新为匹配内容（视为隐式 MODIFIED）

      **MODIFIED Requirements：**
      - 在主规范中找到该需求
      - 应用变更，可能包括：
        - 新增场景（无需复制已有场景）
        - 修改已有场景
        - 修改需求描述
      - 保留增量中未提及的场景/内容

      **REMOVED Requirements：**
      - 从主规范中移除整块需求

      **RENAMED Requirements：**
      - 找到 FROM 需求并重命名为 TO

   d. **若主规范不存在则创建**：
      - 创建 \`openspec/specs/<capability>/spec.md\`
      - 添加 Purpose 部分（可简短，标记为 TBD）
      - 添加 Requirements 部分并写入 ADDED 需求

4. **展示摘要**

   应用完所有变更后，总结：
   - 更新了哪些 capability
   - 做了哪些变更（新增/修改/删除/重命名）

**增量规范格式参考**

\`\`\`markdown
## ADDED Requirements

### Requirement: New Feature
The system SHALL do something new.

#### Scenario: Basic case
- **WHEN** user does X
- **THEN** system does Y

## MODIFIED Requirements

### Requirement: Existing Feature
#### Scenario: New scenario to add
- **WHEN** user does A
- **THEN** system does B

## REMOVED Requirements

### Requirement: Deprecated Feature

## RENAMED Requirements

- FROM: \`### Requirement: Old Name\`
- TO: \`### Requirement: New Name\`
\`\`\`

**关键原则：智能合并**

不同于机械合并，你可以做**局部更新**：
- 只新增一个场景，就在 MODIFIED 下写这个场景，无需复制已有场景
- 增量表达的是*意图*，不是整体替换
- 用你的判断合理合并变更

**成功输出示例**

\`\`\`
## Specs Synced: <change-name>

Updated main specs:

**<capability-1>**:
- Added requirement: "New Feature"
- Modified requirement: "Existing Feature" (added 1 scenario)

**<capability-2>**:
- Created new spec file
- Added requirement: "Another Feature"

Main specs are now updated. The change remains active - archive when implementation is complete.
\`\`\`

**护栏**
- 修改前阅读增量和主规范
- 保留增量未提及的既有内容
- 不清晰时先问
- 过程中展示你做的变更
- 操作应可幂等：重复执行应得到相同结果`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxSyncCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Sync',
    description: '将变更的增量规范同步到主规范',
    category: 'Workflow',
    tags: ['workflow', 'specs', 'experimental'],
    content: `将变更中的增量规范同步到主规范。

这是一个**代理驱动**的操作——你会读取增量规范并直接编辑主规范来应用变更。这样可以进行智能合并（例如新增一个场景而无需复制整条需求）。

**输入**：可在 \`/opsx:sync\` 后指定变更名称（例如 \`/opsx:sync add-auth\`）。若省略，先从对话上下文判断能否推断；若模糊或有歧义，必须提示用户选择可用变更。

**步骤**

1. **未提供变更名称时，提示选择**

   运行 \`openspec list --json\` 获取可用变更。使用 **AskUserQuestion 工具**让用户选择。

   仅展示包含增量规范（\`specs/\` 目录下）的变更。

   **重要**：不要猜测或自动选择，必须让用户做选择。

2. **查找增量规范**

   查找 \`openspec/changes/<name>/specs/*/spec.md\` 下的增量规范文件。

   每个增量规范包含类似章节：
   - \`## ADDED Requirements\` - 新增需求
   - \`## MODIFIED Requirements\` - 修改需求
   - \`## REMOVED Requirements\` - 删除需求
   - \`## RENAMED Requirements\` - 重命名需求（FROM/TO 格式）

   若找不到增量规范，告知用户并停止。

3. **对每个增量规范应用到主规范**

   对每个 capability 的增量规范 \`openspec/changes/<name>/specs/<capability>/spec.md\`：

   a. **读取增量规范**了解预期变更

   b. **读取主规范** \`openspec/specs/<capability>/spec.md\`（可能还不存在）

   c. **智能应用变更**：

      **ADDED Requirements：**
      - 主规范中不存在 → 直接新增
      - 已存在 → 更新为匹配内容（视为隐式 MODIFIED）

      **MODIFIED Requirements：**
      - 在主规范中找到该需求
      - 应用变更，可能包括：
        - 新增场景（无需复制已有场景）
        - 修改已有场景
        - 修改需求描述
      - 保留增量中未提及的场景/内容

      **REMOVED Requirements：**
      - 从主规范中移除整块需求

      **RENAMED Requirements：**
      - 找到 FROM 需求并重命名为 TO

   d. **若主规范不存在则创建**：
      - 创建 \`openspec/specs/<capability>/spec.md\`
      - 添加 Purpose 部分（可简短，标记为 TBD）
      - 添加 Requirements 部分并写入 ADDED 需求

4. **展示摘要**

   应用完所有变更后，总结：
   - 更新了哪些 capability
   - 做了哪些变更（新增/修改/删除/重命名）

**护栏**
- 修改前阅读增量和主规范
- 保留增量未提及的既有内容
- 不清晰时先问
- 过程中展示你做的变更
- 操作应可幂等：重复执行应得到相同结果`,
  };
}
