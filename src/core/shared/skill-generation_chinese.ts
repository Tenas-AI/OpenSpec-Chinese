/**
 * 技能生成工具（中文）
 *
 * 使用中文技能模板生成技能与命令文件。
 */

import {
  getExploreSkillTemplate,
  getNewChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getApplyChangeSkillTemplate,
  getFfChangeSkillTemplate,
  getSyncSpecsSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getVerifyChangeSkillTemplate,
  getOnboardSkillTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxNewCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxSyncCommandTemplate,
  getOpsxArchiveCommandTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getOpsxVerifyCommandTemplate,
  getOpsxOnboardCommandTemplate,
  type SkillTemplate,
} from '../templates_chinese/skill-templates.js';
import type { CommandContent } from '../command-generation/index.js';

/**
 * Skill template with directory name mapping.
 */
export interface SkillTemplateEntry {
  template: SkillTemplate;
  dirName: string;
}

/**
 * Command template with ID mapping.
 */
export interface CommandTemplateEntry {
  template: ReturnType<typeof getOpsxExploreCommandTemplate>;
  id: string;
}

/**
 * Gets all skill templates with their directory names.
 */
export function getSkillTemplatesChinese(): SkillTemplateEntry[] {
  return [
    { template: getExploreSkillTemplate(), dirName: 'openspec-explore' },
    { template: getNewChangeSkillTemplate(), dirName: 'openspec-new-change' },
    { template: getContinueChangeSkillTemplate(), dirName: 'openspec-continue-change' },
    { template: getApplyChangeSkillTemplate(), dirName: 'openspec-apply-change' },
    { template: getFfChangeSkillTemplate(), dirName: 'openspec-ff-change' },
    { template: getSyncSpecsSkillTemplate(), dirName: 'openspec-sync-specs' },
    { template: getArchiveChangeSkillTemplate(), dirName: 'openspec-archive-change' },
    { template: getBulkArchiveChangeSkillTemplate(), dirName: 'openspec-bulk-archive-change' },
    { template: getVerifyChangeSkillTemplate(), dirName: 'openspec-verify-change' },
    { template: getOnboardSkillTemplate(), dirName: 'openspec-onboard' },
  ];
}

/**
 * Gets all command templates with their IDs.
 */
export function getCommandTemplatesChinese(): CommandTemplateEntry[] {
  return [
    { template: getOpsxExploreCommandTemplate(), id: 'explore' },
    { template: getOpsxNewCommandTemplate(), id: 'new' },
    { template: getOpsxContinueCommandTemplate(), id: 'continue' },
    { template: getOpsxApplyCommandTemplate(), id: 'apply' },
    { template: getOpsxFfCommandTemplate(), id: 'ff' },
    { template: getOpsxSyncCommandTemplate(), id: 'sync' },
    { template: getOpsxArchiveCommandTemplate(), id: 'archive' },
    { template: getOpsxBulkArchiveCommandTemplate(), id: 'bulk-archive' },
    { template: getOpsxVerifyCommandTemplate(), id: 'verify' },
    { template: getOpsxOnboardCommandTemplate(), id: 'onboard' },
  ];
}

/**
 * Converts command templates to CommandContent array.
 */
export function getCommandContentsChinese(): CommandContent[] {
  const commandTemplates = getCommandTemplatesChinese();
  return commandTemplates.map(({ template, id }) => ({
    id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content,
  }));
}
