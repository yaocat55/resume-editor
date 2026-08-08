import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { Box, IconButton, Tooltip, Typography, Slider, ToggleButton } from '@mui/material'
import { Refresh as RefreshIcon, FileDownload as DownloadIcon, PictureAsPdf as PdfIcon, ContentCopy as CopyIcon, CropSquare as FitIcon, ViewDayOutlined as PagePreviewIcon } from '@mui/icons-material'
import useResumeStore from '../../store/resumeStore'
import useTemplateStore from '../../store/templateStore'
import { defaultTemplate, populateShadowDOM } from '../../templates'
import type { Resume } from '../../types/resume'

declare global { interface Window { electronAPI?: { exportPDF: (html: string) => Promise<boolean>; onMenuExportPDF: (cb: () => void) => void } } }

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

/** Continuation header styles per template */
const THEMES: Record<string, { bg: string; color: string; accent: string }> = {
  '__m3_expressive__': { bg: '#e8eef5', color: '#4263a0', accent: '#d7e3ff' },
  '__default__': { bg: '#f0f2f5', color: '#2d3748', accent: '#d0d5dd' },
  '__minimal__': { bg: '#f8f9fa', color: '#333', accent: '#ddd' },
  '__academic__': { bg: '#f5f0e5', color: '#5c3d1e', accent: '#c9b99a' },
  '__creative__': { bg: '#1e1b4b', color: '#e0d9ff', accent: '#4c1d95' },
  '__github__': { bg: '#161b22', color: '#c9d1d9', accent: '#30363d' },
  '__vscode__': { bg: '#1e1e1e', color: '#d4d4d4', accent: '#007acc' },
  '__social__': { bg: '#fff0f0', color: '#ff2442', accent: '#ff6b81' },
  '__bento__': { bg: 'rgba(255,255,255,0.06)', color: '#fff', accent: 'rgba(255,255,255,0.15)' },
  '__fde__': { bg: '#f0fdf4', color: '#166534', accent: '#86efac' },
}

function injectContHeader(root: ShadowRoot, page: number, templateId: string, name: string) {
  const t = THEMES[templateId] || THEMES['__default__']
  const hdr = document.createElement('div')
  hdr.className = 'cont-header'
  hdr.setAttribute('data-page', String(page + 1))
  hdr.style.cssText = `margin:0 0 20px;padding:10px 32px;display:flex;align-items:center;gap:12px;background:${t.bg};border-bottom:2px solid ${t.accent};font-size:12px;color:${t.color};`
  hdr.innerHTML = `<span style="font-weight:600;opacity:0.9;">${name}（续）</span><span style="flex:1;height:1px;background:${t.accent};opacity:0.6"></span><span style="opacity:0.5;font-size:10px;">第 ${page + 1} 页</span>`
  const c = root.querySelector('.resume-body') || root.querySelector('#resume-root') || root.firstElementChild
  if (c) { c.querySelectorAll('.cont-header').forEach(e => e.remove()); c.prepend(hdr) }
}

const ShadowPage = React.memo<{
  page: number; single: boolean; cssText: string; bodyHTML: string
  data: Resume; vis: Record<string,boolean>; order: string[]; tid: string
}>(({ page, single, cssText, bodyHTML, data, vis, order, tid }) => {
  const hostRef = useRef<HTMLDivElement>(null); const rootRef = useRef<ShadowRoot|null>(null)
  useEffect(() => {
    const h = hostRef.current; if (!h) return
    if (!rootRef.current) rootRef.current = h.attachShadow({ mode: 'open' })
    const r = rootRef.current; r.innerHTML = ''
    const s = document.createElement('style')
    s.textContent = `:host{display:block;width:210mm;background:#fff;${single?'':'height:297mm;overflow:hidden'}} .resume-page{min-height:0!important} .skill-tag.secondary{opacity:.7;font-weight:400!important} .skill-group[data-type="secondary"] .group-name::after{content:"（加分项）";font-weight:400;opacity:.6;font-size:.75em} .resume-section{margin-bottom:24px!important}.resume-section:last-child{margin-bottom:0!important} @media print{.resume-page{overflow:visible!important;height:auto!important}.resume-section,.entry,.entry-list{page-break-inside:avoid}.section-title{page-break-after:avoid}}`
    r.appendChild(s)
    if (cssText) { const t = document.createElement('style'); t.textContent = cssText; r.appendChild(t) }
    if (!single && page > 0) {
      const shift = document.createElement('style')
      shift.textContent = `.resume-page{margin-top:-${page*PAGE_HEIGHT}px!important;padding-top:${page*PAGE_HEIGHT}px!important}`
      r.appendChild(shift)
    }
    const d = document.createElement('div'); d.innerHTML = bodyHTML
    while (d.firstChild) r.appendChild(d.firstChild)
    if (!single && page > 0) injectContHeader(r, page, tid, data.personal.fullName || '简历')

    // Always show all sections — paging is handled by viewport offset
    // BUT hide first-page-only sections on page 2+
    if (!single && page > 0) {
      const hideCss = document.createElement('style')
      hideCss.textContent = `#personal,#profile,.profile-banner,header,.resume-header{display:none!important}`
      r.appendChild(hideCss)
    }
    populateShadowDOM(r, data, vis, order)
  }, [cssText,bodyHTML,data,vis,order,page,single,tid])
  return <div ref={hostRef} style={single?{width:'210mm'}:{width:'210mm',height:'297mm',flexShrink:0}}/>
})

function countPages(s: ShadowRoot): number {
  const p = s.querySelector('.resume-page') || s.firstElementChild
  return p ? Math.max(1, Math.ceil((p as HTMLElement).scrollHeight / PAGE_HEIGHT)) : 1
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
  const { cssText, bodyHTML } = useMemo(() => parseTemplateHTML(tpl.html), [tpl.html])
  const [pages, setPages] = useState(1)
  const mRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      const h = mRef.current; if (!h) return
      let s = (h as any).__m as ShadowRoot|null
      if (!s) { s = h.attachShadow({ mode: 'open' }); (h as any).__m = s }
      s.innerHTML = ''; s.appendChild(document.createElement('style')).textContent = ':host{display:block;width:210mm}'
      if (cssText) { const x = document.createElement('style'); x.textContent = cssText; s.appendChild(x) }
      const d = document.createElement('div'); d.innerHTML = bodyHTML
      while (d.firstChild) s.appendChild(d.firstChild)
      populateShadowDOM(s, resume, vis, order)
      requestAnimationFrame(() => setPages(countPages(s)))
    }, 500)
    return () => clearTimeout(t)
  }, [resume,vis,order,tpl.html,key,cssText,bodyHTML])

  const refresh = () => setKey(k => k + 1)

  const exportPDF = useCallback(() => {
    const c = document.createElement('div'); c.innerHTML = bodyHTML; c.style.cssText = 'position:absolute;left:-9999px;top:0;width:210mm'
    document.body.appendChild(c); populateShadowDOM(c, resume, vis, order)
    const body = c.innerHTML; document.body.removeChild(c)
    const w = window.open('about:blank','_blank','width=800,height=600')
    if (w) { w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>@page{size:A4;margin:8mm 0 0 0}*{box-sizing:border-box}body{margin:0;padding:0;font-family:'PingFang SC','Microsoft YaHei',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.resume-page{width:210mm;min-height:0!important;overflow:visible!important;height:auto!important}.resume-section{margin-bottom:24px!important;page-break-inside:avoid}.resume-section:last-child{margin-bottom:0!important}.entry,.entry-list{page-break-inside:avoid}.section-title{page-break-after:avoid}${cssText}</style></head><body>${body}</body></html>`); w.document.close(); setTimeout(()=>{try{w.print()}catch{}},600) }
  }, [cssText,bodyHTML,resume,vis,order])

  return (
    <Box sx={{ height:'100%', display:'flex', flexDirection:'column', bgcolor:'background.default' }}>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:2, py:0.75, bgcolor:'background.paper', borderBottom:1, borderColor:'divider', flexShrink:0, minHeight:40 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize:'0.8rem' }}>{tpl.meta.name}{paged&&pages>1?` (${pages} 页)`:''}</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:1, flex:1, maxWidth:200, mx:2 }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize:'0.7rem', minWidth:32, textAlign:'right' }}>{Math.round(zoom*100)}%</Typography>
          <Slider size="small" value={zoom} min={0.3} max={1.5} step={0.05} onChange={(_,v)=>setZoom(v as number)} sx={{ py:0 }} />
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
            {Array.from({length:pages},(_,i)=>(
              <Box key={i} sx={{ width:'210mm', height:'297mm', boxShadow:'0 2px 12px rgba(0,0,0,0.15)', flexShrink:0, bgcolor:'#fff' }}>
                <ShadowPage page={i} single={false} cssText={cssText} bodyHTML={bodyHTML} data={resume} vis={vis} order={order} tid={tpl.id}/>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ transform:`scale(${zoom})`, transformOrigin:'top center', flexShrink:0, alignSelf:'flex-start' }}>
            <ShadowPage page={-1} single={true} cssText={cssText} bodyHTML={bodyHTML} data={resume} vis={vis} order={order} tid={tpl.id}/>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ResumePreview
