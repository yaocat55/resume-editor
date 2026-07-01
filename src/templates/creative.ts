import type { StoredTemplate } from './classic'

export const creativeTemplateHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>resume</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Inter", -apple-system, "PingFang SC", sans-serif; display: flex; justify-content: center; padding: 40px 20px; background: #f5f5f5; }
  .resume-page { width: 210mm; align-self: stretch; background: #fff; padding: 0; border: none; box-shadow: 0 4px 40px rgba(0,0,0,0.08); border-radius: 12px;  }
  @media print { body { background: #fff; padding: 0; } .resume-page { width: 100%; min-height: auto; box-shadow: none; border-radius: 0; } }
  #resume-root { display: grid; grid-template-columns: 220px 1fr; grid-template-rows: auto auto auto auto auto auto; }
  #personal { grid-column: 1; grid-row: 1 / 7; background: linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%); padding: 40px 28px 32px; display: flex; flex-direction: column; }
  #profile { grid-column: 2; grid-row: 1; padding: 36px 36px 20px; }
  #skills { grid-column: 2; grid-row: 2; padding: 0 36px 20px; }
  #work { grid-column: 2; grid-row: 3; padding: 0 36px 20px; }
  #education { grid-column: 2; grid-row: 4; padding: 0 36px 20px; }
  #projects { grid-column: 2; grid-row: 5; padding: 0 36px 20px; }
  #certificates { grid-column: 2; grid-row: 6; padding: 0 36px 36px; }
  #avatar { width: 72px; height: 72px; border-radius: 16px; object-fit: cover; display: block; margin: 0 0 14px; background: rgba(255,255,255,0.08); border: 2px solid rgba(167,139,250,0.3); }
  #fullName { font-size: 22px; font-weight: 700; color: #fff; line-height: 1.15; letter-spacing: -0.3px; }
  #jobTitle { font-size: 12px; font-weight: 500; color: #a78bfa; margin-top: 6px; letter-spacing: 0.5px; }
  .divider { width: 28px; height: 2px; background: #a78bfa; margin: 16px 0; border-radius: 2px; }
  .contact-row { display: flex; flex-direction: column; gap: 8px; font-size: 10px; margin-top: 4px; }
  .contact-row span, .contact-row a { color: rgba(255,255,255,0.5); text-decoration: none; line-height: 1.5; }
  .contact-row a { color: rgba(255,255,255,0.7); }
  #skill-groups { display: flex; flex-direction: row; flex-wrap: wrap; gap: 6px; }
  .skill-group .group-name { font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; display: block; }
  .skill-tags { display: flex; flex-wrap: wrap; gap: 2px; }
  .skill-tag { font-size: 10px; color: #7c3aed; padding: 2px 10px; background: #f5f3ff; border-radius: 4px; display: inline-block; border: 1px solid #ede9fe; }
  .resume-section { margin-bottom: 18px; }
  .section-title { font-size: 10px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #ede9fe; }
  #profile .section-content { font-size: 12px; line-height: 1.8; color: #374151; }
  .entry { margin-bottom: 12px; padding: 12px 14px; background: #fafafa; border-radius: 8px; border: 1px solid #f3f4f6; }
  .entry:last-child { margin-bottom: 0; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 2px 6px; }
  .entry-title { font-size: 13px; font-weight: 700; color: #1e1b4b; }
  .entry-sub { font-size: 11px; color: #7c3aed; font-weight: 500; }
  .entry-date, .entry-date-range { font-size: 10px; color: #9ca3af; white-space: nowrap; }
  .entry-desc { margin-top: 2px; font-size: 12px; line-height: 1.6; color: #4b5563; }
  .entry-list { margin-top: 2px; padding-left: 14px; font-size: 12px; line-height: 1.6; color: #4b5563; }
  .entry-list li { margin-bottom: 1px; }
  .tech-stack { display: flex; flex-wrap: wrap; gap: 3px 6px; margin-top: 2px; }
  .tech-tag { font-size: 9px; color: #7c3aed; background: #f5f3ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #ede9fe; }
  .project-links { margin-top: 2px; font-size: 11px; }
  .project-links a { color: #7c3aed; text-decoration: none; margin-right: 10px; }
  #cert-content { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #374151; }
  .cert-row { display: flex; gap: 6px; align-items: baseline; }
  .cert-row .label { font-weight: 600; color: #1e1b4b; min-width: 44px; font-size: 11px; }
  .cert-badge { display: inline-block; font-size: 11px; color: #7c3aed; background: #f5f3ff; padding: 1px 8px; border-radius: 3px; margin: 1px 3px 1px 0; }
  .lang-item { display: inline-block; font-size: 11px; color: #374151; }
  .lang-item .lang-name { font-weight: 600; }
  .gpa-text { font-size: 10px; color: #9ca3af; }
</style>
</head>
<body>
<div class="resume-page" id="resume-root">

<div id="personal">
  <img id="avatar" src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect width=%27100%27 height=%27100%27 rx=%2750%27 fill=%27rgba(255,255,255,0.06)%27/%3E%3Ccircle cx=%2750%27 cy=%2738%27 r=%2718%27 fill=%27rgba(255,255,255,0.1)%27/%3E%3Cellipse cx=%2750%27 cy=%2772%27 rx=%2728%27 ry=%2722%27 fill=%27rgba(255,255,255,0.04)%27/%3E%3C/svg%3E" alt="头像" />
  <div id="fullName"></div>
  <div id="jobTitle"></div>
  <div class="divider"></div>
  <div class="contact-row">
    <span id="phone"><span class="val"></span></span>
    <span id="email"><span class="val"></span></span>
    <span id="location"><span class="val"></span></span>
    <a id="website" href="" target="_blank"><span class="val"></span></a>
    <a id="github" href="" target="_blank"><span class="val"></span></a>
  </div>
  <div style="flex:1;min-height:20px;"></div>
  <div style="font-size:8px;color:rgba(255,255,255,0.45);letter-spacing:0.5px;line-height:1.4;border-top:1px solid rgba(255,255,255,0.12);padding-top:12px;">
    <div>UI / UX Designer</div>
    <div>Front-end Developer</div>
  </div>
</div>

<div id="profile" class="resume-section">
  <div class="section-title">个人简介</div>
  <div class="section-content" id="profile-content"></div>
</div>
<div id="skills" class="resume-section">
  <div class="section-title">核心技能</div>
  <div id="skill-groups"></div>
</div>
<div id="work" class="resume-section">
  <div class="section-title">工作经历</div>
  <div id="work-list"></div>
</div>
<div id="projects" class="resume-section">
  <div class="section-title">项目经验</div>
  <div id="project-list"></div>
</div>
<div id="education" class="resume-section">
  <div class="section-title">教育背景</div>
  <div id="education-list"></div>
</div>
<div id="certificates" class="resume-section">
  <div class="section-title">证书 / 语言</div>
  <div id="cert-content"></div>
</div>

</div>
</body>
</html>`
export const creativeTemplateMeta = {
  name: '创意/设计',
  description: 'Figma 风 | 深紫渐变侧栏 + 紫色调 + 圆角卡片，适合 UI/UX/视觉/产品设计师岗位',
  author: 'Resume Editor',
  version: '2.0.0',
}

export const creativeTemplate: StoredTemplate = {
  id: '__creative__',
  meta: creativeTemplateMeta,
  html: creativeTemplateHTML,
  builtIn: true,
}
