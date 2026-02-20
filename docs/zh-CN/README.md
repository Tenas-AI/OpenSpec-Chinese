# OpenSpec 中文版本

[![npm version](https://badge.fury.io/js/%40org-hex%2Fopenspec-chinese.svg)](https://badge.fury.io/js/%40org-hex%2Fopenspec-chinese)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

OpenSpec 的中文本地化版本，为中文开发者提供完整的规范驱动开发体验。

## ✨ 特性

- 🧭 **技能驱动工作流**：使用 `/opsx:*` 指令贯通探索、创建、实施与归档
- 🌏 **中文友好**：中文 CLI 与文档说明
- 📚 **规范驱动**：基于 Gherkin 的需求与场景描述
- 🔧 **自动化工具**：提案创建与格式验证
- 🧩 **多工具支持**：支持 20+ AI 工具与编辑器生态

## 🚀 快速开始

### 安装

```bash
npm install -g @org-hex/openspec-chinese@latest
```

### 初始化项目

```bash
openspec-chinese init
```

### 开始第一个变更

在你的 AI 工具中运行：

```
/opsx:new <你的变更名称>
```

## 📖 文档

- [中文使用指南](./usage-guide.md)
- [中文格式问题解决方案](./format-issues-solution.md)

## 🧰 常用命令

```bash
# 列出所有活跃变更
openspec-chinese list

# 验证变更
openspec-chinese validate <change-id> --strict

# 归档完成的变更
openspec-chinese archive <change-id> --yes

# 更新技能与命令
openspec-chinese update
```

## 📁 项目结构

```
openspec/
├── config.yaml            # OpenSpec 配置
├── specs/                 # 当前规格
│   └── [capability]/
│       └── spec.md
├── changes/               # 变更提案
│   └── [change-id]/
│       ├── proposal.md
│       ├── tasks.md
│       ├── design.md
│       └── specs/
└── changes/archive/       # 已完成的变更
```

## 🔧 开发工具

本项目包含以下开发工具：

- `scripts/create-chinese-proposal.js` - 创建提案模板
- `scripts/validate-chinese-spec.js` - 中文规格验证

```bash
# 安装开发依赖
npm install

# 运行开发模式
npm run dev

# 运行测试
npm test

# 创建提案
npm run create:proposal [change-id]

# 验证中文规格
npm run validate:chinese
```

## 📋 规格格式要求

### 基本格式

```markdown
## ADDED Requirements

### Requirement: 功能名称
系统 MUST 提供特定功能。

#### Scenario: 场景名称
- **WHEN** 条件
- **THEN** 期望结果
- **AND** 额外条件
```

### 必要元素

1. ✅ **Delta sections**: `## ADDED/MODIFIED/REMOVED Requirements`
2. ✅ **Requirement blocks**: `### Requirement: 名称`
3. ✅ **Scenario blocks**: `#### Scenario: 名称`
4. ✅ **MUST/SHALL 关键字**: 每个 Requirement 必须包含
5. ✅ **Gherkin 语法**: `**WHEN**`, `**THEN**`, `**AND**`

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/new-feature`)
3. 提交变更 (`git commit -am 'Add new feature'`)
4. 推送到分支 (`git push origin feature/new-feature`)
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](../../LICENSE) 文件

## 🔗 相关链接

- [OpenSpec 官方文档](https://openspec.dev)
- [GitHub 仓库](https://github.com/org-hex/openspec-chinese)
- [问题反馈](https://github.com/org-hex/openspec-chinese/issues)

---

**OpenSpec 中文版本** - 让规范驱动开发更适合中文团队
