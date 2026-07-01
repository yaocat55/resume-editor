import type { Resume } from '../types/resume'

export const defaultTemplateHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>简历</title>
<style>
  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;

    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 40px 20px;
  }

  .resume-page {
    width: 210mm;
    min-height: 297mm;
    background: #ffffff;
    padding: 40px 52px;
    border: 1px solid #d0d5dd;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    color: #2d3748;
    line-height: 1.6;
  }



  .resume-body { padding: 0; }

  @media print {
    body { background: #ffffff; padding: 0; align-items: stretch; }
    .resume-page { width: 100%; min-height: auto; box-shadow: none; border: none; border-radius: 0; padding: 40px 48px; }
  }

  @media screen and (max-width: 800px) {
    .resume-page { width: 100%; min-height: auto; padding: 28px 24px; }
  }

  /* ── 个人信息 ── */
  #personal {
    display: flex;
    align-items: center;
    gap: 28px;
    padding-bottom: 28px;
    border-bottom: 3px solid #f0f2f5;
    margin-bottom: 28px;
  }

  .resume-section {
    margin-bottom: 28px;
  }
  .resume-section:last-child {
    margin-bottom: 0;
  }

  #avatar {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    background: #edf2f7;
    border: 3px solid #f0f2f5;
  }

  .personal-info { flex: 1; }

  #fullName {
    font-size: 30px;
    font-weight: 700;
    color: #1a202c;
    line-height: 1.2;
    letter-spacing: 1px;
  }

  #jobTitle {
    font-size: 16px;
    font-weight: 500;
    color: #4a5568;
    margin-top: 4px;
  }

  .contact-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    margin-top: 10px;
    font-size: 13px;
    color: #5a6577;
  }

  .contact-row a { color: #4a6cf7; text-decoration: none; font-weight: 500; }
  .contact-row a:hover { text-decoration: underline; }

  /* ── 版式标题 ── */
  .section-title {
    font-size: 15px;
    font-weight: 700;
    color: #1a202c;
    letter-spacing: 1.5px;
    padding-bottom: 10px;
    margin-bottom: 16px;
    border-bottom: 2px solid #eef0f3;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-title::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 16px;
    background: #4a6cf7;
    border-radius: 2px;
    flex-shrink: 0;
  }

  /* ── 个人简介 ── */
  #profile .section-content {
    font-size: 14px;
    line-height: 1.9;
    color: #3d4a5c;
    padding: 0 2px;
  }

  /* ── 技能：2 列网格 ── */
  #skill-groups {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 32px;
  }

  .skill-group {
    font-size: 14px;
  }

  .skill-group .group-name {
    font-weight: 600;
    color: #1a202c;
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    letter-spacing: 0.5px;
  }

  .skill-tags {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .skill-tag {
    display: inline-block;
    background: #f0f4ff;
    color: #4a6cf7;
    padding: 3px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.6;
  }

  /* ── 条目（工作/教育/项目）── */
  .entry {
    padding: 16px 20px;
    margin-bottom: 14px;
    background: #fafbfc;
    border-radius: 8px;
    border: 1px solid #eef0f3;
    transition: border-color 0.15s;
  }
  .entry:hover { border-color: #d0d5dd; }
  .entry:last-child { margin-bottom: 0; }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px 12px;
  }

  .entry-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a202c;
  }

  .entry-sub {
    font-weight: 500;
    color: #4a6cf7;
    font-size: 13px;
  }

  .entry-date {
    font-size: 12px;
    color: #8e99ab;
    font-weight: 400;
    white-space: nowrap;
  }

  .entry-date-range {
    font-size: 12px;
    color: #8e99ab;
    font-weight: 400;
    white-space: nowrap;
    margin-left: auto;
  }

  .entry-desc {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.8;
    color: #3d4a5c;
  }

  .entry-list {
    margin-top: 6px;
    padding-left: 0;
    list-style: none;
    font-size: 14px;
    line-height: 1.8;
    color: #3d4a5c;
  }

  .entry-list li {
    position: relative;
    padding-left: 16px;
    margin-bottom: 2px;
  }
  .entry-list li::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 10px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #4a6cf7;
  }

  /* ── 技术栈标签 ── */
  .tech-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
    margin-top: 8px;
  }

  .tech-tag {
    background: #edf2f7;
    color: #3d4a5c;
    padding: 0 10px;
    border-radius: 4px;
    font-size: 11px;
    font-family: "SF Mono", "Fira Code", monospace;
    line-height: 1.8;
  }

  .project-links { margin-top: 8px; font-size: 13px; }
  .project-links a { color: #4a6cf7; text-decoration: none; margin-right: 16px; font-weight: 500; }
  .project-links a:hover { text-decoration: underline; }

  /* ── 证书 & 语言 ── */
  #cert-content {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 40px;
    font-size: 14px;
    color: #3d4a5c;
  }
  .cert-row .label { font-weight: 600; color: #1a202c; margin-right: 8px; }

  .cert-badge {
    display: inline-block;
    background: #f0f4ff;
    color: #4a6cf7;
    padding: 3px 12px;
    border-radius: 4px;
    font-size: 13px;
    margin: 2px 6px 2px 0;
  }

  .lang-item {
    display: inline-block;
    background: #f8f9fc;
    border: 1px solid #eef0f3;
    border-radius: 4px;
    padding: 3px 12px;
    margin: 2px 6px 2px 0;
    font-size: 13px;
  }
  .lang-item .lang-name { font-weight: 600; color: #1a202c; }

  .gpa-text {
    font-size: 12px;
    color: #8e99ab;
    margin-top: 4px;
  }
</style>
</head>
<body>
<div class="resume-page" id="resume-root">
  <div class="resume-body">
    <div id="personal">
    <img id="avatar" src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect width=%27100%27 height=%27100%27 rx=%2750%27 fill=%27%23e2e8f0%27/%3E%3Ccircle cx=%2750%27 cy=%2738%27 r=%2718%27 fill=%27%2394a3b8%27/%3E%3Cellipse cx=%2750%27 cy=%2772%27 rx=%2728%27 ry=%2722%27 fill=%27%2394a3b8%27/%3E%3C/svg%3E" alt="头像" />
    <div class="personal-info">
      <div id="fullName"></div>
      <div id="jobTitle"></div>
      <div class="contact-row">
        <span id="phone">📞 <span class="val"></span></span>
        <span id="email">✉️ <span class="val"></span></span>
        <span id="location">📍 <span class="val"></span></span>
        <a id="website" href="" target="_blank">🌐 <span class="val"></span></a>
        <a id="github" href="" target="_blank">🐙 <span class="val"></span></a>
      </div>
    </div>
  </div>

  <div id="profile" class="resume-section">
    <h2 class="section-title">个人简介</h2>
    <div class="section-content" id="profile-content"></div>
  </div>

  <div id="skills" class="resume-section">
    <h2 class="section-title">核心技能</h2>
    <div id="skill-groups"></div>
  </div>

  <div id="work" class="resume-section">
    <h2 class="section-title">工作经历</h2>
    <div id="work-list"></div>
  </div>

  <div id="projects" class="resume-section">
    <h2 class="section-title">项目经验</h2>
    <div id="project-list"></div>
  </div>

  <div id="education" class="resume-section">
    <h2 class="section-title">教育背景</h2>
    <div id="education-list"></div>
  </div>

  <div id="certificates" class="resume-section">
    <h2 class="section-title">证书 / 语言</h2>
    <div id="cert-content"></div>
  </div>

  </div>
</div>
</body>
</html>`

export interface StoredTemplate {
  id: string
  meta: {
    name: string
    description: string
    author: string
    version: string
  }
  html: string
  builtIn: boolean
}

export const defaultTemplateMeta = {
  name: '经典专业简历',
  description: '蓝灰商务风 | 适合全行业投递，ATS 解析最优，银行/金融/国企/外企/传统行业首选',
  author: 'Resume Editor',
  version: '1.0.0',
}

export const defaultTemplate: StoredTemplate = {
  id: '__default__',
  meta: defaultTemplateMeta,
  html: defaultTemplateHTML,
  builtIn: true,
}
