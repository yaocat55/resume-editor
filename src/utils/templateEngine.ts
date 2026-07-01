import type { Resume } from '../types/resume'

/**
 * Get a nested value from an object using dot notation path.
 */
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.')
  let current = obj
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = current[key]
  }
  return current
}

/**
 * Check truthiness of a path expression.
 */
function evaluateCondition(expr: string, data: Resume, loopContext?: any): boolean {
  const trimmed = expr.trim()

  // Handle this.field inside each blocks
  if (trimmed.startsWith('this.')) {
    if (!loopContext) return false
    const val = getNestedValue(loopContext, trimmed.slice(5))
    return val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)
  }

  // Handle bare 'this' — current item exists
  if (trimmed === 'this') {
    return loopContext !== undefined && loopContext !== null
  }

  // Handle length checks like education.length
  if (trimmed.includes('.length')) {
    const basePath = trimmed.replace('.length', '')
    const val = getNestedValue(data, basePath)
    return Array.isArray(val) && val.length > 0
  }

  const val = getNestedValue(data, trimmed)
  return val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)
}

/**
 * Replace {{field}} / {{this.field}} with values.
 */
function replaceFields(text: string, data: Resume, loopContext?: any): string {
  return text.replace(/\{\{([\w.]+)\}\}/g, (_match, path: string) => {
    // Skip directives
    if (path.startsWith('#') || path.startsWith('/')) return _match

    if (path === 'this') {
      return loopContext !== undefined && loopContext !== null ? String(loopContext) : ''
    }

    if (path.startsWith('this.')) {
      if (!loopContext) return ''
      const val = getNestedValue(loopContext, path.slice(5))
      return val !== undefined && val !== null ? String(val) : ''
    }

    if (path === '@index') return '' // handled per-item
    const val = getNestedValue(data, path)
    return val !== undefined && val !== null ? String(val) : ''
  })
}

/**
 * Process {{#if}} / {{/if}} conditionals with nesting support.
 * Uses depth counting to find the matching closing tag.
 */
function processConditionals(text: string, data: Resume, loopContext?: any): string {
  const startRe = /\{\{#if\s+([\w.]+)\}\}/g
  let result = text
  let match: RegExpExecArray | null
  startRe.lastIndex = 0

  while ((match = startRe.exec(result)) !== null) {
    const startIdx = match.index
    const tagLen = match[0].length
    const path = match[1]

    // Find matching {{/if}} by counting depth
    const scanRe = /\{\{#if\s+([\w.]+)\}\}|\{\{\/if\}\}/g
    scanRe.lastIndex = startIdx + tagLen
    let depth = 1
    let endIdx = -1
    let scanMatch: RegExpExecArray | null
    while ((scanMatch = scanRe.exec(result)) !== null) {
      if (scanMatch[1] !== undefined) {
        depth++
      } else {
        depth--
        if (depth === 0) {
          endIdx = scanMatch.index
          break
        }
      }
    }
    if (endIdx === -1) break

    const inner = result.slice(startIdx + tagLen, endIdx)
    const ifLen = endIdx + 8 - startIdx

    if (evaluateCondition(path, data, loopContext)) {
      let rendered = replaceFields(inner, data, loopContext)
      rendered = processConditionals(rendered, data, loopContext)
      result = result.slice(0, startIdx) + rendered + result.slice(endIdx + 8)
      startRe.lastIndex = startIdx + rendered.length
    } else {
      result = result.slice(0, startIdx) + result.slice(endIdx + 8)
      startRe.lastIndex = startIdx
    }
  }

  return result
}

/**
 * Process {{#each}}...{{/each}} blocks with proper nesting support.
 * Uses depth counting to find the matching closing tag.
 */
function processEachBlocks(text: string, data: Resume, loopContext?: any): string {
  const startRe = /\{\{#each\s+([\w.]+)\}\}/g
  let result = text
  let match: RegExpExecArray | null

  // Reset lastIndex
  startRe.lastIndex = 0

  while ((match = startRe.exec(result)) !== null) {
    const startIdx = match.index
    const tagLen = match[0].length
    const path = match[1]

    // Find matching {{/each}} by counting nesting depth
    const scanRe = /\{\{#each\s+([\w.]+)\}\}|\{\{\/each\}\}/g
    scanRe.lastIndex = startIdx + tagLen
    let depth = 1
    let endIdx = -1
    let scanMatch: RegExpExecArray | null

    while ((scanMatch = scanRe.exec(result)) !== null) {
      if (scanMatch[1] !== undefined) {
        depth++ // nested #each open
      } else {
        depth-- // #each close
        if (depth === 0) {
          endIdx = scanMatch.index
          break
        }
      }
    }

    if (endIdx === -1) break // unbalanced — stop

    const inner = result.slice(startIdx + tagLen, endIdx)

    // Resolve items array
    let items: any[] = []
    if (path.startsWith('this.')) {
      if (loopContext) {
        const arr = getNestedValue(loopContext, path.slice(5))
        if (Array.isArray(arr)) items = arr
      }
    } else {
      const arr = getNestedValue(data, path)
      if (Array.isArray(arr)) items = arr
    }

    if (items.length === 0) {
      // Remove the whole block
      result = result.slice(0, startIdx) + result.slice(endIdx + 8)
      startRe.lastIndex = startIdx
      continue
    }

    // Render each item
    const rendered = items.map((item: any, idx: number) => {
      let content = inner

      // Recursively process nested #each first
      content = processEachBlocks(content, data, item)

      // Process conditionals
      content = processConditionals(content, data, item)

      // Replace {{@index}}
      content = content.replace(/\{\{@index\}\}/g, String(idx))

      // Replace all field references with the item context
      content = replaceFields(content, data, item)

      return content
    }).join('\n')

    result = result.slice(0, startIdx) + rendered + result.slice(endIdx + 8)
    startRe.lastIndex = startIdx + rendered.length
  }

  return result
}

/**
 * Main entry: render template string with resume data.
 */
export function renderTemplate(template: string, data: Resume): string {
  let result = template

  // 1. Process {{#each}} ... {{/each}} (outermost first, handles nesting recursively)
  result = processEachBlocks(result, data)

  // 2. Process {{#if}} ... {{/if}} conditionals
  result = processConditionals(result, data)

  // 3. Replace any remaining {{field}} placeholders
  result = replaceFields(result, data)

  return result
}

/**
 * Extract section names from a template by looking for data-section attributes.
 */
export function extractSections(template: string): string[] {
  const sectionRegex = /data-section=["']([\w-]+)["']/g
  const sections: string[] = []
  let match
  while ((match = sectionRegex.exec(template)) !== null) {
    if (!sections.includes(match[1])) {
      sections.push(match[1])
    }
  }
  return sections
}
