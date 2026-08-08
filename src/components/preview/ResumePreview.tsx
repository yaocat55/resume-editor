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
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi
  let m: RegExpExecArray | null
  while ((m = styleRe.exec(html)) !== null) cssParts.push(m[1])
  let bodyHTML = html
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) bodyHTML = bodyMatch[1]
  else bodyHTML = html.replace(/<!DOCTYPE[^>]*>/i, '').replace(/<html[^>]*>/gi, '').replace(/<\/html>/gi, '').replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '').replace(/<body[^>]*>/gi, '').replace(/<\/body>/gi, '')
  return { cssText: cssParts.join('\n'), bodyHTML }
}

const PAGE_HEIGHT = 1122
const PAGE_GAP = 12

/** Find all natural page break positions by walking DOM tree */
function findPageBreaks(container: Element, pageHeight: number): number[] {
  const breaks: number[] = []
  // Collect child elements of resume-body / resume-root
  const body = container.querySelector('.resume-body') || container
  const children = Array.from(body.children)
  let cumulative = 0

  for (const child of children) {
    const el = child as HTMLElement
    const elHeight = el.offsetHeight + parseFloat(getComputedStyle(el).marginBottom || '0') + parseFloat(getComputedStyle(el).marginTop || '0')
    if (cumulative + elHeight > pageHeight && cumulative > 0) {
      breaks.push(cumulative)
      cumulative = elHeight
    } else {
      cumulative += elHeight
    }
  }
  return breaks
}

const ShadowPage = React.memo<{
  html: string; data: Resume
  visibleSections: Record<string, boolean>; sectionOrder: string[]
  pageIndex: number; pageCount: number
}>(({ html, data, visibleSections, sectionOrder, pageIndex, pageCount }) => {
  const hostRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<ShadowRoot | null>(null)
  const { cssText, bodyHTML } = useMemo(() => parseTemplateHTML(html), [html])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    if (!rootRef.current) rootRef.current = host.attachShadow({ mode: 'open' })
    const root = rootRef.current
    root.innerHTML = ''

    // page 0 = full view (measure), others show from page break
    const baseStyle = document.createElement('style')
    baseStyle.textContent = `
      :host { display: block; width:210mm; height:${pageIndex === 0 ? 'auto' : '297mm'}; overflow:${pageIndex === 0 ? 'visible' : 'hidden'}; background:#fff; }
      .resume-page { min-height: 0 !important; }
      .skill-tag.secondary { opacity: 0.7; font-weight: 400 !important; }
      .skill-group[data-type="secondary"] .group-name::after { content: "（加分项）"; font-weight: 400; opacity: 0.6; font-size: 0.75em; }
    `
    root.appendChild(baseStyle)

    if (cssText) {
      const tplStyle = document.createElement('style')
      tplStyle.textContent = cssText
      root.appendChild(tplStyle)
    }

    // For pages 2+, shift content to show the right portion
    if (pageIndex > 0) {
      const shift = document.createElement('style')
      shift.textContent = `.resume-body { margin-top:-${pageIndex * PAGE_HEIGHT}px !important; min-height:${(pageIndex+1)*PAGE_HEIGHT}px !important; }`
      root.appendChild(shift)
    }

    const temp = document.createElement('div')
    temp.innerHTML = bodyHTML
    while (temp.firstChild) root.appendChild(temp.firstChild)

    populateShadowDOM(root, data, visibleSections, sectionOrder)
  }, [cssText, bodyHTML, data, visibleSections, sectionOrder, pageIndex])

  return <div ref={hostRef} style={{ width: '210mm', flexShrink: 0 }} />
})

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

  const [pageCount, setPageCount] = useState(1)
  const measureRef = useRef<HTMLDivElement>(null)

  // After render, count pages
  useEffect(() => {
    const t = setTimeout(() => {
      const el = measureRef.current
      if (!el || !el.shadowRoot) return
      // Force reflow to get accurate height
      const inner = el.shadowRoot.querySelector('.resume-page') || el.shadowRoot.firstElementChild
      if (!inner) return
      const h = (inner as HTMLElement).scrollHeight
      setPageCount(Math.max(1, Math.ceil(h / PAGE_HEIGHT)))
    }, 400)
    return () => clearTimeout(t)
  }, [resume, visibleSections, sectionOrder, template.html, key])

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
          {template.meta.name}{paginatedPreview && pageCount > 1 ? ` (${pageCount} 页)` : ''}
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
          <Tooltip title="复制 HTML"><IconButton size="small"><CopyIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="导出 HTML"><IconButton size="small"><DownloadIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="导出 PDF"><IconButton size="small" onClick={handleExportPDF}><PdfIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.300', display: 'flex', justifyContent: 'center', p: 2 }}>
        {/* Hidden full-height measure render */}
        <Box ref={measureRef} sx={{ position: 'absolute', left: -9999, width: '210mm' }}>
          <ShadowPage key={`m-${key}`} pageIndex={0} pageCount={1} html={template.html} data={resume} visibleSections={visibleSections} sectionOrder={sectionOrder} />
        </Box>

        {paginatedPreview ? (
          <Box sx={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: `${PAGE_GAP / zoom}px`, flexShrink: 0,
          }}>
            {Array.from({ length: pageCount }, (_, i) => (
              <Box key={i} sx={{
                width: '210mm', height: '297mm',
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                flexShrink: 0, bgcolor: '#fff',
              }}>
                <ShadowPage key={`p-${key}-${i}`} pageIndex={i} pageCount={pageCount} html={template.html} data={resume} visibleSections={visibleSections} sectionOrder={sectionOrder} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ transform: `scale(${zoom})`, transformOrigin: 'top center', flexShrink: 0, alignSelf: 'flex-start' }}>
            <ShadowPage key={`c-${key}`} pageIndex={-1} pageCount={1} html={template.html} data={resume} visibleSections={visibleSections} sectionOrder={sectionOrder} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ResumePreview
