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
 * Render one page.
 * Uses viewport offset (margin-top: -pageNum * PAGE_HEIGHT) to show the right slice of content,
 * then clips with overflow:hidden. This preserves all layout structures (grid, flex, etc).
 */
const ShadowPage = React.memo<{
  pageIndex: number
  singlePageMode: boolean
  cssText: string; bodyHTML: string
  data: Resume; visibleSections: Record<string, boolean>; sectionOrder: string[]
}>(({ pageIndex, singlePageMode, cssText, bodyHTML, data, visibleSections, sectionOrder }) => {
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
      :host { display: block; width:210mm; background:#fff; ${singlePageMode ? '' : 'height:297mm; overflow:hidden;'} }
      .resume-page { min-height: 0 !important; }
      .skill-tag.secondary { opacity: 0.7; font-weight: 400 !important; }
      .skill-group[data-type="secondary"] .group-name::after { content: "（加分项）"; font-weight: 400; opacity: 0.6; font-size: 0.75em; }
      .resume-section { margin-bottom: 24px !important; }
      .resume-section:last-child { margin-bottom: 0 !important; }
      @media print {
        .resume-page { overflow: visible !important; height: auto !important; }
        .resume-section, .entry, .entry-list { page-break-inside: avoid; }
        .section-title { page-break-after: avoid; }
      }
    `
    root.appendChild(baseStyle)

    if (cssText) { const s = document.createElement('style'); s.textContent = cssText; root.appendChild(s) }

    if (!singlePageMode && pageIndex > 0) {
      const shiftCss = document.createElement('style')
      shiftCss.textContent = `.resume-page { margin-top: -${pageIndex * PAGE_HEIGHT}px !important; padding-top: ${pageIndex * PAGE_HEIGHT}px !important; }`
      root.appendChild(shiftCss)
    }

    const temp = document.createElement('div')
    temp.innerHTML = bodyHTML
    while (temp.firstChild) root.appendChild(temp.firstChild)

    populateShadowDOM(root, data, visibleSections, sectionOrder)
  }, [cssText, bodyHTML, data, visibleSections, sectionOrder, pageIndex, singlePageMode])

  return <div ref={hostRef} style={singlePageMode ? { width: '210mm' } : { width: '210mm', height: '297mm', flexShrink: 0 }} />
})

/** Count pages by measuring full content height */
function measurePageCount(shadow: ShadowRoot): number {
  const page = shadow.querySelector('.resume-page') || shadow.firstElementChild
  if (!page) return 1
  return Math.max(1, Math.ceil((page as HTMLElement).scrollHeight / PAGE_HEIGHT))
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

  const [pageCount, setPageCount] = useState(1)
  const measureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      const host = measureRef.current
      if (!host) return
      let shadow = (host as any).__measureRoot as ShadowRoot | null
      if (!shadow) { shadow = host.attachShadow({ mode: 'open' }); (host as any).__measureRoot = shadow }
      shadow.innerHTML = ''

      const baseStyle = document.createElement('style')
      baseStyle.textContent = `:host { display: block; width:210mm; }`
      shadow.appendChild(baseStyle)
      if (cssText) { const s = document.createElement('style'); s.textContent = cssText; shadow.appendChild(s) }

      const temp = document.createElement('div')
      temp.innerHTML = bodyHTML
      while (temp.firstChild) shadow.appendChild(temp.firstChild)

      populateShadowDOM(shadow, resume, visibleSections, sectionOrder)

      requestAnimationFrame(() => {
        setPageCount(measurePageCount(shadow))
      })
    }, 500)
    return () => clearTimeout(t)
  }, [resume, visibleSections, sectionOrder, template.html, key, cssText, bodyHTML])

  const handleRefresh = () => setKey((k) => k + 1)

  const handleExportPDF = useCallback(() => {
    const container = document.createElement('div')
    container.innerHTML = bodyHTML
    container.style.cssText = 'position:absolute;left:-9999px;top:0;width:210mm'
    document.body.appendChild(container)
    populateShadowDOM(container, resume, visibleSections, sectionOrder)
    const populatedBody = container.innerHTML
    document.body.removeChild(container)

    const printCSS = document.getElementById('resume-print-styles')?.textContent || ''
    const printableHTML = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><style>
@page { size: A4; margin: 8mm 0 0 0; }
* { box-sizing: border-box; }
body { margin:0; padding:0; font-family:'PingFang SC','Microsoft YaHei',sans-serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.resume-page { width:210mm; min-height:0 !important; overflow:visible !important; height:auto !important; }
.resume-section { margin-bottom: 24px !important; page-break-inside: avoid; }
.resume-section:last-child { margin-bottom: 0 !important; }
.entry, .entry-list { page-break-inside: avoid; }
.section-title { page-break-after: avoid; }
${printCSS}
${cssText}
</style></head><body>${populatedBody}</body></html>`

    const win = window.open('about:blank', '_blank', 'width=800,height=600')
    if (win) { win.document.write(printableHTML); win.document.close(); setTimeout(() => { try { win.print() } catch {} }, 600) }
  }, [cssText, bodyHTML, resume, visibleSections, sectionOrder])

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
          <Tooltip title="导出 PDF"><IconButton size="small" onClick={handleExportPDF}><PdfIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.300', display: 'flex', justifyContent: 'center', p: 2 }}>
        <div ref={measureRef as any} style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm' }} />

        {paginatedPreview ? (
          <Box sx={{ transform: `scale(${zoom})`, transformOrigin: 'top center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${PAGE_GAP / zoom}px`, flexShrink: 0 }}>
            {Array.from({ length: pageCount }, (_, i) => (
              <Box key={i} sx={{ width: '210mm', height: '297mm', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexShrink: 0, bgcolor: '#fff' }}>
                <ShadowPage
                  key={`p-${key}-${i}`}
                  pageIndex={i}
                  singlePageMode={false}
                  cssText={cssText} bodyHTML={bodyHTML}
                  data={resume} visibleSections={visibleSections} sectionOrder={sectionOrder}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ transform: `scale(${zoom})`, transformOrigin: 'top center', flexShrink: 0, alignSelf: 'flex-start' }}>
            <ShadowPage
              key={`c-${key}`}
              pageIndex={-1}
              singlePageMode={true}
              cssText={cssText} bodyHTML={bodyHTML}
              data={resume} visibleSections={visibleSections} sectionOrder={sectionOrder}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ResumePreview
