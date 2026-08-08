import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { Box, IconButton, Tooltip, Typography, Slider, ToggleButton } from '@mui/material'
import { Refresh as RefreshIcon, FileDownload as DownloadIcon, PictureAsPdf as PdfIcon, ContentCopy as CopyIcon, CropSquare as FitIcon, ViewDayOutlined as PagePreviewIcon } from '@mui/icons-material'
import useResumeStore from '../../store/resumeStore'
import useTemplateStore from '../../store/templateStore'
import { defaultTemplate, populateShadowDOM } from '../../templates'
import type { Resume } from '../../types/resume'

declare global {
  interface Window { electronAPI?: { exportPDF: (html: string) => Promise<boolean>; onMenuExportPDF: (cb: () => void) => void } }
}

function parseTemplateHTML(html: string): { cssText: string; bodyHTML: string } {
  const cssParts: string[] = []
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi; let m: RegExpExecArray | null
  while ((m = styleRe.exec(html)) !== null) cssParts.push(m[1])
  let bodyHTML = html
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) bodyHTML = bodyMatch[1]
  else bodyHTML = html.replace(/<!DOCTYPE[^>]*>/i, '').replace(/<html[^>]*>/gi, '').replace(/<\/html>/gi, '').replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '').replace(/<body[^>]*>/gi, '').replace(/<\/body>/gi, '')
  return { cssText: cssParts.join('\n'), bodyHTML }
}

const PAGE_HEIGHT = 1122
const PAGE_GAP = 12

/**
 * Render one page: only sections within [startOffset, endOffset] are visible.
 * Others are hidden with display:none to let browser reflow correctly.
 */

interface PageResult {
  html: string; data: Resume
  visibleSections: Record<string, boolean>; sectionOrder: string[]
  pageIndex: number; cssText: string; bodyHTML: string
}

const ShadowPage = React.memo<PageResult>(
  ({ pageIndex, cssText, bodyHTML, data, visibleSections, sectionOrder }) => {
    const hostRef = useRef<HTMLDivElement>(null)
    const rootRef = useRef<ShadowRoot | null>(null)

    useEffect(() => {
      const host = hostRef.current
      if (!host) return
      if (!rootRef.current) rootRef.current = host.attachShadow({ mode: 'open' })
      const root = rootRef.current
      root.innerHTML = ''

      const baseStyle = document.createElement('style')
      baseStyle.textContent = `
        :host { display: block; width:210mm; height:297mm; overflow:hidden; background:#fff; }
        .resume-page { min-height: 0 !important; }
        .skill-tag.secondary { opacity: 0.7; font-weight: 400 !important; }
        .skill-group[data-type="secondary"] .group-name::after { content: "（加分项）"; font-weight: 400; opacity: 0.6; font-size: 0.75em; }
      `
      root.appendChild(baseStyle)

      if (cssText) { const s = document.createElement('style'); s.textContent = cssText; root.appendChild(s) }

      const temp = document.createElement('div')
      temp.innerHTML = bodyHTML
      while (temp.firstChild) root.appendChild(temp.firstChild)

      populateShadowDOM(root, data, visibleSections, sectionOrder)
    }, [cssText, bodyHTML, data, visibleSections, sectionOrder])

    return <div ref={hostRef} style={{ width: '210mm', height: '297mm', flexShrink: 0 }} />
  }
)

/**
 * Scan rendered DOM to determine which sections belong on which page.
 * Uses a fixed page height of 1122px (A4 at 96dpi).
 */
function measurePagedSections(container: Element, sectionOrder: string[]): string[][] {
  const resumePage = container.querySelector('.resume-page') || container
  const body = resumePage.querySelector('.resume-body') || resumePage
  if (!body) return [sectionOrder]

  // Collect all direct child sections of resume-body
  const children = Array.from(body.children).filter(el => {
    const id = (el as HTMLElement).getAttribute('id')
    return (el as HTMLElement).offsetHeight > 0 &&
           !(el as HTMLElement).classList.contains('profile-banner')
  })

  const pages: string[][] = [[]]
  let used = 0

  for (const child of children) {
    const el = child as HTMLElement
    const section = el.getAttribute('data-section') || el.getAttribute('id') || ''
    const style = getComputedStyle(el)
    const h = el.offsetHeight +
      parseFloat(style.marginTop || '0') +
      parseFloat(style.marginBottom || '0')

    console.log('[measure] section:', section, 'height:', el.offsetHeight, 'used:', used, 'h:', h)

    // If this section overflows the page and there is already content → start new page
    if (used > 10 && used + h > PAGE_HEIGHT) {
      console.log('[measure] page break at', section)
      pages.push([])
      used = 0
    }

    pages[pages.length - 1].push(section)
    used += h
  }

  return pages.filter(p => p.length > 0)
}

const ResumePreview: React.FC = () => {
  const resume = useResumeStore((s) => s.resume)
  const visibleSections = useResumeStore((s) => s.visibleSections)
  const sectionOrder = useResumeStore((s) => s.sectionOrder)
  const currentTemplate = useTemplateStore((s) => s.getCurrentTemplate())
  const [key, setKey] = useState(0)
  const [zoom, setZoom] = useState(0.65)
  const [forceSinglePage, setForceSinglePage] = useState(false)
  const [paginatedPreview, setPaginatedPreview] = useState(true)
  const template = currentTemplate || defaultTemplate
  const { cssText, bodyHTML } = useMemo(() => parseTemplateHTML(template.html), [template.html])

  const [pageSections, setPageSections] = useState<string[][]>([sectionOrder])
  const measureRef = useRef<HTMLDivElement>(null)
  // Stable refs for template context
  const cssTextRef = useRef(cssText)
  cssTextRef.current = cssText
  const bodyHTMLRef = useRef(bodyHTML)
  bodyHTMLRef.current = bodyHTML

  useEffect(() => {
    // Render measurement content directly into hidden div's shadow DOM
    const t = setTimeout(() => {
      const host = measureRef.current
      if (!host) return

      let shadow = (host as any).__measureRoot as ShadowRoot | null
      if (!shadow) {
        shadow = host.attachShadow({ mode: 'open' })
        ;(host as any).__measureRoot = shadow
      }
      shadow.innerHTML = ''

      const baseStyle = document.createElement('style')
      baseStyle.textContent = `
        :host { display: block; width:210mm; background:#fff; }
        .resume-page { min-height: 0 !important; }
        .skill-tag.secondary { opacity: 0.7; font-weight: 400 !important; }
        .skill-group[data-type="secondary"] .group-name::after { content: "（加分项）"; font-weight: 400; opacity: 0.6; font-size: 0.75em; }
      `
      shadow.appendChild(baseStyle)

      const currentCSS = cssTextRef.current
      if (currentCSS) {
        const tplStyle = document.createElement('style')
        tplStyle.textContent = currentCSS
        shadow.appendChild(tplStyle)
      }

      const temp = document.createElement('div')
      temp.innerHTML = bodyHTMLRef.current
      while (temp.firstChild) shadow.appendChild(temp.firstChild)

      populateShadowDOM(shadow, resume, visibleSections, sectionOrder)

      setTimeout(() => {
        const body = shadow!.querySelector('.resume-body') || shadow!.querySelector('.resume-page')
        if (!body) { setPageSections([sectionOrder]); return }
        const pages = measurePagedSections(body, sectionOrder)
        setPageSections(pages.length > 0 ? pages : [sectionOrder])
      }, 300)
    }, 800)
    return () => clearTimeout(t)
  }, [resume, visibleSections, sectionOrder, template.html, key])

  const handleRefresh = () => setKey((k) => k + 1)

  // --- PDF Export: render template with real data, then extract populated HTML ---
  const handleExportPDF = useCallback(() => {
    // 1. Create a hidden div and populate it with resume data
    const container = document.createElement('div')
    container.innerHTML = bodyHTML
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = '210mm'
    document.body.appendChild(container)

    // 2. Populate with real data
    populateShadowDOM(container, resume, visibleSections, sectionOrder)

    // 3. Extract populated HTML
    const populatedBody = container.innerHTML
    document.body.removeChild(container)

    // 4. Build standalone HTML for printing
    const printCSS = document.getElementById('resume-print-styles')?.textContent || ''
    const printableHTML = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">
<style>
  @page { size: A4; margin: 8mm 0 0 0; }
  * { box-sizing: border-box; }
  body { margin:0; padding:0; font-family:'PingFang SC','Microsoft YaHei',sans-serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .resume-page { width:210mm; min-height:0 !important; }
  .resume-section, .entry, .entry-list { page-break-inside: avoid; }
  .section-title { page-break-after: avoid; }
  ${printCSS}
  ${cssText}
</style></head><body>${populatedBody}</body></html>`

    const win = window.open('about:blank', '_blank', 'width=800,height=600')
    if (win) {
      win.document.write(printableHTML)
      win.document.close()
      setTimeout(() => { try { win.print() } catch {} }, 600)
    }
  }, [cssText, bodyHTML, resume, visibleSections, sectionOrder])

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 0.75, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', flexShrink: 0, minHeight: 40 }}>
        <Typography variant="subtitle2" color="text.secondary" noWrap sx={{ fontSize: '0.8rem' }}>
          {template.meta.name}{paginatedPreview && pageSections.length > 1 ? ` (${pageSections.length} 页)` : ''}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 200, mx: 2 }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem', minWidth: 32, textAlign: 'right' }}>{Math.round(zoom * 100)}%</Typography>
          <Slider size="small" value={zoom} min={0.3} max={1.5} step={0.05} onChange={(_, v) => setZoom(v as number)} sx={{ py: 0 }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Tooltip title={forceSinglePage ? '取消强制一页' : '强制一页'}>
            <ToggleButton value="fit" selected={forceSinglePage} onChange={() => setForceSinglePage(!forceSinglePage)} size="small" sx={{ border: 0, p: 0.5 }}>
              <FitIcon fontSize="small" color={forceSinglePage ? 'primary' : 'disabled'} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={paginatedPreview ? '连续预览' : '分页预览'}>
            <ToggleButton value="page" selected={paginatedPreview} onChange={() => setPaginatedPreview(!paginatedPreview)} size="small" sx={{ border: 0, p: 0.5 }}>
              <PagePreviewIcon fontSize="small" color={paginatedPreview ? 'primary' : 'disabled'} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="刷新"><IconButton size="small" onClick={handleRefresh}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="导出 PDF"><IconButton size="small" onClick={handleExportPDF}><PdfIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.300', display: 'flex', justifyContent: 'center', p: 2 }}>
        {/* Hidden measurement host — renders complete DOM for height calculation */}
        <div ref={measureRef as any} style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm' }} />

        {paginatedPreview ? (
          <Box sx={{
            transform: `scale(${zoom})`, transformOrigin: 'top center',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: `${PAGE_GAP / zoom}px`, flexShrink: 0,
          }}>
            {pageSections.map((sections, i) => (
              <Box key={i} sx={{
                width: '210mm', height: '297mm',
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                flexShrink: 0, bgcolor: '#fff',
              }}>
                <ShadowPage
                  pageIndex={i} cssText={cssText} bodyHTML={bodyHTML}
                  data={resume}
                  visibleSections={Object.fromEntries(sectionOrder.map(s => [s, sections.includes(s)]))}
                  sectionOrder={sections}
                  html={template.html}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ transform: `scale(${zoom})`, transformOrigin: 'top center', flexShrink: 0, alignSelf: 'flex-start' }}>
            <ShadowPage
              pageIndex={-1} cssText={cssText} bodyHTML={bodyHTML}
              data={resume} visibleSections={visibleSections} sectionOrder={sectionOrder}
              html={template.html}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ResumePreview
