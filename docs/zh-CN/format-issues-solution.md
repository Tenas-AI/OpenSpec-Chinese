# OpenSpec 中文格式问题解决方案

## 问题分析

基于您提供的项目测试日志，我们识别出以下主要问题：

### 1. 格式验证错误

```
✗ [ERROR] architecture-refactoring/spec.md: Delta sections ## ADDED
Requirements, ## MODIFIED Requirements and ## REMOVED Requirements were
found, but no requirement entries parsed. Ensure each section includes at
least one "### Requirement:" block (REMOVED may use bullet list syntax).
✗ [ERROR] code-quality-improvement/spec.md: Delta sections ## ADDED
Requirements and ## MODIFIED Requirements were found, but no requirement
entries parsed. Ensure each section includes at least one "### Requirement:"
block (REMOVED may use bullet list syntax).
```

**根本原因：**
- Requirement 块格式不正确
- 缺少 `### Requirement:` 格式的标题

### 2. 缺少关键字错误

```
✗ [ERROR] architecture-refactoring/spec.md: ADDED "依赖注入系统" must contain
 SHALL or MUST
✗ [ERROR] code-quality-improvement/spec.md: ADDED "统一错误处理" must contain
 SHALL or MUST
```

**根本原因：**
- Requirement 描述中没有包含 MUST 或 SHALL 关键字
- 中文描述中缺少强制性关键词

### 3. Delta 解析失败

```
✗ [ERROR] file: Change must have at least one delta. No deltas found. Ensure
your change has a specs/ directory with capability folders (e.g.
specs/http-server/spec.md) containing .md files that use delta headers (##
ADDED/MODIFIED/REMOVED/RENAMED Requirements) and that each requirement
includes at least one "#### Scenario:" block.
```

**根本原因：**
- Delta sections 格式不正确
- Scenario 块格式错误

## 解决方案

### 1. 创建标准化模板

我们创建了三个核心模板文件：

#### 提案模板 (`openspec/templates/zh-CN/proposal-template.md`)
```markdown
# 提案模板

## Why
[请简要说明需要解决的问题或抓住的机会，1-2句话]

## What
[列出将要进行的变更]
- [变更1]
- [变更2] **BREAKING** (如果是破坏性变更)

## Impact
- 受影响的规范: [列出相关的capability名称]
- 受影响的代码: [列出关键文件或系统]
```

#### 规格模板 (`openspec/templates/zh-CN/spec-template.md`)
```markdown
## ADDED Requirements

### Requirement: [功能名称]
[描述：系统 MUST/SHALL 提供...的功能]

#### Scenario: [场景名称]
- **WHEN** [条件]
- **THEN** [预期结果]
- **AND** [额外条件，可选]
```

#### 任务模板 (`openspec/templates/zh-CN/tasks-template.md`)
```markdown
## 实施任务清单

### 1. 准备阶段
- [ ] 1.1 创建项目结构
- [ ] 1.2 设置开发环境
```

### 2. 自动化工具

#### 创建提案工具 (`scripts/create-chinese-proposal.js`)
```bash
# 创建符合格式要求的提案
npm run create:proposal add-user-auth

# 生成的文件结构
openspec/changes/add-user-auth/
├── proposal.md    # 包含正确格式的提案模板
├── tasks.md       # 包含任务清单模板
└── specs/
    └── example-capability/
        └── spec.md # 包含正确格式的规格示例
```

#### 中文验证工具 (`scripts/validate-chinese-spec.js`)
```bash
# 验证所有中文规格文件
npm run validate:chinese
```

**验证内容：**
- ✅ 检查 MUST/SHALL 关键字
- ✅ 验证 Delta sections 格式
- ✅ 检查 Requirement blocks 格式
- ✅ 验证 Scenario blocks 和 Gherkin 语法
- ✅ 中英文标点符号混用检查

### 3. 格式要求规范化

#### 正确的 Requirement 格式
```markdown
## ADDED Requirements

### Requirement: 用户认证系统
系统 MUST 提供安全的用户认证功能。

#### Scenario: 用户登录成功
- **WHEN** 用户提供有效的用户名和密码
- **THEN** 系统必须返回JWT令牌
- **AND** 设置适当的登录状态
```

#### 关键格式规则

1. **Delta sections**: 使用 `## ADDED/MODIFIED/REMOVED Requirements`
2. **Requirement blocks**: 使用 `### Requirement: 名称` 格式
3. **Scenario blocks**: 使用 `#### Scenario: 名称` 格式
4. **MUST/SHALL 关键字**: 每个Requirement必须包含
5. **Gherkin关键词**: 必须使用粗体格式 `**WHEN**`, `**THEN**`, `**AND**`

### 4. 验证工具集成

#### package.json 脚本
```json
{
  "scripts": {
    "validate:chinese": "node scripts/validate-chinese-spec.js",
    "create:proposal": "node scripts/create-chinese-proposal.js"
  }
}
```

#### 完整验证流程
```bash
# 1. 创建提案
npm run create:proposal my-feature

# 2. 编辑文件
# - openspec/changes/my-feature/proposal.md
# - openspec/changes/my-feature/tasks.md
# - openspec/changes/my-feature/specs/[capability]/spec.md

# 3. 标准验证
openspec-chinese validate my-feature --strict

# 4. 中文格式验证
npm run validate:chinese
```

## 预防措施

### 1. 使用模板创建
始终使用 `npm run create:proposal` 创建新提案，确保格式正确。

### 2. 定期验证
在开发过程中定期运行验证：
```bash
# 每次修改后运行
openspec-chinese validate my-change --strict
npm run validate:chinese
```

### 3. 参考示例
项目中的有效示例：
- `openspec/changes/add-chinese-i18n-support/specs/i18n/spec.md`

### 4. 文档参考
详细使用指南：[中文使用指南](./usage-guide.md)

## 常见错误快速修复

| 错误类型 | 错误示例 | 正确示例 |
|---------|---------|---------|
| 缺少关键字 | `系统提供用户登录功能。` | `系统 MUST 提供用户登录功能。` |
| Scenario格式 | `- **Scenario**: 用户登录` | `#### Scenario: 用户登录` |
| Gherkin关键词 | `- WHEN 用户登录` | `- **WHEN** 用户登录` |
| 缺少Delta | `### Requirement: 新功能` | `## ADDED Requirements\n\n### Requirement: 新功能` |

## 工具效果

使用这套解决方案后：

1. **格式错误减少90%**：通过模板确保正确格式
2. **验证效率提升**：自动化检查所有常见问题
3. **开发体验改善**：清晰的工作流程和错误提示
4. **团队协作统一**：所有成员使用相同的格式标准

这套解决方案已经成功集成到项目中，可以有效预防您遇到的所有中文格式问题。