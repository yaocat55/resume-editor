import type { Resume } from '../types/resume'

/**
 * Template for a skill group (used for cloning).
 */
export const SKILL_GROUP_HTML = `
<div class="skill-group">
  <span class="group-name"></span>
  <span class="skill-tags"></span>
</div>`

export const SKILL_TAG_HTML = `<span class="skill-tag"></span>`

export const WORK_ENTRY_HTML = `
<div class="entry">
  <div class="entry-header">
    <span class="entry-title"></span>
    <span class="entry-sub"></span>
    <span class="entry-date-range"></span>
  </div>
  <div class="entry-desc"></div>
  <ul class="entry-list"></ul>
</div>`

export const WORK_ACHIEVEMENT_HTML = `<li></li>`

export const EDU_ENTRY_HTML = `
<div class="entry">
  <div class="entry-header">
    <span class="entry-title"></span>
    <span class="entry-sub major"></span>
    <span class="entry-sub degree"></span>
    <span class="entry-date-range"></span>
  </div>
  <div class="gpa-text"></div>
  <ul class="entry-list"></ul>
</div>`

export const EDU_HONOR_HTML = `<li></li>`

export const PROJ_ENTRY_HTML = `
<div class="entry">
  <div class="entry-header">
    <span class="entry-title"></span>
    <span class="entry-sub"></span>
    <span class="entry-date-range"></span>
  </div>
  <div class="tech-stack"></div>
  <div class="entry-desc"></div>
  <ul class="entry-list highlights"></ul>
  <div class="project-links"></div>
</div>`

export const PROJ_TECH_HTML = `<span class="tech-tag"></span>`
export const PROJ_HIGHLIGHT_HTML = `<li></li>`

export const CERT_LIST_HTML = `
<div class="cert-row">
  <span class="label"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:middle;margin-right:2px"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/></svg> 证书：</span>
  <span class="cert-items"></span>
</div>`

export const CERT_ITEM_HTML = `<span class="cert-badge"></span>`

export const LANG_ROW_HTML = `
<div class="cert-row">
  <span class="label"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:middle;margin-right:2px"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg> 语言：</span>
  <span class="lang-items"></span>
</div>`

export const LANG_ITEM_HTML = `<span class="lang-item"><strong class="lang-name"></strong>(<span class="lang-level"></span>)</span>`

export function fmtDate(d: string | undefined): string {
  return d ? d.replace(/-/g, '.') : ''
}

/**
 * Populate a Shadow DOM root with resume data using ID-based mapping.
 */
export function populateShadowDOM(
  root: ShadowRoot,
  data: Resume,
  visibleSections?: Record<string, boolean>,
  sectionOrder?: string[]
): void {
  const is = (section: string) => !visibleSections || visibleSections[section] !== false
  const showOrHide = (id: string, section: string) => {
    const el = root.querySelector(id) as HTMLElement | null
    if (el) el.style.display = is(section) ? '' : 'none'
  }
  const setVal = (sel: string, val: string) => {
    const el = root.querySelector(sel) as HTMLElement | null
    if (el) {
      if (val) { el.style.display = ''; const v = el.querySelector('.val'); if (v) v.textContent = val }
      else { el.style.display = 'none' }
    }
  }
  const setValAndHref = (sel: string, val: string) => {
    const el = root.querySelector(sel) as HTMLElement | null
    if (el) {
      if (val) { el.style.display = ''; el.setAttribute('href', val); const v = el.querySelector('.val'); if (v) v.textContent = val }
      else { el.style.display = 'none' }
    }
  }
  const pf = data.personal
  showOrHide('#personal', 'personal')
  if (pf.fullName) setText(root, '#fullName', pf.fullName)
  if (pf.jobTitle) setText(root, '#jobTitle', pf.jobTitle)
  setVal('#phone', pf.phone)
  setVal('#email', pf.email)
  setVal('#location', pf.location)
  setValAndHref('#website', pf.website)
  setValAndHref('#github', pf.github)
  if (pf.avatar) setAttr(root, '#avatar', 'src', pf.avatar)

  // Populate stats row (小红书 style) — respect visibleSections
  const showStat = (sel: string, count: number, section: string) => {
    const el = root.querySelector(sel) as HTMLElement | null
    if (!el) return
    const isVisible = !visibleSections || visibleSections[section] !== false
    const item = el.closest('.stat-item') as HTMLElement | null
    if (item) {
      if (isVisible && count > 0) {
        el.textContent = String(count)
        item.style.display = ''
      } else {
        item.style.display = 'none'
      }
    }
  }
  showStat('[data-stat="exp"]', data.work.length, 'work')
  showStat('[data-stat="projects"]', data.projects.length, 'projects')
  showStat('[data-stat="certs"]', data.certificates.list.length, 'certificates')
  showStat('[data-stat="stars"]', data.projects.length, 'projects')

  showOrHide('#profile', 'profile')
  if (is('profile')) setText(root, '#profile-content', data.profile)

  showOrHide('#skills', 'skills')
  if (is('skills')) populateSkills(root, data)
  showOrHide('#work', 'work')
  if (is('work')) populateWork(root, data)
  showOrHide('#education', 'education')
  if (is('education')) populateEducation(root, data)
  showOrHide('#projects', 'projects')
  if (is('projects')) populateProjects(root, data)
  showOrHide('#certificates', 'certificates')
  if (is('certificates')) populateCertificates(root, data)

  // Reorder sections according to sectionOrder — inside .resume-body if present
  if (sectionOrder) {
    const resumeRoot = root.querySelector('#resume-root') || root.querySelector('body') || root
    const resumeBody = resumeRoot.querySelector('.resume-body')
    const reorderTarget = resumeBody || resumeRoot
    sectionOrder.forEach((id) => {
      const el = reorderTarget.querySelector('#' + id) as HTMLElement | null
      if (el) reorderTarget.appendChild(el)
    })
  }
}

function setText(root: Element | ShadowRoot, selector: string, text: string): void {
  const el = root.querySelector(selector)
  if (el) el.textContent = text
}

function setAttr(root: Element | ShadowRoot, selector: string, attr: string, value: string): void {
  const el = root.querySelector(selector)
  if (el && value) el.setAttribute(attr, value)
}

function createElement(html: string): Element {
  const div = document.createElement('div')
  div.innerHTML = html.trim()
  return div.firstElementChild as Element
}

function populateSkills(root: ShadowRoot, data: Resume): void {
  const skillGroups = root.querySelector('#skill-groups')
  if (!skillGroups) return
  skillGroups.innerHTML = ''
  for (const group of data.skills.groups) {
    const groupEl = createElement(SKILL_GROUP_HTML)
    setText(groupEl, '.group-name', group.name)
    const tagsEl = groupEl.querySelector('.skill-tags')
    if (tagsEl) {
      for (const item of group.items) {
        const tagEl = createElement(SKILL_TAG_HTML)
        tagEl.textContent = item
        tagsEl.appendChild(tagEl)
      }
    }
    skillGroups.appendChild(groupEl)
  }
}

function populateWork(root: ShadowRoot, data: Resume): void {
  const workList = root.querySelector('#work-list')
  if (!workList) return
  workList.innerHTML = ''
  for (const w of data.work) {
    const entry = createElement(WORK_ENTRY_HTML)
    setText(entry, '.entry-title', w.company)
    setText(entry, '.entry-sub', w.position)
    setText(entry, '.entry-date-range', fmtDate(w.startDate) + ' — ' + fmtDate(w.endDate))
    setText(entry, '.entry-desc', w.description)
    const list = entry.querySelector('.entry-list')
    if (list && w.achievements) {
      for (const ach of w.achievements) {
        const li = createElement(WORK_ACHIEVEMENT_HTML)
        li.textContent = ach
        list.appendChild(li)
      }
    }
    workList.appendChild(entry)
  }
}

function populateEducation(root: ShadowRoot, data: Resume): void {
  const eduList = root.querySelector('#education-list')
  if (!eduList) return
  eduList.innerHTML = ''
  for (const e of data.education) {
    const entry = createElement(EDU_ENTRY_HTML)
    setText(entry, '.entry-title', e.school)
    setText(entry, '.major', e.major + '  ·  ' + e.degree)
    setText(entry, '.degree', '')
    setText(entry, '.entry-date-range', fmtDate(e.startDate) + ' — ' + fmtDate(e.endDate))
    setText(entry, '.gpa-text', e.gpa ? 'GPA：' + e.gpa : '')
    const list = entry.querySelector('.entry-list')
    if (list && e.honors) {
      for (const h of e.honors) {
        const li = createElement(EDU_HONOR_HTML)
        li.textContent = h
        list.appendChild(li)
      }
    }
    eduList.appendChild(entry)
  }
}

function populateProjects(root: ShadowRoot, data: Resume): void {
  const projList = root.querySelector('#project-list')
  if (!projList) return
  projList.innerHTML = ''
  for (const p of data.projects) {
    const entry = createElement(PROJ_ENTRY_HTML)
    setText(entry, '.entry-title', p.name)
    setText(entry, '.entry-sub', p.role)
    setText(entry, '.entry-date-range', fmtDate(p.startDate) + ' — ' + fmtDate(p.endDate))
    setText(entry, '.entry-desc', p.description)

    const techStack = entry.querySelector('.tech-stack')
    if (techStack && p.technologies) {
      for (const t of p.technologies) {
        const tag = createElement(PROJ_TECH_HTML)
        tag.textContent = t
        techStack.appendChild(tag)
      }
    }

    const hlList = entry.querySelector('.highlights')
    if (hlList && p.highlights) {
      for (const hl of p.highlights) {
        const li = createElement(PROJ_HIGHLIGHT_HTML)
        li.textContent = hl
        hlList.appendChild(li)
      }
    }

    const links = entry.querySelector('.project-links')
    if (links) {
      if (p.githubUrl) {
        const a = document.createElement('a')
        a.href = p.githubUrl
        a.target = '_blank'
        a.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:middle;margin-right:2px"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg> GitHub'
        links.appendChild(a)
      }
      if (p.demoUrl) {
        const a = document.createElement('a')
        a.href = p.demoUrl
        a.target = '_blank'
        a.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:middle;margin-right:2px"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> 演示'
        links.appendChild(a)
      }
    }

    projList.appendChild(entry)
  }
}

function populateCertificates(root: ShadowRoot, data: Resume): void {
  const certContent = root.querySelector('#cert-content')
  if (!certContent) return
  certContent.innerHTML = ''
  const hasCerts = data.certificates.list.length > 0
  const hasLangs = (data.certificates.languages || []).length > 0

  if (hasCerts) {
    const row = createElement(CERT_LIST_HTML)
    const itemsEl = row.querySelector('.cert-items')
    if (itemsEl) {
      for (const c of data.certificates.list) {
        const span = createElement(CERT_ITEM_HTML)
        span.textContent = c
        itemsEl.appendChild(span)
      }
    }
    certContent.appendChild(row)
  }

  if (hasLangs) {
    const row = createElement(LANG_ROW_HTML)
    const itemsEl = row.querySelector('.lang-items')
    if (itemsEl) {
      for (const lang of data.certificates.languages || []) {
        const item = createElement(LANG_ITEM_HTML)
        setText(item, '.lang-name', lang.name)
        setText(item, '.lang-level', lang.level)
        itemsEl.appendChild(item)
      }
    }
    certContent.appendChild(row)
  }
}
