import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { Box, IconButton, Tooltip, Typography, Slider, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Refresh as RefreshIcon, FileDownload as DownloadIcon, PictureAsPdf as PdfIcon, ContentCopy as CopyIcon, CropSquare as FitIcon, ViewDayOutlined as PagePreviewIcon } from '@mui/icons-material'
import useResumeStore from '../../store/resumeStore'
import useTemplateStore from '../../store/templateStore'
import { defaultTemplate, populateShadowDOM } from '../../templates'
import type { Resume } from '../../types/resume'

// Electron API type
declare global {
  interface Window { electronAPI?: { exportPDF: (html: string) => Promise<boolean>; onMenuExportPDF: (cb: () => void) => void } }
}

/**
 * Parse full HTML → extract CSS text + body innerHTML.
 */
function parseTemplateHTML(html: string): { cssText: string; bodyHTML: string } {
  const cssParts: string[] = []
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi
  let m: RegExpExecArray | null
  while ((m = styleRe.exec(html)) !== null) {
    cssParts.push(m[1])
  }
  const linkRe = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi
  while ((m = linkRe.exec(html)) !== null) {
    cssParts.push(`@import url("${m[1]}");`)
  }
  let bodyHTML = html
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    bodyHTML = bodyMatch[1]
  } else {
    bodyHTML = html
      .replace(/<!DOCTYPE[^>]*>/i, '')
      .replace(/<html[^>]*>/gi, '').replace(/<\/html>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<body[^>]*>/gi, '').replace(/<\/body>/gi, '')
  }
  return { cssText: cssParts.join('\n'), bodyHTML }
}

function hasPlaceholders(html: string): boolean {
  return /\{\{(?!\/|#|@)([\w.]+)\}\}/g.test(html)
}

/**
 * Renders a template inside a Shadow Root.
 * 1. Inject raw HTML + CSS from the template
 * 2. Populate data via ID-mapped DOM manipulation (populateShadowDOM)
 */
const ShadowPreview = React.forwardRef<{ getHTML: () => string; refreshData: () => void }, { html: string; data: Resume; visibleSections: Record<string, boolean>; sectionOrder: string[]; showPageBreaks: boolean }>(
  ({ html, data, visibleSections, sectionOrder, showPageBreaks }, ref) => {
    const hostRef = useRef<HTMLDivElement>(null)
    const rootRef = useRef<ShadowRoot | null>(null)
    const { cssText, bodyHTML } = useMemo(() => parseTemplateHTML(html), [html])

    // Effect 1: Inject template HTML (only when template changes)
    useEffect(() => {
      const host = hostRef.current
      if (!host) return
      if (!rootRef.current) {
        rootRef.current = host.attachShadow({ mode: 'open' })
      }
      const root = rootRef.current
      root.innerHTML = ''

      const baseStyle = document.createElement('style')
      baseStyle.textContent = `
        :host { display: block; }
        .skill-tag.secondary { opacity: 0.7; font-weight: 400 !important; }
        .skill-group[data-type="secondary"] .group-name::after { content: "（加分项）"; font-weight: 400; opacity: 0.6; font-size: 0.75em; }
        .page-break-guide {
          display: none;
          position: relative;
          height: 0;
          border: none;
          margin: 0;
          padding: 0;
        }
        .page-break-guide::before {
          content: "";
          display: block;
          border-top: 2px dashed #ef4444;
          opacity: 0.5;
          margin: 0 0 0 0;
        }
        .page-break-guide::after {
          content: "A4 分页";
          display: block;
          text-align: right;
          font-size: 10px;
          color: #ef4444;
          opacity: 0.6;
          margin-top: 2px;
          margin-bottom: 0;
        }
      `
      root.appendChild(baseStyle)

      if (cssText) {
        const tplStyle = document.createElement('style')
        tplStyle.textContent = cssText
        root.appendChild(tplStyle)
      }

      const temp = document.createElement('div')
      temp.innerHTML = bodyHTML
      while (temp.firstChild) {
        root.appendChild(temp.firstChild)
      }

      // Data + page breaks
      populateShadowDOM(root, data, visibleSections, sectionOrder)

      // Inject A4 page break guides into Shadow DOM — only if pagination toggle is ON
      if (showPageBreaks) {
        const resumePage = root.querySelector('.resume-page') as HTMLElement | null
        if (resumePage) {
          resumePage.style.position = 'relative'
          const existing = resumePage.querySelectorAll('.page-line')
          existing.forEach((e) => e.remove())
        }
        // Delay to ensure layout is calculated
        setTimeout(() => {
          const page = root.querySelector('.resume-page') as HTMLElement | null
          if (!page) return
          if (page.scrollHeight <= 1122) return

          const pageCount = Math.ceil(page.scrollHeight / 1122)
          for (let i = 1; i < pageCount; i++) {
            const line = document.createElement('div')
            line.className = 'page-line'
            line.style.cssText = `
              position: absolute;
              top: ${i * 1122}px;
              left: 0;
              right: 0;
              height: 0;
              border-top: 2px dashed #ef4444;
              z-index: 10;
              pointer-events: none;
            `
            const label = document.createElement('span')
            label.textContent = `— 第 ${i + 1} 页 —`
            label.style.cssText = `
              position: absolute;
              right: 4px;
              top: -14px;
              font-size: 10px;
              color: #ef4444;
              background: inherit;
              padding: 0 4px;
            `
            line.appendChild(label)
            page.appendChild(line)
          }
        }, 100)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cssText, bodyHTML])

    // Expose getHTML and refreshData to parent
    React.useImperativeHandle(ref, () => ({
      getHTML: () => {
        const root = rootRef.current
        if (!root) return ''
        const allHTML = root.innerHTML
        const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi
        const cssParts: string[] = []
        let m
        while ((m = styleRe.exec(allHTML)) !== null) {
          cssParts.push(m[1])
        }
        const contentHTML = allHTML
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<base[^>]*\/?>/gi, '')
        const bodyStyle = cssText.match(/body\s*\{[^}]+\}/)?.[0] || ''
        const fontMatch = bodyStyle.match(/font-family\s*:\s*([^;]+)/)
        const fontFamily = fontMatch ? fontMatch[1].trim() : "-apple-system, 'PingFang SC', sans-serif"
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${data.personal.fullName || 'resume'} - 简历</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ${fontFamily}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @page { size: A4; margin: 0; }
  .resume-page { min-height: auto !important; overflow: visible !important; }
  .resume-section, .entry, .entry-list { page-break-inside: avoid; }
  .section-title { page-break-after: avoid; }
  ${cssParts.join('\n')}
</style>
</head>
<body>${contentHTML}</body>
</html>`
      },
      refreshData: () => {
        const root = rootRef.current
        if (root && root.hasChildNodes()) {
          populateShadowDOM(root, data, visibleSections, sectionOrder)
        }
      },
    }), [cssText, data, visibleSections, sectionOrder])

    return <div ref={hostRef} style={{ minHeight: '100%' }} />
  }
)

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
  const previewRef = useRef<{ getHTML: () => string; refreshData: () => void }>(null)

  // Debounced data sync to Shadow DOM (200ms after last change)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      previewRef.current?.refreshData()
    }, 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [resume, visibleSections, sectionOrder])

  // Inject global print styles once
  useEffect(() => {
    const id = 'resume-print-styles'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = `
  @page { size: A4; margin: 0; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .resume-page { min-height: auto !important; overflow: visible !important; }
    .resume-section { page-break-inside: avoid; }
    .section-title { page-break-after: avoid; }
    .entry { page-break-inside: avoid; }
    .entry-list { page-break-inside: avoid; }
  }
    `
    document.head.appendChild(style)
  }, [])

  // Listen for Electron menu-triggered export
  useEffect(() => {
    if (window.electronAPI?.onMenuExportPDF) {
      window.electronAPI.onMenuExportPDF(() => handleExportPDF())
    }
  }, [])

  const hasOldPlaceholders = hasPlaceholders(template.html)

  const handleRefresh = () => setKey((k) => k + 1)

  const getRenderedHTML = useCallback(() => {
    let html = previewRef.current?.getHTML() || template.html
    if (forceSinglePage) {
      html = html.replace('</body>', `<script>
window.onload=function(){
  var el=document.querySelector('.resume-page')||document.querySelector('[id="resume-root"]')||document.body.children[0];
  if(!el||el.offsetHeight<=1122)return;
  var s=1122/el.offsetHeight;
  el.style.transform='scale('+s+')';
  el.style.transformOrigin='top center';
  document.body.style.height=Math.ceil(el.offsetHeight*s)+'px';
  setTimeout(function(){window.print()},300)
}
<\/script></body>`)
    } else {
      // Multi-page: add explicit page break handling
      html = html.replace('</style>', `
    @media print {
      .resume-page { overflow: visible !important; height: auto !important; }
      .resume-section { page-break-inside: avoid; }
      .section-title { page-break-after: avoid; }
      .entry { page-break-inside: avoid; }
      .entry-list { page-break-inside: avoid; }
    }
  </style>`)
    }
    return html
  }, [template.html, forceSinglePage])

  const handleExportPDF = () => {
    const rendered = getRenderedHTML()

    // Electron: native PDF export (no print dialog, no page headers)
    if (window.electronAPI) {
      window.electronAPI.exportPDF(rendered).catch(() => {})
      return
    }

    // Browser fallback: open new window → print → save as PDF
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(rendered)
      win.document.close()
      win.focus()
      setTimeout(() => { try { win.print() } catch {} }, 500)
      return
    }
    // Popup blocked: iframe fallback
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.top = iframe.style.left = '-9999px'
    iframe.style.width = '210mm'
    iframe.style.height = '297mm'
    document.body.appendChild(iframe)
    iframe.srcdoc = rendered
    iframe.onload = () => setTimeout(() => {
      try { iframe.contentWindow?.print() } catch {}
      document.body.removeChild(iframe)
    }, 500)
  }

  const handleExportHTML = () => {
    const rendered = getRenderedHTML()
    const blob = new Blob([rendered], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${resume.personal.fullName || 'resume'}-简历.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyHTML = async () => {
    const rendered = getRenderedHTML()
    try {
      await navigator.clipboard.writeText(rendered)
    } catch {
      const el = document.createElement('textarea')
      el.value = rendered
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 0.75, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', flexShrink: 0, minHeight: 40 }}>
        <Typography variant="subtitle2" color="text.secondary" noWrap sx={{ fontSize: '0.8rem', display: { xs: 'none', sm: 'block' } }}>
          {template.meta.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 200, mx: 2 }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem', minWidth: 32, textAlign: 'right' }}>
            {Math.round(zoom * 100)}%
          </Typography>
          <Slider
            size="small"
            value={zoom}
            min={0.3}
            max={1.5}
            step={0.05}
            onChange={(_, v) => setZoom(v as number)}
            sx={{ py: 0 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Tooltip title={forceSinglePage ? '取消强制一页' : '强制一页（自动缩放适配）'}>
            <ToggleButton value="fit" selected={forceSinglePage} onChange={() => setForceSinglePage(!forceSinglePage)} size="small" sx={{ border: 0, p: 0.5 }}>
              <FitIcon fontSize="small" color={forceSinglePage ? 'primary' : 'disabled'} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={paginatedPreview ? '隐藏分页线' : '显示分页线（预览 PDF 跨页位置）'}>
            <ToggleButton value="page" selected={paginatedPreview} onChange={() => setPaginatedPreview(!paginatedPreview)} size="small" sx={{ border: 0, p: 0.5 }}>
              <PagePreviewIcon fontSize="small" color={paginatedPreview ? 'primary' : 'disabled'} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="刷新"><IconButton size="small" onClick={handleRefresh}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="复制渲染后 HTML"><IconButton size="small" onClick={handleCopyHTML}><CopyIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="导出渲染 HTML 文件"><IconButton size="small" onClick={handleExportHTML}><DownloadIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="导出 PDF（打印 → 另存为 PDF）"><IconButton size="small" onClick={handleExportPDF}><PdfIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      </Box>
      <Box id="resume-print-root" sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default', display: 'flex', justifyContent: 'center', p: 2 }}>
        <Box sx={{
          width: '210mm',
          minHeight: '297mm',
          ...(paginatedPreview
            ? {
                backgroundImage: 'linear-gradient(to bottom, transparent 0px, transparent 1122px, #ef4444 1122px, #ef4444 1124px, transparent 1124px, transparent 0)',
                backgroundSize: '100% 1123px',
                backgroundRepeat: 'repeat-y',
              }
            : {}),
          transform: 'scale(' + zoom + ')',
          transformOrigin: 'top center',
          flexShrink: 0,
          alignSelf: 'flex-start',
        }}>
          <ShadowPreview key={key} ref={previewRef} html={template.html} data={resume} visibleSections={visibleSections} sectionOrder={sectionOrder} showPageBreaks={paginatedPreview} />
        </Box>
      </Box>
    </Box>
  )
}

export default ResumePreview
