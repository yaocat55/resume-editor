import type { StoredTemplate } from './classic'

export const vscodeTemplateHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>resume.ts - Visual Studio Code</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: "Cascadia Code", "Fira Code", "SF Mono", "Consolas", "Source Han Sans SC", monospace;
    display: flex; justify-content: center; align-items: flex-start;
    min-height: 100vh; padding: 40px 20px;
    background: #1e1e1e; color: #d4d4d4;
  }

  .resume-page {
    width: 210mm; min-height: 297mm;
    padding: 0;
    border: 1px solid #3c3c3c;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);
    border-radius: 6px;
    
  }

  @media print {
    body { background: #fff; padding: 0; color: #333; }
    .resume-page { width: 100%; min-height: auto; box-shadow: none; border: 1px solid #ccc; border-radius: 0; background: #fff; }
    .editor-tabs, .status-bar { display: none !important; }
  }

  #resume-root {
    display: flex; flex-direction: column;
    min-height: 100%;
  }

  /* ── Editor Tabs ── */
  .editor-tabs {
    display: flex; background: #252526;
    border-bottom: 1px solid #2d2d2d;
    flex-shrink: 0; user-select: none;
  }
  .editor-tab {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 14px; font-size: 11px; color: #969696;
    background: #2d2d2d;
    border-right: 1px solid #252526;
  }
  .editor-tab.active {
    background: #1e1e1e; color: #d4d4d4;
    border-bottom: 1px solid #1e1e1e;
  }
  .editor-tab .tab-icon { font-size: 10px; }

  /* ── Resume Body ── */
  .resume-body {
    flex: 1; padding: 28px 48px 36px;
  }

  /* ── Personal ── */
  #personal {
    padding-bottom: 14px;
    border-bottom: 1px solid #2d2d2d;
    margin-bottom: 14px;
  }
  #avatar { display: none; }
  #fullName {
    font-size: 22px; font-weight: 700;
    color: #dcdcaa; line-height: 1.3;
  }
  #jobTitle {
    font-size: 12px; font-weight: 400;
    color: #9cdcfe; margin-top: 2px;
  }
  .contact-row {
    display: flex; flex-wrap: wrap; gap: 4px 14px;
    margin-top: 6px; font-size: 11px; color: #a0a0a0;
  }
  .contact-row span { color: #ce9178; }
  .contact-row a { color: #569cd6; text-decoration: none; }
  .contact-row .val { color: #d4d4d4; }

  /* ── Sections ── */
  .resume-section { margin-bottom: 14px; }
  .resume-section:last-child { margin-bottom: 0; }

  .section-title {
    font-size: 12px; font-weight: 600;
    color: #569cd6; margin-bottom: 5px;
  }
  .section-title::before { content: "// "; color: #6a9955; }

  #profile .section-content {
    font-size: 12px; line-height: 1.9; color: #d4d4d4;
  }

  /* ── Skills ── */
  #skill-groups { display: flex; flex-direction: column; gap: 3px; }
  .skill-group { font-size: 11px; display: flex; align-items: baseline; flex-wrap: wrap; gap: 2px; }
  .skill-group .group-name { font-weight: 600; color: #9cdcfe; margin-right: 6px; font-size: 11px; }
  .skill-tags { display: inline-flex; flex-wrap: wrap; gap: 2px; }
  .skill-tag { display: inline-block; color: #ce9178; font-size: 11px; }
  .skill-tag::before { content: "["; color: #6a9955; }
  .skill-tag::after { content: "]"; color: #6a9955; }

  /* ── Entries ── */
  .entry { padding: 3px 0; margin-bottom: 1px; border: none; }

  .entry-header {
    display: flex; justify-content: space-between; align-items: baseline;
    flex-wrap: wrap; gap: 2px 8px;
  }
  .entry-title { font-size: 13px; font-weight: 600; color: #dcdcaa; }
  .entry-sub { font-weight: 400; color: #4ec9b0; font-size: 11px; }
  .entry-date, .entry-date-range { font-size: 11px; color: #a0a0a0; white-space: nowrap; }

  .entry-desc { margin-top: 1px; font-size: 12px; line-height: 1.8; color: #d4d4d4; }
  .entry-list { margin-top: 1px; padding-left: 0; list-style: none; font-size: 12px; line-height: 1.8; }
  .entry-list li { position: relative; padding-left: 20px; margin-bottom: 0; color: #d4d4d4; }
  .entry-list li::before { content: "\\2192"; position: absolute; left: 2px; color: #6a9955; }

  .tech-stack { display: flex; flex-wrap: wrap; gap: 3px 8px; margin-top: 1px; }
  .tech-tag { display: inline-block; background: #2d2d2d; color: #ce9178; padding: 0 6px; border-radius: 3px; font-size: 11px; }

  .project-links { margin-top: 1px; font-size: 11px; }
  .project-links a { color: #569cd6; text-decoration: none; margin-right: 10px; }

  /* ── Certs ── */
  #cert-content { display: flex; flex-wrap: wrap; gap: 4px 20px; font-size: 12px; color: #d4d4d4; }
  .cert-row .label { font-weight: 600; color: #569cd6; margin-right: 4px; font-size: 11px; }
  .cert-badge { display: inline-block; color: #ce9178; padding: 0 4px; font-size: 11px; margin: 0; }
  .lang-item { display: inline-block; padding: 0 4px; margin: 0 4px 0 0; font-size: 11px; }
  .lang-item .lang-name { font-weight: 600; color: #dcdcaa; }
  .gpa-text { font-size: 11px; color: #a0a0a0; margin-top: 1px; }

  /* ── Status Bar ── */
  .status-bar {
    display: flex; align-items: center; justify-content: space-between;
    background: #007acc; color: #ffffff;
    padding: 2px 12px; font-size: 11px;
    flex-shrink: 0; user-select: none;
  }
  .status-left, .status-right { display: flex; align-items: center; gap: 12px; }
  .status-item { display: inline-flex; align-items: center; gap: 3px; }
</style>
</head>
<body>
<div class="resume-page">
  <div id="resume-root">

    <div class="editor-tabs">
      <div class="editor-tab active">
        <span class="tab-icon">📄</span>
        resume.ts
      </div>
      <div class="editor-tab">
        <span class="tab-icon">📄</span>
        个人简介
      </div>
    </div>

    <div class="resume-body">

      <div id="personal">
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
        <div class="section-title">技术栈</div>
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

    <div class="status-bar">
      <div class="status-left">
        <span class="status-item">⎔ master</span>
        <span class="status-item">✕ 0</span>
        <span class="status-item">△ 0</span>
      </div>
      <div class="status-right">
        <span class="status-item">Ln 1, Col 1</span>
        <span class="status-item">UTF-8</span>
        <span class="status-item">{} TS</span>
      </div>
    </div>

  </div>
</div>
</body>
</html>`

export const vscodeTemplateMeta = {
  name: 'VS Code 主题',
  description: 'VS Code IDE 风 | 编辑器标签页 + 行号 + 状态栏 + 代码配色，开发者一眼共鸣',
  author: 'Resume Editor',
  version: '2.0.0',
}

export const vscodeTemplate: StoredTemplate = {
  id: '__vscode__',
  meta: vscodeTemplateMeta,
  html: vscodeTemplateHTML,
  builtIn: true,
}
