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
 * Returns array of section-id arrays: [[sections for page 1], [sections for page 2], ...]
 */
function measurePageSections(container: Element, sectionOrder: string[]): string[][] {
  const resumePage = container.querySelector('.resume-page') || container
  const body = resumePage.querySelector('.resume-body') || resumePage
  if (!body) return [sectionOrder]

  const children = Array.from(body.children).filter(el => {
    const id = el.getAttribute('id')
    // Skip non-section elements like page-line markers, profile-banner
    return (el as HTMLElement).offsetHeight > 0 &&
           !(el as HTMLElement).classList.contains('profile-banner') &&
           !el.getAttribute('class')?.includes('page-line')
  })

  const pages: string[][] = [[]]
  let used = 0

  for (const child of children) {
    const el = child as HTMLElement
    // Use data-section attribute if present, otherwise use id
    const section = el.getAttribute('data-section') || el.getAttribute('id') || ''

    // Get actual height including margins
    const style = getComputedStyle(el)
    const h = el.offsetHeight +
      parseFloat(style.marginTop || '0') +
      parseFloat(style.marginBottom || '0')

    // If this section would overflow AND there's already content on this page
    // AND the section isn't too tall → start new page
    if (used + h > PAGE_HEIGHT && used > 0 && h < PAGE_HEIGHT * 0.7) {
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

  useEffect(() => {
    // Render measurement content directly into hidden div's shadow DOM
    const t = setTimeout(() => {
      const host = measureRef.current
      if (!host) return

      // Ensure shadow root exists
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

      if (cssText) {
        const tplStyle = document.createElement('style')
        tplStyle.textContent = cssText
        shadow.appendChild(tplStyle)
      }

      const temp = document.createElement('div')
      temp.innerHTML = bodyHTML
      while (temp.firstChild) shadow.appendChild(temp.firstChild)

      populateShadowDOM(shadow, resume, visibleSections, sectionOrder)

      // Wait for layout, then measure
      requestAnimationFrame(() => {
        const body = shadow!.querySelector('.resume-body') || shadow!.querySelector('.resume-page')
        if (!body) { setPageSections([sectionOrder]); return }
        const pages = measurePageSections(body, sectionOrder)
        setPageSections(pages.length > 0 ? pages : [sectionOrder])
      })
    }, 600)
    return () => clearTimeout(t)
  }, [resume, visibleSections, sectionOrder, template.html, key, cssText, bodyHTML])

  const handleRefresh = () => setKey((k) => k + 1)

  const handleExportPDF = () => {
    const win = window.open('', '_blank')
    if (win) {
      const styles = Array.from(measureRef.current?.shadowRoot?.querySelectorAll('style') || []).map(s => s.textContent).join('\n')
      const body = measureRef.current?.shadowRoot?.querySelector('.resume-page')?.outerHTML || ''
      win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
        @page { size:A4; margin:0; }
        * { box-sizing:border-box; }
        .resume-section,.entry,.entry-list { page-break-inside:avoid; }
        .section-title { page-break-after:avoid; }
        .resume-page { width:210mm; margin:0; }
        body { margin:0; padding:0; font-family:'PingFang SC','Microsoft YaHei',sans-serif; }
        ${styles}</style></head><body>${body}</body></html>`)
      win.document.close()
      setTimeout(() => win.print(), 500)
    }
  }

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
