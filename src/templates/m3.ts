import type { StoredTemplate } from './classic'

export const m3TemplateHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>简历</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 40px 20px;
    background: #fdfbff;
  }

  .resume-page {
    width: 210mm;
    min-height: 297mm;
    background: #ffffff;
    padding: 40px 52px;
    border: none;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    line-height: 1.6;
    color: #1c1b1f;
  }

  .resume-body { padding: 0; }

  @media print {
    body { background: #fff; padding: 0; }
    .resume-page { width: 100%; min-height: auto; padding: 40px 48px; box-shadow: none; border-radius: 0; }
  }

  /* ── Header (M3 Elevated Card) ── */
  #personal {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    gap: 20px;
    padding: 20px 24px;
    margin-bottom: 28px;
    background: linear-gradient(135deg, #e8eef5 0%, #d7e3ff 50%, #e8eef5 100%);
    border-radius: 16px;
  }

  #avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    background: rgba(66, 99, 160, 0.1);
    border: 2px solid rgba(66, 99, 160, 0.2);
  }

  .personal-info { flex: 1; min-width: 0; }

  #fullName {
    font-size: 24px;
    font-weight: 700;
    color: #001b3e;
    line-height: 1.15;
  }

  #jobTitle {
    font-size: 14px;
    font-weight: 500;
    color: #5d5d71;
    margin-top: 2px;
  }

  .contact-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }
  .contact-row span, .contact-row a {
    font-size: 11px;
    color: #4263a0;
    background: #e8eef5;
    padding: 3px 10px;
    border-radius: 8px;
    text-decoration: none;
    white-space: nowrap;
  }
  .contact-row a { background: #d7e3ff; }

  .resume-section { margin-bottom: 28px; }
  .resume-section:last-child { margin-bottom: 0; }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #4263a0;
    letter-spacing: 0.5px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-title::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #d7e3ff;
  }

  #profile .section-content {
    font-size: 14px;
    line-height: 1.9;
    color: #49454f;
    padding: 14px 18px;
    background: #f5f5f5;
    border-radius: 12px;
    border: 1px solid #e0e2ec;
  }

  #skill-groups { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill-group {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 14px;
    background: #e8eef5;
    border-radius: 8px;
  }
  .skill-group .group-name { font-size: 12px; font-weight: 600; color: #4263a0; }
  .skill-tags { display: inline-flex; flex-wrap: wrap; gap: 4px; }
  .skill-tag {
    display: inline-block; padding: 2px 10px; border-radius: 6px;
    font-size: 12px; color: #1c1b1f; background: #ffffff;
    border: 1px solid #d7e3ff;
  }

  .entry {
    margin-bottom: 0;
    display: grid;
    grid-template-columns: 80px 24px 1fr;
    gap: 0;
    padding: 14px 0;
  }
  .entry:last-child { padding-bottom: 0; }

  .entry::before {
    content: "";
    grid-column: 2;
    grid-row: 1 / span 10;
    width: 2px;
    background: #d7e3ff;
    justify-self: center;
    margin-top: 8px;
  }
  .entry:last-child::before { background: linear-gradient(to bottom, #d7e3ff, transparent); }
  .entry::after {
    content: "";
    grid-column: 2; grid-row: 1;
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #4263a0;
    border: 2px solid #d7e3ff;
    justify-self: center;
    z-index: 1;
    margin-top: 4px;
  }

  .entry-header { display: contents; }
  .entry-date, .entry-date-range {
    grid-column: 1; grid-row: 1;
    text-align: right;
    font-size: 12px; color: #5d5d71; font-weight: 500;
    padding: 0 12px 0 0; margin: 0; background: none;
    line-height: 1.4; align-self: start;
  }

  .entry-title { grid-column: 3; grid-row: 1; font-size: 15px; font-weight: 600; color: #001b3e; }
  .entry-sub { grid-column: 3; grid-row: 2; font-weight: 500; color: #9e7d3a; font-size: 13px; margin-bottom: 4px; }
  .entry-desc { grid-column: 3; margin-top: 4px; font-size: 14px; line-height: 1.8; color: #49454f; }
  .entry-list { grid-column: 3; margin-top: 4px; padding-left: 0; list-style: none; font-size: 14px; line-height: 1.8; color: #49454f; }
  .entry-list li { position: relative; padding-left: 16px; margin-bottom: 1px; }
  .entry-list li::before { content: ""; position: absolute; left: 2px; top: 10px; width: 4px; height: 4px; border-radius: 50%; background: #d7e3ff; }
  .tech-stack { grid-column: 3; display: flex; flex-wrap: wrap; gap: 4px 8px; margin-top: 4px; }
  .tech-tag { background: #e8eef5; color: #49454f; padding: 0 8px; border-radius: 4px; font-size: 11px; font-family: "SF Mono", monospace; line-height: 1.8; }
  .gpa-text { grid-column: 3; font-size: 12px; color: #74777f; margin-top: 2px; }
  .project-links { grid-column: 3; margin-top: 4px; font-size: 13px; }
  .project-links a { color: #4263a0; text-decoration: none; margin-right: 14px; font-weight: 500; font-size: 12px; }

  #cert-content { display: flex; flex-direction: column; gap: 6px; font-size: 14px; color: #49454f; }
  .cert-row { display: flex; align-items: baseline; gap: 8px; }
  .cert-row .label { font-weight: 600; color: #001b3e; min-width: 56px; }
  .cert-badge { display: inline-block; background: #d7e3ff; color: #4263a0; padding: 3px 10px; border-radius: 8px; font-size: 12px; margin: 2px 4px 2px 0; font-weight: 500; }
  .lang-item { display: inline-block; border: 1px solid #d7e3ff; border-radius: 8px; padding: 2px 10px; margin: 2px 6px 2px 0; font-size: 13px; }
  .lang-item .lang-name { font-weight: 600; color: #001b3e; }
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
        <span id="phone"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:middle"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/></svg> <span class="val"></span></span>
        <span id="email"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:middle"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg> <span class="val"></span></span>
        <span id="location"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:middle"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> <span class="val"></span></span>
        <a id="website" href="" target="_blank"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:middle"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg> <span class="val"></span></a>
        <a id="github" href="" target="_blank"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:middle"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg> <span class="val"></span></a>
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

export const m3TemplateMeta = {
  name: 'Material 3 雾蓝',
  description: 'M3 浅蓝 + 暖金 | 柔和蓝紫调 Primary Container + 圆角 + 时间线，适合产品经理/运营/市场/咨询/管理岗',
  author: 'Resume Editor',
  version: '2.0.0',
}

export const m3Template: StoredTemplate = {
  id: '__m3_expressive__',
  meta: m3TemplateMeta,
  html: m3TemplateHTML,
  builtIn: true,
}
