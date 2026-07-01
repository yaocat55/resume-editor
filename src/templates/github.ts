import type { StoredTemplate } from './classic'

export const githubTemplateHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>resume · GitHub</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 40px 20px;
    background: #010409;
    color: #e6edf3;
  }

  .resume-page {
    width: 210mm;
    min-height: 297mm;
    background: #0d1117;
    padding: 0;
    border: 1px solid #30363d;
    border-radius: 8px;
    
  }

  .resume-body { padding: 0; }

  @media print {
    body { background: #fff; padding: 0; color: #333; }
    .resume-page { width: 100%; min-height: auto; box-shadow: none; border: 1px solid #d0d7de; border-radius: 0; background: #fff; }
  }

  /* ── GitHub Profile Header ── */
  #personal {
    display: flex; flex-direction: column; align-items: center;
    padding: 28px 40px 16px;
    text-align: center;
    border-bottom: 1px solid #21262d;
  }

  #avatar {
    width: 80px; height: 80px; border-radius: 50%;
    object-fit: cover; display: block; margin: 0 auto;
    background: #21262d; border: 2px solid #30363d;
  }

  .personal-info { text-align: center; margin-top: 12px; }

  #fullName {
    font-size: 24px; font-weight: 600;
    color: #e6edf3; line-height: 1.25;
  }
  #fullName::after {
    content: "";
    display: inline-block;
    width: 18px; height: 18px; margin-left: 6px;
    background: #21262d; border-radius: 50%;
    vertical-align: middle;
    background-image: url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27 fill=%27%238b949e%27%3E%3Cpath d=%27M8 1a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 8c3.314 0 6 1.343 6 3v1H2v-1c0-1.657 2.686-3 6-3z%27/%3E%3C/svg%3E");
    background-size: 10px; background-position: center; background-repeat: no-repeat;
  }

  #jobTitle {
    font-size: 14px; font-weight: 400; color: #8b949e;
    margin-top: 2px;
  }

  .follow-btn {
    display: inline-block;
    background: #21262d; color: #e6edf3;
    padding: 5px 32px; border-radius: 6px;
    font-size: 13px; font-weight: 600;
    margin-top: 12px;
    border: 1px solid #30363d;
  }

  .stats-row {
    display: flex; justify-content: center; gap: 28px;
    margin-top: 14px;
  }
  .stat-item { text-align: center; }
  .stat-num { display: block; font-size: 16px; font-weight: 600; color: #e6edf3; }
  .stat-label { display: block; font-size: 11px; color: #8b949e; margin-top: 1px; }

  .contact-row {
    display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 14px;
    margin-top: 12px; font-size: 12px;
  }
  .contact-row span, .contact-row a {
    display: inline-flex; align-items: center; gap: 4px;
    color: #8b949e; text-decoration: none;
  }
  .contact-row a { color: #58a6ff; }

  .resume-section { margin-bottom: 0; }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #e6edf3;
    padding: 16px 40px 10px;
    border-bottom: 1px solid #21262d;
  }

  .section-content {
    padding: 12px 40px 8px;
  }

  /* ── Profile Bio ── */
  #profile .section-content {
    font-size: 14px;
    line-height: 1.7;
    color: #e6edf3;
  }

  /* ── Skills as Repo Topics ── */
  #skill-groups { display: flex; flex-direction: column; gap: 8px; }
  .skill-group { font-size: 13px; display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px; }
  .skill-group .group-name {
    font-size: 12px; font-weight: 600; color: #8b949e;
    margin-right: 8px; text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .skill-tags { display: inline-flex; flex-wrap: wrap; gap: 4px; }
  .skill-tag {
    font-size: 11px; color: #58a6ff;
    background: #161b22; border: 1px solid #30363d;
    padding: 2px 10px; border-radius: 20px;
    font-weight: 500;
  }

  /* ── Repo-Style Cards ── */
  #project-list {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  #project-list .entry { margin-bottom: 0; }
  .entry {
    border: 1px solid #30363d;
    border-radius: 6px;
    padding: 14px 16px;
    margin-bottom: 10px;
    background: #161b22;
  }
  .entry:last-child { margin-bottom: 0; }

  .entry-header {
    display: flex; justify-content: space-between; align-items: baseline;
    flex-wrap: wrap; gap: 2px 8px;
  }
  .entry-title {
    font-size: 14px; font-weight: 600; color: #58a6ff;
  }
  .entry-title::before {
    content: "";
    display: inline-block; width: 14px; height: 14px; margin-right: 6px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27 fill=%27%238b949e%27%3E%3Cpath d=%27M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8zm10.5 0h-8a1 1 0 00-1 1v6.708A2.5 2.5 0 014.5 8h8.25z%27/%3E%3C/svg%3E");
    background-size: contain; background-repeat: no-repeat;
    vertical-align: text-bottom;
  }
  .entry-sub { font-weight: 500; color: #8b949e; font-size: 12px; }
  .entry-date, .entry-date-range { font-size: 11px; color: #8b949e; white-space: nowrap; }

  .entry-desc {
    margin-top: 6px; font-size: 12px; line-height: 1.6; color: #8b949e;
  }
  .entry-list {
    margin-top: 4px; padding-left: 0; list-style: none;
    font-size: 12px; line-height: 1.6; color: #8b949e;
  }
  .entry-list li {
    position: relative; padding-left: 16px; margin-bottom: 1px;
  }
  .entry-list li::before {
    content: "\\2713"; position: absolute; left: 0;
    color: #3fb950; font-weight: 700;
  }

  .tech-stack {
    display: flex; flex-wrap: wrap; gap: 3px 6px; margin-top: 6px;
  }
  .tech-tag {
    font-size: 11px; color: #8b949e;
    background: #0d1117; padding: 1px 8px;
    border-radius: 20px; border: 1px solid #30363d;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .tech-tag::before {
    content: ""; width: 10px; height: 10px;
    border-radius: 50%; flex-shrink: 0;
  }
  /* GitHub language colors */
  .tech-tag:nth-child(8n+1)::before { background: #f1e05a; }
  .tech-tag:nth-child(8n+2)::before { background: #3178c6; }
  .tech-tag:nth-child(8n+3)::before { background: #3572A5; }
  .tech-tag:nth-child(8n+4)::before { background: #00ADD8; }
  .tech-tag:nth-child(8n+5)::before { background: #f18e33; }
  .tech-tag:nth-child(8n+6)::before { background: #e34c26; }
  .tech-tag:nth-child(8n+7)::before { background: #563d7c; }
  .tech-tag:nth-child(8n+0)::before { background: #2b7489; }

  .project-links { margin-top: 4px; font-size: 12px; }
  .project-links a { color: #58a6ff; text-decoration: none; margin-right: 12px; }

  .entry-footer {
    display: flex; align-items: center; gap: 14px;
    margin-top: 8px; padding-top: 6px; border-top: 1px solid #21262d;
    font-size: 11px; color: #8b949e;
  }
  .entry-footer span { display: inline-flex; align-items: center; gap: 3px; }

  /* ── Certs / Languages ── */
  #cert-content { display: flex; flex-wrap: wrap; gap: 10px 28px; font-size: 13px; color: #8b949e; }
  .cert-row .label { font-weight: 600; color: #e6edf3; margin-right: 4px; font-size: 12px; }
  .cert-badge {
    display: inline-block; font-size: 12px; color: #3fb950;
    background: #161b22; padding: 2px 10px; border-radius: 2px;
    border: 1px solid #30363d; margin: 2px 4px 2px 0;
  }
  .lang-item {
    display: inline-block; font-size: 12px; color: #e6edf3;
    padding: 2px 10px; border-radius: 2px;
    border: 1px solid #30363d; margin: 2px 6px 2px 0;
  }
  .lang-item .lang-name { font-weight: 600; }
  .gpa-text { font-size: 12px; color: #8b949e; margin-top: 2px; }
</style>
</head>
<body>
<div class="resume-page" id="resume-root">
<div class="resume-body">

  <!-- Profile Header -->
  <div id="personal">
    <img id="avatar" src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect width=%27100%27 height=%27100%27 rx=%2750%27 fill=%27%2321262d%27/%3E%3Ccircle cx=%2750%27 cy=%2738%27 r=%2718%27 fill=%27%238b949e%27/%3E%3Cellipse cx=%2750%27 cy=%2772%27 rx=%2728%27 ry=%2722%27 fill=%27%2330363d%27/%3E%3C/svg%3E" alt="头像" />
    <div class="personal-info">
      <div id="fullName"></div>
      <div id="jobTitle"></div>
      <div class="follow-btn">Follow</div>
      <div class="stats-row">
        <div class="stat-item"><span class="stat-num" data-stat="exp">2</span><span class="stat-label">工作经历</span></div>
        <div class="stat-item"><span class="stat-num" data-stat="projects">5</span><span class="stat-label">项目</span></div>
        <div class="stat-item"><span class="stat-num" data-stat="stars">12</span><span class="stat-label">Stars</span></div>
      </div>
      <div class="contact-row">
        <span id="location"><svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" style="vertical-align:-2px"><path d="M8 1C5.5 1 3.5 2.9 3.5 5.3c0 2.1 1.6 4.6 4.5 7.7 2.9-3.1 4.5-5.6 4.5-7.7C12.5 2.9 10.5 1 8 1zm0 6c-.9 0-1.5-.7-1.5-1.5S7.1 4 8 4s1.5.7 1.5 1.5S8.9 7 8 7z"/></svg> <span class="val"></span></span>
        <span id="email"><svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" style="vertical-align:-2px"><path d="M1 3.5v9l.5.5h13l.5-.5v-9l-.5-.5h-13l-.5.5zM8 8.8L2.2 4h11.6L8 8.8zM2 12V5.2l6 4.8 6-4.8V12H2z"/></svg> <span class="val"></span></span>
        <a id="website" href="" target="_blank"><svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" style="vertical-align:-2px"><path d="M6.5 1.5a4 4 0 0 1 4 4c0 .7-.2 1.4-.5 2l1.5 1.5a5.5 5.5 0 1 0-7.8 7.8L5.2 15a4 4 0 0 1 1.3-7.8c.7 0 1.4.2 2 .5L10 6.2a4 4 0 0 0-3.5-4.7z"/><path d="M9.5 14.5a4 4 0 0 1-4-4c0-.7.2-1.4.5-2L4.5 7a5.5 5.5 0 1 0 7.8 7.8l-1.5-1.5a4 4 0 0 1-1.3 1.2z"/></svg> <span class="val"></span></a>
        <a id="github" href="" target="_blank"><svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" style="vertical-align:-2px"><path d="M8 1C4.1 1 1 4.3 1 8.2c0 3.2 2 5.9 4.8 6.8.4.1.5-.2.5-.4v-1.4c-1.9.4-2.4-.9-2.4-.9-.3-.8-.8-1-1-1-.8-.6.1-.6.1-.6.9.1 1.4.9 1.4.9.8 1.4 2.1 1 2.6.8.1-.6.3-1 .5-1.2-2-.2-4.1-1-4.1-4.5 0-1 .3-1.8.9-2.4-.1-.2-.4-1.1.1-2.4 0 0 .8-.3 2.5.9.7-.2 1.5-.3 2.3-.3s1.6.1 2.3.3c1.7-1.2 2.5-.9 2.5-.9.5 1.3.2 2.2.1 2.4.6.6.9 1.4.9 2.4 0 3.5-2.1 4.3-4.1 4.5.3.3.6.9.6 1.8v2.7c0 .2.1.5.5.4 2.8-.9 4.8-3.6 4.8-6.8C15 4.3 11.9 1 8 1z"/></svg> <span class="val"></span></a>
      </div>
    </div>
  </div>

  <div id="profile" class="resume-section">
    <div class="section-title">个人简介</div>
    <div class="section-content" id="profile-content"></div>
  </div>

  <div id="skills" class="resume-section">
    <div class="section-title">技术栈</div>
    <div id="skill-groups" class="section-content"></div>
  </div>

  <div id="work" class="resume-section">
    <div class="section-title">工作经历</div>
    <div id="work-list" class="section-content"></div>
  </div>

  <div id="projects" class="resume-section">
    <div class="section-title">项目经验</div>
    <div id="project-list" class="section-content"></div>
  </div>

  <div id="education" class="resume-section">
    <div class="section-title">教育背景</div>
    <div id="education-list" class="section-content"></div>
  </div>

  <div id="certificates" class="resume-section">
    <div class="section-title">证书 / 语言</div>
    <div id="cert-content" class="section-content"></div>
  </div>

</div>
</div>
</body>
</html>`

export const githubTemplateMeta = {
  name: 'GitHub 主题',
  description: '暗色 GitHub Profile 风 | Repo 卡片 + Follow 按钮 + 语言标签 + 个人主页布局，适合开源开发者/技术博主/GitHub 重度用户',
  author: 'Resume Editor',
  version: '1.0.0',
}

export const githubTemplate: StoredTemplate = {
  id: '__github__',
  meta: githubTemplateMeta,
  html: githubTemplateHTML,
  builtIn: true,
}
