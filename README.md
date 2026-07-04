# Resume Editor

> 跨平台简历编辑器 — 10 款精心设计的简历模板 + AI 润色，所见即所得的编辑体验。

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/yaocat55/resume-editor)
![GitHub all releases](https://img.shields.io/github/downloads/yaocat55/resume-editor/total)

---

## 特性

- **🤖 AI 润色** — 接入任意 OpenAI 兼容 API，支持分段润色（全篇上下文感知）和全文润色（JSON 入 JSON 出 + diff 对比）
- **📝 所见即所得编辑** — 左侧编辑，右侧实时预览，所有模板基于 Shadow DOM 隔离渲染
- **🎨 10 款简历模板** — 经典商务、Material 3 雾蓝、VS Code 代码风、GitHub Profile、小红书、Bento 网格、学术、创意设计、FDE 实施工程师、极简 ATS
- **↩️ Undo / Redo** — Ctrl+Z 撤销、Ctrl+Shift+Z 重做，30 步历史记录
- **🔄 拖拽排序** — 拖拽调整简历板块顺序，无需上下箭头
- **🖼️ 模板画廊** — 可视化模板选择，每个模板有专属配色卡片
- **📷 头像上传** — 点击上传头像，自动转 base64 存储
- **🖨️ 原生 PDF 导出** — Electron 版直接调用 `printToPDF`，无页眉页脚
- **📄 渲染 HTML 导出** — 导出包含完整数据的独立 HTML 文件，Word 可直接打开
- **🌓 深色/浅色模式** — 0.35s 平滑过渡动画
- **📦 数据持久化** — 自动保存到本地，支持 JSON 导入导出
- **📐 强制一页** — 内容超长时自动缩放适配一页 A4
- **🔒 隐私安全** — 纯本地应用，AI 数据直发你配置的地址，不经第三方
- **🔄 自动发版** — GitHub Actions 每次推送自动构建 + 发布 Release

## 模板一览

| 模板 | 风格 | 适合 |
|------|------|------|
| **经典专业** | 蓝灰商务 | 全行业通用 |
| **Material 3 雾蓝** | 圆角卡片 | PM/运营/市场 |
| **VS Code 主题** | 深色代码 | 开发者 |
| **GitHub 主题** | 仓库卡片 | 开源/技术 |
| **Bento 网格** | 卡片网格 | 产品/设计/科技 |
| **创意设计** | 深紫渐变 | UI/UX/视觉 |
| **小红书** | 红白笔记 | 新媒体/营销 |
| **FDE 实施工程师** | 技术方案书 | 实施/项目工程师 |
| **学术** | 衬线暖纸 | 科研/教育 |
| **极简文本** | 纯文字 ATS | 机读优先 |

## 快速开始

### 本地开发

```bash
git clone https://github.com/yaocat55/resume-editor.git
cd resume-editor
npm install

# 浏览器开发模式
npm run dev

# 桌面应用开发模式
npm run dev:electron
```

> Windows 用户注意：首次执行 Electron 会自动下载二进制文件，国内可配置镜像加速。
> 在项目根目录创建 `.npmrc`：
> ```
> electron_mirror=https://npmmirror.com/mirrors/electron/
> ```

### 构建安装包

```bash
npm run build:electron
```

安装包将输出到 `release/` 目录。

## AI 配置

支持所有兼容 OpenAI Chat Completions 格式的 API：

| 供应商 | 自动配置 |
|--------|---------|
| **DeepSeek** | `api.deepseek.com` + V4 Flash / V4 Pro |
| **智谱 GLM** | `open.bigmodel.cn` + GLM-4 系列 |
| **阿里通义千问** | `dashscope.aliyuncs.com` + Qwen 系列 |
| **火山引擎** | `ark.cn-beijing.volces.com` + Doubao 系列 |
| **Kimi** | `api.moonshot.cn` + Moonshot 系列 |
| **阶跃星辰** | `api.stepfun.com` + Step 系列 |
| **百川智能** | `api.baichuan-ai.com` + Baichuan 系列 |
| **硅基流动** | `api.siliconflow.cn` + DeepSeek / QwQ / GLM / 混元 |
| **ModelScope** | `api.modelscope.cn` + 开源模型 |
| **CCSub** | 聚合中转站 |
| **OpenRouter** | 全球模型聚合平台 |
| **神算云** | AI API 聚合平台 |
| **OpenAI** | `api.openai.com/v1` + GPT-4o 系列 |

点击「获取模型」可从 API 拉取实时模型列表。

## 导出 PDF 指南

| 方式 | 平台 | 操作 |
|------|------|------|
| Electron 原生导出 | 桌面应用 | 点击工具栏「导出 PDF」，直接弹出保存对话框 |
| 浏览器打印 | 网页版 | 点击「导出 PDF」，在新窗口中选择「另存为 PDF」，取消勾选「页眉和页脚」 |

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | React 19 + TypeScript 6 |
| 构建 | Vite 8 |
| 桌面端 | Electron 43 |
| 模板渲染 | Shadow DOM |
| 状态管理 | Zustand 5 + persist |
| UI 组件 | MUI v9 (Material Design 3) |
| 日期选择 | MUI X Date Pickers |
| 图标 | Material Icons |
| 国际化 | i18next |
| CI/CD | GitHub Actions (自动构建 + 发版) |

## 项目结构

```
resume-editor/
├── electron/                # Electron 主进程
│   ├── main.cjs             # 窗口创建、IPC、菜单、CSP
│   └── preload.cjs          # contextBridge 预加载
├── src/
│   ├── features/ai/         # AI 润色功能模块
│   │   ├── AIConfigPage.tsx  # 配置页面
│   │   ├── store.ts          # 配置状态 + 13 家供应商预设
│   │   └── service.ts        # API 调用 + prompt
│   ├── components/
│   │   ├── editor/           # 各编辑器组件
│   │   ├── preview/          # Shadow DOM 实时预览
│   │   ├── layout/           # 三栏主布局
│   │   └── shared/           # 通用小组件
│   ├── hooks/                # 自定义 hooks
│   │   └── useUndo.ts        # Undo/Redo 逻辑
│   ├── templates/            # 10 款简历模板
│   ├── store/                # 全局状态管理
│   ├── i18n/                 # 国际化
│   └── types/                # TypeScript 类型定义
├── .github/workflows/        # CI/CD 自动构建 + 发版
└── package.json
```

## 开发

```bash
# 代码检查
npm run lint

# 构建
npm run build
```

## 贡献

欢迎提交 Issue 和 PR。如果这个项目对你有帮助，给个 Star ⭐ 就是最大的支持。

## 许可证

MIT
