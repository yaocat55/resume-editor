import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { Box, IconButton, Tooltip, Typography, Slider, ToggleButton } from '@mui/material'
import { Refresh as RefreshIcon, FileDownload as DownloadIcon, PictureAsPdf as PdfIcon, ContentCopy as CopyIcon, CropSquare as FitIcon, ViewDayOutlined as PagePreviewIcon } from '@mui/icons-material'
import useResumeStore from '../../store/resumeStore'
import useTemplateStore from '../../store/templateStore'
import { defaultTemplate, populateShadowDOM } from '../../templates'
import type { Resume } from '../../types/resume'

declare global { interface Window { electronAPI?: { exportPDF: (html: string) => Promise<boolean>; onMenuExportPDF: (cb: () => void) => void } } }

const PAGE_H = 1122
const PAGE_GAP = 12

/* ── Template header themes for continuation pages ── */
const THEMES: Record<string, { bg: string; color: string }> = {
  '__m3_expressive__': { bg: '#e8eef5', color: '#4263a0' },
  '__default__': { bg: '#f0f2f5', color: '#2d3748' },
  '__minimal__': { bg: '#f8f9fa', color: '#333' },
  '__academic__': { bg: '#f5f0e5', color: '#5c3d1e' },
  '__creative__': { bg: '#1e1b4b', color: '#e0d9ff' },
  '__github__': { bg: '#161b22', color: '#c9d1d9' },
  '__vscode__': { bg: '#1e1e1e', color: '#d4d4d4' },
  '__social__': { bg: '#fff0f0', color: '#ff2442' },
  '__bento__': { bg: '#111', color: '#fff' },
  '__fde__': { bg: '#f0fdf4', color: '#166534' },
}

function parseHTML(html: string) {
  const css: string[] = []
  const r = /<style[^>]*>([\s\S]*?)<\/style>/gi; let m: RegExpExecArray|null
  while ((m = r.exec(html)) !== null) css.push(m[1])
  let body = html
  const bm = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bm) body = bm[1]
  return { css: css.join('\n'), body }
}

/** Measure sections in a fully-rendered Shadow DOM */
function measureSections(shadow: ShadowRoot): { sections: string[]; heights: number[] } {
  const page = shadow.querySelector('.resume-page') as HTMLElement|null
  if (!page) return { sections: [], heights: [] }
  // Find the section container
  const body = page.querySelector('.resume-body') || page.querySelector('#resume-root') || page
  const sections: string[] = []
  const heights: number[] = []
  for (const el of Array.from(body.children)) {
    const e = el as HTMLElement
    if (e.offsetHeight < 5) continue
    const id = e.getAttribute('id') || e.getAttribute('data-section')
    if (id) { sections.push(id); heights.push(e.offsetHeight) }
  }
  return { sections, heights }
}

/** Assign sections to pages greedily */
function assignPages(sections: string[], heights: number[]): string[][] {
  const pages: string[][] = [[]]
  let used = 0
  for (let i = 0; i < sections.length; i++) {
    if (used > 20 && used + heights[i] > PAGE_H) { pages.push([]); used = 0 }
    pages[pages.length-1].push(sections[i])
    used += heights[i]
  }
  return pages.filter(p => p.length > 0)
}

function isGridTemplate(cssText: string): boolean {
  return /#resume-root\s*\{[^}]*display\s*:\s*(grid|flex)\b/.test(cssText)
}

/* ── One page ── */
const ShadowPage = React.memo<{
  pageSections: string[]
  allSections: string[]
  isFirst: boolean
  cssText: string; bodyHTML: string
  data: Resume; vis: Record<string,boolean>; order: string[]
  name: string
  tid: string
  useGrid: boolean
}>(({ pageSections, allSections, isFirst, cssText, bodyHTML, data, vis, order, name, tid, useGrid }) => {
  const hRef = useRef<HTMLDivElement>(null); const rRef = useRef<ShadowRoot|null>(null)
  useEffect(() => {
    const h = hRef.current; if (!h) return
    if (!rRef.current) rRef.current = h.attachShadow({ mode:'open' })
    const r = rRef.current; r.innerHTML = ''

    // Base + multi-page print rules
    const s = document.createElement('style')
    s.textContent = `:host{display:block;width:210mm;height:297mm;overflow:hidden;background:#fff}
.resume-page{min-height:0!important}
.skill-tag.secondary{opacity:.7;font-weight:400!important}
.skill-group[data-type="secondary"] .group-name::after{content:"（加分项）";font-weight:400;opacity:.6;font-size:.75em}
.resume-section{margin-bottom:24px!important}.resume-section:last-child{margin-bottom:0!important}
@media print{.resume-page{overflow:visible!important;height:auto!important}.resume-section,.entry,.entry-list{page-break-inside:avoid}.section-title{page-break-after:avoid}}
`
    r.appendChild(s)
    if (cssText) { const t = document.createElement('style'); t.textContent = cssText; r.appendChild(t) }

    // Don't hide sections for grid layouts — use viewport offset instead
    if (!isFirst && !useGrid) {
      const hide = document.createElement('style')
      hide.textContent = allSections.filter(s => !pageSections.includes(s)).map(s => `#${s}{display:none!important}`).join('\n')
      r.appendChild(hide)
    }
    if (!isFirst && useGrid) {
      // Viewport offset for grid: shift content + clip
      const shift = document.createElement('style')
      const offset = allSections.indexOf(pageSections[0]) > 0 ? PAGE_H : 0
      shift.textContent = `.resume-page{margin-top:-${offset}px!important}.resume-page>*:first-child{display:none!important}`
      r.appendChild(shift)
    }

    // Continuation header for page 2+
    if (!isFirst) {
      const t = THEMES[tid] || THEMES['__default__']
      const hdr = document.createElement('div')
      hdr.style.cssText = `margin:0 0 20px;padding:10px 32px;display:flex;align-items:center;gap:12px;background:${t.bg};font-size:12px;color:${t.color};border-bottom:2px solid transparent;`
      hdr.innerHTML = `<span style="font-weight:600">${name}（续）</span><span style="flex:1;height:1px;background:${t.color};opacity:.3"></span>`
      const c = document.createElement('div'); c.innerHTML = bodyHTML
      while (c.firstChild) r.appendChild(c.firstChild)
      const container = r.querySelector('.resume-body') || r.querySelector('#resume-root') || r.firstElementChild
      if (container) container.prepend(hdr)
    } else {
      const d = document.createElement('div'); d.innerHTML = bodyHTML
      while (d.firstChild) r.appendChild(d.firstChild)
    }

    populateShadowDOM(r, data, vis, order)
  }, [cssText,bodyHTML,data,vis,order,pageSections,allSections,isFirst,name,tid,useGrid])

  return <div ref={hRef} style={{ width:'210mm', height:'297mm', flexShrink:0 }}/>
})

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
  const { css, body } = useMemo(() => parseHTML(tpl.html), [tpl.html])
  const grid = useMemo(() => isGridTemplate(css), [css])

  const [pageSections, setPageSections] = useState<string[][]>([order])
  const mRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      const h = mRef.current; if (!h) return
      let s = (h as any).__m as ShadowRoot|null
      if (!s) { s = h.attachShadow({ mode:'open' }); (h as any).__m = s }
      s.innerHTML = ''
      const bs = document.createElement('style'); bs.textContent = ':host{display:block;width:210mm}'; s.appendChild(bs)
      if (css) { const x = document.createElement('style'); x.textContent = css; s.appendChild(x) }
      const d = document.createElement('div'); d.innerHTML = body
      while (d.firstChild) s.appendChild(d.firstChild)
      populateShadowDOM(s, resume, vis, order)
      requestAnimationFrame(() => {
        const { sections, heights } = measureSections(s)
        const pages = assignPages(sections, heights)
        setPageSections(pages.length > 0 ? pages : [order])
      })
    }, 500)
    return () => clearTimeout(t)
  }, [resume,vis,order,tpl.html,key,css,body])

  const refresh = () => setKey(k => k+1)

  const exportPDF = useCallback(() => {
    const c = document.createElement('div'); c.innerHTML = body; c.style.cssText = 'position:absolute;left:-9999px;top:0;width:210mm'
    document.body.appendChild(c)
    populateShadowDOM(c, resume, vis, order)
    const html = c.innerHTML; document.body.removeChild(c)
    const w = window.open('about:blank','_blank','width=800,height=600')
    if (w) { w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
@page{size:A4;margin:8mm 0 0 0}*{box-sizing:border-box}
body{margin:0;padding:0;font-family:'PingFang SC','Microsoft YaHei',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.resume-page{width:210mm;min-height:0!important;overflow:visible!important;height:auto!important}
.resume-section{margin-bottom:24px!important;page-break-inside:avoid}.resume-section:last-child{margin-bottom:0!important}
.entry,.entry-list{page-break-inside:avoid}.section-title{page-break-after:avoid}
${css}</style></head><body>${html}</body></html>`); w.document.close(); setTimeout(()=>{try{w.print()}catch{}},600) }
  }, [css,body,resume,vis,order])

  return (
    <Box sx={{ height:'100%', display:'flex', flexDirection:'column', bgcolor:'background.default' }}>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:2, py:0.75, bgcolor:'background.paper', borderBottom:1, borderColor:'divider', flexShrink:0, minHeight:40 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize:'0.8rem' }}>{tpl.meta.name}{paged&&pageSections.length>1?` (${pageSections.length} 页)`:''}</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:1, flex:1, maxWidth:200, mx:2 }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize:'0.7rem', minWidth:32, textAlign:'right' }}>{Math.round(zoom*100)}%</Typography>
          <Slider size="small" value={zoom} min={0.3} max={1.5} step={0.05} onChange={(_,v)=>setZoom(v as number)} sx={{ py:0 }}/>
        </Box>
        <Box sx={{ display:'flex', gap:0.5, alignItems:'center' }}>
          <Tooltip title={force1?'取消强制一页':'强制一页'}><ToggleButton value="fit" selected={force1} onChange={()=>setForce1(!force1)} size="small" sx={{ border:0,p:0.5 }}><FitIcon fontSize="small" color={force1?'primary':'disabled'}/></ToggleButton></Tooltip>
          <Tooltip title={paged?'连续预览':'分页预览'}><ToggleButton value="page" selected={paged} onChange={()=>setPaged(!paged)} size="small" sx={{ border:0,p:0.5 }}><PagePreviewIcon fontSize="small" color={paged?'primary':'disabled'}/></ToggleButton></Tooltip>
          <Tooltip title="刷新"><IconButton size="small" onClick={refresh}><RefreshIcon fontSize="small"/></IconButton></Tooltip>
          <Tooltip title="导出 PDF"><IconButton size="small" onClick={exportPDF}><PdfIcon fontSize="small"/></IconButton></Tooltip>
        </Box>
      </Box>
      <Box sx={{ flex:1, overflow:'auto', bgcolor:'grey.300', display:'flex', justifyContent:'center', p:2 }}>
        <div ref={mRef as any} style={{ position:'absolute', left:'-9999px', top:0, width:'210mm' }}/>
        {paged ? (
          <Box sx={{ transform:`scale(${zoom})`, transformOrigin:'top center', display:'flex', flexDirection:'column', alignItems:'center', gap:`${PAGE_GAP/zoom}px`, flexShrink:0 }}>
            {pageSections.map((secs, i) => (
              <Box key={i} sx={{ width:'210mm', height:'297mm', boxShadow:'0 2px 12px rgba(0,0,0,0.15)', flexShrink:0, bgcolor:'#fff' }}>
                <ShadowPage
                  pageSections={secs}
                  allSections={pageSections.flat()}
                  isFirst={i===0}
                  cssText={css} bodyHTML={body}
                  data={resume} vis={vis} order={order}
                  name={resume.personal.fullName||'简历'} tid={tpl.id}
                  useGrid={grid}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ transform:`scale(${zoom})`, transformOrigin:'top center', flexShrink:0, alignSelf:'flex-start' }}>
            <ShadowPage
              pageSections={pageSections.flat()}
              allSections={pageSections.flat()}
              isFirst={true} cssText={css} bodyHTML={body}
              data={resume} vis={vis} order={order}
              name={resume.personal.fullName||'简历'} tid={tpl.id}
              useGrid={false}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ResumePreview
