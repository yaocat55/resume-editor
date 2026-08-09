/**
 * DOCX 导出 — 从简历数据生成 .docx 文件
 * 模板风格映射 + Word 原生排版
 */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, TabStopPosition, TabStopType, Header, Footer, PageNumber } from 'docx'
import { saveAs } from 'file-saver'
import type { Resume } from '../../types/resume'

interface DocxTheme { primary: string; accent: string; bg: string; font: string; fontSize: number }

const THEME: Record<string, DocxTheme> = {
  '__m3_expressive__': { primary: '4263A0', accent: 'D7E3FF', bg: 'E8EEF5', font: 'PingFang SC', fontSize: 21 },
  '__default__': { primary: '1E293B', accent: 'D0D5DD', bg: 'F0F2F5', font: 'PingFang SC', fontSize: 21 },
  '__minimal__': { primary: '222', accent: 'DDD', bg: 'F8F9FA', font: 'PingFang SC', fontSize: 20 },
  '__academic__': { primary: '5C3D1E', accent: 'C9B99A', bg: 'F5F0E5', font: 'Times New Roman', fontSize: 22 },
  '__creative__': { primary: '4C1D95', accent: 'C4B5FD', bg: '1E1B4B', font: 'Inter', fontSize: 20 },
  '__github__': { primary: '58A6FF', accent: '30363D', bg: '0D1117', font: 'Segoe UI', fontSize: 20 },
  '__vscode__': { primary: '569CD6', accent: '007ACC', bg: '1E1E1E', font: 'Consolas', fontSize: 20 },
  '__social__': { primary: 'FF2442', accent: 'FF6B81', bg: 'FFF0F0', font: 'PingFang SC', fontSize: 21 },
  '__bento__': { primary: 'FFFFFF', accent: '333', bg: '0A0A0A', font: 'PingFang SC', fontSize: 20 },
  '__fde__': { primary: '166534', accent: '86EFAC', bg: 'F0FDF4', font: 'PingFang SC', fontSize: 21 },
}

function makeRun(text: string, opts: { bold?: boolean; color?: string; size?: number; font?: string; italics?: boolean } = {}) {
  const color = opts.color ? (opts.color.startsWith('#') ? opts.color : `#${opts.color}`) : undefined
  return new TextRun({ text, bold: opts.bold, color, size: opts.size || 21, font: opts.font, italics: opts.italics })
}

function sectionTitle(text: string, theme: DocxTheme) {
  return new Paragraph({
    children: [makeRun(text, { bold: true, size: theme.fontSize + 2, color: theme.primary, font: theme.font })],
    spacing: { after: 160, before: 80 },
    border: { bottom: { color: theme.accent, space: 6, size: 6 } },
  })
}

function styleSeparator(theme: DocxTheme) {
  return new Paragraph({ border: { bottom: { color: theme.accent, space: 4, size: 4 } }, spacing: { after: 120, before: 120 }, children: [] })
}

export async function generateDocx(resume: Resume, templateId: string) {
  const theme = THEME[templateId] || THEME['__default__']
  const children: any[] = []

  /* ── Header ── */
  children.push(
    new Paragraph({ children: [makeRun(resume.personal.fullName || '', { bold: true, size: 48, color: theme.primary, font: theme.font })], spacing: { after: 80 } }),
    new Paragraph({
      children: [
        makeRun(resume.personal.jobTitle || '', { size: theme.fontSize + 4, color: '666666', font: theme.font }),
        resume.personal.gender ? makeRun(`  ${resume.personal.gender}`, { size: theme.fontSize, color: '999999', font: theme.font }) : makeRun('', {}),
        resume.personal.age ? makeRun(`  年龄：${resume.personal.age}`, { size: theme.fontSize, color: '999999', font: theme.font }) : makeRun('', {}),
      ].filter(x => x.text),
      spacing: { after: 120 },
    }),
  )

  // Contact info as styled pills
  const contacts = [
    { label: '手机', value: resume.personal.phone },
    { label: '邮箱', value: resume.personal.email },
    { label: '城市', value: resume.personal.location },
  ].filter(c => c.value)
  if (contacts.length > 0) {
    children.push(
      new Paragraph({
        children: contacts.flatMap((c, i) => [
          makeRun(`${c.label}：${c.value}`, { size: theme.fontSize - 3, color: theme.primary, font: theme.font }),
          i < contacts.length - 1 ? makeRun('    ', { size: theme.fontSize - 3, color: theme.primary }) : makeRun('', {}),
        ]).filter(x => x.text),
        spacing: { after: 40 },
      })
    )
  }
  const links = [
    resume.personal.website && { label: '网站', value: resume.personal.website },
    resume.personal.github && { label: 'GitHub', value: resume.personal.github },
  ].filter(Boolean) as { label: string; value: string }[]
  if (links.length > 0) {
    children.push(
      new Paragraph({
        children: links.map(l => makeRun(`${l.label}：${l.value}`, { size: theme.fontSize - 3, color: theme.primary, font: theme.font })),
        spacing: { after: 160 },
      })
    )
  }

  children.push(styleSeparator(theme))

  /* ── 个人简介 ── */
  if (resume.profile) {
    children.push(sectionTitle('个人简介', theme))
    children.push(new Paragraph({ children: [makeRun(resume.profile, { size: theme.fontSize, color: '333333', font: theme.font })], spacing: { after: 200 }, indent: { left: 80 } }))
  }

  /* ── 专业技能 ── */
  if (resume.skills.groups.length > 0) {
    children.push(sectionTitle('专业技能', theme))
    for (const group of resume.skills.groups) {
      children.push(
        new Paragraph({
          children: [
            makeRun(`${group.name}：`, { bold: true, size: theme.fontSize, color: theme.primary, font: theme.font }),
            makeRun(group.items.join('、'), { size: theme.fontSize, color: '333333', font: theme.font }),
          ],
          spacing: { after: 60 },
        })
      )
    }
    children.push(new Paragraph({ spacing: { after: 40 }, children: [] }))
  }

  /* ── 工作经历 ── */
  if (resume.work.length > 0) {
    children.push(sectionTitle('工作经历', theme))
    for (const w of resume.work) {
      children.push(
        new Paragraph({
          children: [
            makeRun(`${w.company}  `, { bold: true, size: theme.fontSize + 2, color: '222222', font: theme.font }),
            makeRun(w.position, { size: theme.fontSize, color: theme.primary, font: theme.font }),
            makeRun(`  ${w.startDate || ''} ~ ${w.endDate || ''}`, { size: theme.fontSize - 4, color: '999999', font: theme.font }),
          ],
          spacing: { after: 80 },
        }),
      )
      if (w.description) {
        children.push(new Paragraph({ children: [makeRun(w.description, { size: theme.fontSize, color: '444444', font: theme.font })], spacing: { after: 60 }, indent: { left: 120 } }))
      }
      if (w.achievements && w.achievements.length > 0) {
        for (const a of w.achievements) {
          children.push(new Paragraph({ children: [makeRun(`• ${a}`, { size: theme.fontSize - 1, color: '444444', font: theme.font, italics: true })], spacing: { after: 20 }, indent: { left: 240 } }))
        }
      }
      children.push(new Paragraph({ spacing: { after: 160 }, children: [] }))
    }
  }

  /* ── 项目经验 ── */
  if (resume.projects.length > 0) {
    children.push(sectionTitle('项目经验', theme))
    for (const p of resume.projects) {
      children.push(
        new Paragraph({
          children: [
            makeRun(`${p.name}  `, { bold: true, size: theme.fontSize + 2, color: '222222', font: theme.font }),
            makeRun(p.role, { size: theme.fontSize, color: theme.primary, font: theme.font }),
          ],
          spacing: { after: 80 },
        }),
      )
      if (p.description) {
        children.push(new Paragraph({ children: [makeRun(p.description, { size: theme.fontSize, color: '444444', font: theme.font })], spacing: { after: 60 }, indent: { left: 120 } }))
      }
      if (p.highlights && p.highlights.length > 0) {
        for (const h of p.highlights) {
          children.push(new Paragraph({ children: [makeRun(`• ${h}`, { size: theme.fontSize - 1, color: '444444', font: theme.font, italics: true })], spacing: { after: 20 }, indent: { left: 240 } }))
        }
      }
      children.push(new Paragraph({ spacing: { after: 160 }, children: [] }))
    }
  }

  /* ── 教育经历 ── */
  if (resume.education.length > 0) {
    children.push(sectionTitle('教育背景', theme))
    for (const edu of resume.education) {
      children.push(
        new Paragraph({
          children: [
            makeRun(`${edu.school}  `, { bold: true, size: theme.fontSize + 2, color: '222222', font: theme.font }),
            makeRun(`${edu.major} · ${edu.degree}`, { size: theme.fontSize, color: '666666', font: theme.font }),
            makeRun(`  ${edu.startDate || ''} ~ ${edu.endDate || ''}`, { size: theme.fontSize - 4, color: '999999', font: theme.font }),
          ],
          spacing: { after: 80 },
        }),
      )
    }
    children.push(new Paragraph({ spacing: { after: 40 }, children: [] }))
  }

  /* ── 证书/语言 ── */
  const hasCerts = resume.certificates.list.length > 0 || (resume.certificates.languages || []).length > 0
  if (hasCerts) {
    children.push(sectionTitle('证书 & 语言', theme))
    if (resume.certificates.list.length > 0) {
      children.push(new Paragraph({ children: [makeRun(resume.certificates.list.join('  ·  '), { size: theme.fontSize, color: '444444', font: theme.font })], spacing: { after: 40 } }))
    }
    for (const l of (resume.certificates.languages || [])) {
      children.push(new Paragraph({ children: [makeRun(`${l.name}（${l.level}）`, { size: theme.fontSize, color: '444444', font: theme.font })], spacing: { after: 40 } }))
    }
  }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: t.font, size: sz * 2 } } },
    },
    sections: [{
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1200, bottom: 1200, left: 1440, right: 1440 } },
      },
      children,
    }],
  })

  const blob = await Packer.toBlob(doc)
  const name = resume.personal.fullName || '简历'
  saveAs(blob, `${name}-简历.docx`)
}
