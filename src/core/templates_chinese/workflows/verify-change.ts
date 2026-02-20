/**
 * 技能模板工作流模块（中文）
 *
 * 由旧版单体模板拆分而来。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getVerifyChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-verify-change',
    description: '验证实现是否与变更工件一致。适用于归档前确认实现完整、正确且一致。',
    instructions: `验证实现是否与变更工件（specs、tasks、design）一致。

**输入**：可选指定变更名称。如果省略，先从对话上下文判断能否推断；若模糊或有歧义，必须提示用户选择可用变更。

**步骤**

1. **未提供变更名称时，提示选择**

   运行 \`openspec list --json\` 获取可用变更。使用 **AskUserQuestion 工具**让用户选择。

   仅展示存在实现任务的变更（tasks 工件存在）。
   若可用，包含每个变更的 schema。
   对任务未完成的变更标记 “(In Progress)”。

   **重要**：不要猜测或自动选择，必须让用户做选择。

2. **检查状态以了解 schema**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON，了解：
   - \`schemaName\`：正在使用的工作流（例如 “spec-driven”）
   - 该变更已有哪些工件

3. **获取变更目录并加载工件**

   \`\`\`bash
   openspec instructions apply --change "<name>" --json
   \`\`\`

   返回变更目录和上下文文件。读取 \`contextFiles\` 中的所有可用工件。

4. **初始化验证报告结构**

   创建三维度报告结构：
   - **Completeness**：任务与规范覆盖
   - **Correctness**：需求实现与场景覆盖
   - **Coherence**：设计一致性与模式一致性

   每个维度可包含 CRITICAL、WARNING 或 SUGGESTION。

5. **验证完整性（Completeness）**

   **任务完成情况**：
   - 若 contextFiles 中存在 tasks.md，读取
   - 解析复选框：\`- [ ]\`（未完成）与 \`- [x]\`（已完成）
   - 统计完成 vs 总数
   - 若存在未完成任务：
     - 为每个未完成任务添加 CRITICAL
     - 建议：“完成任务：<描述>”或“若已实现则标记完成”

   **规范覆盖**：
   - 若 \`openspec/changes/<name>/specs/\` 中存在增量规范：
     - 提取所有需求（标记为 “### Requirement:”）
     - 对每个需求：
       - 在代码库中搜索与需求相关的关键字
       - 判断是否可能已实现
     - 若需求似乎未实现：
       - 添加 CRITICAL：“未发现需求实现：<需求名>”
       - 建议：“实现需求 X：<描述>”

6. **验证正确性（Correctness）**

   **需求实现映射**：
   - 对每个增量规范中的需求：
     - 在代码库中搜索实现证据
     - 若找到，记录文件路径和行范围
     - 判断实现是否符合需求意图
     - 若发现偏差：
       - 添加 WARNING：“实现可能与规范不一致：<细节>”
       - 建议：“核对 <file>:<lines> 与需求 X”

   **场景覆盖**：
   - 对每个场景（标记为 “#### Scenario:”）：
     - 检查代码是否处理该条件
     - 检查是否有测试覆盖该场景
     - 若场景未覆盖：
       - 添加 WARNING：“场景未覆盖：<场景名>”
       - 建议：“为场景添加测试或实现：<描述>”

7. **验证一致性（Coherence）**

   **设计一致性**：
   - 若 contextFiles 中存在 design.md：
     - 提取关键决策（例如 “Decision:”、“Approach:”、“Architecture:”）
     - 验证实现是否遵循这些决策
     - 若发现矛盾：
       - 添加 WARNING：“设计决策未遵循：<决策>”
       - 建议：“更新实现或修订 design.md 以匹配现实”
   - 若没有 design.md：跳过设计一致性检查，并注明 “No design.md to verify against”。

   **代码模式一致性**：
   - 检查新代码是否符合项目模式
   - 检查命名、目录结构、编码风格
   - 若存在明显偏离：
     - 添加 SUGGESTION：“代码模式偏离：<细节>”
     - 建议：“考虑遵循项目模式：<示例>”

8. **生成验证报告**

   **汇总记分卡**：
   \`\`\`
   ## Verification Report: <change-name>

   ### Summary
   | Dimension    | Status           |
   |--------------|------------------|
   | Completeness | X/Y tasks, N reqs|
   | Correctness  | M/N reqs covered |
   | Coherence    | Followed/Issues  |
   \`\`\`

   **按优先级列出问题**：

   1. **CRITICAL**（归档前必须修复）：
      - 未完成任务
      - 缺失需求实现
      - 每项附具体可执行建议

   2. **WARNING**（建议修复）：
      - 规范/设计偏差
      - 场景覆盖缺失
      - 每项附具体建议

   3. **SUGGESTION**（可优化）：
      - 模式不一致
      - 小改进建议
      - 每项附具体建议

   **最终评估**：
   - 若有 CRITICAL： “发现 X 个关键问题，归档前需修复。”
   - 若只有 WARNING： “无关键问题，有 Y 个警告可考虑修复，可归档（带改进建议）。”
   - 若完全通过： “全部检查通过，可归档。”

**验证启发式**

- **Completeness**：关注客观检查项（复选框、需求列表）
- **Correctness**：用关键字搜索、文件路径分析、合理推断，不要求绝对确定
- **Coherence**：抓明显不一致，不纠结风格细节
- **避免误报**：不确定时优先 SUGGESTION，再到 WARNING，最后 CRITICAL
- **可执行性**：每个问题都应给出可操作建议，尽量包含文件/行号

**优雅降级**

- 仅存在 tasks.md：只验证任务完成情况，跳过规范/设计
- 有 tasks + specs：验证完整性与正确性，跳过设计
- 工件齐全：验证三维度
- 始终注明哪些检查被跳过及原因

**输出格式**

使用清晰的 Markdown，包括：
- 汇总表
- 按优先级分组的问题列表（CRITICAL/WARNING/SUGGESTION）
- 代码引用格式：\`file.ts:123\`
- 具体可执行建议
- 避免“考虑看看”这类模糊建议`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxVerifyCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Verify',
    description: '归档前验证实现与变更工件一致',
    category: 'Workflow',
    tags: ['workflow', 'verify', 'experimental'],
    content: `验证实现是否与变更工件（specs、tasks、design）一致。

**输入**：可在 \`/opsx:verify\` 后指定变更名称（例如 \`/opsx:verify add-auth\`）。若省略，先从对话上下文判断能否推断；若模糊或有歧义，必须提示用户选择可用变更。

**步骤**

1. **未提供变更名称时，提示选择**

   运行 \`openspec list --json\` 获取可用变更。使用 **AskUserQuestion 工具**让用户选择。

   仅展示存在实现任务的变更（tasks 工件存在）。
   若可用，包含每个变更的 schema。
   对任务未完成的变更标记 “(In Progress)”。

   **重要**：不要猜测或自动选择，必须让用户做选择。

2. **检查状态以了解 schema**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON，了解：
   - \`schemaName\`：正在使用的工作流（例如 “spec-driven”）
   - 该变更已有哪些工件

3. **获取变更目录并加载工件**

   \`\`\`bash
   openspec instructions apply --change "<name>" --json
   \`\`\`

   返回变更目录和上下文文件。读取 \`contextFiles\` 中的所有可用工件。

4. **初始化验证报告结构**

   创建三维度报告结构：
   - **Completeness**：任务与规范覆盖
   - **Correctness**：需求实现与场景覆盖
   - **Coherence**：设计一致性与模式一致性

5. **验证完整性**

   参照上文（同技能说明）。

6. **验证正确性**

   参照上文（同技能说明）。

7. **验证一致性**

   参照上文（同技能说明）。

8. **生成验证报告**

   按上文格式输出汇总表、问题列表与结论。

**护栏**
- 使用明确的 Markdown 结构
- 每个问题都给出可执行建议
- 若不确定，降低严重级别`,
  };
}
