/**
 * PDF 导出 — 使用 pdfmake 直接从数据生成 PDF
 * 绕过浏览器打印引擎，精确控制分页和样式
 */
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import type { Resume } from '../../types/resume'

pdfMake.vfs = pdfFonts.vfs

interface PdfTheme {
  primary: string; accent: string; font: string
}

const THEME: Record<string, PdfTheme> = {
  '__m3_expressive__': { primary: '#4263A0', accent: '#D7E3FF', font: 'PingFang SC' },
  '__default__':       { primary: '#1E293B', accent: '#D0D5DD', font: 'PingFang SC' },
  '__minimal__':       { primary: '#222222', accent: '#DDDDDD', font: 'PingFang SC' },
  '__academic__':      { primary: '#5C3D1E', accent: '#C9B99A', font: 'Times' },
  '__creative__':      { primary: '#4C1D95', accent: '#C4B5FD', font: 'PingFang SC' },
  '__github__':        { primary: '#58A6FF', accent: '#30363D', font: 'PingFang SC' },
  '__vscode__':        { primary: '#569CD6', accent: '#007ACC', font: 'PingFang SC' },
  '__social__':        { primary: '#FF2442', accent: '#FF6B81', font: 'PingFang SC' },
  '__bento__':         { primary: '#FFFFFF', accent: '#333333', font: 'PingFang SC' },
  '__fde__':           { primary: '#166534', accent: '#86EFAC', font: 'PingFang SC' },
}

type Content = any // pdfmake Content type

function h1(text: string, color: string): Content {
  return { text, fontSize: 26, bold: true, color, margin: [0, 0, 0, 6] }
}

function h2(text: string, color: string): Content {
  return { text, fontSize: 14, bold: true, color, margin: [0, 12, 0, 6] }
}

function body(text: string, opts?: { indent?: number }): Content {
  return { text, fontSize: 10, color: '#333333', margin: [opts?.indent || 0, 0, 0, 4], lineHeight: 1.6 }
}

function pill(text: string, color: string): Content {
  return { text, fontSize: 9, color, margin: [0, 0, 0, 2] }
}

function sectionDivider(color: string): Content {
  return { canvas: [{ type: 'line', x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 0.5, lineColor: color }], margin: [0, 6, 0, 6] }
}

function contactRow(items: string[], color: string): Content {
  return {
    columns: items.map(text => ({ text, fontSize: 9, color, width: 'auto' })),
    columnGap: 16,
    margin: [0, 2, 0, 2],
  }
}

export function generatePDF(resume: Resume, templateId: string) {
  const t = THEME[templateId] || THEME['__default__']
  const pf = resume.personal
  const content: Content[] = []
  const pageCount = { current: 1, total: 1 }

  /* ── Header ── */
  content.push(h1(pf.fullName || '未填写', t.primary))

  const subtitle = [pf.jobTitle, pf.gender, pf.age ? `${pf.age}岁` : ''].filter(Boolean).join('  ·  ')
  if (subtitle) content.push({ text: subtitle, fontSize: 11, color: '#666666', margin: [0, 0, 0, 10] })

  // Contact pills
  const contacts = [
    pf.phone && `📞 ${pf.phone}`,
    pf.email && `✉ ${pf.email}`,
    pf.location && `📍 ${pf.location}`,
  ].filter(Boolean) as string[]
  if (contacts.length > 0) content.push(contactRow(contacts, t.primary))

  const links = [
    pf.website && `🌐 ${pf.website}`,
    pf.github && `🐙 ${pf.github}`,
  ].filter(Boolean) as string[]
  if (links.length > 0) content.push(contactRow(links, t.primary))

  content.push(sectionDivider(t.accent))

  /* ── 个人简介 ── */
  if (resume.profile) {
    content.push(h2('个人简介', t.primary))
    content.push(body(resume.profile, { indent: 4 }))
  }

  /* ── 专业技能 ── */
  if (resume.skills.groups.length > 0) {
    content.push(h2('专业技能', t.primary))
    for (const g of resume.skills.groups) {
      content.push({
        text: [
          { text: `${g.name}：`, bold: true, fontSize: 10, color: t.primary },
          { text: g.items.join('、'), fontSize: 10, color: '#333333' },
        ],
        margin: [0, 0, 0, 4],
      })
    }
  }

  /* ── 工作经历 ── */
  if (resume.work.length > 0) {
    content.push(h2('工作经历', t.primary))
    for (const w of resume.work) {
      content.push({
        text: [
          { text: w.company, bold: true, fontSize: 11, color: '#222222' },
          { text: `  ${w.position}`, fontSize: 11, color: t.primary },
        ],
        margin: [0, 6, 0, 2],
      })
      if (w.description) content.push(body(w.description, { indent: 8 }))
      if (w.achievements) {
        for (const a of w.achievements) {
          content.push(body(`• ${a}`, { indent: 16 }))
        }
      }
      content.push({ text: `${w.startDate || ''} ~ ${w.endDate || ''}`, fontSize: 8, color: '#AAAAAA', margin: [0, 2, 0, 10] })
    }
  }

  /* ── 项目经验 ── */
  if (resume.projects.length > 0) {
    content.push(h2('项目经验', t.primary))
    for (const p of resume.projects) {
      content.push({
        text: [
          { text: p.name, bold: true, fontSize: 11, color: '#222222' },
          { text: `  ${p.role}`, fontSize: 11, color: t.primary },
        ],
        margin: [0, 6, 0, 2],
      })
      if (p.description) content.push(body(p.description, { indent: 8 }))
      if (p.highlights) {
        for (const h of p.highlights) content.push(body(`• ${h}`, { indent: 16 }))
      }
      content.push({ text: '', margin: [0, 0, 0, 8] })
    }
  }

  /* ── 教育经历 ── */
  if (resume.education.length > 0) {
    content.push(h2('教育背景', t.primary))
    for (const edu of resume.education) {
      content.push({
        text: [
          { text: edu.school, bold: true, fontSize: 11, color: '#222222' },
          { text: `  ${edu.major} · ${edu.degree}`, fontSize: 10, color: '#666666' },
        ],
        margin: [0, 2, 0, 2],
      })
      content.push({ text: `${edu.startDate || ''} ~ ${edu.endDate || ''}`, fontSize: 8, color: '#AAAAAA', margin: [0, 0, 0, 8] })
    }
  }

  /* ── 证书/语言 ── */
  const hasCerts = resume.certificates.list.length > 0 || (resume.certificates.languages || []).length > 0
  if (hasCerts) {
    content.push(h2('证书 & 语言', t.primary))
    if (resume.certificates.list.length > 0) {
      content.push(body(resume.certificates.list.join('  ·  ')))
    }
    for (const l of (resume.certificates.languages || [])) {
      content.push(body(`${l.name}（${l.level}）`))
    }
  }

  /* ── Generate PDF ── */
  const doc = pdfMake.createPdf({
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    content,
    defaultStyle: { font: t.font },
    footer: (currentPage: number, totalPages: number) => {
      if (totalPages <= 1) return null
      return {
        text: `${pf.fullName || '简历'} · 第 ${currentPage} 页 / 共 ${totalPages} 页`,
        fontSize: 8, color: '#AAAAAA', alignment: 'center', margin: [0, 10, 0, 0],
      }
    },
  })

  doc.download(`${pf.fullName || '简历'}-简历.pdf`)
}
