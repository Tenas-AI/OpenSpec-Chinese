# OpenSpec 中文使用指南

本指南帮助您使用 OpenSpec 中文版完成从探索到归档的完整工作流。

## 快速开始

```bash
# 初始化
openspec-chinese init
```

在你的 AI 工具中运行：

```
/opsx:new <你的变更名称>
```

## 核心工作流（AI 工具）

- `/opsx:explore`：探索问题与方案
- `/opsx:new`：创建变更容器
- `/opsx:continue`：继续生成下一个产物
- `/opsx:ff`：一键生成全部规划产物
- `/opsx:apply`：实施任务
- `/opsx:archive`：归档变更

## 常用 CLI 命令

```bash
# 列出所有活跃变更
openspec-chinese list

# 查看变更详情
openspec-chinese show <change-id>

# 验证变更格式
openspec-chinese validate <change-id> --strict

# 归档变更
openspec-chinese archive <change-id> --yes

# 更新技能与命令
openspec-chinese update
```

## 规格文件格式要求

### 基本结构

每个规格文件必须包含以下元素：

1. **Delta Sections**: 使用 `## ADDED/MODIFIED/REMOVED Requirements`
2. **Requirement Blocks**: 使用 `### Requirement: 名称` 格式
3. **Scenario Blocks**: 使用 `#### Scenario: 名称` 格式
4. **MUST/SHALL 关键字**: 每个 Requirement 必须包含
5. **Gherkin 关键词**: Scenario 中必须使用 `**WHEN**`, `**THEN**`, `**AND**`

### 完整示例

```markdown
## ADDED Requirements

### Requirement: 用户认证系统
系统 MUST 提供安全的用户认证功能。

#### Scenario: 用户登录成功
- **WHEN** 用户提供有效的用户名和密码
- **THEN** 系统必须返回JWT令牌
- **AND** 设置适当的登录状态

#### Scenario: 用户登录失败
- **WHEN** 用户提供错误的凭据
- **THEN** 系统必须返回401错误
- **AND** 记录失败的登录尝试

## MODIFIED Requirements

### Requirement: 密码加密算法
现有的密码加密算法 SHALL 升级为更安全的算法。

#### Scenario: 密码加密
- **WHEN** 用户设置新密码
- **THEN** 系统必须使用Argon2算法加密
- **AND** 存储加密后的密码哈希

## REMOVED Requirements

### Requirement: 旧版认证方式
**Reason**: 安全性不足，已被更安全的方式替代
**Migration**: 所有用户必须迁移到新的认证系统

- 移除基于MD5的密码存储
- 移除简单的令牌认证
- 移除不安全的会话管理
```

## 常见错误与解决方案

### 1. 缺少 MUST/SHALL 关键字

**错误**:
```markdown
### Requirement: 用户登录
系统提供用户登录功能。
```

**正确**:
```markdown
### Requirement: 用户登录
系统 MUST 提供用户登录功能。
```

### 2. Scenario 格式错误

**错误**:
```markdown
- **Scenario**: 用户登录
- WHEN 用户登录
- THEN 返回成功
```

**正确**:
```markdown
#### Scenario: 用户登录
- **WHEN** 用户登录
- **THEN** 返回成功
```

### 3. 缺少 Gherkin 关键词

**错误**:
```markdown
#### Scenario: 用户登录
- 用户点击登录按钮
- 系统验证用户信息
```

**正确**:
```markdown
#### Scenario: 用户登录
- **WHEN** 用户点击登录按钮
- **THEN** 系统验证用户信息
```

### 4. Delta Sections 缺失

**错误**:
```markdown
### Requirement: 新功能
系统 MUST 添加新功能。
```

**正确**:
```markdown
## ADDED Requirements

### Requirement: 新功能
系统 MUST 添加新功能。
```

## 传统提案工具（可选）

如果你更习惯脚本方式，也可以使用：

```bash
# 创建新的提案模板
npm run create:proposal add-user-auth

# 手动指定 change-id
node scripts/create-chinese-proposal.js my-feature-name
```

## 验证与测试

```bash
# 严格验证
openspec-chinese validate my-feature-name --strict

# 中文专用验证（额外检查中文格式问题）
npm run validate:chinese

# 运行测试
npm test
```
