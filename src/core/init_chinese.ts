import path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';
import {
  createPrompt,
  isBackspaceKey,
  isDownKey,
  isEnterKey,
  isSpaceKey,
  isUpKey,
  useKeypress,
  usePagination,
  useState,
} from '@inquirer/core';
import chalk from 'chalk';
import ora from 'ora';
import { FileSystemUtils } from '../utils/file-system.js';
import { transformToHyphenCommands } from '../utils/command-references.js';
import {
  OpenSpecConfig,
  AI_TOOLS,
  OPENSPEC_DIR_NAME,
  AIToolOption,
} from './config.js';
import { PALETTE } from './styles/palette.js';
import { serializeConfig } from './config-prompts.js';
import {
  generateCommands,
  CommandAdapterRegistry,
} from './command-generation/index.js';
import {
  detectLegacyArtifacts,
  cleanupLegacyArtifacts,
  formatCleanupSummary,
  formatDetectionSummary,
  type LegacyDetectionResult,
} from './legacy-cleanup.js';
import {
  generateSkillContent,
  getToolStates,
} from './shared/index.js';
import {
  getSkillTemplatesChinese,
  getCommandContentsChinese,
} from './shared/skill-generation_chinese.js';
import { isInteractive } from '../utils/interactive.js';
import { getChineseToolName } from './config_chinese.js';

const require = createRequire(import.meta.url);
const { version: OPENSPEC_VERSION } = require('../../package.json');

const PROGRESS_SPINNER = {
  interval: 80,
  frames: ['░░░', '▒░░', '▒▒░', '▒▒▒', '▓▒▒', '▓▓▒', '▓▓▓', '▒▓▓', '░▒▓'],
};

const DEFAULT_SCHEMA = 'spec-driven';

const LETTER_MAP: Record<string, string[]> = {
  O: [' ████ ', '██  ██', '██  ██', '██  ██', ' ████ '],
  P: ['█████ ', '██  ██', '█████ ', '██    ', '██    '],
  E: ['██████', '██    ', '█████ ', '██    ', '██████'],
  N: ['██  ██', '███ ██', '██ ███', '██  ██', '██  ██'],
  S: [' █████', '██    ', ' ████ ', '    ██', '█████ '],
  C: [' █████', '██    ', '██    ', '██    ', ' █████'],
  ' ': ['  ', '  ', '  ', '  ', '  '],
};

type ToolLabel = {
  primary: string;
  annotation?: string;
};

const sanitizeToolLabel = (raw: string): string =>
  raw.replace(/✅/gu, '✔').trim();

const parseToolLabel = (raw: string): ToolLabel => {
  const sanitized = sanitizeToolLabel(raw);
  const match = sanitized.match(/^(.*?)\s*\((.+)\)$/u);
  if (!match) {
    return { primary: sanitized };
  }
  return {
    primary: match[1].trim(),
    annotation: match[2].trim(),
  };
};

const isSelectableChoice = (
  choice: ToolWizardChoice
): choice is Extract<ToolWizardChoice, { selectable: true }> => choice.selectable;

type ToolWizardChoice =
  | {
      kind: 'heading' | 'info';
      value: string;
      label: ToolLabel;
      selectable: false;
    }
  | {
      kind: 'option';
      value: string;
      label: ToolLabel;
      configured: boolean;
      selectable: true;
    };

type ToolWizardConfig = {
  extendMode: boolean;
  baseMessage: string;
  choices: ToolWizardChoice[];
  initialSelected?: string[];
};

type WizardStep = 'intro' | 'select' | 'review';

type ToolSelectionPrompt = (config: ToolWizardConfig) => Promise<string[]>;


const toolSelectionWizard = createPrompt<string[], ToolWizardConfig>(
  (config, done) => {
    const totalSteps = 3;
    const [step, setStep] = useState<WizardStep>('intro');
    const selectableChoices = config.choices.filter(isSelectableChoice);
    const initialCursorIndex = config.choices.findIndex((choice) =>
      choice.selectable
    );
    const [cursor, setCursor] = useState<number>(
      initialCursorIndex === -1 ? 0 : initialCursorIndex
    );
    const [selected, setSelected] = useState<string[]>(() => {
      const initial = new Set(
        (config.initialSelected ?? []).filter((value) =>
          selectableChoices.some((choice) => choice.value === value)
        )
      );
      return selectableChoices
        .map((choice) => choice.value)
        .filter((value) => initial.has(value));
    });
    const [error, setError] = useState<string | null>(null);

    const selectedSet = new Set(selected);
    const pageSize = Math.max(config.choices.length, 1);

    const updateSelected = (next: Set<string>) => {
      const ordered = selectableChoices
        .map((choice) => choice.value)
        .filter((value) => next.has(value));
      setSelected(ordered);
    };

    const page = usePagination({
      items: config.choices,
      active: cursor,
      pageSize,
      loop: false,
      renderItem: ({ item, isActive }) => {
        if (!item.selectable) {
          const prefix = item.kind === 'info' ? '  ' : '';
          const textColor =
            item.kind === 'heading' ? PALETTE.lightGray : PALETTE.midGray;
          return `${PALETTE.midGray(' ')} ${PALETTE.midGray(' ')} ${textColor(
            `${prefix}${item.label.primary}`
          )}`;
        }

        const isSelected = selectedSet.has(item.value);
        const cursorSymbol = isActive
          ? PALETTE.white('›')
          : PALETTE.midGray(' ');
        const indicator = isSelected
          ? PALETTE.white('◉')
          : PALETTE.midGray('○');
        const nameColor = isActive ? PALETTE.white : PALETTE.midGray;
        const annotation = item.label.annotation
          ? PALETTE.midGray(` (${item.label.annotation})`)
          : '';
        const configuredNote = item.configured
          ? PALETTE.midGray(' (already configured)')
          : '';
        const label = `${nameColor(item.label.primary)}${annotation}${configuredNote}`;
        return `${cursorSymbol} ${indicator} ${label}`;
      },
    });

    const moveCursor = (direction: 1 | -1) => {
      if (selectableChoices.length === 0) {
        return;
      }

      let nextIndex = cursor;
      while (true) {
        nextIndex = nextIndex + direction;
        if (nextIndex < 0 || nextIndex >= config.choices.length) {
          return;
        }

        if (config.choices[nextIndex]?.selectable) {
          setCursor(nextIndex);
          return;
        }
      }
    };

    useKeypress((key) => {
      if (step === 'intro') {
        if (isEnterKey(key)) {
          setStep('select');
        }
        return;
      }

      if (step === 'select') {
        if (isUpKey(key)) {
          moveCursor(-1);
          setError(null);
          return;
        }

        if (isDownKey(key)) {
          moveCursor(1);
          setError(null);
          return;
        }

        if (isSpaceKey(key)) {
          const current = config.choices[cursor];
          if (!current || !current.selectable) return;

          const next = new Set(selected);
          if (next.has(current.value)) {
            next.delete(current.value);
          } else {
            next.add(current.value);
          }

          updateSelected(next);
          setError(null);
          return;
        }

        if (isEnterKey(key)) {
          const current = config.choices[cursor];
          if (
            current &&
            current.selectable &&
            !selectedSet.has(current.value)
          ) {
            const next = new Set(selected);
            next.add(current.value);
            updateSelected(next);
          }
          setStep('review');
          setError(null);
          return;
        }

        if (key.name === 'escape') {
          const next = new Set<string>();
          updateSelected(next);
          setError(null);
        }
        return;
      }

      if (step === 'review') {
        if (isEnterKey(key)) {
          const finalSelection = config.choices
            .map((choice) => choice.value)
            .filter((value) => selectedSet.has(value));
          done(finalSelection);
          return;
        }

        if (isBackspaceKey(key) || key.name === 'escape') {
          setStep('select');
          setError(null);
        }
      }
    });

    const selectedChoices = selectableChoices.filter((choice) =>
      selectedSet.has(choice.value)
    );

    const formatSummaryLabel = (
      choice: Extract<ToolWizardChoice, { selectable: true }>
    ) => {
      const annotation = choice.label.annotation
        ? PALETTE.midGray(` (${choice.label.annotation})`)
        : '';
      const configuredNote = choice.configured
        ? PALETTE.midGray('（已配置）')
        : '';
      return `${PALETTE.white(choice.label.primary)}${annotation}${configuredNote}`;
    };

    const stepIndex = step === 'intro' ? 1 : step === 'select' ? 2 : 3;
    const lines: string[] = [];
    lines.push(PALETTE.midGray(`Step ${stepIndex}/${totalSteps}`));
    lines.push('');

    if (step === 'intro') {
      const introHeadline = config.extendMode
        ? '扩展您的OpenSpec工具配置'
        : '配置您的OpenSpec工具';
      const introBody = config.extendMode
        ? '我们检测到现有的设置。我们将帮助您刷新或添加集成。'
        : '让我们连接您的AI助手，以便它们理解OpenSpec。';

      lines.push(PALETTE.white(introHeadline));
      lines.push(PALETTE.midGray(introBody));
      lines.push('');
      lines.push(PALETTE.midGray('按 Enter 继续。'));
    } else if (step === 'select') {
      lines.push(PALETTE.white(config.baseMessage));
      lines.push(
        PALETTE.midGray(
          '使用 ↑/↓ 移动 · Space 切换 · Enter 选择高亮工具并查看。'
        )
      );
      lines.push('');
      lines.push(page);
      lines.push('');
      lines.push(PALETTE.midGray('选定的配置:'));
      if (selectedChoices.length === 0) {
        lines.push(
          `  ${PALETTE.midGray('- 未选择任何工具')}`
        );
      } else {
        selectedChoices.forEach((choice) => {
          lines.push(
            `  ${PALETTE.white('-')} ${formatSummaryLabel(choice)}`
          );
        });
      }
    } else {
      lines.push(PALETTE.white('检查选择'));
      lines.push(
        PALETTE.midGray('按 Enter 确认或 Backspace 调整。')
      );
      lines.push('');

      if (selectedChoices.length === 0) {
        lines.push(
          PALETTE.midGray('未选择任何工具。可稍后再次运行 init 配置。')
        );
      } else {
        selectedChoices.forEach((choice) => {
          lines.push(
            `${PALETTE.white('▌')} ${formatSummaryLabel(choice)}`
          );
        });
      }
    }

    if (error) {
      return [lines.join('\n'), chalk.red(error)];
    }

    return lines.join('\n');
  }
);

type InitCommandChineseOptions = {
  prompt?: ToolSelectionPrompt;
  tools?: string;
};

export class InitCommandChinese {
  private readonly prompt: ToolSelectionPrompt;
  private readonly toolsArg?: string;

  constructor(options: InitCommandChineseOptions = {}) {
    this.prompt = options.prompt ?? ((config) => toolSelectionWizard(config));
    this.toolsArg = options.tools;
  }

  async execute(targetPath: string): Promise<void> {
    const projectPath = path.resolve(targetPath);
    const openspecDir = OPENSPEC_DIR_NAME;
    const openspecPath = path.join(projectPath, openspecDir);

    // Validation happens silently in the background
    const extendMode = await this.validate(projectPath, openspecPath);

    // Legacy cleanup (skills workflow)
    await this.handleLegacyCleanup(projectPath);

    const existingToolStates = await this.getExistingToolStates(projectPath, extendMode);

    this.renderBanner(extendMode);

    // Get configuration (after validation to avoid prompts if validation fails)
    const config = await this.getConfiguration(existingToolStates, extendMode);

    const availableTools = AI_TOOLS.filter((tool) => tool.available && tool.skillsDir);
    const selectedIds = new Set(config.aiTools);
    const selectedTools = availableTools.filter((tool) =>
      selectedIds.has(tool.value)
    );
    // Step 1: Create directory structure
    if (!extendMode) {
      const structureSpinner = this.startSpinner(
        '正在创建OpenSpec结构...'
      );
      await this.createDirectoryStructure(openspecPath);
      structureSpinner.stopAndPersist({
        symbol: PALETTE.white('▌'),
        text: PALETTE.white('OpenSpec结构已创建'),
      });
    } else {
      ora({ stream: process.stdout }).info(
        PALETTE.midGray(
          'ℹ OpenSpec已初始化。正在检查缺失的目录...'
        )
      );
      await this.createDirectoryStructure(openspecPath);
    }

    // Step 2: Generate skills and commands
    const toolEntries = selectedTools.map((tool) => ({
      value: tool.value,
      name: getChineseToolName(tool.value),
      skillsDir: tool.skillsDir as string,
      wasConfigured: Boolean(existingToolStates[tool.value]),
    }));

    const results = await this.generateSkillsAndCommands(projectPath, toolEntries);

    // Step 3: Create config.yaml if needed
    const configStatus = await this.createConfig(openspecPath);

    // Success message
    this.displaySuccessMessage(projectPath, toolEntries, results, configStatus);
  }

  private async validate(
    projectPath: string,
    _openspecPath: string
  ): Promise<boolean> {
    const extendMode = await FileSystemUtils.directoryExists(_openspecPath);

    // Check write permissions
    if (!(await FileSystemUtils.ensureWritePermissions(projectPath))) {
      throw new Error(`写入权限不足: ${projectPath}`);
    }
    return extendMode;
  }

  private canPromptInteractively(): boolean {
    if (this.toolsArg !== undefined) return false;
    return isInteractive();
  }

  private async handleLegacyCleanup(projectPath: string): Promise<void> {
    const detection = await detectLegacyArtifacts(projectPath);

    if (!detection.hasLegacyArtifacts) {
      return;
    }

    console.log();
    console.log(formatDetectionSummary(detection));
    console.log();

    const canPrompt = this.canPromptInteractively();
    if (!canPrompt) {
      console.log(chalk.red('检测到旧版文件，但当前为非交互模式。'));
      console.log(chalk.dim('请在交互模式运行，或手动清理旧版文件后再试。'));
      process.exit(1);
    }

    const { confirm } = await import('@inquirer/prompts');
    const shouldCleanup = await confirm({
      message: '检测到旧版文件，是否升级并清理？',
      default: true,
    });

    if (!shouldCleanup) {
      console.log(chalk.dim('已取消初始化。'));
      console.log(chalk.dim('如需跳过此提示，请先手动清理旧版文件。'));
      process.exit(0);
    }

    await this.performLegacyCleanup(projectPath, detection);
  }

  private async performLegacyCleanup(
    projectPath: string,
    detection: LegacyDetectionResult
  ): Promise<void> {
    const spinner = ora('正在清理旧版文件...').start();
    const result = await cleanupLegacyArtifacts(projectPath, detection);
    spinner.succeed('旧版文件已清理');
    console.log();
    console.log(formatCleanupSummary(result));
  }

  private async getConfiguration(
    existingTools: Record<string, boolean>,
    extendMode: boolean
  ): Promise<OpenSpecConfig> {
    const selectedTools = await this.getSelectedTools(existingTools, extendMode);
    return { aiTools: selectedTools };
  }

  private async getSelectedTools(
    existingTools: Record<string, boolean>,
    extendMode: boolean
  ): Promise<string[]> {
    const nonInteractiveSelection = this.resolveToolsArg();
    if (nonInteractiveSelection !== null) {
      return nonInteractiveSelection;
    }

    // Fall back to interactive mode
    return this.promptForAITools(existingTools, extendMode);
  }

  private resolveToolsArg(): string[] | null {
    if (typeof this.toolsArg === 'undefined') {
      return null;
    }

    const raw = this.toolsArg.trim();
    if (raw.length === 0) {
      throw new Error(
        '--tools 选项需要一个值。使用 "all"、"none" 或逗号分隔的工具ID列表。'
      );
    }

    const availableTools = AI_TOOLS.filter((tool) => tool.available && tool.skillsDir);
    const availableValues = availableTools.map((tool) => tool.value);
    const availableSet = new Set(availableValues);
    const availableList = ['all', 'none', ...availableValues].join(', ');

    const lowerRaw = raw.toLowerCase();
    if (lowerRaw === 'all') {
      return availableValues;
    }

    if (lowerRaw === 'none') {
      return [];
    }

    const tokens = raw
      .split(',')
      .map((token) => token.trim())
      .filter((token) => token.length > 0);

    if (tokens.length === 0) {
      throw new Error(
        '当不使用 "all" 或 "none" 时，--tools 选项至少需要一个工具ID。'
      );
    }

    const normalizedTokens = tokens.map((token) => token.toLowerCase());

    if (normalizedTokens.some((token) => token === 'all' || token === 'none')) {
      throw new Error('不能将保留值 "all" 或 "none" 与特定工具ID结合使用。');
    }

    const invalidTokens = tokens.filter(
      (_token, index) => !availableSet.has(normalizedTokens[index])
    );

    if (invalidTokens.length > 0) {
      throw new Error(
        `无效工具: ${invalidTokens.join(', ')}。可用值: ${availableList}`
      );
    }

    const deduped: string[] = [];
    for (const token of normalizedTokens) {
      if (!deduped.includes(token)) {
        deduped.push(token);
      }
    }

    return deduped;
  }

  private async promptForAITools(
    existingTools: Record<string, boolean>,
    extendMode: boolean
  ): Promise<string[]> {
    const availableTools = AI_TOOLS.filter((tool) => tool.available && tool.skillsDir);

    const baseMessage = extendMode
      ? '您想要添加或刷新哪些原生支持的AI工具？'
      : '您使用哪些原生支持的AI工具？';
    const initialNativeSelection = extendMode
      ? availableTools
          .filter((tool) => existingTools[tool.value])
          .map((tool) => tool.value)
      : [];

    const initialSelected = Array.from(new Set(initialNativeSelection));

    const choices: ToolWizardChoice[] = [
      {
        kind: 'heading',
        value: '__heading-native__',
        label: {
          primary:
            '原生支持的提供商 (✔ OpenSpec 自定义斜杠命令可用)',
        },
        selectable: false,
      },
      ...availableTools.map<ToolWizardChoice>((tool) => ({
        kind: 'option',
        value: tool.value,
        label: parseToolLabel(getChineseToolName(tool.value)),
        configured: Boolean(existingTools[tool.value]),
        selectable: true,
      })),
    ];

    return this.prompt({
      extendMode,
      baseMessage,
      choices,
      initialSelected,
    });
  }

  private async getExistingToolStates(
    projectPath: string,
    extendMode: boolean
  ): Promise<Record<string, boolean>> {
    // Fresh initialization - no tools configured yet
    if (!extendMode) {
      return Object.fromEntries(AI_TOOLS.map(t => [t.value, false]));
    }

    const toolStates = getToolStates(projectPath);
    return Object.fromEntries(
      AI_TOOLS.map((t) => [t.value, toolStates.get(t.value)?.configured ?? false])
    );
  }

  private async createDirectoryStructure(openspecPath: string): Promise<void> {
    const directories = [
      openspecPath,
      path.join(openspecPath, 'specs'),
      path.join(openspecPath, 'changes'),
      path.join(openspecPath, 'changes', 'archive'),
    ];

    for (const dir of directories) {
      await FileSystemUtils.createDirectory(dir);
    }
  }

  private async createConfig(
    openspecPath: string
  ): Promise<'created' | 'exists' | 'skipped'> {
    const configPath = path.join(openspecPath, 'config.yaml');
    const configYmlPath = path.join(openspecPath, 'config.yml');
    const configYamlExists = fs.existsSync(configPath);
    const configYmlExists = fs.existsSync(configYmlPath);

    if (configYamlExists || configYmlExists) {
      return 'exists';
    }

    try {
      const yamlContent = serializeConfig({ schema: DEFAULT_SCHEMA });
      await FileSystemUtils.writeFile(configPath, yamlContent);
      return 'created';
    } catch {
      return 'skipped';
    }
  }

  private async generateSkillsAndCommands(
    projectPath: string,
    tools: Array<{ value: string; name: string; skillsDir: string; wasConfigured: boolean }>
  ): Promise<{
    createdTools: typeof tools;
    refreshedTools: typeof tools;
    failedTools: Array<{ name: string; error: Error }>;
    commandsSkipped: string[];
  }> {
    const createdTools: typeof tools = [];
    const refreshedTools: typeof tools = [];
    const failedTools: Array<{ name: string; error: Error }> = [];
    const commandsSkipped: string[] = [];

    const skillTemplates = getSkillTemplatesChinese();
    const commandContents = getCommandContentsChinese();

    for (const tool of tools) {
      const spinner = ora(`正在配置 ${tool.name}...`).start();

      try {
        const skillsDir = path.join(projectPath, tool.skillsDir, 'skills');

        for (const { template, dirName } of skillTemplates) {
          const skillDir = path.join(skillsDir, dirName);
          const skillFile = path.join(skillDir, 'SKILL.md');

          const transformer = tool.value === 'opencode' ? transformToHyphenCommands : undefined;
          const skillContent = generateSkillContent(template, OPENSPEC_VERSION, transformer);
          await FileSystemUtils.writeFile(skillFile, skillContent);
        }

        const adapter = CommandAdapterRegistry.get(tool.value);
        if (adapter) {
          const generatedCommands = generateCommands(commandContents, adapter);
          for (const cmd of generatedCommands) {
            const commandFile = path.isAbsolute(cmd.path) ? cmd.path : path.join(projectPath, cmd.path);
            await FileSystemUtils.writeFile(commandFile, cmd.fileContent);
          }
        } else {
          commandsSkipped.push(tool.value);
        }

        spinner.succeed(`已完成 ${tool.name} 配置`);
        if (tool.wasConfigured) {
          refreshedTools.push(tool);
        } else {
          createdTools.push(tool);
        }
      } catch (error) {
        spinner.fail(`配置 ${tool.name} 失败`);
        failedTools.push({ name: tool.name, error: error as Error });
      }
    }

    return { createdTools, refreshedTools, failedTools, commandsSkipped };
  }

  private displaySuccessMessage(
    projectPath: string,
    tools: Array<{ value: string; name: string; skillsDir: string; wasConfigured: boolean }>,
    results: {
      createdTools: Array<{ value: string; name: string; skillsDir: string; wasConfigured: boolean }>;
      refreshedTools: Array<{ value: string; name: string; skillsDir: string; wasConfigured: boolean }>;
      failedTools: Array<{ name: string; error: Error }>;
      commandsSkipped: string[];
    },
    configStatus: 'created' | 'exists' | 'skipped'
  ): void {
    console.log();
    console.log(chalk.bold('OpenSpec 设置完成'));
    console.log();

    if (results.createdTools.length > 0) {
      console.log(`已创建: ${results.createdTools.map((t) => t.name).join('、')}`);
    }
    if (results.refreshedTools.length > 0) {
      console.log(`已刷新: ${results.refreshedTools.map((t) => t.name).join('、')}`);
    }

    const successfulTools = [...results.createdTools, ...results.refreshedTools];
    if (successfulTools.length > 0) {
      const toolDirs = [...new Set(successfulTools.map((t) => t.skillsDir))].join(', ');
      const hasCommands = results.commandsSkipped.length < successfulTools.length;
      if (hasCommands) {
        console.log(`${getSkillTemplatesChinese().length} 个技能、${getCommandContentsChinese().length} 个命令已写入 ${toolDirs}/`);
      } else {
        console.log(`${getSkillTemplatesChinese().length} 个技能已写入 ${toolDirs}/`);
      }
    }

    if (results.failedTools.length > 0) {
      console.log(chalk.red(`失败: ${results.failedTools.map((f) => `${f.name} (${f.error.message})`).join(', ')}`));
    }

    if (results.commandsSkipped.length > 0) {
      console.log(chalk.dim(`未生成命令: ${results.commandsSkipped.join(', ')} (无适配器)`));
    }

    if (configStatus === 'created') {
      console.log(`配置: openspec/config.yaml (schema: ${DEFAULT_SCHEMA})`);
    } else if (configStatus === 'exists') {
      const configYaml = path.join(projectPath, OPENSPEC_DIR_NAME, 'config.yaml');
      const configYml = path.join(projectPath, OPENSPEC_DIR_NAME, 'config.yml');
      const configName = fs.existsSync(configYaml) ? 'config.yaml' : fs.existsSync(configYml) ? 'config.yml' : 'config.yaml';
      console.log(`配置: openspec/${configName} (已存在)`);
    } else {
      console.log(chalk.dim('配置: 已跳过'));
    }

    console.log();
    console.log(chalk.bold('开始使用:'));
    console.log('  /opsx:new       创建变更');
    console.log('  /opsx:continue  继续生成产物');
    console.log('  /opsx:apply     实施任务');

    console.log();
    console.log(`了解更多: ${chalk.cyan('https://github.com/org-hex/openspec-chinese')}`);
    console.log(`反馈:   ${chalk.cyan('https://github.com/org-hex/openspec-chinese/issues')}`);

    if (successfulTools.length > 0) {
      console.log();
      console.log(chalk.white('如需斜杠命令生效，请重启你的 IDE。'));
    }

    // Codex heads-up: prompts installed globally
    const selectedToolIds = new Set(tools.map((t) => t.value));
    if (selectedToolIds.has('codex')) {
      console.log();
      console.log(PALETTE.white('Codex 设置说明'));
      console.log(
        PALETTE.midGray('提示已安装到 ~/.codex/prompts (或 $CODEX_HOME/prompts)。')
      );
    }

    console.log();
  }

  private renderBanner(_extendMode: boolean): void {
    const rows = ['', '', '', '', ''];
    for (const char of 'OPENSPEC') {
      const glyph = LETTER_MAP[char] ?? LETTER_MAP[' '];
      for (let i = 0; i < rows.length; i += 1) {
        rows[i] += `${glyph[i]}  `;
      }
    }

    const rowStyles = [
      PALETTE.white,
      PALETTE.lightGray,
      PALETTE.midGray,
      PALETTE.lightGray,
      PALETTE.white,
    ];

    console.log();
    rows.forEach((row, index) => {
      console.log(rowStyles[index](row.replace(/\s+$/u, '')));
    });
    console.log();
    console.log(PALETTE.white('欢迎使用OpenSpec中文版！'));
    console.log();
  }

  private startSpinner(text: string) {
    return ora({
      text,
      stream: process.stdout,
      color: 'gray',
      spinner: PROGRESS_SPINNER,
    }).start();
  }
}
