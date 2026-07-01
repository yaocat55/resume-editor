// Re-export shared code
export { populateShadowDOM, fmtDate } from './shared'

// Re-export classic template
export { type StoredTemplate, defaultTemplateHTML, defaultTemplateMeta, defaultTemplate } from './classic'

// Re-export M3 template
export { m3TemplateHTML, m3TemplateMeta, m3Template } from './m3'

// Re-export VS Code template
export { vscodeTemplateHTML, vscodeTemplateMeta, vscodeTemplate } from './vscode'

// Re-export GitHub template
export { githubTemplateHTML, githubTemplateMeta, githubTemplate } from './github'

// Re-export Minimal template
export { minimalTemplateHTML, minimalTemplateMeta, minimalTemplate } from './minimal'

// Re-export Academic template
export { academicTemplateHTML, academicTemplateMeta, academicTemplate } from './academic'

// Re-export Creative template
export { creativeTemplateHTML, creativeTemplateMeta, creativeTemplate } from './creative'

// Re-export Social template
export { socialTemplateHTML, socialTemplateMeta, socialTemplate } from './social'

// Re-export Bento template
export { bentoTemplateHTML, bentoTemplateMeta, bentoTemplate } from './bento'

// Re-export FDE template
export { fdeTemplateHTML, fdeTemplateMeta, fdeTemplate } from './fde'

// Built-in templates list
import { defaultTemplate } from './classic'
import { m3Template } from './m3'
import { vscodeTemplate } from './vscode'
import { githubTemplate } from './github'
import { minimalTemplate } from './minimal'
import { academicTemplate } from './academic'
import { creativeTemplate } from './creative'
import { socialTemplate } from './social'
import { bentoTemplate } from './bento'
import { fdeTemplate } from './fde'
import type { StoredTemplate } from './classic'

export const builtInTemplates: StoredTemplate[] = [
  defaultTemplate,
  m3Template,
  vscodeTemplate,
  githubTemplate,
  minimalTemplate,
  academicTemplate,
  creativeTemplate,
  socialTemplate,
  bentoTemplate,
  fdeTemplate,
]
