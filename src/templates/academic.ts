import type { StoredTemplate } from './classic'

export const academicTemplateHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>简历</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Georgia, "Times New Roman", "Noto Serif SC", serif;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 40px 20px;
  }
  .resume-page {
    width: 210mm;
    min-height: 297mm;
    background: #fefcf8;
    padding: 40px 52px;
    border: none;
    border-radius: 8px;
    border-radius: 8px;
    color: #2c2c2c;
    line-height: 1.6;
    font-size: 11.5pt;
  }


  .resume-body { padding: 0; }

  @media print {
    body { background: #fff; padding: 0; }
    .resume-page { width: 100%; min-height: auto; padding: 40px 48px; background: #fff; }
  }

  #personal {
    display: flex;
    align-items: center;
    gap: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #c9b99a;
    margin-bottom: 24px;
  }
  #avatar {
    width: 72px; height: 72px; border-radius: 50%;
    object-fit: cover; flex-shrink: 0;
    background: #e8e0d0; border: 2px solid #c9b99a;
  }
  .personal-info { flex: 1; }
  #fullName { font-size: 24pt; font-weight: 400; color: #1a1a1a; letter-spacing: 0.5px; }
  #jobTitle { font-size: 11pt; font-weight: 400; color: #6b5a4a; margin-top: 2px; font-style: italic; }
  .contact-row {
    display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 8px; font-size: 9.5pt; color: #6b5a4a;
  }
  .contact-row a { color: #8b4513; text-decoration: none; }
  .contact-row a:hover { text-decoration: underline; }

  .resume-section { margin-bottom: 22px; }
  .section-title {
    font-size: 11pt; font-weight: 600; color: #8b4513;
    letter-spacing: 0.5px; margin-bottom: 10px;
    display: flex; align-items: center; gap: 10px;
  }
  .section-title::after {
    content: ""; flex: 1; height: 1px;
    background: linear-gradient(90deg, #c9b99a 0%, transparent 100%);
  }

  #profile .section-content { font-size: 10.5pt; line-height: 1.7; color: #3a3a3a; padding: 0 2px; }

  #skill-groups { display: flex; flex-direction: column; gap: 5px; }
  .skill-group { display: flex; gap: 8px; font-size: 10.5pt; }
  .skill-group .group-name { font-weight: 600; color: #1a1a1a; min-width: 64px; font-size: 10pt; }
  .skill-tags { display: inline; }
  .skill-tag { display: inline; }
  .skill-tag + .skill-tag::before { content: " · "; color: #b8a88a; }

  .entry { margin-bottom: 14px; padding: 0; }
  .entry-header {
    display: flex; justify-content: space-between; align-items: baseline;
    flex-wrap: wrap; gap: 2px 8px;
  }
  .entry-title { font-size: 12pt; font-weight: 600; color: #1a1a1a; }
  .entry-sub { font-weight: 500; color: #6b5a4a; font-size: 10.5pt; }
  .entry-date, .entry-date-range { font-size: 9.5pt; color: #8a8a8a; white-space: nowrap; }
  .entry-desc { margin-top: 3px; font-size: 10.5pt; line-height: 1.6; color: #3a3a3a; }
  .entry-list { margin-top: 2px; padding-left: 18px; font-size: 10.5pt; line-height: 1.6; color: #3a3a3a; }
  .entry-list li { margin-bottom: 1px; }

  .tech-stack { display: inline; }
  .tech-tag { display: inline; font-size: 9.5pt; color: #6b5a4a; }
  .tech-tag + .tech-tag::before { content: " · "; }

  .project-links { margin-top: 2px; font-size: 9.5pt; }
  .project-links a { color: #8b4513; text-decoration: none; margin-right: 12px; }
  .project-links a:hover { text-decoration: underline; }

  #cert-content { display: flex; flex-direction: column; gap: 4px; font-size: 10.5pt; color: #3a3a3a; }
  .cert-row { display: flex; gap: 6px; }
  .cert-row .label { font-weight: 600; color: #1a1a1a; min-width: 48px; }
  .cert-badge { display: inline; }
  .cert-badge + .cert-badge::before { content: ", "; }
  .lang-item { display: inline; }
  .lang-item + .lang-item::before { content: ", "; }
  .lang-item .lang-name { font-weight: 600; }
  .gpa-text { font-size: 9.5pt; color: #8a8a8a; }
</style>
</head>
<body>
<div class="resume-page" id="resume-root">
  <div class="resume-body">
    <div id="personal">
    <img id="avatar" src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect width=%27100%27 height=%27100%27 rx=%2750%27 fill=%27%23e8e0d0%27/%3E%3Ccircle cx=%2750%27 cy=%2738%27 r=%2718%27 fill=%27%23c9b99a%27/%3E%3Cellipse cx=%2750%27 cy=%2772%27 rx=%2728%27 ry=%2722%27 fill=%27%23b8a88a%27/%3E%3C/svg%3E" alt="头像" />
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
</div>
</body>
</html>`

export const academicTemplateMeta = {
  name: '学术风格',
  description: '学术风格 | 适合高校教职/科研院所/博士申请/学术会议，衬线字体 + 暖白纸色显严谨',
  author: 'Resume Editor',
  version: '1.0.0',
}

export const academicTemplate: StoredTemplate = {
  id: '__academic__',
  meta: academicTemplateMeta,
  html: academicTemplateHTML,
  builtIn: true,
}
