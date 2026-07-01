import type { StoredTemplate } from './classic'

export const socialTemplateHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>简历</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
    display: flex; justify-content: center; align-items: flex-start;
    min-height: 100vh; padding: 40px 20px;
    background: #f4f4f4;
  }
  .resume-page { width: 210mm; min-height: 297mm; background: #ffffff; padding: 0; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border-radius: 0; }

  @media print {
    body { background: #fff; padding: 0; }
    .resume-page { width: 100%; min-height: auto; box-shadow: none; border: none; border-radius: 0; }
  }

  /* ── 小红书 Banner ── */
  .profile-banner {
    background: linear-gradient(135deg, #ff2442 0%, #ff6b81 100%);
    height: 120px;
  }

  /* ── Resume Body ── */
  #resume-root { }
  .resume-body { padding: 0 40px 32px; }

  /* ── Profile Header ── */
  #personal {
    display: flex; flex-direction: column; align-items: center;
    text-align: center;
    margin-top: -40px;
    padding-bottom: 20px;
    position: relative;
    z-index: 1;
    border-bottom: 8px solid #f4f4f4;
    margin-bottom: 0;
  }

  #avatar {
    width: 80px; height: 80px; border-radius: 50%;
    object-fit: cover; flex-shrink: 0;
    background: #fff; border: 3px solid #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  }

  .personal-info { text-align: center; margin-top: 8px; }

  #fullName {
    font-size: 22px; font-weight: 700;
    color: #222; line-height: 1.3;
  }
  #fullName::after {
    content: "";
    display: inline-block; width: 20px; height: 20px;
    background: #ff2442; border-radius: 50%;
    margin-left: 6px; vertical-align: middle;
    background-image: url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27%23fff%27%3E%3Cpath d=%27M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z%27/%3E%3C/svg%3E");
    background-size: 12px; background-position: center; background-repeat: no-repeat;
  }

  #jobTitle {
    font-size: 14px; font-weight: 400; color: #666;
    margin-top: 2px;
  }

  .stats-row {
    display: flex; justify-content: center; gap: 36px;
    margin-top: 16px;
  }
  .stat-item { text-align: center; }
  .stat-num { display: block; font-size: 18px; font-weight: 700; color: #222; letter-spacing: -0.3px; }
  .stat-label { display: block; font-size: 12px; color: #999; margin-top: 1px; }

  .contact-row {
    display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 14px;
    margin-top: 14px; font-size: 12px; color: #999;
  }
  .contact-row span, .contact-row a { display: inline-flex; align-items: center; gap: 3px; }
  .contact-row a { color: #ff2442; text-decoration: none; font-weight: 500; }

  .follow-btn {
    display: inline-block;
    background: #ff2442; color: #fff;
    padding: 6px 36px; border-radius: 20px;
    font-size: 14px; font-weight: 600;
    margin-top: 12px; letter-spacing: 0.5px;
  }

  /* ── Profile Bio ── */
  #profile {
    padding: 16px 0 8px;
  }
  #profile .section-content {
    font-size: 13px; line-height: 1.8; color: #444;
  }

  /* ── Sections ── */
  .resume-section { margin-bottom: 0; }

  .section-title {
    font-size: 14px; font-weight: 700; color: #222;
    display: flex; align-items: center; gap: 8px;
    padding: 14px 0 10px; margin-bottom: 0;
  }
  .section-title::before {
    content: "";
    display: inline-block; width: 3px; height: 16px;
    background: #ff2442; border-radius: 2px;
  }

  .section-content {
    padding: 12px 0 16px;
  }

  /* ── Skills ── */
  #skill-groups { display: flex; flex-direction: column; gap: 6px; }
  .skill-group { font-size: 13px; display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px; }
  .skill-group .group-name { font-weight: 600; color: #222; margin-right: 4px; font-size: 12px; }
  .skill-tags { display: inline-flex; flex-wrap: wrap; gap: 4px; }
  .skill-tag {
    display: inline-block; background: #fff0f0; color: #ff2442;
    padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 500;
  }

  /* ── RED Note Cards ── */
  #work-list, #education-list, #project-list {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .entry {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 0;
    transition: box-shadow 0.15s;
    background: #fff;
    position: relative;
    overflow: hidden;
  }
  .entry::before {
    content: "";
    position: absolute; top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ff2442, #ff6b81);
  }
  .entry:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }

  .entry-header {
    display: flex; justify-content: space-between; align-items: baseline;
    flex-wrap: wrap; gap: 2px 6px;
  }
  .entry-title { font-size: 14px; font-weight: 600; color: #222; }
  .entry-sub { font-weight: 500; color: #ff2442; font-size: 11px; }
  .entry-date, .entry-date-range { font-size: 11px; color: #bbb; white-space: nowrap; }
  .entry-desc { margin-top: 6px; font-size: 12px; line-height: 1.7; color: #666; }
  .entry-list { margin-top: 4px; padding-left: 0; list-style: none; font-size: 12px; line-height: 1.7; color: #666; }
  .entry-list li { position: relative; padding-left: 13px; margin-bottom: 1px; }
  .entry-list li::before { content: ""; position: absolute; left: 2px; top: 8px; width: 3px; height: 3px; border-radius: 50%; background: #ff2442; }

  .tech-stack { display: flex; flex-wrap: wrap; gap: 3px 6px; margin-top: 5px; }
  .tech-tag {
    background: #fff0f0; color: #ff2442; padding: 1px 7px;
    border-radius: 3px; font-size: 10px; font-weight: 500;
  }

  .project-links { margin-top: 4px; font-size: 11px; }
  .project-links a { color: #ff2442; text-decoration: none; margin-right: 10px; font-weight: 500; }

  /* ── Certs / Languages ── */
  #cert-content { display: flex; flex-wrap: wrap; gap: 10px 28px; font-size: 13px; color: #555; }
  .cert-row .label { font-weight: 600; color: #222; margin-right: 4px; font-size: 12px; }
  .cert-badge { display: inline-block; background: #fff0f0; color: #ff2442; padding: 2px 10px; border-radius: 4px; font-size: 12px; margin: 2px 4px 2px 0; }
  .lang-item { display: inline-block; border: 1px solid #eee; border-radius: 4px; padding: 2px 10px; margin: 2px 6px 2px 0; font-size: 12px; background: #fafafa; }
  .lang-item .lang-name { font-weight: 600; color: #222; }
  .gpa-text { font-size: 11px; color: #bbb; margin-top: 2px; }
</style>
</head>
<body>
<div class="resume-page">
  <div id="resume-root">
    <div class="profile-banner"></div>

    <div class="resume-body">

      <div id="personal">
        <img id="avatar" src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect width=%27100%27 height=%27100%27 rx=%2750%27 fill=%27%23fff5f5%27/%3E%3Ccircle cx=%2750%27 cy=%2736%27 r=%2718%27 fill=%27%23ffd4d4%27/%3E%3Cellipse cx=%2750%27 cy=%2772%27 rx=%2728%27 ry=%2722%27 fill=%27%23ffb0b0%27/%3E%3C/svg%3E" alt="头像" />
        <div class="personal-info">
          <div id="fullName"></div>
          <div id="jobTitle"></div>
          <div class="stats-row">
            <div class="stat-item"><span class="stat-num" data-stat="exp">2</span><span class="stat-label">工作经验</span></div>
            <div class="stat-item"><span class="stat-num" data-stat="projects">5</span><span class="stat-label">项目</span></div>
            <div class="stat-item"><span class="stat-num" data-stat="certs">3</span><span class="stat-label">证书</span></div>
          </div>
          <div class="follow-btn">📩 联系我</div>
          <div class="contact-row">
            <span id="location">📍 <span class="val"></span></span>
            <span id="email">✉️ <span class="val"></span></span>
            <span id="phone">📞 <span class="val"></span></span>
            <a id="website" href="" target="_blank">🔗 <span class="val"></span></a>
            <a id="github" href="" target="_blank">💻 <span class="val"></span></a>
          </div>
        </div>
      </div>

      <div id="profile" class="resume-section">
        <div class="section-content" id="profile-content"></div>
      </div>

      <div id="skills" class="resume-section">
        <div class="section-title">核心能力</div>
        <div id="skill-groups" class="section-content"></div>
      </div>

      <div id="work" class="resume-section">
        <div class="section-title">📝 工作经历</div>
        <div id="work-list" class="section-content"></div>
      </div>

      <div id="projects" class="resume-section">
        <div class="section-title">📝 项目经验</div>
        <div id="project-list" class="section-content"></div>
      </div>

      <div id="education" class="resume-section">
        <div class="section-title">📝 教育背景</div>
        <div id="education-list" class="section-content"></div>
      </div>

      <div id="certificates" class="resume-section">
        <div class="section-title">📝 证书 / 语言</div>
        <div id="cert-content" class="section-content"></div>
      </div>

    </div>
  </div>
</div>
</body>
</html>`

export const socialTemplateMeta = {
  name: '社交媒体风格',
  description: '小红书个人主页风 ｜ 红白配色 + 笔记卡片布局 + 关注/点赞/收藏互动元素，适合新媒体运营/内容策划/市场营销/品牌岗位',
  author: 'Resume Editor',
  version: '1.0.0',
}

export const socialTemplate: StoredTemplate = {
  id: '__social__',
  meta: socialTemplateMeta,
  html: socialTemplateHTML,
  builtIn: true,
}
