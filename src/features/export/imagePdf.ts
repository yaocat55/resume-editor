/**
 * Image PDF 导出 — Searchable Image PDF (单页长图)
 *
 * 不切割不分页，直接输出一张跟内容等高的长 PDF 页。
 * CSS 100% 保留，A4 宽度 + 自适应高度。
 */
import { toPng } from 'html-to-image'
import { PDFDocument, rgb, PageSizes } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { Resume } from '../../types/resume'
import { FONT_DATA } from './fontData'

const PAGE_W_PX = 794
const PX_TO_PT = 72 / 96
const SCALE = 2

interface TextSpan { text: string; x: number; y: number; w: number; h: number }

function extractTextSpans(root: Element, refTop: number): TextSpan[] {
  const spans: TextSpan[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const node = walker.currentNode
    const text = node.textContent?.trim()
    if (!text) continue
    const parent = node.parentElement
    if (!parent) continue
    const style = window.getComputedStyle(parent)
    if (style.display === 'none' || style.visibility === 'hidden') continue
    try {
      const range = document.createRange()
      range.selectNodeContents(node)
      const rr = range.getBoundingClientRect()
      if (rr.width > 0 && rr.height > 0) {
        spans.push({ text, x: rr.left - refTop, y: rr.top - refTop, w: rr.width, h: rr.height })
        continue
      }
    } catch { /* ok */ }
    const pr = parent.getBoundingClientRect()
    if (pr.width > 0 && pr.height > 0) {
      spans.push({ text, x: pr.left - refTop, y: pr.top - refTop, w: pr.width, h: pr.height })
    }
  }
  return spans
}

export async function generateImagePDF(
  resume: Resume,
  templateHTML: string,
  _pageSections: string[][],
  templateId: string,
  vis: Record<string, boolean>,
  order: string[],
  populateFn: (root: Element, data: Resume, vis?: Record<string, boolean>, order?: string[]) => void,
) {
  const css: string[] = []
  const sRe = /<style[^>]*>([\s\S]*?)<\/style>/gi
  let m: RegExpExecArray | null
  while ((m = sRe.exec(templateHTML)) !== null) css.push(m[1])
  const templateCSS = css.join('\n')
  const bm = templateHTML.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const templateBody = bm ? bm[1] : templateHTML
  const name = resume.personal.fullName || '简历'

  // 1. Render full content
  const container = document.createElement('div')
  container.style.cssText = 'position:absolute;left:-9999px;top:0;'
  document.body.appendChild(container)

  const fullPage = document.createElement('div')
  fullPage.style.cssText = `width:${PAGE_W_PX}px;background:#fff;`

  const styleEl = document.createElement('style')
  styleEl.textContent = templateCSS + `.resume-page{box-shadow:none!important;border-radius:0!important;min-height:auto!important;}`
  fullPage.appendChild(styleEl)

  const bw = document.createElement('div')
  bw.innerHTML = templateBody
  while (bw.firstChild) fullPage.appendChild(bw.firstChild)

  populateFn(fullPage, resume, vis, order)
  container.appendChild(fullPage)

  await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())))

  const rootRect = fullPage.getBoundingClientRect()
  const refTop = rootRect.top
  const contentHeight = fullPage.offsetHeight

  // 2. Screenshot
  const fullDataUrl = await toPng(fullPage, {
    pixelRatio: SCALE,
    cacheBust: true,
    width: PAGE_W_PX,
    height: Math.ceil(contentHeight),
  })

  // 3. Text spans
  const allSpans = extractTextSpans(fullPage, refTop)

  document.body.removeChild(container)

  // 4. Single-page PDF
  const pageWpt = PAGE_W_PX * PX_TO_PT
  const pageHpt = contentHeight * PX_TO_PT

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const fontBytes = Uint8Array.from(atob(FONT_DATA), c => c.charCodeAt(0))
  const customFont = await pdfDoc.embedFont(fontBytes)

  const resp = await fetch(fullDataUrl)
  const imgBytes = await resp.arrayBuffer()
  const img = await pdfDoc.embedPng(imgBytes)

  const pdfPage = pdfDoc.addPage([pageWpt, pageHpt])
  pdfPage.drawImage(img, { x: 0, y: 0, width: pageWpt, height: pageHpt })

  for (const span of allSpans) {
    const px = span.x * PX_TO_PT
    const py = pageHpt - (span.y + span.h) * PX_TO_PT
    const fs = Math.max(5, Math.min(14, span.h * PX_TO_PT * 0.75))
    if (px >= 0 && px < pageWpt && py >= 0 && py < pageHpt) {
      pdfPage.drawText(span.text, { x: px, y: py, size: fs, font: customFont, color: rgb(0, 0, 0), opacity: 0 })
    }
  }

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
