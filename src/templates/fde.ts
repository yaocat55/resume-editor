import type { StoredTemplate } from './classic'

export const fdeTemplateHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>项目实施技术方案</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: "Inter", -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
    display: flex; justify-content: center; align-items: flex-start;
    min-height: 100vh; padding: 40px 20px;
    background: #f5f5f0;
  }

  .resume-page {
    width: 210mm; min-height: 297mm;
    background: #ffffff; padding: 0;
    border: none;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  }

  @media print {
    body { background: #fff; padding: 0; }
    .resume-page { width: 100%; min-height: auto; box-shadow: none; }
  }

  #resume-root { }
  .resume-body { padding: 36px 44px 40px; }

  /* ── Document Header ── */
  .doc-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding-bottom: 16px;
    border-bottom: 2px solid #0c1929;
    margin-bottom: 24px;
  }
  .doc-title-area { }
  .doc-title {
    font-size: 20px; font-weight: 700; color: #0c1929;
    letter-spacing: 1px;
  }
  .doc-subtitle {
    font-size: 11px; color: #64748b; margin-top: 3px;
  }
  .doc-meta {
    text-align: right; font-size: 10px; color: #94a3b8; line-height: 1.7;
  }
  .doc-meta .label { color: #64748b; }
  .doc-meta .value { color: #0c1929; font-weight: 600; }

  /* ── Personal as Document Author Block ── */
  #personal {
    display: flex; align-items: center; gap: 20px;
    padding: 16px 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    margin-bottom: 24px;
  }
  #avatar {
    width: 52px; height: 52px; border-radius: 50%;
    object-fit: cover; flex-shrink: 0;
    background: #e2e8f0; border: none;
  }
  .personal-info { flex: 1; }
  #fullName {
    font-size: 16px; font-weight: 700; color: #0c1929;
  }
  #jobTitle {
    font-size: 12px; font-weight: 400; color: #475569; margin-top: 1px;
  }
  .contact-row {
    display: flex; flex-wrap: wrap; gap: 4px 16px; margin-top: 4px;
  }
  .contact-row span, .contact-row a {
    font-size: 11px; color: #64748b; text-decoration: none;
    display: inline-flex; align-items: center; gap: 3px;
  }
  .contact-row a { color: #2563eb; }

  .stats-row {
    display: flex; gap: 16px; margin-top: 4px;
  }
  .stat-item { font-size: 11px; color: #475569; }
  .stat-num { font-weight: 700; color: #2563eb; }
  .stat-label { color: #64748b; margin-left: 2px; }

  /* ── Sections as Document Chapters ── */
  .resume-section {
    margin-bottom: 22px;
    counter-increment: chapter;
  }
  .resume-section:last-child { margin-bottom: 0; }

  .section-title {
    font-size: 14px; font-weight: 700;
    color: #0c1929;
    padding-bottom: 6px;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .section-title .num {
    font-size: 11px; font-weight: 700; color: #2563eb;
    font-family: "SF Mono", "Fira Code", monospace;
    background: #eff6ff; padding: 1px 6px;
    border-radius: 3px;
  }

  .section-content {
    font-size: 13px; line-height: 1.8; color: #475569;
  }

  /* ── Profile ── */
  #profile .section-content {
    font-size: 13px; line-height: 1.9; color: #475569;
  }

  /* ── Skills as Spec Table ── */
  #skill-groups {
    display: flex; flex-direction: column; gap: 2px;
    border: 1px solid #e2e8f0; border-radius: 4px;
    overflow: hidden;
  }
  .skill-group {
    display: flex; align-items: baseline;
    border-bottom: 1px solid #f1f5f9;
    font-size: 13px;
  }
  .skill-group:last-child { border-bottom: none; }
  .skill-group .group-name {
    font-weight: 600; color: #0c1929;
    min-width: 80px; font-size: 12px;
    padding: 5px 12px; background: #f8fafc;
    font-family: "SF Mono", "Fira Code", monospace;
  }
  .skill-tags {
    display: inline-flex; flex-wrap: wrap; gap: 3px;
    padding: 4px 12px;
  }
  .skill-tag {
    display: inline-block; color: #2563eb;
    padding: 1px 8px; border-radius: 3px; font-size: 12px;
    background: #eff6ff;
  }

  /* ── Entry Cards ── */
  .entry {
    margin-bottom: 10px;
    padding: 12px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    background: #fafbfc;
  }
  .entry:last-child { margin-bottom: 0; }

  .entry-header {
    display: flex; justify-content: space-between; align-items: baseline;
    flex-wrap: wrap; gap: 2px 8px;
  }
  .entry-title { font-size: 14px; font-weight: 600; color: #0c1929; }
  .entry-sub { font-weight: 500; color: #2563eb; font-size: 12px; }
  .entry-date, .entry-date-range { font-size: 11px; color: #94a3b8; white-space: nowrap; font-family: "SF Mono", monospace; }

  .entry-desc { margin-top: 3px; font-size: 12px; line-height: 1.7; color: #475569; }
  .entry-list {
    margin-top: 3px; padding-left: 0; list-style: none;
    font-size: 13px; line-height: 1.7; color: #475569;
  }
  .entry-list li {
    position: relative; padding-left: 16px; margin-bottom: 0;
  }
  .entry-list li::before {
    content: "»"; position: absolute; left: 0; color: #2563eb; font-weight: 700;
  }

  .tech-stack { display: flex; flex-wrap: wrap; gap: 3px 6px; margin-top: 3px; }
  .tech-tag {
    color: #475569; padding: 1px 8px; border-radius: 3px; font-size: 10px;
    border: 1px solid #e2e8f0; background: #ffffff;
    font-family: "SF Mono", monospace; line-height: 1.7;
  }

  .project-links { margin-top: 2px; font-size: 12px; }
  .project-links a { color: #2563eb; text-decoration: none; margin-right: 10px; }

  /* ── Certs ── */
  #cert-content { display: flex; flex-wrap: wrap; gap: 6px 24px; font-size: 13px; color: #475569; }
  .cert-row .label { font-weight: 600; color: #0c1929; margin-right: 4px; font-size: 12px; }
  .cert-badge {
    display: inline-block; color: #2563eb; padding: 1px 8px; border-radius: 3px;
    font-size: 12px; margin: 1px 3px 1px 0;
    background: #eff6ff;
  }
  .lang-item {
    display: inline-block; border: 1px solid #e2e8f0; border-radius: 3px;
    padding: 2px 10px; margin: 1px 4px 1px 0; font-size: 12px;
  }
  .lang-item .lang-name { font-weight: 600; color: #0c1929; }
  .gpa-text { font-size: 11px; color: #94a3b8; margin-top: 1px; }

  /* ── Footer ── */
  .doc-footer {
    margin-top: 32px; padding-top: 12px;
    border-top: 1px solid #e2e8f0;
    display: flex; justify-content: space-between;
    font-size: 9px; color: #94a3b8;
  }
</style>
</head>
<body>
<div class="resume-page">
  <div id="resume-root">
    <div class="resume-body">

      <!-- Document Header -->
      <div class="doc-header">
        <div class="doc-title-area">
          <div class="doc-title">简历</div>
          <div class="doc-subtitle">实施工程师 · 技术履历</div>
        </div>
        <div class="doc-meta">
          <div><span class="label">文档编号：</span><span class="value">RES-2024-001</span></div>
          <div><span class="label">版本：</span><span class="value">V2.0</span></div>
          <div><span class="label">密级：</span><span class="value">内部公开</span></div>
        </div>
      </div>

      <!-- Author Block -->
      <div id="personal">
        <img id="avatar" src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect width=%27100%27 height=%27100%27 rx=%2750%27 fill=%27%23e2e8f0%27/%3E%3Ccircle cx=%2750%27 cy=%2736%27 r=%2718%27 fill=%27%2394a3b8%27/%3E%3Cellipse cx=%2750%27 cy=%2772%27 rx=%2728%27 ry=%2722%27 fill=%27%2394a3b8%27/%3E%3C/svg%3E" alt="" />
        <div class="personal-info">
          <div id="fullName"></div>
          <div id="jobTitle"></div>
          <div class="stats-row">
            <span class="stat-item"><span class="stat-num" data-stat="exp">0</span><span class="stat-label">实施项目</span></span>
            <span class="stat-item"><span class="stat-num" data-stat="projects">0</span><span class="stat-label">服务客户</span></span>
            <span class="stat-item"><span class="stat-num" data-stat="certs">0</span><span class="stat-label">专业认证</span></span>
          </div>
          <div class="contact-row">
            <span id="phone"><span class="val"></span></span>
            <span id="email"><span class="val"></span></span>
            <span id="location"><span class="val"></span></span>
            <a id="website" href="" target="_blank"><span class="val"></span></a>
            <a id="github" href="" target="_blank"><span class="val"></span></a>
          </div>
        </div>
      </div>

      <!-- 01 Profile -->
      <div id="profile" class="resume-section">
        <div class="section-title"><span class="num">01</span>个人简介</div>
        <div class="section-content" id="profile-content"></div>
      </div>

      <!-- 02 Skills -->
      <div id="skills" class="resume-section">
        <div class="section-title"><span class="num">02</span>技术栈 · 平台工具</div>
        <div id="skill-groups"></div>
      </div>

      <!-- 03 Work -->
      <div id="work" class="resume-section">
        <div class="section-title"><span class="num">03</span>工作经历</div>
        <div id="work-list"></div>
      </div>

      <!-- 04 Projects -->
      <div id="projects" class="resume-section">
        <div class="section-title"><span class="num">04</span>项目经验</div>
        <div id="project-list"></div>
      </div>

      <!-- 05 Education -->
      <div id="education" class="resume-section">
        <div class="section-title"><span class="num">05</span>教育背景</div>
        <div id="education-list"></div>
      </div>

      <!-- 06 Certs -->
      <div id="certificates" class="resume-section">
        <div class="section-title"><span class="num">06</span>证书 · 语言</div>
        <div id="cert-content"></div>
      </div>

      <!-- Footer -->
      <div class="doc-footer">
        <span>项目实施 · 技术履历</span>
        <span>第 1 页 / 共 1 页</span>
      </div>

    </div>
  </div>
</div>
</body>
</html>`

export const fdeTemplateMeta = {
  name: 'FDE 实施工程师',
  description: '技术方案书风 | 文档标题 + 编号/版本 + 章节编号 + 规格表 + 交付卡片，实施工程师/FDE/FAE 一眼共鸣',
  author: 'Resume Editor',
  version: '4.0.0',
}

export const fdeTemplate: StoredTemplate = {
  id: '__fde__',
  meta: fdeTemplateMeta,
  html: fdeTemplateHTML,
  builtIn: true,
}
