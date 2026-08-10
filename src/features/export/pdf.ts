/**
 * PDF 导出 — 使用隐藏 iframe + 浏览器原生打印
 * 完美支持中文，分页由浏览器 CSS @page 处理
 */
import type { Resume } from '../../types/resume'

export function generatePDF(resume: Resume, _templateId: string) {
  const html = document.getElementById('resume-print-root')?.innerHTML || ''
  const styleEl = document.getElementById('resume-print-styles')
  const printCSS = styleEl?.textContent || ''

  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;border:none;z-index:9999;background:#fff'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument || iframe.contentWindow!.document
  doc.open()
  doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    @page { size: A4; margin: 8mm; }
    body { margin: 0; font-family: 'PingFang SC','Microsoft YaHei',sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .resume-page { width: 210mm; min-height: 0 !important; overflow: visible !important; }
    .resume-section, .entry, .entry-list { page-break-inside: avoid; }
    .section-title { page-break-after: avoid; }
    ${printCSS}
  </style></head><body>${html}</body></html>`)
  doc.close()

  iframe.onload = () => {
    iframe.contentWindow!.focus()
    iframe.contentWindow!.print()
    setTimeout(() => document.body.removeChild(iframe), 500)
  }

  // Fallback: if iframe already loaded
  if (doc.readyState === 'complete' || doc.readyState === 'interactive') {
    iframe.contentWindow!.focus()
    iframe.contentWindow!.print()
    setTimeout(() => document.body.removeChild(iframe), 500)
  }
}
