import type { AIConfig } from './store'
import type { Resume } from '../../types/resume'

async function callAI(config: AIConfig, messages: { role: 'system' | 'user'; content: string }[]): Promise<string> {
  const base = config.baseURL.replace(/\/+$/, '')
  const endpoint = base.endsWith('/chat/completions') ? base : `${base}/chat/completions`

  const body: Record<string, any> = {
    model: config.model || 'deepseek-v4-flash',
    messages,
    temperature: 0.5,
    max_tokens: 8192,
  }

  const env = config.env || {}
  if (config.providerId === 'deepseek') {
    if (env.thinkingMode) {
      body.thinking = { type: 'enabled' }
      body.reasoning_effort = env.reasoningEffort || 'medium'
    }
  }
  if (config.providerId === 'siliconflow') {
    if (env.enableThinking) {
      body.enable_thinking = true
      if (env.thinkingBudget) body.thinking_budget = env.thinkingBudget
    }
    if (env.reasoningEffort && config.model === 'deepseek-ai/DeepSeek-V4-Flash') {
      body.reasoning_effort = env.reasoningEffort
    }
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API 请求失败 [${res.status}]${text ? `: ${text.slice(0, 200)}` : ''}`)
  }
  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('API 返回格式异常')
  return content.trim()
}

/** 构建简历全貌摘要，让 AI 了解上下文 */
function buildResumeContext(resume: Resume): string {
  const { personal, profile, skills, work, projects } = resume
  const parts: string[] = []

  parts.push(`=== 求职者概况 ===`)
  parts.push(`姓名：${personal.fullName || '未填写'}`)
  parts.push(`求职意向：${personal.jobTitle || '未填写'}`)

  if (profile) parts.push(`\n个人简介：${profile}`)

  if (skills.groups.length > 0) {
    parts.push(`\n=== 技能 ===`)
    for (const g of skills.groups) {
      parts.push(`${g.name}：${g.items.join('、')}`)
    }
  }

  if (work.length > 0) {
    parts.push(`\n=== 工作经历 ===`)
    for (const w of work) {
      parts.push(`· ${w.company} - ${w.position}（${w.startDate || '?'} ~ ${w.endDate || '?'}）`)
    }
  }

  if (projects.length > 0) {
    parts.push(`\n=== 项目经验 ===`)
    for (const p of projects) {
      parts.push(`· ${p.name} - ${p.role}`)
    }
  }

  return parts.join('\n')
}

const SYSTEM = `你是一位资深的简历优化顾问。你的工作流程是：

第一步：通读候选人完整的简历上下文，理解其职业背景、技能栈、行业定位。
第二步：针对要求优化的具体内容，结合全篇语境做精炼优化。

核心原则：
1. 【绝不虚构】不添加原文不存在的经历、技能、数据、成果数字
2. 【上下文一致】优化后的措辞要与候选人整体风格、职级、行业匹配
3. 【专业务实】用简洁有力的语言，避免"精通""卓越""一流"等空洞形容词
4. 【突出个人贡献】用主动语态（"主导设计了…"而非"参与了…的设计"）
5. 【数据优先】原文如有数据保留并突出
6. 【保持长度】优化后内容长度与原文基本一致
7. 【直接返回】只返回优化后的内容，不要加解释、不要加引号`

/** 优化个人简介（上下文驱动） */
export async function optimizeProfile(config: AIConfig, resume: Resume) {
  const ctx = buildResumeContext(resume)
  const target = resume.profile || '(空)'
  return callAI(config, [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: `【完整简历背景】\n${ctx}\n\n【任务】优化以下个人简介，使其更有吸引力且与整体简历一致：\n\n${target}` },
  ])
}

/** 优化工作描述 */
export async function optimizeWorkDescription(config: AIConfig, resume: Resume, workId: string) {
  const w = resume.work.find((x) => x.id === workId)
  if (!w) throw new Error('工作经历不存在')
  const ctx = buildResumeContext(resume)
  return callAI(config, [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: `【完整简历背景】\n${ctx}\n\n【任务】优化以下工作描述。公司：${w.company}，职位：${w.position}\n\n${w.description || '(空)'}` },
  ])
}

/** 优化量化成果 */
export async function optimizeWorkAchievements(config: AIConfig, resume: Resume, workId: string) {
  const w = resume.work.find((x) => x.id === workId)
  if (!w) throw new Error('工作经历不存在')
  const items = w.achievements || []
  const ctx = buildResumeContext(resume)
  const text = await callAI(config, [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: `${ctx}\n\n【任务】优化以下量化成果列表，保持每条一句简洁要点。公司：${w.company}，职位：${w.position}\n\n直接返回优化后的列表，每行一条，不要序号。\n\n${items.map((x, i) => `${i+1}. ${x}`).join('\n')}` },
  ])
  return text.split('\n').map(s => s.replace(/^[\d.]*\s*/, '').trim()).filter(Boolean)
}

/** 优化项目描述 */
export async function optimizeProjectDescription(config: AIConfig, resume: Resume, projectId: string) {
  const p = resume.projects.find((x) => x.id === projectId)
  if (!p) throw new Error('项目不存在')
  const ctx = buildResumeContext(resume)
  return callAI(config, [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: `【完整简历背景】\n${ctx}\n\n【任务】优化以下项目描述。项目：${p.name}，角色：${p.role}\n\n${p.description || '(空)'}` },
  ])
}

/** 优化项目亮点 */
export async function optimizeProjectHighlights(config: AIConfig, resume: Resume, projectId: string) {
  const p = resume.projects.find((x) => x.id === projectId)
  if (!p) throw new Error('项目不存在')
  const items = p.highlights || []
  const ctx = buildResumeContext(resume)
  const text = await callAI(config, [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: `${ctx}\n\n【任务】优化以下项目亮点，保持每条一句简洁要点。项目：${p.name}\n\n直接返回优化后的列表，每行一条，不要序号。\n\n${items.map((x, i) => `${i+1}. ${x}`).join('\n')}` },
  ])
  return text.split('\n').map(s => s.replace(/^[\d.]*\s*/, '').trim()).filter(Boolean)
}

/** 全文润色：AI 读取完整简历 JSON，返回优化后的完整 JSON */
export async function optimizeFullResume(config: AIConfig, resume: Resume): Promise<Resume> {
  const json = JSON.stringify(resume, null, 2)
  const systemPrompt = `你是一位资深的简历优化顾问。你的任务是对整份简历做全篇润色。

工作流程：
1. 通读整份简历 JSON，理解候选人的背景、技能、职业路径
2. 逐字段优化所有文本内容（个人简介、工作描述、量化成果、项目描述、项目亮点）
3. 保持整体风格一致、语气匹配职级和行业

核心原则：
1. 【绝不虚构】不添加原文不存在的经历、技能、数据
2. 【专业务实】用简洁有力的语言，避免空洞形容词
3. 【突出个人贡献】用主动语态
4. 【数据优先】原文如有数据保留并突出
5. 【保持结构】不修改 id、不修改公司名/学校名/日期/姓名/联系方式等结构化字段
6. 【JSON 输出】直接返回优化后的完整 JSON，不要加任何解释或 Markdown 包裹`

  const text = await callAI(config, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `请润色以下简历 JSON，只优化文本字段，保持 JSON 结构不变：\n\n${json}` },
  ])

  // 尝试提取 JSON（AI 可能用 ```json 包裹）
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = jsonMatch ? jsonMatch[1] : text
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('AI 返回的 JSON 格式异常，请重试')
  }
}
