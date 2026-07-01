// ============================================================
// 简历完整类型定义
// ============================================================

/** 个人信息 */
export interface Personal {
  avatar: string
  fullName: string
  jobTitle: string
  phone: string
  email: string
  location: string
  website: string
  github: string
}

/** 教育经历 */
export interface Education {
  id: string
  school: string
  major: string
  degree: '本科' | '硕士' | '博士' | '专科'
  startDate: string   // YYYY-MM
  endDate: string     // YYYY-MM
  gpa?: string
  honors?: string[]
}

/** 工作经历 */
export interface Work {
  id: string
  company: string
  position: string
  startDate: string   // YYYY-MM
  endDate: string     // YYYY-MM
  description: string
  achievements?: string[]
}

/** 项目经验 */
export interface Project {
  id: string
  name: string
  role: string
  technologies?: string[]
  startDate?: string  // YYYY-MM
  endDate?: string    // YYYY-MM
  description: string
  highlights?: string[]
  githubUrl?: string
  demoUrl?: string
}

/** 技能分组 */
export interface SkillGroup {
  name: string
  items: string[]
}

/** 技能 */
export interface Skills {
  groups: SkillGroup[]
}

/** 语言 */
export interface Language {
  name: string
  level: string
}

/** 证书/语言 */
export interface Certificates {
  list: string[]
  languages: Language[]
}

/** 简历完整数据结构 */
export interface Resume {
  personal: Personal
  profile: string
  education: Education[]
  work: Work[]
  projects: Project[]
  skills: Skills
  certificates: Certificates
}

// ============================================================
// 校验规则类型
// ============================================================

export interface ValidationRule {
  field: string
  required: boolean
  minLength?: number
  pattern?: RegExp
  message: string
}

export interface ValidationErrors {
  [key: string]: string
}

// ============================================================
// 模板相关类型
// ============================================================

/** 模板中定义的容器区块 */
export interface TemplateSection {
  name: string        // 如 personal, profile, education
  label: string       // 显示名称
  enabled: boolean    // 用户是否启用该区块
}

/** 模板元数据 */
export interface TemplateMeta {
  name: string
  description: string
  author: string
  version: string
}

/** 完整模板定义 */
export interface ResumeTemplate {
  meta: TemplateMeta
  html: string
  sections: TemplateSection[]
}

// ============================================================
// 默认数据
// ============================================================

export const defaultResume: Resume = {
  personal: {
    avatar: '',
    fullName: '张明',
    jobTitle: '前端开发工程师',
    phone: '138-0000-8888',
    email: 'ming.zhang@email.com',
    location: '深圳',
    website: 'https://ming.dev',
    github: 'https://github.com/mingdev',
  },
  profile: '4 年前端开发经验，精通 React 生态，注重代码质量与工程效率。主导过多个大型中后台项目的架构设计与性能优化。',
  education: [
    {
      id: 'e-default-1',
      school: '华中科技大学',
      major: '计算机科学与技术',
      degree: '本科',
      startDate: '2016-09',
      endDate: '2020-06',
      gpa: '3.8/4.0',
      honors: ['校级优秀毕业生（前5%）', '全国服务外包创新创业大赛一等奖'],
    },
  ],
  work: [
    {
      id: 'w-default-1',
      company: '字节跳动',
      position: '高级前端开发工程师',
      startDate: '2022-07',
      endDate: '2025-06',
      description: '负责抖音电商后台管理系统的前端架构设计与团队协作，支撑日均百万级订单管理。',
      achievements: [
        '主导微前端架构改造，模块加载时间从 3.2s 优化至 0.8s',
        '封装通用业务组件库 40+，团队复用率提升 60%',
        '引入 SWR 缓存策略，接口请求量减少 52%',
      ],
    },
    {
      id: 'w-default-2',
      company: '蚂蚁集团',
      position: '前端开发工程师',
      startDate: '2020-06',
      endDate: '2022-06',
      description: '参与支付宝小程序开发者工具的前端开发，服务 30 万+开发者。',
      achievements: [
        '重构代码编辑器核心模块，编辑响应速度提升 40%',
        '实现多端适配方案，一次开发覆盖 Web/Electron/小程序三端',
        '撰写技术文档 12 篇，内部阅读量 5000+',
      ],
    },
  ],
  projects: [
    {
      id: 'p-default-1',
      name: 'AI 辅助代码审查工具',
      role: '核心开发者',
      technologies: ['React', 'Node.js', 'OpenAI API', 'TypeScript'],
      startDate: '2024-01',
      endDate: '2024-04',
      description: '基于大模型 API 开发的 PR 代码审查辅助工具，自动识别代码潜在问题并提供优化建议。',
      highlights: [
        '集成 GitHub App，自动监听 PR 事件并触发审查',
        '支持 10+ 种语言及框架的规范检测',
        '内部试用 3 个月，审查效率提升 50%',
      ],
      githubUrl: 'https://github.com/mingdev/ai-code-review',
      demoUrl: 'https://ai-review.demo.com',
    },
    {
      id: 'p-default-2',
      name: '个人技术博客系统',
      role: '独立开发',
      technologies: ['Next.js', 'TailwindCSS', 'MDX', 'Vercel'],
      startDate: '2023-08',
      endDate: '2023-10',
      description: '基于 Next.js App Router 构建的个人技术博客，支持 Markdown 文章解析与全栈渲染。',
      highlights: [
        '集成 GitHub Issues 作为 CMS，发 Issue 即发文章',
        '配置 GitHub Actions 自动化构建部署',
        'Lighthouse 评分 96，首屏加载 1.1s',
      ],
      githubUrl: 'https://github.com/mingdev/my-blog',
      demoUrl: 'https://ming.dev',
    },
  ],
  skills: {
    groups: [
      {
        name: '前端',
        items: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'Webpack'],
      },
      {
        name: '后端',
        items: ['Node.js', 'Python', 'PostgreSQL', 'Redis'],
      },
      {
        name: '工具',
        items: ['Git', 'Docker', 'Vite', 'CI/CD'],
      },
    ],
  },
  certificates: {
    list: ['PMP 认证', '阿里云 ACP 认证'],
    languages: [
      { name: '中文', level: '母语' },
      { name: '英语', level: 'CET-6，技术文档读写流利' },
    ],
  },
}
