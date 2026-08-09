import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { Box, IconButton, Tooltip, Typography, Slider, ToggleButton } from '@mui/material'
import { Refresh as RefreshIcon, FileDownload as DownloadIcon, PictureAsPdf as PdfIcon, CropSquare as FitIcon, ViewDayOutlined as PagePreviewIcon } from '@mui/icons-material'
import useResumeStore from '../../store/resumeStore'
import useTemplateStore from '../../store/templateStore'
import useAIStore from '../../features/ai/store'
import { defaultTemplate, populateShadowDOM } from '../../templates'
import { generateDocx } from '../../features/export/docx'
import { generatePDF } from '../../features/export/pdf'
import type { Resume } from '../../types/resume'

declare global { interface Window { electronAPI?: { exportPDF: (html: string) => Promise<boolean>; onMenuExportPDF: (cb: () => void) => void } } }

const PAGE_HEIGHT = 1122
const PAGE_GAP = 12

/* ── Continuation header themes per template ── */
const THEMES: Record<string, { bg: string; color: string; accent: string }> = {
  '__m3_expressive__': { bg: '#e8eef5', color: '#4263a0', accent: '#d7e3ff' },
  '__default__': { bg: '#f0f2f5', color: '#2d3748', accent: '#d0d5dd' },
  '__minimal__': { bg: '#f8f9fa', color: '#333', accent: '#ddd' },
  '__academic__': { bg: '#f5f0e5', color: '#5c3d1e', accent: '#c9b99a' },
  '__creative__': { bg: '#1e1b4b', color: '#e0d9ff', accent: '#4c1d95' },
  '__github__': { bg: '#161b22', color: '#c9d1d9', accent: '#30363d' },
  '__vscode__': { bg: '#1e1e1e', color: '#d4d4d4', accent: '#007acc' },
  '__social__': { bg: '#fff0f0', color: '#ff2442', accent: '#ff6b81' },
  '__bento__': { bg: '#111', color: '#fff', accent: '#333' },
  '__fde__': { bg: '#f0fdf4', color: '#166534', accent: '#86efac' },
}

function parseTemplate(html: string) {
  const css: string[] = []; const r = /<style[^>]*>([\s\S]*?)<\/style>/gi; let m: RegExpExecArray | null
  while ((m = r.exec(html)) !== null) css.push(m[1])
  let body = html; const bm = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bm) body = bm[1]
  else body = html.replace(/<!DOCTYPE[^>]*>/i, '').replace(/<html[^>]*>/gi, '').replace(/<\/html>/gi, '').replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '').replace(/<body[^>]*>/gi, '').replace(/<\/body>/gi, '')
  return { css: css.join('\n'), body }
}

/** Measure section heights from a rendered Shadow DOM */
function measureSections(root: ShadowRoot): string[] {
  const page = root.querySelector('.resume-page') as HTMLElement | null
  if (!page) return []
  const body = page.querySelector('.resume-body') || page.querySelector('#resume-root') || page
  const sections: string[] = []
  for (const el of Array.from(body.children)) {
    const e = el as HTMLElement; if (e.offsetHeight < 5) continue
    const id = e.getAttribute('id'); if (id) sections.push(id)
  }
  return sections
}

/** Assign sections to pages greedily by height */
function assignPages(shadow: ShadowRoot, sectionOrder: string[]): string[][] {
  const body = (shadow.querySelector('.resume-body') || shadow.querySelector('#resume-root') || shadow.firstElementChild) as HTMLElement | null
  if (!body) return [sectionOrder]

  const pages: string[][] = [[]]; let used = 0
  for (const id of sectionOrder) {
    const el = body.querySelector(`#${CSS.escape(id)}`) as HTMLElement | null
    const h = el ? el.offsetHeight : 200
    if (used > 20 && used + h > PAGE_HEIGHT) { pages.push([]); used = 0 }
    pages[pages.length - 1].push(id); used += h
  }
  return pages.filter(p => p.length > 0)
}

/* ── Single page component ── */
const ShadowPage = React.memo<{
  sections: string[]; allSections: string[]; isFirst: boolean
  css: string; body: string; data: Resume; vis: Record<string, boolean>; order: string[]
  name: string; tid: string
}>(({ sections, allSections, isFirst, css, body, data, vis, order, name, tid }) => {
  const hRef = useRef<HTMLDivElement>(null); const rRef = useRef<ShadowRoot | null>(null)

  useEffect(() => {
    const h = hRef.current; if (!h) return
    if (!rRef.current) rRef.current = h.attachShadow({ mode: 'open' })
    const r = rRef.current; r.innerHTML = ''

    // Base styles
    const base = document.createElement('style')
    base.textContent = `:host{display:block;width:210mm;height:297mm;overflow:hidden;background:#fff}
.resume-page{min-height:0!important}
.skill-tag.secondary{opacity:.7;font-weight:400!important}
.skill-group[data-type="secondary"] .group-name::after{content:"（加分项）";font-weight:400;opacity:.6;font-size:.75em}
.resume-section{margin-bottom:24px!important}.resume-section:last-child{margin-bottom:0!important}
@media print{.resume-page{overflow:visible!important;height:auto!important}.resume-section,.entry,.entry-list{page-break-inside:avoid}.section-title{page-break-after:avoid}}`
    r.appendChild(base)

    // Template CSS
    if (css) { const s = document.createElement('style'); s.textContent = css; r.appendChild(s) }

    // Hide sections not on this page
    if (!isFirst || allSections.length > sections.length) {
      const hidden = allSections.filter(s => !sections.includes(s))
      if (hidden.length > 0) {
        const hideStyle = document.createElement('style')
        hideStyle.textContent = hidden.map(s => `#${CSS.escape(s)}{display:none!important}`).join('\n')
        r.appendChild(hideStyle)
      }
    }

    // Render body
    const div = document.createElement('div'); div.innerHTML = body
    while (div.firstChild) r.appendChild(div.firstChild)

    // Continuation header for page 2+
    if (!isFirst) {
      const t = THEMES[tid] || THEMES['__default__']
      const hdr = document.createElement('div')
      hdr.style.cssText = `margin:0 0 20px;padding:10px 32px;display:flex;align-items:center;gap:12px;background:${t.bg};font-size:12px;color:${t.color};border-bottom:2px solid ${t.accent}`
      hdr.innerHTML = `<span style="font-weight:600">${name}（续）</span><span style="flex:1;height:1px;background:${t.color};opacity:.3"></span><span style="opacity:.5;font-size:10px">第 ${pageIndex()} 页</span>`
      const container = r.querySelector('.resume-body') || r.querySelector('#resume-root') || r.firstElementChild
      if (container) container.prepend(hdr)
    }

    populateShadowDOM(r, data, vis, order)
  }, [css, body, data, vis, order, sections, allSections, isFirst, name, tid])

  return <div ref={hRef} style={{ width: '210mm', height: '297mm', flexShrink: 0 }} />
})

function pageIndex(): number {
  let i = 0; try { throw Error() } catch (e: any) { const stack = e.stack?.split('\n') || []; for (const line of stack) { const m = line.match(/page-(\d+)/); if (m) i = parseInt(m[1]) + 1 } }
  return i + 1
}

const ResumePreview: React.FC = () => {
  const resume = useResumeStore(s => s.resume)
  const vis = useResumeStore(s => s.visibleSections)
  const order = useResumeStore(s => s.sectionOrder)
  const cur = useTemplateStore(s => s.getCurrentTemplate())
  const [key, setKey] = useState(0)
  const [zoom, setZoom] = useState(0.65)
  const [force1, setForce1] = useState(false)
  const [paged, setPaged] = useState(true)
  const tpl = cur || defaultTemplate
  const { css, body } = useMemo(() => parseTemplate(tpl.html), [tpl.html])

  const [pages, setPages] = useState<string[][]>([order])
  const mRef = useRef<HTMLDivElement>(null)

  // Measurement pass: render full template invisibly, measure section heights, assign pages
  useEffect(() => {
    const tid = setTimeout(() => {
      const h = mRef.current; if (!h) return
      let s = (h as any).__m as ShadowRoot | null
      if (!s) { s = h.attachShadow({ mode: 'open' }); (h as any).__m = s }
      s.innerHTML = ''
      s.appendChild(document.createElement('style')).textContent = ':host{display:block;width:210mm}'
      if (css) { const x = document.createElement('style'); x.textContent = css; s.appendChild(x) }
      const d = document.createElement('div'); d.innerHTML = body
      while (d.firstChild) s.appendChild(d.firstChild)
      populateShadowDOM(s, resume, vis, order)
      requestAnimationFrame(() => { const p = assignPages(s, order); setPages(p.length > 0 ? p : [order]) })
    }, 500)
    return () => clearTimeout(tid)
  }, [resume, vis, order, tpl.html, key, css, body])

  const refresh = () => setKey(k => k + 1)

  const exportPDF = useCallback(() => {
    const c = document.createElement('div'); c.innerHTML = body; c.style.cssText = 'position:absolute;left:-9999px;top:0;width:210mm'
    document.body.appendChild(c); populateShadowDOM(c, resume, vis, order)
    const html = c.innerHTML; document.body.removeChild(c)
    const w = window.open('about:blank', '_blank', 'width=800,height=600')
    if (w) { w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
@page{size:A4;margin:8mm 0 0 0}*{box-sizing:border-box}
body{margin:0;padding:0;font-family:'PingFang SC','Microsoft YaHei',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.resume-page{width:210mm;min-height:0!important;overflow:visible!important;height:auto!important}
.resume-section{margin-bottom:24px!important;page-break-inside:avoid}.resume-section:last-child{margin-bottom:0!important}
.entry,.entry-list{page-break-inside:avoid}.section-title{page-break-after:avoid}
${css}</style></head><body>${html}</body></html>`); w.document.close(); setTimeout(() => { try { w.print() } catch {} }, 600) }
  }, [css, body, resume, vis, order])

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 0.75, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', flexShrink: 0, minHeight: 40 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{tpl.meta.name}{paged && pages.length > 1 ? ` (${pages.length} 页)` : ''}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 200, mx: 2 }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem', minWidth: 32, textAlign: 'right' }}>{Math.round(zoom * 100)}%</Typography>
          <Slider size="small" value={zoom} min={0.3} max={1.5} step={0.05} onChange={(_, v) => setZoom(v as number)} sx={{ py: 0 }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Tooltip title={force1 ? '取消强制一页' : '强制一页'}><ToggleButton value="fit" selected={force1} onChange={() => setForce1(!force1)} size="small" sx={{ border: 0, p: 0.5 }}><FitIcon fontSize="small" color={force1 ? 'primary' : 'disabled'} /></ToggleButton></Tooltip>
          <Tooltip title={paged ? '连续预览' : '分页预览'}><ToggleButton value="page" selected={paged} onChange={() => setPaged(!paged)} size="small" sx={{ border: 0, p: 0.5 }}><PagePreviewIcon fontSize="small" color={paged ? 'primary' : 'disabled'} /></ToggleButton></Tooltip>
          <Tooltip title="刷新"><IconButton size="small" onClick={refresh}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="导出 Word (.docx)"><IconButton size="small" onClick={() => generateDocx(resume, tpl.id)}><DownloadIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="导出 PDF（pdfmake）"><IconButton size="small" onClick={() => generatePDF(resume, tpl.id)}><PdfIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.300', display: 'flex', justifyContent: 'center', p: 2 }}>
        <div ref={mRef as any} style={{ position: 'absolute', left: -9999, top: 0, width: '210mm' }} />
        {paged ? (
          <Box sx={{ transform: `scale(${zoom})`, transformOrigin: 'top center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${PAGE_GAP / zoom}px`, flexShrink: 0 }}>
            {pages.map((secs, i) => (
              <Box key={i} sx={{ width: '210mm', height: '297mm', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexShrink: 0, bgcolor: '#fff' }}>
                <ShadowPage sections={secs} allSections={pages.flat()} isFirst={i === 0} css={css} body={body} data={resume} vis={vis} order={order} name={resume.personal.fullName || '简历'} tid={tpl.id} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ transform: `scale(${zoom})`, transformOrigin: 'top center', flexShrink: 0, alignSelf: 'flex-start' }}>
            <ShadowPage sections={pages.flat()} allSections={pages.flat()} isFirst={true} css={css} body={body} data={resume} vis={vis} order={order} name={resume.personal.fullName || '简历'} tid={tpl.id} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ResumePreview
