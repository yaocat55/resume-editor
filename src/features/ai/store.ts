import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* ── Provider preset types ── */

export type ProviderCategory = 'official' | 'aggregator' | 'cn_official' | 'third_party' | 'custom'

export interface ProviderPreset {
  id: string
  name: string
  websiteUrl?: string
  apiKeyUrl?: string
  description?: string
  category: ProviderCategory
  icon?: string
  iconColor?: string
  baseURL: string
  models: { id: string; label: string; badge?: string; desc: string }[]
  env?: Record<string, any>
}

export interface AIConfig {
  providerId: string
  baseURL: string
  apiKey: string
  model: string
  industry: string
  env: Record<string, any>
}

interface AIStore {
  config: AIConfig
  setConfig: (config: Partial<AIConfig>) => void
  setEnv: (key: string, value: any) => void
  isConfigured: () => boolean
  switchProvider: (id: string) => void
}

/* ── Presets ── */

export const PRESETS: ProviderPreset[] = [
  // ── 国产官方 ──
  {
    id: 'deepseek', name: 'DeepSeek',
    websiteUrl: 'https://www.deepseek.com',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
    description: '深度求索 · 国产开源大模型', category: 'cn_official',
    iconColor: '#4F46E5',
    baseURL: 'https://api.deepseek.com',
    models: [
      { id: 'deepseek-v4-flash', label: 'V4 Flash', badge: '推荐', desc: '快速响应，日常润色' },
      { id: 'deepseek-v4-pro', label: 'V4 Pro', badge: '更强', desc: '深度推理，支持思考模式' },
    ],
    env: { thinkingMode: false, reasoningEffort: 'medium' },
  },
  {
    id: 'zhipu', name: '智谱 GLM',
    websiteUrl: 'https://www.zhipuai.cn',
    apiKeyUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
    description: '智谱AI · GLM 系列', category: 'cn_official',
    iconColor: '#8B5CF6',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { id: 'glm-4-flash', label: 'GLM-4-Flash', desc: '免费快速' },
      { id: 'glm-4-air', label: 'GLM-4-Air', desc: '高性价比' },
      { id: 'glm-4-plus', label: 'GLM-4-Plus', badge: '推荐', desc: '旗舰级' },
    ],
  },
  {
    id: 'qwen', name: '阿里通义千问',
    websiteUrl: 'https://tongyi.aliyun.com',
    apiKeyUrl: 'https://help.aliyun.com/document_detail/2712195.html',
    description: '阿里云 · Qwen 系列', category: 'cn_official',
    iconColor: '#FF6A00',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { id: 'qwen-turbo', label: 'Qwen Turbo', desc: '快速轻量' },
      { id: 'qwen-plus', label: 'Qwen Plus', desc: '均衡之选' },
      { id: 'qwen-max', label: 'Qwen Max', badge: '推荐', desc: '最强性能' },
    ],
  },
  {
    id: 'volcengine', name: '火山引擎',
    websiteUrl: 'https://www.volcengine.com/product/doubao',
    apiKeyUrl: 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey',
    description: '字节跳动 · 豆包系列', category: 'cn_official',
    iconColor: '#3370FF',
    baseURL: 'https://ark.cn-beijing.volces.com/api/compatible',
    models: [
      { id: 'doubao-seed-2-1-pro-260628', label: 'Doubao Seed 2.1 Pro', badge: '推荐', desc: '最新旗舰' },
      { id: 'doubao-1.5-pro-256k', label: 'Doubao 1.5 Pro 256K', desc: '超长上下文' },
      { id: 'doubao-1.5-lite-32k', label: 'Doubao 1.5 Lite', desc: '轻量快速' },
    ],
  },
  {
    id: 'kimi', name: 'Kimi',
    websiteUrl: 'https://kimi.moonshot.cn',
    apiKeyUrl: 'https://platform.moonshot.cn/console/api-keys',
    description: '月之暗面 · Kimi', category: 'cn_official',
    iconColor: '#FF6B8A',
    baseURL: 'https://api.moonshot.cn/v1',
    models: [
      { id: 'moonshot-v1-8k', label: 'Moonshot v1 8K', desc: '日常对话' },
      { id: 'moonshot-v1-32k', label: 'Moonshot v1 32K', desc: '长文本' },
      { id: 'moonshot-v1-128k', label: 'Moonshot v1 128K', badge: '推荐', desc: '超长上下文' },
    ],
  },
  {
    id: 'stepfun', name: '阶跃星辰',
    websiteUrl: 'https://www.stepfun.com',
    apiKeyUrl: 'https://platform.stepfun.com/request-key',
    description: '阶跃星辰 · Step 系列', category: 'cn_official',
    iconColor: '#10B981',
    baseURL: 'https://api.stepfun.com/v1',
    models: [
      { id: 'step-1-flash', label: 'Step-1 Flash', desc: '快速响应' },
      { id: 'step-1-8k', label: 'Step-1 8K', desc: '均衡型' },
      { id: 'step-2-16k', label: 'Step-2 16K', badge: '推荐', desc: '最新旗舰' },
    ],
  },
  {
    id: 'baichuan', name: '百川智能',
    websiteUrl: 'https://www.baichuan-ai.com',
    apiKeyUrl: 'https://platform.baichuan-ai.com/console/apikey',
    description: '百川 · Baichuan 系列', category: 'cn_official',
    iconColor: '#3B82F6',
    baseURL: 'https://api.baichuan-ai.com/v1',
    models: [
      { id: 'Baichuan4', label: 'Baichuan 4', badge: '推荐', desc: '旗舰模型' },
      { id: 'Baichuan3-Turbo', label: 'Baichuan 3 Turbo', desc: '快速推理' },
    ],
  },
  // ── 多模型平台 ──
  {
    id: 'siliconflow', name: '硅基流动',
    websiteUrl: 'https://siliconflow.cn',
    apiKeyUrl: 'https://cloud.siliconflow.cn/account/ak',
    description: 'SiliconFlow · 多模型平台', category: 'cn_official',
    iconColor: '#0EA5E9',
    baseURL: 'https://api.siliconflow.cn/v1',
    models: [
      { id: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3', desc: '高性价比通用' },
      { id: 'deepseek-ai/DeepSeek-V4-Flash', label: 'DeepSeek V4 Flash', badge: '最新', desc: '支持 reasoning_effort' },
      { id: 'Qwen/QwQ-32B', label: 'QwQ 32B', desc: '阿里推理模型' },
      { id: 'Pro/zai-org/GLM-4.7', label: 'GLM 4.7', badge: '推荐', desc: '智谱最新' },
      { id: 'Pro/zai-org/GLM-5', label: 'GLM-5', badge: '最强', desc: '智谱旗舰' },
      { id: 'tencent/Hunyuan-A13B-Instruct', label: '混元 A13B', desc: '腾讯混元' },
    ],
    env: { enableThinking: false, thinkingBudget: 2048, reasoningEffort: 'high' },
  },
  {
    id: 'modelscope', name: 'ModelScope',
    websiteUrl: 'https://modelscope.cn',
    apiKeyUrl: 'https://modelscope.cn/my/myaccesstoken',
    description: '阿里魔搭 · 开源模型平台', category: 'cn_official',
    iconColor: '#F472B6',
    baseURL: 'https://api.modelscope.cn/v1',
    models: [
      { id: 'Qwen/Qwen2.5-72B-Instruct', label: 'Qwen2.5 72B', desc: '阿里开源大模型' },
      { id: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3', desc: '深度求索' },
    ],
  },
  // ── 聚合 / 中转站 ──
  {
    id: 'ccsub', name: 'CCSub',
    websiteUrl: 'https://www.ccsub.net',
    apiKeyUrl: 'https://www.ccsub.net/register?ref=Y6Z8DXEA',
    description: 'API 中转聚合服务', category: 'aggregator',
    iconColor: '#06B6D4',
    baseURL: 'https://www.ccsub.net',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o', desc: 'OpenAI 旗舰' },
      { id: 'gpt-4o-mini', label: 'GPT-4o mini', desc: '轻量快速' },
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', badge: '推荐', desc: 'Anthropic 最新' },
      { id: 'deepseek-chat', label: 'DeepSeek Chat', desc: '深度求索' },
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Google 快速' },
    ],
  },
  {
    id: 'openrouter', name: 'OpenRouter',
    websiteUrl: 'https://openrouter.ai',
    apiKeyUrl: 'https://openrouter.ai/keys',
    description: '全球模型聚合平台', category: 'aggregator',
    iconColor: '#8B5CF6',
    baseURL: 'https://openrouter.ai/api/v1',
    models: [
      { id: 'openai/gpt-4o', label: 'GPT-4o', desc: 'OpenAI 旗舰' },
      { id: 'anthropic/claude-sonnet-4-20250514', label: 'Claude Sonnet 4', badge: '推荐', desc: 'Anthropic' },
      { id: 'deepseek/deepseek-chat', label: 'DeepSeek Chat', desc: '深度求索' },
      { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash', desc: 'Google' },
      { id: 'qwen/qwen-max', label: 'Qwen Max', desc: '阿里通义' },
    ],
  },
  {
    id: 'shengsuanyun', name: '神算云',
    websiteUrl: 'https://www.shengsuanyun.com',
    apiKeyUrl: 'https://www.shengsuanyun.com/?from=CH_4HHXMRYF',
    description: 'AI API 聚合平台', category: 'aggregator',
    iconColor: '#F59E0B',
    baseURL: 'https://router.shengsuanyun.com/api',
    models: [
      { id: 'anthropic/claude-sonnet-5', label: 'Claude Sonnet 5', badge: '推荐', desc: 'Anthropic 最新' },
      { id: 'openai/gpt-4o', label: 'GPT-4o', desc: 'OpenAI 旗舰' },
    ],
  },
  // ── 官方 ──
  {
    id: 'openai', name: 'OpenAI',
    websiteUrl: 'https://openai.com',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    description: 'OpenAI · GPT 系列', category: 'official',
    iconColor: '#10A37F',
    baseURL: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini', desc: '轻量经济' },
      { id: 'gpt-4o', label: 'GPT-4o', badge: '推荐', desc: '多模态旗舰' },
      { id: 'o3-mini', label: 'o3-mini', desc: '推理优化' },
    ],
  },
  {
    id: 'openai-compatible', name: '兼容 OpenAI',
    description: '任意 OpenAI 兼容接口', category: 'custom',
    iconColor: '#6B7280',
    baseURL: '',
    models: [],
  },
]

export function getPreset(id: string): ProviderPreset | undefined {
  return PRESETS.find((p) => p.id === id)
}

/* ── Store ── */

const DEFAULT_CONFIG: AIConfig = {
  providerId: 'deepseek',
  baseURL: 'https://api.deepseek.com',
  apiKey: '',
  model: 'deepseek-v4-flash',
  industry: '',
  env: {},
}

const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      config: { ...DEFAULT_CONFIG },

      setConfig: (partial) =>
        set((s) => ({ config: { ...s.config, ...partial } })),

      setEnv: (key, value) =>
        set((s) => ({ config: { ...s.config, env: { ...s.config.env, [key]: value } } })),

      isConfigured: () => !!get().config.apiKey && !!get().config.baseURL,

      switchProvider: (id) => {
        const preset = getPreset(id)
        if (!preset) return
        set({
          config: {
            ...get().config,
            providerId: id,
            baseURL: preset.baseURL,
            model: preset.models[0]?.id || '',
            env: { ...(preset.env || {}) },
          },
        })
      },
    }),
    {
      name: 'ai-config',
      partialize: (state) => ({ config: state.config }),
      merge: (persisted, current) => {
        const saved = persisted as any
        if (!saved?.config) return current
        const c = { ...saved.config }
        if (!c.env || c.thinkingMode !== undefined) {
          c.env = {
            thinkingMode: c.thinkingMode ?? false,
            reasoningEffort: c.reasoningEffort ?? 'medium',
            enableThinking: c.enableThinking ?? false,
            thinkingBudget: c.thinkingBudget ?? 2048,
          }
          delete c.thinkingMode; delete c.reasoningEffort
          delete c.enableThinking; delete c.thinkingBudget
        }
        if (!c.providerId && c.provider) {
          c.providerId = c.provider; delete c.provider
        }
        if (!c.providerId && c.providerId !== 'custom') {
          const preset = PRESETS.find(p => c.baseURL?.includes(p.baseURL))
          if (preset) c.providerId = preset.id
        }
        return { ...current, config: { ...current.config, ...c, env: c.env || {} } }
      },
    }
  )
)

export default useAIStore
