import { OPENSPEC_DIR_NAME, OPENSPEC_MARKERS, OpenSpecConfig, AIToolOption } from './config.js';

// Re-export original constants and interfaces
export { OPENSPEC_DIR_NAME, OPENSPEC_MARKERS, OpenSpecConfig, AIToolOption };

// Chinese-specific constants
export const OPENSPEC_CHINESE_DIR_NAME = 'openspec';

export const OPENSPEC_CHINESE_MARKERS = {
  start: '<!-- OPENSPEC:START -->',
  end: '<!-- OPENSPEC:END -->'
};

export interface OpenSpecChineseConfig extends OpenSpecConfig {
  language?: 'zh';
}

export interface AIToolChineseOption extends AIToolOption {
  chineseName?: string;
}

export const AI_TOOLS_CHINESE: AIToolChineseOption[] = [
  { name: 'Auggie (Augment CLI)', value: 'auggie', available: true, successLabel: 'Auggie', chineseName: 'Auggie增强CLI' },
  { name: 'Claude Code', value: 'claude', available: true, successLabel: 'Claude Code', chineseName: 'Claude代码助手' },
  { name: 'Cline', value: 'cline', available: true, successLabel: 'Cline', chineseName: 'Cline智能助手' },
  { name: 'RooCode', value: 'roocode', available: true, successLabel: 'RooCode', chineseName: 'RooCode开发助手' },
  { name: 'CodeBuddy Code (CLI)', value: 'codebuddy', available: true, successLabel: 'CodeBuddy Code', chineseName: 'CodeBuddy编程伙伴' },
  { name: 'CoStrict', value: 'costrict', available: true, successLabel: 'CoStrict', chineseName: 'CoStrict严格开发' },
  { name: 'Crush', value: 'crush', available: true, successLabel: 'Crush', chineseName: 'Crush高效开发' },
  { name: 'Cursor', value: 'cursor', available: true, successLabel: 'Cursor', chineseName: 'Cursor智能编辑器' },
  { name: 'Factory Droid', value: 'factory', available: true, successLabel: 'Factory Droid', chineseName: 'Factory Droid工厂助手' },
  { name: 'Gemini CLI', value: 'gemini', available: true, successLabel: 'Gemini CLI', chineseName: 'Gemini命令行工具' },
  { name: 'OpenCode', value: 'opencode', available: true, successLabel: 'OpenCode', chineseName: 'OpenCode开源助手' },
  { name: 'Kilo Code', value: 'kilocode', available: true, successLabel: 'Kilo Code', chineseName: 'Kilo Code千行代码' },
  { name: 'Qoder (CLI)', value: 'qoder', available: true, successLabel: 'Qoder', chineseName: 'Qoder编码助手' },
  { name: 'Windsurf', value: 'windsurf', available: true, successLabel: 'Windsurf', chineseName: 'Windsurf冲浪编程' },
  { name: 'Codex', value: 'codex', available: true, successLabel: 'Codex', chineseName: 'Codex代码生成' },
  { name: 'GitHub Copilot', value: 'github-copilot', available: true, successLabel: 'GitHub Copilot', chineseName: 'GitHub智能编程伙伴' },
  { name: 'Amazon Q Developer', value: 'amazon-q', available: true, successLabel: 'Amazon Q Developer', chineseName: '亚马逊Q开发者' },
  { name: 'Qwen Code', value: 'qwen', available: true, successLabel: 'Qwen Code', chineseName: '通义代码助手' },
  { name: 'AGENTS.md (works with Amp, VS Code, …)', value: 'agents', available: false, successLabel: 'your AGENTS.md-compatible assistant', chineseName: 'AGENTS.md兼容助手（适用于Amp、VS Code等）' }
];

// Helper function to get Chinese name if available
export function getChineseToolName(toolValue: string): string {
  const tool = AI_TOOLS_CHINESE.find(t => t.value === toolValue);
  return tool?.chineseName || tool?.name || toolValue;
}