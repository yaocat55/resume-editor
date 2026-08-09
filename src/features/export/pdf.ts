/**
 * PDF 导出 — 使用 pdfmake 直接从数据生成 PDF
 * 绕过浏览器打印引擎，精确控制分页和样式
 * 10 套模板各自有独立的 PDF 视觉风格
 */
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import type { Resume } from '../../types/resume'

pdfMake.vfs = pdfFonts.vfs

type Content = any
type LayoutFn = (resume: Resume, t: PdfTheme) => Content[]

interface PdfTheme {
  id: string
  name: string
  primary: string
  bg: string
  accent: string
  font: string
  /** Dark background template? */
  dark: boolean
  /** Page background color */
  pageColor: string
  /** Header style per template */
  headerStyle: 'm3-pill' | 'classic-underline' | 'minimal-rule' | 'academic-ornament' | 'creative-gradient' | 'github-card' | 'vscode-sidebar' | 'social-banner' | 'bento-dark' | 'fde-teal'
}

const THEMES: Record<string, PdfTheme> = {
  '__m3_expressive__': {
    id: '__m3_expressive__', name: 'Material 3', primary: '#4263A0', bg: '#E8EEF5', accent: '#D7E3FF',
    font: 'PingFang SC', dark: false, pageColor: '#FFFFFF', headerStyle: 'm3-pill',
  },
  '__default__': {
    id: '__default__', name: '经典专业', primary: '#2563EB', bg: '#F0F2F5', accent: '#D0D5DD',
    font: 'PingFang SC', dark: false, pageColor: '#FFFFFF', headerStyle: 'classic-underline',
  },
  '__minimal__': {
    id: '__minimal__', name: '极简 ATS', primary: '#222222', bg: '#FFFFFF', accent: '#DDDDDD',
    font: 'PingFang SC', dark: false, pageColor: '#FFFFFF', headerStyle: 'minimal-rule',
  },
  '__academic__': {
    id: '__academic__', name: '学术', primary: '#5C3D1E', bg: '#F5F0E5', accent: '#C9B99A',
    font: 'Times', dark: false, pageColor: '#FFFAF0', headerStyle: 'academic-ornament',
  },
  '__creative__': {
    id: '__creative__', name: '创意设计', primary: '#A78BFA', bg: '#1E1B4B', accent: '#4C1D95',
    font: 'PingFang SC', dark: true, pageColor: '#1E1B4B', headerStyle: 'creative-gradient',
  },
  '__github__': {
    id: '__github__', name: 'GitHub', primary: '#58A6FF', bg: '#0D1117', accent: '#30363D',
    font: 'PingFang SC', dark: true, pageColor: '#0D1117', headerStyle: 'github-card',
  },
  '__vscode__': {
    id: '__vscode__', name: 'VS Code', primary: '#569CD6', bg: '#1E1E1E', accent: '#007ACC',
    font: 'PingFang SC', dark: true, pageColor: '#1E1E1E', headerStyle: 'vscode-sidebar',
  },
  '__social__': {
    id: '__social__', name: '小红书', primary: '#FF2442', bg: '#FFF0F0', accent: '#FF6B81',
    font: 'PingFang SC', dark: false, pageColor: '#FFFFFF', headerStyle: 'social-banner',
  },
  '__bento__': {
    id: '__bento__', name: 'Bento 网格', primary: '#22D3EE', bg: '#0A0A0A', accent: '#333333',
    font: 'PingFang SC', dark: true, pageColor: '#0A0A0A', headerStyle: 'bento-dark',
  },
  '__fde__': {
    id: '__fde__', name: 'FDE 实施', primary: '#166534', bg: '#F0FDF4', accent: '#86EFAC',
    font: 'PingFang SC', dark: false, pageColor: '#FFFFFF', headerStyle: 'fde-teal',
  },
}

/* ── Style builders per theme ── */

function sectionDivider(t: PdfTheme): Content {
  switch (t.headerStyle) {
    case 'creative-gradient':
      return { canvas: [{ type: 'line', x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 1, lineColor: t.accent, opacity: 0.5 }], margin: [0, 6, 0, 6] }
    case 'github-card':
      return { canvas: [{ type: 'line', x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 0.5, lineColor: t.accent }], margin: [0, 8, 0, 8] }
    case 'academic-ornament':
      return { text: '❧ ❧ ❧', alignment: 'center', fontSize: 10, color: t.accent, margin: [0, 8, 0, 8] }
    case 'social-banner':
      return { canvas: [{ type: 'rect', x: 0, y: 0, w: 515, h: 3, color: t.primary }], margin: [0, 6, 0, 10] }
    default:
      return { canvas: [{ type: 'line', x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 0.5, lineColor: t.primary, opacity: 0.2 }], margin: [0, 6, 0, 6] }
  }
}

function sectionTitle(text: string, t: PdfTheme): Content {
  const color = t.dark ? t.primary : t.primary
  switch (t.headerStyle) {
    case 'academic-ornament':
      return { text, fontSize: 14, bold: true, color, margin: [0, 12, 0, 4], fontFeatures: ['smcp'] }
    case 'github-card':
      return { text, fontSize: 13, bold: true, color, margin: [0, 12, 0, 6] }
    case 'creative-gradient':
      return { text, fontSize: 15, bold: true, color: t.primary, margin: [0, 14, 0, 6] }
    default:
      return { text, fontSize: 13, bold: true, color, margin: [0, 12, 0, 6] }
  }
}

function headerName(text: string, t: PdfTheme): Content {
  if (t.headerStyle === 'social-banner') {
    return { text, fontSize: 28, bold: true, color: t.primary, margin: [0, 0, 0, 2] }
  }
  return { text, fontSize: 24, bold: true, color: t.dark ? '#FFFFFF' : t.primary, margin: [0, 0, 0, 4] }
}

function headerSubtitle(pf: any, t: PdfTheme): Content {
  const parts = [pf.jobTitle, pf.gender, pf.age ? `${pf.age}岁` : ''].filter(Boolean)
  return { text: parts.join('  ·  '), fontSize: 10, color: t.dark ? '#AAAAAA' : '#666666', margin: [0, 0, 0, 8] }
}

function contactLine(items: string[], t: PdfTheme): Content {
  if (t.headerStyle === 'm3-pill') {
    return {
      columns: items.map(text => ({
        text, fontSize: 8, color: t.primary,
        background: t.bg, border: [3, 8, 3, 8], fillColor: t.bg,
      })),
      columnGap: 6, margin: [0, 2, 0, 2],
    }
  }
  if (t.headerStyle === 'github-card') {
    return { text: items.join('  │  '), fontSize: 8, color: '#8B949E', margin: [0, 2, 0, 2] }
  }
  return { text: items.join('  ·  '), fontSize: 9, color: t.dark ? '#CCCCCC' : t.primary, margin: [0, 2, 0, 2] }
}

function p(text: string, opts?: { indent?: number; color?: string; size?: number; bold?: boolean }): Content {
  return { text, fontSize: opts?.size || 10, color: opts?.color || (opts?.bold ? '#222' : '#333'), margin: [opts?.indent || 0, 0, 0, 3], bold: !!opts?.bold, lineHeight: 1.5 }
}

/* ── Main generator ── */

function renderDocument(resume: Resume, t: PdfTheme): Content[] {
  const content: Content[] = []
  const pf = resume.personal
  const textColor = t.dark ? '#DDDDDD' : '#222222'
  const bodyColor = t.dark ? '#BBBBBB' : '#444444'

  /* ── Header ── */
  content.push(headerName(pf.fullName || '', t))
  content.push(headerSubtitle(pf, t))

  const contacts = [
    pf.phone && `📞 ${pf.phone}`, pf.email && `✉ ${pf.email}`, pf.location && `📍 ${pf.location}`,
  ].filter(Boolean) as string[]
  if (contacts.length) content.push(contactLine(contacts, t))
  const links = [pf.website && `🌐 ${pf.website}`, pf.github && `🐙 ${pf.github}`].filter(Boolean) as string[]
  if (links.length) content.push(contactLine(links, t))

  content.push(sectionDivider(t))

  /* ── Profile ── */
  if (resume.profile) {
    content.push(sectionTitle('个人简介', t))
    content.push(p(resume.profile, { indent: 4, color: bodyColor }))
  }

  /* ── Skills ── */
  if (resume.skills.groups.length) {
    content.push(sectionTitle('专业技能', t))
    for (const g of resume.skills.groups) {
      content.push({
        text: [{ text: `${g.name}：`, bold: true, fontSize: 10, color: t.primary }, { text: g.items.join('、'), fontSize: 10, color: textColor }],
        margin: [0, 0, 0, 3],
      })
    }
  }

  /* ── Work ── */
  if (resume.work.length) {
    content.push(sectionTitle('工作经历', t))
    for (const w of resume.work) {
      content.push({
        text: [
          { text: w.company, bold: true, fontSize: 11, color: textColor },
          { text: `  ${w.position}`, fontSize: 10, color: t.primary },
        ], margin: [0, 6, 0, 2],
      })
      if (w.description) content.push(p(w.description, { indent: 8, color: bodyColor }))
      for (const a of (w.achievements || [])) content.push(p(`• ${a}`, { indent: 16, color: bodyColor, size: 9 }))
      content.push({ text: `${w.startDate || ''} ~ ${w.endDate || ''}`, fontSize: 7, color: '#999', margin: [0, 2, 0, 8] })
    }
  }

  /* ── Projects ── */
  if (resume.projects.length) {
    content.push(sectionTitle('项目经验', t))
    for (const pj of resume.projects) {
      content.push({
        text: [
          { text: pj.name, bold: true, fontSize: 11, color: textColor },
          { text: `  ${pj.role}`, fontSize: 10, color: t.primary },
        ], margin: [0, 6, 0, 2],
      })
      if (pj.description) content.push(p(pj.description, { indent: 8, color: bodyColor }))
      for (const h of (pj.highlights || [])) content.push(p(`• ${h}`, { indent: 16, color: bodyColor, size: 9 }))
      content.push({ text: '', margin: [0, 0, 0, 6] })
    }
  }

  /* ── Education ── */
  if (resume.education.length) {
    content.push(sectionTitle('教育背景', t))
    for (const edu of resume.education) {
      content.push({
        text: [
          { text: edu.school, bold: true, fontSize: 11, color: textColor },
          { text: `  ${edu.major} · ${edu.degree}`, fontSize: 10, color: '#888' },
        ], margin: [0, 2, 0, 2],
      })
      content.push({ text: `${edu.startDate || ''} ~ ${edu.endDate || ''}`, fontSize: 7, color: '#999', margin: [0, 0, 0, 6] })
    }
  }

  /* ── Certs / Languages ── */
  const hasCerts = resume.certificates.list.length || (resume.certificates.languages || []).length
  if (hasCerts) {
    content.push(sectionTitle('证书 & 语言', t))
    if (resume.certificates.list.length) content.push(p(resume.certificates.list.join('  ·  '), { color: bodyColor }))
    for (const l of (resume.certificates.languages || [])) content.push(p(`${l.name}（${l.level}）`, { color: bodyColor }))
  }

  return content
}

export function generatePDF(resume: Resume, templateId: string) {
  const t = THEMES[templateId] || THEMES['__default__']
  const content = renderDocument(resume, t)

  const doc = pdfMake.createPdf({
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    content,
    background: t.dark ? { canvas: [{ type: 'rect', x: 0, y: 0, w: 595.28, h: 841.89, color: t.pageColor }] } : undefined,
    defaultStyle: { font: t.font, color: t.dark ? '#DDDDDD' : '#333333' },
    footer: (currentPage: number, totalPages: number) => {
      if (totalPages <= 1) return null
      return { text: `${resume.personal.fullName || '简历'} · ${currentPage}/${totalPages}`, fontSize: 7, color: '#999', alignment: 'center', margin: [0, 10, 0, 0] }
    },
  })

  doc.download(`${resume.personal.fullName || '简历'}-${t.name}.pdf`)
}
