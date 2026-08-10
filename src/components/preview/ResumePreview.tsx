import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { Box, IconButton, Tooltip, Typography, Slider, ToggleButton } from '@mui/material'
import { Refresh as RefreshIcon, FileDownload as DownloadIcon, PictureAsPdf as PdfIcon, CropSquare as FitIcon } from '@mui/icons-material'
import useResumeStore from '../../store/resumeStore'
import useTemplateStore from '../../store/templateStore'
import { defaultTemplate, populateShadowDOM } from '../../templates'
import { generateDocx } from '../../features/export/docx'
import { generateImagePDF } from '../../features/export/imagePdf'
import type { Resume } from '../../types/resume'

declare global { interface Window { electronAPI?: { exportPDF: (html: string) => Promise<boolean>; onMenuExportPDF: (cb: () => void) => void } } }

function parseTemplate(html: string) {
  const css: string[] = []; const r = /<style[^>]*>([\s\S]*?)<\/style>/gi; let m: RegExpExecArray | null
  while ((m = r.exec(html)) !== null) css.push(m[1])
  let body = html; const bm = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bm) body = bm[1]
  else body = html.replace(/<!DOCTYPE[^>]*>/i, '').replace(/<html[^>]*>/gi, '').replace(/<\/html>/gi, '').replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '').replace(/<body[^>]*>/gi, '').replace(/<\/body>/gi, '')
  return { css: css.join('\n'), body }
}

const ResumePreview: React.FC = () => {
  const resume = useResumeStore(s => s.resume)
  const vis = useResumeStore(s => s.visibleSections)
  const order = useResumeStore(s => s.sectionOrder)
  const cur = useTemplateStore(s => s.getCurrentTemplate())
  const [key, setKey] = useState(0)
  const [zoom, setZoom] = useState(0.65)
  const [fitWidth, setFitWidth] = useState(true)
  const tpl = cur || defaultTemplate
  const { css, body } = useMemo(() => parseTemplate(tpl.html), [tpl.html])

  const hRef = useRef<HTMLDivElement>(null)
  const rRef = useRef<ShadowRoot | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(800)
  const PAGE_W_PX = 794
  const MAX_ZOOM = 1.5
  const MIN_ZOOM = 0.3

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const effectiveZoom = fitWidth ? Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, (containerWidth - 40) / PAGE_W_PX)) : zoom

  // Render full content in Shadow DOM, no page splitting
  useEffect(() => {
    const h = hRef.current; if (!h) return
    if (!rRef.current) rRef.current = h.attachShadow({ mode: 'open' })
    const r = rRef.current; r.innerHTML = ''

    const base = document.createElement('style')
    base.textContent = `:host{display:block;width:210mm;background:#fff;min-height:auto}
.resume-page{min-height:0!important;overflow:visible!important;height:auto!important}
.skill-tag.secondary{opacity:.7;font-weight:400!important}
.skill-group[data-type="secondary"] .group-name::after{content:"（加分项）";font-weight:400;opacity:.6;font-size:.75em}
.resume-section{margin-bottom:24px!important}.resume-section:last-child{margin-bottom:0!important}`
    r.appendChild(base)

    if (css) { const s = document.createElement('style'); s.textContent = css; r.appendChild(s) }

    const div = document.createElement('div'); div.innerHTML = body
    while (div.firstChild) r.appendChild(div.firstChild)

    populateShadowDOM(r, resume, vis, order)
  }, [css, body, resume, vis, order, key])

  const refresh = () => setKey(k => k + 1)
  const pages = [order] // keep API compat

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 0.75, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', flexShrink: 0, minHeight: 40 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{tpl.meta.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 260, mx: 2 }}>
          <Tooltip title={fitWidth ? '固定缩放' : '适应宽度'}><ToggleButton value="fitWidth" selected={fitWidth} onChange={() => setFitWidth(!fitWidth)} size="small" sx={{ border: 0, p: 0.5 }}><FitIcon fontSize="small" color={fitWidth ? 'primary' : 'disabled'} /></ToggleButton></Tooltip>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem', minWidth: 32, textAlign: 'right' }}>{Math.round(effectiveZoom * 100)}%</Typography>
          <Slider size="small" value={effectiveZoom} min={0.3} max={1.5} step={0.05} onChange={(_, v) => { setFitWidth(false); setZoom(v as number) }} sx={{ py: 0 }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Tooltip title="刷新"><IconButton size="small" onClick={refresh}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="导出 Word (.docx)"><IconButton size="small" onClick={() => generateDocx(resume, tpl.id)}><DownloadIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="导出 PDF（图文）"><IconButton size="small" onClick={() => generateImagePDF(resume, tpl.html, pages, tpl.id, vis, order, populateShadowDOM)}><PdfIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.300', display: 'flex', justifyContent: 'center', p: 2 }} ref={containerRef}>
        <Box sx={{ transform: `scale(${effectiveZoom})`, transformOrigin: 'top center', flexShrink: 0 }}>
          <div ref={hRef} style={{ width: '210mm', minHeight: '297mm' }} />
        </Box>
      </Box>
    </Box>
  )
}

export default ResumePreview
