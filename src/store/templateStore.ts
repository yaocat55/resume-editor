import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { builtInTemplates, type StoredTemplate } from '../templates'
import { extractSections } from '../utils/templateEngine'

/** Known field paths used in the Resume data model (for template validation) */
const KNOWN_FIELDS = [
  'personal.fullName', 'personal.jobTitle', 'personal.phone', 'personal.email',
  'personal.location', 'personal.website', 'personal.github',
  'profile',
  'education.length', 'education.school', 'education.major', 'education.degree',
  'education.startDate', 'education.endDate', 'education.gpa', 'education.honors',
  'work.length', 'work.company', 'work.position', 'work.startDate', 'work.endDate',
  'work.description', 'work.achievements',
  'projects.length', 'projects.name', 'projects.role', 'projects.technologies',
  'projects.startDate', 'projects.endDate', 'projects.description',
  'projects.highlights', 'projects.githubUrl', 'projects.demoUrl',
  'skills.groups.length', 'skills.groups.name', 'skills.groups.items',
  'certificates.list', 'certificates.languages.name', 'certificates.languages.level',
]

export interface TemplateValidationResult {
  valid: boolean
  sections: string[]
  errors: string[]
  warnings: string[]
  unknownFields: string[]
}

interface TemplateStore {
  templates: StoredTemplate[]
  currentTemplateId: string | null

  setCurrentTemplate: (id: string) => void
  addTemplate: (template: Omit<StoredTemplate, 'id' | 'builtIn'>) => string
  removeTemplate: (id: string) => void
  getCurrentTemplate: () => StoredTemplate | undefined

  /** Validate uploaded template HTML and check field compatibility */
  validateTemplate: (html: string, meta?: { name?: string }) => TemplateValidationResult
}

function validateTemplateHtml(html: string): TemplateValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const unknownFields: string[] = []

  // Check basic HTML structure
  if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
    warnings.push('缺少 DOCTYPE 或 <html> 标签，可能导致渲染异常')
  }
  if (!html.includes('<style') && !html.includes('</style>')) {
    warnings.push('缺少 <style> 标签，模板可能没有样式')
  }

  // Extract data-section attributes
  const sections = extractSections(html)
  if (sections.length === 0) {
    errors.push('未找到 data-section 属性定义的容器区块')
  }

  const validSections = ['personal', 'profile', 'education', 'work', 'projects', 'skills', 'certificates']
  for (const section of sections) {
    if (!validSections.includes(section)) {
      warnings.push(`未知容器区块: "${section}"，渲染时可能被忽略`)
    }
  }

  // Extract placeholder fields
  const fieldRegex = /\{\{([\w.]+)\}\}/g
  const usesEachRegex = /\{\{#each\s+([\w.]+)\}\}/g
  const usesIfRegex = /\{\{#if\s+([\w.]+)\}\}/g

  const fields: string[] = []
  let match
  while ((match = fieldRegex.exec(html)) !== null) {
    const field = match[1]
    if (!field.startsWith('#') && !field.startsWith('/') && !field.startsWith('this.') && field !== '@index') {
      fields.push(field)
    }
  }

  const eachPaths: string[] = []
  while ((match = usesEachRegex.exec(html)) !== null) {
    eachPaths.push(match[1])
  }

  const ifPaths: string[] = []
  while ((match = usesIfRegex.exec(html)) !== null) {
    ifPaths.push(match[1])
  }

  // Check that #each arrays exist in data model
  for (const path of eachPaths) {
    if (!KNOWN_FIELDS.includes(path) && !KNOWN_FIELDS.some(kf => kf.startsWith(path + '.'))) {
      if (!['education', 'work', 'projects'].includes(path)) {
        warnings.push(`"#each ${path}" — 未知的数组字段`)
      }
    }
  }

  // Check unknown fields
  for (const field of fields) {
    if (!KNOWN_FIELDS.includes(field) && !ifPaths.includes(field)) {
      unknownFields.push(field)
    }
  }

  if (unknownFields.length > 0) {
    warnings.push(`发现未知字段: ${unknownFields.slice(0, 5).join(', ')}${unknownFields.length > 5 ? '...' : ''}`)
  }

  return {
    valid: errors.length === 0,
    sections,
    errors,
    warnings,
    unknownFields,
  }
}

const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: [...builtInTemplates],
      currentTemplateId: '__default__',

      setCurrentTemplate: (id) => {
        const exists = get().templates.find((t) => t.id === id)
        if (exists) set({ currentTemplateId: id })
      },

      addTemplate: (template) => {
        const id = uuidv4()
        const newTemplate: StoredTemplate = { ...template, id, builtIn: false }
        set((state) => ({
          templates: [...state.templates, newTemplate],
          currentTemplateId: id,
        }))
        return id
      },

      removeTemplate: (id) => {
        set((state) => {
          const tpl = state.templates.find((t) => t.id === id)
          if (tpl?.builtIn) return state // Cannot remove built-in
          const firstBuiltIn = state.templates.find((t) => t.builtIn)
          return {
            templates: state.templates.filter((t) => t.id !== id),
            currentTemplateId:
              state.currentTemplateId === id
                ? (firstBuiltIn?.id || '__default__')
                : state.currentTemplateId,
          }
        })
      },

      getCurrentTemplate: () => {
        const state = get()
        return state.templates.find((t) => t.id === state.currentTemplateId)
      },

      validateTemplate: (html, meta) => validateTemplateHtml(html),
    }),
    {
      name: 'resume-templates',
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as object) } as any
        // Always override built-in templates with latest source
        merged.templates = [
          ...builtInTemplates,
          ...((merged.templates || []) as StoredTemplate[]).filter((t: StoredTemplate) => !t.builtIn),
        ]
        return merged
      },
    }
  )
)

export { validateTemplateHtml }
export default useTemplateStore
