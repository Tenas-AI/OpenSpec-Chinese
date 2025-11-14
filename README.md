<p align="center">
  <a href="https://github.com/org-hex/openspec-chinese">
    <picture>
      <source srcset="assets/openspec_pixel_dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="assets/openspec_pixel_light.svg" media="(prefers-color-scheme: light)">
      <img src="assets/openspec_pixel_light.svg" alt="OpenSpec logo" height="64">
    </picture>
  </a>
</p>

<p align="center">
  <strong>OpenSpec 中文版 - AI驱动的系统化开发规范管理</strong>
</p>
<p align="center">
  <strong>为AI编程助手提供规范驱动的开发流程，中文界面支持</strong>
</p>

<p align="center">
  <a href="https://github.com/org-hex/openspec-chinese/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/org-hex/openspec-chinese/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" /></a>
</p>

---

## 📖 项目简介

**OpenSpec 中文版** 是基于 [org-hex/openspec-chinese](https://github.com/org-hex/openspec-chinese) 的中文本地化版本。

### 🎯 主要特性

- **中文界面支持** - 完整的中文用户界面和文档
- **零侵入性设计** - 原有代码一行不改，完全独立实现
- **规范驱动开发** - 在编写代码前与AI达成规范共识
- **支持主流AI工具** - Claude Code、Cursor、Cline等20+AI编程工具
- **无需API密钥** - 本地运行，保护隐私

### 🔧 与原版区别

| 特性 | 原版 OpenSpec | OpenSpec 中文版 |
|------|---------------|-----------------|
| 界面语言 | 英文 | 中文 |
| CLI命令 | `openspec` | `openspec-chinese` |
| 原始代码修改 | - | 零修改（完全兼容） |
| 中文模板 | - | ✅ 完整支持 |
| Gherkin关键字 | 英文 | 英文（保持兼容性） |

## 🚀 快速开始

### 系统要求

- **Node.js >= 20.19.0**

### 安装

#### 方法1：全局安装（推荐）

```bash
npm install -g @org-hex/openspec-chinese@latest
```

#### 方法2：本地开发模式

```bash
# 克隆中文版仓库
git clone https://github.com/org-hex/openspec-chinese.git
cd openspec-chinese

# 安装依赖
pnpm install

# 构建项目
pnpm run build
```

#### 方法3：使用npm link（本地开发推荐）

```bash
# 克隆中文版仓库
git clone https://github.com/org-hex/openspec-chinese.git
cd openspec-chinese

# 安装依赖
pnpm install

# 构建项目
pnpm run build

# 创建全局符号链接
npm link

# 验证链接成功
openspec-chinese --version

# 如需取消链接
npm unlink -g @org-hex/openspec-chinese
```

### 启动命令

根据您的安装方式，选择以下方法启动：

#### 全局安装后
```bash
# 直接使用命令
openspec-chinese

# 查看帮助
openspec-chinese --help

# 查看版本
openspec-chinese --version
```

#### 本地开发模式（直接运行）
```bash
# 在 openspec-chinese 项目目录下
pnpm run build && node bin/openspec-chinese.js
```

#### 使用 npm link 后（推荐开发者）
```bash
# 链接后可以像全局安装一样使用
openspec-chinese

# 查看帮助
openspec-chinese --help

# 查看版本
openspec-chinese --version
```

### 初始化项目

```bash
# 进入你的项目目录
cd your-project

# 使用中文版初始化
openspec-chinese init

# 验证安装
openspec-chinese --version
```

### 开发者常用命令

```bash
# 在 openspec-chinese 项目目录下进行开发

# 构建项目
pnpm run build

# 开发模式（自动重新构建）
pnpm run dev

# 运行中文版CLI（直接运行）
pnpm run build && node bin/openspec-chinese.js

# 创建全局链接（推荐）
npm link

# 测试链接是否成功
openspec-chinese --version

# 运行测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm run test:coverage

# 取消全局链接
npm unlink -g @org-hex/openspec-chinese

# 重新链接（代码更新后）
pnpm run build && npm link
```

## 📋 使用方法

### 1. 创建变更提案

```bash
# 方法1：使用CLI命令
openspec-chinese proposal "添加用户搜索功能"

# 方法2：在AI助手中使用（支持的工具）
# Claude Code: /openspec:proposal 添加用户搜索功能
# Cursor: /openspec-proposal 添加用户搜索功能
# Cline: 在工作流中选择 "Create OpenSpec Proposal"
```

### 2. 查看和管理变更

```bash
# 查看所有变更
openspec-chinese list

# 查看特定变更详情
openspec-chinese show add-user-search

# 验证变更格式
openspec-chinese validate add-user-search

# 交互式仪表板
openspec-chinese view
```

### 3. 实施变更

```bash
# 在AI助手中实施变更
# "请实施 add-user-search 变更"

# AI助手会：
# 1. 查看任务列表 (openspec/changes/add-user-search/tasks.md)
# 2. 按照规范实施代码
# 3. 标记完成的任务
```

### 4. 归档变更

```bash
# 归档完成的变更
openspec-chinese archive add-user-search --yes

# 这会将变更合并到主规范中
```

## 🎯 支持的AI工具

### 原生支持（斜杠命令）

| 工具 | 命令格式 |
|------|----------|
| **Claude Code** | `/openspec:proposal`, `/openspec:apply`, `/openspec:archive` |
| **Cursor** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` |
| **Cline** | 工作流支持 (`.clinerules/workflows/`) |
| **RooCode** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` |
| **CodeBuddy** | `/openspec:proposal`, `/openspec:apply`, `/openspec:archive` |
| **GitHub Copilot** | `/openspec-proposal`, `/openspec-apply`, `/openspec-archive` |
| **Amazon Q Developer** | `@openspec-proposal`, `@openspec-apply`, `@openspec-archive` |

### AGENTS.md 兼容

所有支持 `AGENTS.md` 规范的AI工具都可以使用，包括：
- Amp、Jules 等其他工具

## 📁 项目结构

```
your-project/
├── openspec/
│   ├── specs/              # 当前规范（当前事实）
│   │   └── feature/
│   │       └── spec.md
│   ├── changes/            # 变更提案（建议更新）
│   │   └── add-feature/
│   │       ├── proposal.md     # 变更提案
│   │       ├── tasks.md        # 实施任务
│   │       ├── design.md       # 技术设计（可选）
│   │       └── specs/          # 规范增量
│   │           └── feature/
│   │               └── spec.md
│   ├── project.md          # 项目上下文
│   └── AGENTS.md           # AI助手指令
```

## 📝 规范格式示例

### 正确的中文规范格式

```markdown
## ADDED Requirements
### Requirement: 用户搜索功能
系统应当提供用户搜索功能，支持按姓名和邮箱搜索。

#### Scenario: 按姓名搜索用户
- **WHEN** 用户输入姓名并点击搜索
- **THEN** 系统返回匹配的用户列表

#### Scenario: 按邮箱搜索用户
- **WHEN** 用户输入邮箱并点击搜索
- **THEN** 系统返回匹配的用户信息

## MODIFIED Requirements
### Requirement: 用户列表页面
用户列表页面应当支持搜索过滤功能。

## REMOVED Requirements
### Requirement: 简单用户浏览
**Reason**: 功能已被新的搜索功能替代
**Migration**: 用户应使用新的搜索功能来查找用户
```

**重要提示：**
- `## ADDED|MODIFIED|REMOVED Requirements` 必须使用英文
- `#### Scenario:`、`**WHEN**`、`**THEN**` 等Gherkin关键字必须使用英文
- 描述性内容可以使用中文

## 🔧 高级用法

### 项目上下文配置

初始化后，填充项目上下文：

```text
请帮我完善 openspec/project.md 文件，包含以下信息：
- 项目技术栈
- 架构模式
- 编码规范
- 测试策略
- 部署流程
```

### 更新AI助手配置

```bash
# 更新AI助手指令和斜杠命令
openspec-chinese update
```

## 🆘 常见问题

### Q: 如何启动 openspec-chinese 命令？
A: 有几种方式：
- **全局安装后**：直接使用 `openspec-chinese`
- **本地开发**：在项目目录下使用 `pnpm run build && node bin/openspec-chinese.js`
- **使用npm link**：构建后使用 `npm link`，然后全局可用

### Q: 运行时提示 "command not found: openspec-chinese" 怎么办？
A: 根据您的安装方式检查：
- **全局安装**：尝试重新安装 `npm install -g @org-hex/openspec-chinese@latest`
- **本地开发**：
  1. 确保在项目目录下
  2. 运行 `pnpm run build` 构建项目
  3. 使用 `npm link` 创建全局链接
  4. 或者直接使用：`node bin/openspec-chinese.js`
- **验证链接**：运行 `openspec-chinese --version` 确认可用

### Q: npm link 后命令仍然不可用？
A: 可能的原因和解决方案：
1. **权限问题**：尝试使用 `sudo npm link`（不推荐）或检查 npm 配置
2. **PATH 问题**：确保全局 npm bin 目录在 PATH 中
3. **链接失败**：尝试 `npm unlink -g @org-hex/openspec-chinese` 然后 `npm link`
4. **包名冲突**：检查是否已安装其他版本的 openspec

### Q: 如何切换回英文版？
A: 使用原版命令 `openspec` 即可，两个版本可以并存。

### Q: 中文版是否与原版兼容？
A: 完全兼容。规范文件格式相同，可以与使用原版的团队成员协作。

### Q: 支持哪些中文AI模型？
A: 支持所有遵循OpenSpec格式的AI工具，包括国产AI模型。

### Q: 如何贡献中文翻译改进？
A: 欢迎提交PR改进中文模板和文档。

### Q: 开发时需要重新构建吗？
A: 是的，每次修改源代码后需要运行 `pnpm run build`，或者使用 `pnpm run dev` 进入监视模式自动构建。

## 🤝 贡献

欢迎为OpenSpec中文版贡献代码：

```bash
# 安装依赖
pnpm install

# 构建
pnpm run build

# 测试
pnpm test

# 本地开发
pnpm run dev
```

## 📄 许可证

MIT License - 与原版保持一致

## 🔗 相关链接

- [原版 OpenSpec](https://github.com/org-hex/openspec)
- [OpenSpec 官方文档](https://openspec.dev)
- [AGENTS.md 规范](https://agents.md/)

---

<p align="center">
  <strong>让AI编程助手更好地理解中文开发需求 🚀</strong>
</p>