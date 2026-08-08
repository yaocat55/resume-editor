/**
 * DOCX 导出 — 从简历数据生成 .docx 文件
 * 模板风格映射 + Word 原生排版
 */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, PageBreak, TabStopPosition, TabStopType, Header, Footer, PageNumber } from 'docx'
import { saveAs } from 'file-saver'
import type { Resume } from '../../types/resume'

interface DocxTheme {
  primary: string
  accent: string
  bg: string
  font: string
  fontSize: number
}

const THEME: Record<string, DocxTheme> = {
  '__m3_expressive__': { primary: '4263A0', accent: 'D7E3FF', bg: 'E8EEF5', font: 'PingFang SC', fontSize: 21 },
  '__default__': { primary: '1E293B', accent: 'D0D5DD', bg: 'F0F2F5', font: 'PingFang SC', fontSize: 21 },
  '__minimal__': { primary: '222222', accent: 'DDDDDD', bg: 'F8F9FA', font: 'PingFang SC', fontSize: 20 },
  '__academic__': { primary: '5C3D1E', accent: 'C9B99A', bg: 'F5F0E5', font: 'Noto Serif SC', fontSize: 22 },
  '__creative__': { primary: '4C1D95', accent: 'C4B5FD', bg: '1E1B4B', font: 'Inter', fontSize: 20 },
  '__github__': { primary: 'C9D1D9', accent: '30363D', bg: '0D1117', font: 'Segoe UI', fontSize: 20 },
  '__vscode__': { primary: '569CD6', accent: '007ACC', bg: '1E1E1E', font: 'Consolas', fontSize: 20 },
  '__social__': { primary: 'FF2442', accent: 'FF6B81', bg: 'FFF0F0', font: 'PingFang SC', fontSize: 21 },
  '__bento__': { primary: 'FFFFFF', accent: '333333', bg: '0A0A0A', font: 'PingFang SC', fontSize: 20 },
  '__fde__': { primary: '166534', accent: '86EFAC', bg: 'F0FDF4', font: 'PingFang SC', fontSize: 21 },
}

function hexToRgb(hex: string) {
  if (hex.startsWith('#')) hex = hex.slice(1)
  return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) }
}

function makeRun(text: string, opts: { bold?: boolean; color?: string; size?: number; font?: string; italics?: boolean } = {}) {
  return new TextRun({ text, bold: opts.bold, color: opts.color, size: opts.size || 21, font: opts.font, italics: opts.italics })
}

export async function generateDocx(resume: Resume, templateId: string) {
  const t = THEME[templateId] || THEME['__default__']
  const primary = t.primary
  const accent = t.accent
  const font = t.font
  const sz = t.fontSize

  const children: any[] = []

  /* ── 个人信息 Header ── */
  children.push(
    new Paragraph({
      children: [makeRun(resume.personal.fullName || '未填写', { bold: true, size: 36, color: primary, font })],
      spacing: { after: 40 },
    }),
    new Paragraph({
      children: [
        makeRun(resume.personal.jobTitle || '', { size: sz, color: '5D5D71', font }),
        ...(resume.personal.gender ? [makeRun(`  ${resume.personal.gender}`, { size: sz - 3, color: '999999', font })] : []),
      ],
      spacing: { after: 80 },
    }),
  )

  // Contact pills
  const contacts = [
    resume.personal.phone && `📞 ${resume.personal.phone}`,
    resume.personal.email && `✉ ${resume.personal.email}`,
    resume.personal.location && `📍 ${resume.personal.location}`,
    resume.personal.website && `🌐 ${resume.personal.website}`,
    resume.personal.github && `🐙 ${resume.personal.github}`,
  ].filter(Boolean)

  if (contacts.length > 0) {
    children.push(
      new Paragraph({
        children: [makeRun(contacts.join('  ·  '), { size: sz - 3, color: primary, font })],
        spacing: { after: 200 },
      })
    )
  }

  /* ── 分隔线 ── */
  children.push(
    new Paragraph({
      border: { bottom: { color: accent, space: 8 } },
      spacing: { after: 160 },
      children: [],
    })
  )

  /* ── 个人简介 ── */
  if (resume.profile) {
    children.push(
      new Paragraph({ children: [makeRun('个人简介', { bold: true, size: sz, color: primary, font })], spacing: { after: 80 } }),
      new Paragraph({ children: [makeRun(resume.profile, { size: sz, color: '333333', font })], spacing: { after: 160 } }),
    )
  }

  /* ── 专业技能 ── */
  if (resume.skills.groups.length > 0) {
    children.push(
      new Paragraph({ children: [makeRun('专业技能', { bold: true, size: sz, color: primary, font })], spacing: { after: 80 } }),
    )
    for (const group of resume.skills.groups) {
      children.push(
        new Paragraph({
          children: [
            makeRun(`${group.name}: `, { bold: true, size: sz - 2, color: primary, font }),
            makeRun(group.items.join('、'), { size: sz - 2, color: '333333', font }),
          ],
          spacing: { after: 40 },
        })
      )
    }
    children.push(new Paragraph({ spacing: { after: 80 }, children: [] }))
  }

  /* ── 工作经历 ── */
  if (resume.work.length > 0) {
    children.push(
      new Paragraph({ children: [makeRun('工作经历', { bold: true, size: sz, color: primary, font })], spacing: { after: 80 } }),
    )
    for (const w of resume.work) {
      children.push(
        new Paragraph({
          children: [
            makeRun(w.company, { bold: true, size: sz, color: '1C1B1F', font }),
            makeRun(`  ${w.position}`, { size: sz - 1, color: '9E7D3A', font }),
            makeRun(`  ${w.startDate} ~ ${w.endDate}`, { size: sz - 5, color: '999999', font }),
          ],
          spacing: { after: 40 },
        }),
      )
      if (w.description) {
        children.push(new Paragraph({ children: [makeRun(w.description, { size: sz - 2, color: '49454F', font })], spacing: { after: 40 } }))
      }
      if (w.achievements && w.achievements.length > 0) {
        for (const a of w.achievements) {
          children.push(
            new Paragraph({ children: [makeRun(`• ${a}`, { size: sz - 3, color: '49454F', font })], spacing: { after: 20 }, indent: { left: 360 } })
          )
        }
      }
      children.push(new Paragraph({ spacing: { after: 120 }, children: [] }))
    }
  }

  /* ── 项目经验 ── */
  if (resume.projects.length > 0) {
    children.push(
      new Paragraph({ children: [makeRun('项目经验', { bold: true, size: sz, color: primary, font })], spacing: { after: 80 } }),
    )
    for (const p of resume.projects) {
      children.push(
        new Paragraph({
          children: [
            makeRun(p.name, { bold: true, size: sz, color: '1C1B1F', font }),
            makeRun(`  ${p.role}`, { size: sz - 1, color: '9E7D3A', font }),
          ],
          spacing: { after: 40 },
        }),
      )
      if (p.description) {
        children.push(new Paragraph({ children: [makeRun(p.description, { size: sz - 2, color: '49454F', font })], spacing: { after: 40 } }))
      }
      if (p.highlights && p.highlights.length > 0) {
        for (const h of p.highlights) {
          children.push(new Paragraph({ children: [makeRun(`• ${h}`, { size: sz - 3, color: '49454F', font })], spacing: { after: 20 }, indent: { left: 360 } }))
        }
      }
      children.push(new Paragraph({ spacing: { after: 120 }, children: [] }))
    }
  }

  /* ── 教育经历 ── */
  if (resume.education.length > 0) {
    children.push(
      new Paragraph({ children: [makeRun('教育背景', { bold: true, size: sz, color: primary, font })], spacing: { after: 80 } }),
    )
    for (const edu of resume.education) {
      children.push(
        new Paragraph({
          children: [
            makeRun(edu.school, { bold: true, size: sz, color: '1C1B1F', font }),
            makeRun(`  ${edu.major} · ${edu.degree}`, { size: sz - 1, color: '64748B', font }),
            makeRun(`  ${edu.startDate} ~ ${edu.endDate}`, { size: sz - 5, color: '999999', font }),
          ],
          spacing: { after: 40 },
        }),
      )
      children.push(new Paragraph({ spacing: { after: 80 }, children: [] }))
    }
  }

  /* ── 证书/语言 ── */
  if (resume.certificates.list.length > 0 || (resume.certificates.languages || []).length > 0) {
    children.push(
      new Paragraph({ children: [makeRun('证书 & 语言', { bold: true, size: sz, color: primary, font })], spacing: { after: 80 } }),
    )
    if (resume.certificates.list.length > 0) {
      children.push(new Paragraph({ children: [makeRun(resume.certificates.list.join('  ·  '), { size: sz - 2, color: '49454F', font })], spacing: { after: 40 } }))
    }
    if ((resume.certificates.languages || []).length > 0) {
      const langs = resume.certificates.languages!.map(l => `${l.name}（${l.level}）`).join('  ·  ')
      children.push(new Paragraph({ children: [makeRun(langs, { size: sz - 2, color: '49454F', font })], spacing: { after: 40 } }))
    }
  }

  // Generate document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1134, bottom: 1134, left: 1440, right: 1440 },
        },
      },
      children,
    }],
  })

  const blob = await Packer.toBlob(doc)
  const name = resume.personal.fullName || '简历'
  saveAs(blob, `${name}-简历.docx`)
}
