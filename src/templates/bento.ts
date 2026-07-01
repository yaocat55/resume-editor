import type { StoredTemplate } from './classic'

export const bentoTemplateHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>简历 - Bento</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: "Inter", -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
    display: flex; justify-content: center; align-items: flex-start;
    min-height: 100vh; padding: 40px 20px;
    background: #f1f5f9;
  }

  .resume-page {
    width: 210mm; min-height: 297mm;
    background: #f1f5f9; padding: 24px;
    border: none; box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    border-radius: 16px;
  }

  @media print {
    body { background: #fff; padding: 0; }
    .resume-page { width: 100%; min-height: auto; padding: 20px; box-shadow: none; border-radius: 0; background: #fff; }
  }

  /* ── Bento Grid ── */
  #resume-root {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  /* ── Bento Cards ── */
  .resume-section {
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    padding: 16px 18px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }
  .resume-section:last-child { margin-bottom: 0; }

  /* ── Hero Card (full width) ── */
  #personal {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
    border: none; border-radius: 12px;
    padding: 28px 32px;
    display: flex; align-items: center; gap: 24px;
  }
  #avatar {
    width: 72px; height: 72px; border-radius: 14px;
    object-fit: cover; flex-shrink: 0;
    background: rgba(255,255,255,0.1);
    border: 2px solid rgba(255,255,255,0.15);
  }
  .personal-info { flex: 1; }
  #fullName {
    font-size: 26px; font-weight: 700;
    color: #ffffff; line-height: 1.2;
  }
  #jobTitle {
    font-size: 14px; font-weight: 400;
    color: #c7d2fe; margin-top: 2px;
  }
  .contact-row {
    display: flex; flex-wrap: wrap; gap: 6px;
    margin-top: 10px;
  }
  .contact-row span, .contact-row a {
    font-size: 11px; color: #e0e7ff;
    background: rgba(255,255,255,0.1);
    padding: 3px 10px; border-radius: 6px;
    text-decoration: none; white-space: nowrap;
  }
  .contact-row a { background: rgba(255,255,255,0.15); }

  /* ── Section Title ── */
  .section-title {
    font-size: 10px; font-weight: 700;
    color: #6366f1; text-transform: uppercase;
    letter-spacing: 1.2px; margin-bottom: 8px;
  }

  .section-content {
    font-size: 12px; line-height: 1.7; color: #475569;
  }

  /* ── Profile ── */
  #profile { grid-column: 1; padding: 18px 20px; }

  /* ── Skills ── */
  #skills { grid-column: 2; padding: 18px 20px; }
  #skill-groups { display: flex; flex-direction: column; gap: 6px; }
  .skill-group { font-size: 12px; display: flex; align-items: baseline; flex-wrap: wrap; gap: 3px; }
  .skill-group .group-name {
    font-weight: 600; color: #1e293b; margin-right: 4px; font-size: 12px;
  }
  .skill-tags { display: inline-flex; flex-wrap: wrap; gap: 3px; }
  .skill-tag {
    display: inline-block; background: #eef2ff; color: #6366f1;
    padding: 1px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;
  }

  /* ── Work (full width) ── */
  #work { grid-column: 1 / -1; padding: 18px 20px; }

  .entry {
    margin-bottom: 10px; border: none; padding: 0;
    background: transparent; border-radius: 0;
  }
  .entry:last-child { margin-bottom: 0; }

  .entry-header {
    display: flex; justify-content: space-between; align-items: baseline;
    flex-wrap: wrap; gap: 2px 8px;
  }
  .entry-title { font-size: 14px; font-weight: 600; color: #1e293b; }
  .entry-sub { font-weight: 500; color: #6366f1; font-size: 12px; }
  .entry-date, .entry-date-range { font-size: 11px; color: #94a3b8; white-space: nowrap; }

  .entry-desc { margin-top: 3px; font-size: 12px; line-height: 1.7; color: #64748b; }
  .entry-list { margin-top: 2px; padding-left: 0; list-style: none; font-size: 12px; line-height: 1.7; color: #64748b; }
  .entry-list li { position: relative; padding-left: 14px; margin-bottom: 0; }
  .entry-list li::before { content: ""; position: absolute; left: 2px; top: 9px; width: 4px; height: 4px; border-radius: 50%; background: #6366f1; }

  .tech-stack { display: flex; flex-wrap: wrap; gap: 3px 6px; margin-top: 4px; }
  .tech-tag {
    background: #f1f5f9; color: #475569;
    padding: 0 8px; border-radius: 4px; font-size: 10px;
    font-family: "SF Mono", monospace; line-height: 1.8;
  }

  .project-links { margin-top: 2px; font-size: 12px; }
  .project-links a { color: #6366f1; text-decoration: none; margin-right: 12px; font-weight: 500; font-size: 11px; }

  /* ── Education (full width, compact) ── */
  #education { grid-column: 1 / -1; padding: 14px 20px; }
  #education .entry { margin-bottom: 0; }

  /* ── Projects (full width) ── */
  #projects { grid-column: 1 / -1; padding: 18px 20px; }

  /* ── Certs (full width) ── */
  #certificates { grid-column: 1 / -1; padding: 18px 20px; }
  #cert-content { display: flex; flex-wrap: wrap; gap: 6px 24px; font-size: 12px; color: #64748b; }
  .cert-row .label { font-weight: 600; color: #1e293b; margin-right: 4px; font-size: 11px; }
  .cert-badge {
    display: inline-block; background: #eef2ff; color: #6366f1;
    padding: 2px 10px; border-radius: 4px; font-size: 11px; margin: 1px 4px 1px 0; font-weight: 500;
  }
  .lang-item { display: inline-block; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px 10px; margin: 1px 4px 1px 0; font-size: 11px; background: #f8fafc; }
  .lang-item .lang-name { font-weight: 600; color: #1e293b; }
  .gpa-text { font-size: 11px; color: #94a3b8; margin-top: 1px; }
</style>
</head>
<body>
<div class="resume-page">
  <div id="resume-root">

    <!-- Hero -->
    <div id="personal">
      <img id="avatar" src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect width=%27100%27 height=%27100%27 rx=%2714%27 fill=%27rgba(255,255,255,0.08)%27/%3E%3Ccircle cx=%2750%27 cy=%2736%27 r=%2718%27 fill=%27rgba(255,255,255,0.12)%27/%3E%3Cellipse cx=%2750%27 cy=%2772%27 rx=%2728%27 ry=%2722%27 fill=%27rgba(255,255,255,0.06)%27/%3E%3C/svg%3E" alt="" />
      <div class="personal-info">
        <div id="fullName"></div>
        <div id="jobTitle"></div>
        <div class="contact-row">
          <span id="phone"><span class="val"></span></span>
          <span id="email"><span class="val"></span></span>
          <span id="location"><span class="val"></span></span>
          <a id="website" href="" target="_blank"><span class="val"></span></a>
          <a id="github" href="" target="_blank"><span class="val"></span></a>
        </div>
      </div>
    </div>

    <!-- Profile -->
    <div id="profile" class="resume-section">
      <div class="section-title">个人简介</div>
      <div class="section-content" id="profile-content"></div>
    </div>

    <!-- Skills -->
    <div id="skills" class="resume-section">
      <div class="section-title">核心能力</div>
      <div id="skill-groups"></div>
    </div>

    <!-- Work -->
    <div id="work" class="resume-section">
      <div class="section-title">工作经历</div>
      <div id="work-list"></div>
    </div>

    <!-- Projects -->
    <div id="projects" class="resume-section">
      <div class="section-title">项目经验</div>
      <div id="project-list"></div>
    </div>

    <!-- Education -->
    <div id="education" class="resume-section">
      <div class="section-title">教育背景</div>
      <div id="education-list"></div>
    </div>

    <!-- Certs -->
    <div id="certificates" class="resume-section">
      <div class="section-title">证书 / 语言</div>
      <div id="cert-content"></div>
    </div>

  </div>
</div>
</body>
</html>`

export const bentoTemplateMeta = {
  name: 'Bento 网格',
  description: 'Bento 卡片网格风 | 深紫渐变 Hero + 双列卡片 + 阴影呼吸感，适合产品经理/设计师/科技行业',
  author: 'Resume Editor',
  version: '1.0.0',
}

export const bentoTemplate: StoredTemplate = {
  id: '__bento__',
  meta: bentoTemplateMeta,
  html: bentoTemplateHTML,
  builtIn: true,
}
