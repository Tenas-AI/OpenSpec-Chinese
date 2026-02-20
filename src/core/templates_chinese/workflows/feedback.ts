/**
 * 技能模板工作流模块（中文）
 *
 * 由旧版单体模板拆分而来。
 */
import type { SkillTemplate } from '../types.js';

export function getFeedbackSkillTemplate(): SkillTemplate {
  return {
    name: 'feedback',
    description: '收集并提交 OpenSpec 用户反馈，包含上下文补充与匿名化处理。',
    instructions: `帮助用户提交 OpenSpec 反馈。

**目标**：引导用户收集、补充并提交反馈，同时通过匿名化保护隐私。

**流程**

1. **从对话中收集上下文**
   - 回顾近期对话记录
   - 识别正在做的任务
   - 记录哪里做得好/不好
   - 捕捉具体的阻碍点或称赞

2. **起草增强版反馈**
   - 创建清晰的标题（单句，无需 “Feedback:” 前缀）
   - 编写正文，包含：
     - 用户正在尝试做什么
     - 发生了什么（好或不好）
     - 对话中的相关上下文
     - 具体建议或请求

3. **匿名化敏感信息**
   - 将文件路径替换为 \`<path>\` 或通用描述
   - 将 API key、token、secret 替换为 \`<redacted>\`
   - 将公司/组织名称替换为 \`<company>\`
   - 将个人姓名替换为 \`<user>\`
   - 除非公开且相关，否则将具体 URL 替换为 \`<url>\`
   - 保留有助于理解问题的技术细节

4. **展示草稿并请求确认**
   - 向用户展示完整草稿
   - 清晰展示标题和正文
   - 提交前必须获得明确许可
   - 允许用户修改草稿

5. **确认后提交**
   - 使用 \`openspec feedback\` 命令提交
   - 格式：\`openspec feedback "title" --body "body content"\`
   - 命令会自动添加元数据（版本、平台、时间戳）

**草稿示例**

\`\`\`
Title: Error handling in artifact workflow needs improvement

Body:
I was working on creating a new change and encountered an issue with
the artifact workflow. When I tried to continue after creating the
proposal, the system didn't clearly indicate that I needed to complete
the specs first.

Suggestion: Add clearer error messages that explain dependency chains
in the artifact workflow. Something like "Cannot create design.md
because specs are not complete (0/2 done)."

Context: Using the spec-driven schema with <path>/my-project
\`\`\`

**匿名化示例**

Before:
\`\`\`
Working on /Users/john/mycompany/auth-service/src/oauth.ts
Failed with API key: sk_live_abc123xyz
Working at Acme Corp
\`\`\`

After:
\`\`\`
Working on <path>/oauth.ts
Failed with API key: <redacted>
Working at <company>
\`\`\`

**护栏**

- 必须在提交前展示完整草稿
- 必须要求明确确认
- 必须匿名化敏感信息
- 允许用户修改草稿
- 未经确认不得提交
- 应包含相关技术上下文
- 保留对话中的关键信息

**需要用户确认**

始终询问：
\`\`\`
Here's the feedback I've drafted:

Title: [title]

Body:
[body]

Does this look good? I can modify it if you'd like, or submit it as-is.
\`\`\`

仅在用户确认后提交。`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}
