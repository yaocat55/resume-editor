import type { StoredTemplate } from './classic'

export const minimalTemplateHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>简历</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Helvetica Neue", Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 40px 20px;
  }
  .resume-page {
    width: 210mm;
    min-height: 297mm;
    background: #fff;
    padding: 40px 52px;
    border: none;
    border-radius: 8px;
    border-radius: 8px;
    color: #222;
    line-height: 1.5;
    font-size: 11pt;
  }


  .resume-body { padding: 0; }

  @media print {
    body { background: #fff; padding: 0; }
    .resume-page { width: 100%; min-height: auto; padding: 36px 44px; }
  }
  #personal { margin-bottom: 20px; }
  #avatar { display: none; }
  #fullName { font-size: 22pt; font-weight: 700; margin-bottom: 2px; letter-spacing: -0.5px; }
  #jobTitle { font-size: 11pt; color: #555; margin-bottom: 8px; }
  .contact-row { font-size: 9.5pt; color: #555; }
  .contact-row span, .contact-row a { color: #222; text-decoration: none; }
  .contact-row span + span::before, .contact-row a + a::before { content: " | "; color: #ccc; }
  .contact-row a { text-decoration: underline; color: #555; }

  .resume-section { margin-bottom: 18px; }
  .section-title {
    font-size: 10pt; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1.5px; border-bottom: 1px solid #ccc;
    padding-bottom: 4px; margin-bottom: 8px;
  }
  #profile .section-content { font-size: 10pt; line-height: 1.6; color: #333; }

  #skill-groups { display: flex; flex-direction: column; gap: 4px; }
  .skill-group { display: flex; gap: 6px; font-size: 10pt; }
  .skill-group .group-name { font-weight: 600; min-width: 56px; color: #222; }
  .skill-tags { display: inline; }
  .skill-tag { display: inline; }
  .skill-tag + .skill-tag::before { content: " / "; color: #999; }

  .entry { margin-bottom: 12px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; gap: 4px 8px; }
  .entry-title { font-size: 11pt; font-weight: 600; }
  .entry-sub { font-size: 10pt; color: #555; }
  .entry-date, .entry-date-range { font-size: 9.5pt; color: #777; white-space: nowrap; }
  .entry-desc { margin-top: 2px; font-size: 10pt; line-height: 1.5; color: #333; }
  .entry-list { margin-top: 2px; padding-left: 16px; font-size: 10pt; line-height: 1.5; color: #333; }
  .entry-list li { margin-bottom: 1px; }
  .tech-stack { display: inline; }
  .tech-tag { display: inline; font-size: 9.5pt; color: #555; }
  .tech-tag + .tech-tag::before { content: " · "; }
  .project-links { margin-top: 2px; font-size: 9.5pt; }
  .project-links a { color: #555; text-decoration: underline; margin-right: 12px; }
  #cert-content { display: flex; flex-direction: column; gap: 4px; font-size: 10pt; color: #333; }
  .cert-row { display: flex; gap: 6px; }
  .cert-row .label { font-weight: 600; min-width: 48px; }
  .cert-badge { display: inline; }
  .cert-badge + .cert-badge::before { content: ", "; }
  .lang-item { display: inline; }
  .lang-item + .lang-item::before { content: ", "; }
  .lang-item .lang-name { font-weight: 600; }
  .gpa-text { font-size: 9.5pt; color: #777; }
</style>
</head>
<body>
<div class="resume-page" id="resume-root">
  <div class="resume-body">
    <div id="personal">
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

export const minimalTemplateMeta = {
  name: '极简纯文本',
  description: '极简纯文本 | ATS 地狱级兼容，适合海投/猎头系统/政府招考/高校行政，零装饰零风险',
  author: 'Resume Editor',
  version: '1.0.0',
}

export const minimalTemplate: StoredTemplate = {
  id: '__minimal__',
  meta: minimalTemplateMeta,
  html: minimalTemplateHTML,
  builtIn: true,
}
