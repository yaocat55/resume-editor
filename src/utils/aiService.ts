import type { AIConfig } from '../store/aiStore'

async function callAI(config: AIConfig, messages: { role: 'system' | 'user'; content: string }[]): Promise<string> {
  const base = config.baseURL.replace(/\/+$/, '')
  const endpoint = base.endsWith('/chat/completions') ? base : `${base}/chat/completions`

  const body: Record<string, any> = {
    model: config.model || 'deepseek-v4-flash',
    messages,
    temperature: 0.5,
    max_tokens: 2048,
  }

  // 各服务商私有参数
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

const SYSTEM = `你是一位资深的简历优化顾问。核心原则：
1. 绝不虚构，不添加原文不存在的经历、技能、数据
2. 用简洁有力的语言，避免空洞形容词
3. 突出个人贡献，用主动语态
4. 原文如有数据保留并突出
5. 只返回优化后的内容，不要加解释`

export async function optimizeProfile(config: AIConfig, content: string) {
  return callAI(config, [{ role: 'system', content: SYSTEM }, { role: 'user', content: `优化以下个人简介：\n${content}` }])
}

export async function optimizeWorkDescription(config: AIConfig, company: string, position: string, desc: string) {
  return callAI(config, [{ role: 'system', content: SYSTEM }, { role: 'user', content: `优化以下工作描述。职位：${position}，公司：${company}\n${desc}` }])
}

export async function optimizeWorkAchievements(config: AIConfig, company: string, position: string, items: string[]) {
  const text = await callAI(config, [{ role: 'system', content: SYSTEM }, { role: 'user', content: `优化以下量化成果列表，每行一条不要序号。职位：${position}，公司：${company}\n${items.map((x, i) => `${i+1}. ${x}`).join('\n')}` }])
  return text.split('\n').map(s => s.replace(/^[\d.]*\s*/, '').trim()).filter(Boolean)
}

export async function optimizeProjectDescription(config: AIConfig, name: string, role: string, desc: string) {
  return callAI(config, [{ role: 'system', content: SYSTEM }, { role: 'user', content: `优化以下项目描述。项目：${name}，角色：${role}\n${desc}` }])
}

export async function optimizeProjectHighlights(config: AIConfig, name: string, items: string[]) {
  const text = await callAI(config, [{ role: 'system', content: SYSTEM }, { role: 'user', content: `优化以下项目亮点，每行一条不要序号。项目：${name}\n${items.map((x, i) => `${i+1}. ${x}`).join('\n')}` }])
  return text.split('\n').map(s => s.replace(/^[\d.]*\s*/, '').trim()).filter(Boolean)
}
