import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { createRequire } from 'module';
import { FileSystemUtils } from '../utils/file-system.js';
import { transformToHyphenCommands } from '../utils/command-references.js';
import { AI_TOOLS, OPENSPEC_DIR_NAME } from './config.js';
import {
  generateCommands,
  CommandAdapterRegistry,
} from './command-generation/index.js';
import {
  getConfiguredTools,
  generateSkillContent,
} from './shared/index.js';
import {
  getSkillTemplatesChinese,
  getCommandContentsChinese,
} from './shared/skill-generation_chinese.js';
import { getChineseToolName } from './config_chinese.js';

const require = createRequire(import.meta.url);
const { version: OPENSPEC_VERSION } = require('../../package.json');

export class UpdateCommandChinese {
  async execute(projectPath: string): Promise<void> {
    const resolvedProjectPath = path.resolve(projectPath);
    const openspecPath = path.join(resolvedProjectPath, OPENSPEC_DIR_NAME);

    // 1. Check openspec directory exists
    if (!await FileSystemUtils.directoryExists(openspecPath)) {
      throw new Error(`未找到OpenSpec目录。请先运行 'openspec-chinese init'。`);
    }

    // 2. Find configured tools
    const configuredTools = getConfiguredTools(resolvedProjectPath);
    if (configuredTools.length === 0) {
      console.log(chalk.yellow('未找到已配置的工具。'));
      console.log(chalk.dim('请运行 "openspec-chinese init" 进行配置。'));
      return;
    }

    const skillTemplates = getSkillTemplatesChinese();
    const commandContents = getCommandContentsChinese();
    const updatedTools: string[] = [];
    const failedTools: Array<{ name: string; error: string }> = [];
    const commandsSkipped: string[] = [];

    for (const toolId of configuredTools) {
      const tool = AI_TOOLS.find((t) => t.value === toolId);
      if (!tool?.skillsDir) continue;

      const toolName = getChineseToolName(toolId);
      const spinner = ora(`正在更新 ${toolName}...`).start();

      try {
        const skillsDir = path.join(resolvedProjectPath, tool.skillsDir, 'skills');

        // Update skill files
        for (const { template, dirName } of skillTemplates) {
          const skillDir = path.join(skillsDir, dirName);
          const skillFile = path.join(skillDir, 'SKILL.md');

          const transformer = toolId === 'opencode' ? transformToHyphenCommands : undefined;
          const skillContent = generateSkillContent(template, OPENSPEC_VERSION, transformer);
          await FileSystemUtils.writeFile(skillFile, skillContent);
        }

        // Update commands
        const adapter = CommandAdapterRegistry.get(toolId);
        if (adapter) {
          const generatedCommands = generateCommands(commandContents, adapter);
          for (const cmd of generatedCommands) {
            const commandFile = path.isAbsolute(cmd.path) ? cmd.path : path.join(resolvedProjectPath, cmd.path);
            await FileSystemUtils.writeFile(commandFile, cmd.fileContent);
          }
        } else {
          commandsSkipped.push(toolId);
        }

        spinner.succeed(`已更新 ${toolName}`);
        updatedTools.push(toolName);
      } catch (error) {
        spinner.fail(`更新 ${toolName} 失败`);
        failedTools.push({
          name: toolName,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    console.log();
    if (updatedTools.length > 0) {
      console.log(chalk.green(`✓ 已更新: ${updatedTools.join(', ')} (v${OPENSPEC_VERSION})`));
    }
    if (failedTools.length > 0) {
      console.log(chalk.red(`✗ 失败: ${failedTools.map((f) => `${f.name} (${f.error})`).join(', ')}`));
    }
    if (commandsSkipped.length > 0) {
      console.log(chalk.dim(`未生成命令: ${commandsSkipped.join(', ')} (无适配器)`));
    }
    console.log();
  }
}
