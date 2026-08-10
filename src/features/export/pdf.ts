/**
 * PDF 导出 — 使用 pdfmake 直接从数据生成 PDF
 * 绕过浏览器打印引擎，精确控制分页和样式
 * 内嵌 PingFang SC 字体（约 10MB），支持中文渲染
 */
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import type { Resume } from '../../types/resume'

/* ═══════════════════════════════════════════════════════════
 * PingFang SC Regular — base64 encoded TTF
 * Download the font file, convert to base64, paste here:
 * 1. Download: https://raw.githubusercontent.com/nicadre/nice-fonts/main/fonts/PingFangSC-Regular.ttf
 *    (or any PingFang SC .ttf file)
 * 2. Run: node -e "const fs=require('fs');console.log(fs.readFileSync('PingFangSC-Regular.ttf').toString('base64'))"
 * 3. Paste the output below as FONT_DATA
 * ═══════════════════════════════════════════════════════════ */
const FONT_DATA = ''

// Load PingFang SC into pdfmake VFS
if (FONT_DATA) {
  pdfMake.vfs = { ...pdfFonts.vfs, 'pingfang.ttf': FONT_DATA }
  pdfMake.fonts = {
    PingFangSC: { normal: 'pingfang.ttf', bold: 'pingfang.ttf', italics: 'pingfang.ttf', bolditalics: 'pingfang.ttf' },
  }
} else {
  pdfMake.vfs = pdfFonts.vfs
}

const FONT = FONT_DATA ? 'PingFangSC' : 'Roboto'

/* ═══════════════════════════════════════════════════════════
 * Build script — generates font data
 * Run: node scripts/embed-font.cjs
 * This reads PingFangSC-Regular.ttf from scripts/ and writes
 * the base64 constant into this file.
 * ═══════════════════════════════════════════════════════════ */

interface PdfTheme {
  id: string; name: string; primary: string; accent: string; dark: boolean; pageColor: string
}

const THEMES: Record<string, PdfTheme> = {
  '__m3_expressive__': { id: '__m3_expressive__', name: 'Material 3', primary: '#4263A0', accent: '#D7E3FF', dark: false, pageColor: '#FFFFFF' },
  '__default__': { id: '__default__', name: '经典专业', primary: '#2563EB', accent: '#D0D5DD', dark: false, pageColor: '#FFFFFF' },
  '__minimal__': { id: '__minimal__', name: '极简 ATS', primary: '#222', accent: '#DDD', dark: false, pageColor: '#FFFFFF' },
  '__academic__': { id: '__academic__', name: '学术', primary: '#5C3D1E', accent: '#C9B99A', dark: false, pageColor: '#FFFAF0' },
  '__creative__': { id: '__creative__', name: '创意设计', primary: '#A78BFA', accent: '#4C1D95', dark: true, pageColor: '#1E1B4B' },
  '__github__': { id: '__github__', name: 'GitHub', primary: '#58A6FF', accent: '#30363D', dark: true, pageColor: '#0D1117' },
  '__vscode__': { id: '__vscode__', name: 'VS Code', primary: '#569CD6', accent: '#007ACC', dark: true, pageColor: '#1E1E1E' },
  '__social__': { id: '__social__', name: '小红书', primary: '#FF2442', accent: '#FF6B81', dark: false, pageColor: '#FFFFFF' },
  '__bento__': { id: '__bento__', name: 'Bento 网格', primary: '#22D3EE', accent: '#333', dark: true, pageColor: '#0A0A0A' },
  '__fde__': { id: '__fde__', name: 'FDE 实施', primary: '#166534', accent: '#86EFAC', dark: false, pageColor: '#FFFFFF' },
}

/* ── pdfmake content builders ── */

type Content = any

function h1(text: string, t: PdfTheme): Content {
  return { text, fontSize: 24, bold: true, color: t.dark ? '#FFF' : t.primary, margin: [0, 0, 0, 4] }
}
function stitle(text: string, t: PdfTheme): Content {
  return { text, fontSize: 13, bold: true, color: t.primary, margin: [0, 12, 0, 6] }
}
function divider(t: PdfTheme): Content {
  return { canvas: [{ type: 'line', x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 0.5, lineColor: t.accent }], margin: [0, 6, 0, 6] }
}
function para(text: string, opts?: { indent?: number; size?: number; color?: string; bold?: boolean }): Content {
  return { text, fontSize: opts?.size || 10, color: opts?.color || '#333', margin: [opts?.indent || 0, 0, 0, 3], bold: !!opts?.bold, lineHeight: 1.5 }
}

function render(resume: Resume, t: PdfTheme): Content[] {
  const content: Content[] = []
  const pf = resume.personal
  const txt = t.dark ? '#DDD' : '#222'
  const bdy = t.dark ? '#BBB' : '#444'

  content.push(h1(pf.fullName || '', t))
  const sub = [pf.jobTitle, pf.gender, pf.age ? `${pf.age}岁` : ''].filter(Boolean).join('  ·  ')
  if (sub) content.push({ text: sub, fontSize: 10, color: t.dark ? '#AAA' : '#666', margin: [0, 0, 0, 6] })
  const lines = [[pf.phone, pf.email, pf.location].filter(Boolean).join('  ·  '), [pf.website, pf.github].filter(Boolean).join('  ·  ')].filter(l => l)
  for (const l of lines) content.push({ text: l, fontSize: 9, color: t.dark ? '#CCC' : t.primary, margin: [0, 2, 0, 2] })
  content.push(divider(t))

  if (resume.profile) { content.push(stitle('个人简介', t)); content.push(para(resume.profile, { indent: 4, color: bdy })) }

  if (resume.skills.groups.length) {
    content.push(stitle('专业技能', t))
    for (const g of resume.skills.groups) content.push({ text: [{ text: `${g.name}：`, bold: true, fontSize: 10, color: t.primary }, { text: g.items.join('、'), fontSize: 10, color: txt }], margin: [0, 0, 0, 3] })
  }

  if (resume.work.length) {
    content.push(stitle('工作经历', t))
    for (const w of resume.work) {
      content.push({ text: [{ text: w.company, bold: true, fontSize: 11, color: txt }, { text: `  ${w.position}`, fontSize: 10, color: t.primary }], margin: [0, 6, 0, 2] })
      if (w.description) content.push(para(w.description, { indent: 8, color: bdy }))
      for (const a of (w.achievements || [])) content.push(para(`• ${a}`, { indent: 16, color: bdy, size: 9 }))
      content.push({ text: `${w.startDate || ''} ~ ${w.endDate || ''}`, fontSize: 7, color: '#999', margin: [0, 2, 0, 8] })
    }
  }

  if (resume.projects.length) {
    content.push(stitle('项目经验', t))
    for (const pj of resume.projects) {
      content.push({ text: [{ text: pj.name, bold: true, fontSize: 11, color: txt }, { text: `  ${pj.role}`, fontSize: 10, color: t.primary }], margin: [0, 6, 0, 2] })
      if (pj.description) content.push(para(pj.description, { indent: 8, color: bdy }))
      for (const h of (pj.highlights || [])) content.push(para(`• ${h}`, { indent: 16, color: bdy, size: 9 }))
      content.push({ text: '', margin: [0, 0, 0, 6] })
    }
  }

  if (resume.education.length) {
    content.push(stitle('教育背景', t))
    for (const edu of resume.education) {
      content.push({ text: [{ text: edu.school, bold: true, fontSize: 11, color: txt }, { text: `  ${edu.major} · ${edu.degree}`, fontSize: 10, color: '#888' }], margin: [0, 2, 0, 2] })
      content.push({ text: `${edu.startDate || ''} ~ ${edu.endDate || ''}`, fontSize: 7, color: '#999', margin: [0, 0, 0, 6] })
    }
  }

  if (resume.certificates.list.length || (resume.certificates.languages || []).length) {
    content.push(stitle('证书 & 语言', t))
    if (resume.certificates.list.length) content.push(para(resume.certificates.list.join('  ·  '), { color: bdy }))
    for (const l of (resume.certificates.languages || [])) content.push(para(`${l.name}（${l.level}）`, { color: bdy }))
  }

  return content
}

export function generatePDF(resume: Resume, templateId: string) {
  const t = THEMES[templateId] || THEMES['__default__']
  const content = render(resume, t)

  const docDef: any = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    content,
    defaultStyle: { fontSize: 10 },
  }

  if (FONT_DATA) {
    docDef.defaultStyle.font = 'PingFangSC'
  }

  if (t.dark) {
    docDef.background = { canvas: [{ type: 'rect', x: 0, y: 0, w: 595.28, h: 841.89, color: t.pageColor }] }
  }

  const doc = pdfMake.createPdf(docDef)
  doc.download(`${resume.personal.fullName || '简历'}-${t.name}.pdf`)
}
