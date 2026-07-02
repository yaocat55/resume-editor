import React from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack,
  Card, CardActionArea, CardContent, Typography, Box, FormControlLabel, Switch,
  FormControl, InputLabel, Select, MenuItem, FormHelperText, Chip, Divider, Slider,
} from '@mui/material'
import useAIStore from '../store/aiStore'

interface Props { open: boolean; onClose: () => void }

/* ── 各服务商参数面板 ── */

const DeepSeekParams: React.FC<{ config: any; setConfig: (p: any) => void }> = ({ config, setConfig }) => (
  <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
      DeepSeek V4 Pro 参数
    </Typography>
    <Stack spacing={2}>
      <FormControlLabel
        control={<Switch checked={config.thinkingMode} onChange={(e) => setConfig({ thinkingMode: e.target.checked })} size="small" />}
        label={<Box><Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>思考模式</Typography></Box>}
        sx={{ mx: 0 }}
      />
      {config.thinkingMode && (
        <FormControl fullWidth size="small">
          <InputLabel shrink>推理努力程度</InputLabel>
          <Select value={config.reasoningEffort} label="推理努力程度" onChange={(e) => setConfig({ reasoningEffort: e.target.value as any })}>
            <MenuItem value="low">低</MenuItem>
            <MenuItem value="medium">中</MenuItem>
            <MenuItem value="high">高</MenuItem>
          </Select>
        </FormControl>
      )}
    </Stack>
  </Box>
)

const SiliconFlowParams: React.FC<{ config: any; setConfig: (p: any) => void }> = ({ config, setConfig }) => (
  <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
      硅基流动参数
    </Typography>
    <Stack spacing={2}>
      <FormControlLabel
        control={<Switch checked={config.enableThinking} onChange={(e) => setConfig({ enableThinking: e.target.checked })} size="small" />}
        label={<Box><Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>推理模式（enable_thinking）</Typography><Typography variant="caption" color="text.secondary">部分模型支持展示思考链</Typography></Box>}
        sx={{ alignItems: 'flex-start', mx: 0 }}
      />
      {config.enableThinking && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            思考预算（thinking_budget）：{config.thinkingBudget}
          </Typography>
          <Slider
            size="small"
            value={config.thinkingBudget}
            min={128}
            max={32768}
            step={128}
            onChange={(_, v) => setConfig({ thinkingBudget: v as number })}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.disabled">128</Typography>
            <Typography variant="caption" color="text.disabled">32768</Typography>
          </Box>
        </Box>
      )}
      {config.model === 'deepseek-ai/DeepSeek-V4-Flash' && (
        <FormControl fullWidth size="small">
          <InputLabel shrink>推理努力程度（reasoning_effort）</InputLabel>
          <Select value={config.reasoningEffort || 'high'} label="推理努力程度" onChange={(e) => setConfig({ reasoningEffort: e.target.value })}>
            <MenuItem value="high">high — 常规</MenuItem>
            <MenuItem value="max">max — 最大努力</MenuItem>
          </Select>
          <FormHelperText>仅 deepseek-ai/DeepSeek-V4-Flash 支持</FormHelperText>
        </FormControl>
      )}
    </Stack>
  </Box>
)

/* ── 服务商定义 ── */

interface ProviderDef {
  id: string
  name: string
  desc: string
  baseURL: string
  models: { id: string; label: string; badge?: string; desc: string }[]
  params?: React.FC<{ config: any; setConfig: (p: any) => void }>
  onSwitch?: () => Partial<any>
}

const PROVIDERS: ProviderDef[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    desc: '深度求索 · 国产开源',
    baseURL: 'https://api.deepseek.com',
    models: [
      { id: 'deepseek-v4-flash', label: 'V4 Flash', badge: '推荐', desc: '快速响应，日常润色' },
      { id: 'deepseek-v4-pro', label: 'V4 Pro', badge: '更强', desc: '深度推理，支持思考模式' },
    ],
    params: DeepSeekParams,
    onSwitch: () => ({ thinkingMode: false, reasoningEffort: 'medium' }),
  },
  {
    id: 'siliconflow',
    name: '硅基流动',
    desc: 'SiliconFlow · 多模型平台',
    baseURL: 'https://api.siliconflow.cn/v1',
    models: [
      { id: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3', desc: '高性价比通用模型' },
      { id: 'Pro/deepseek-ai/DeepSeek-V3', label: 'Pro DeepSeek V3', badge: '更强', desc: '更高性能版本' },
      { id: 'deepseek-ai/DeepSeek-V4-Flash', label: 'DeepSeek V4 Flash', badge: '最新', desc: '支持 reasoning_effort' },
      { id: 'Qwen/QwQ-32B', label: 'QwQ 32B', desc: '阿里推理模型' },
      { id: 'Qwen/Qwen3-32B', label: 'Qwen3 32B', desc: '阿里通义最新' },
      { id: 'Pro/zai-org/GLM-4.7', label: 'GLM 4.7', badge: '推荐', desc: '智谱最新，支持推理' },
      { id: 'Pro/zai-org/GLM-5', label: 'GLM-5', badge: '最强', desc: '智谱旗舰' },
      { id: 'tencent/Hunyuan-A13B-Instruct', label: '混元 A13B', desc: '腾讯混元' },
    ],
    params: SiliconFlowParams,
    onSwitch: () => ({ enableThinking: false, thinkingBudget: 2048, reasoningEffort: 'high' }),
  },
  {
    id: 'custom',
    name: '自定义',
    desc: '手动配置其他服务',
    baseURL: '',
    models: [],
  },
]

const AIConfigDialog: React.FC<Props> = ({ open, onClose }) => {
  const config = useAIStore((s) => s.config)
  const setConfig = useAIStore((s) => s.setConfig)

  const providerId = PROVIDERS.find((p) => p.id !== 'custom' && p.baseURL && config.baseURL?.includes(p.baseURL))
    ?.id || (config.baseURL ? 'custom' : 'deepseek')
  const provider = PROVIDERS.find((p) => p.id === providerId) || PROVIDERS[0]
  const isCustom = provider.id === 'custom'

  const switchProvider = (id: string) => {
    const p = PROVIDERS.find((x) => x.id === id)
    if (!p || p.id === providerId) return
    setConfig({ baseURL: p.baseURL, model: p.models[0]?.id || '', ...(p.onSwitch?.() || {}) })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>🤖 AI 配置</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* 服务商 */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 500 }}>
              服务商
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {PROVIDERS.map((p) => (
                <Card key={p.id} variant="outlined" sx={{
                  flex: 1, cursor: 'pointer',
                  borderColor: providerId === p.id ? 'primary.main' : 'divider',
                  borderWidth: providerId === p.id ? 2 : 1,
                  bgcolor: providerId === p.id ? 'action.selected' : 'background.paper',
                  transition: 'all 0.15s',
                }}>
                  <CardActionArea onClick={() => switchProvider(p.id)} sx={{ p: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', mb: 0.3 }}>{p.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.desc}</Typography>
                  </CardActionArea>
                </Card>
              ))}
            </Stack>
          </Box>

          {/* 接口地址 */}
          <TextField
            label="接口地址"
            value={isCustom ? config.baseURL : provider.baseURL}
            onChange={(e) => setConfig({ baseURL: e.target.value })}
            placeholder="https://api.deepseek.com"
            slotProps={{ inputLabel: { shrink: true }, input: isCustom ? {} : { readOnly: true } }}
            size="small"
            helperText={isCustom ? '填写兼容 OpenAI 格式的接口地址' : '已自动配置'}
          />

          {/* 模型选择 */}
          {provider.models.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 500 }}>
                模型
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                {provider.models.map((m) => (
                  <Card key={m.id} variant="outlined" sx={{
                    flex: '1 0 calc(50% - 8px)', minWidth: 120, cursor: 'pointer',
                    borderColor: config.model === m.id ? 'primary.main' : 'divider',
                    borderWidth: config.model === m.id ? 2 : 1,
                    bgcolor: config.model === m.id ? 'action.selected' : 'background.paper',
                  }}>
                    <CardActionArea onClick={() => setConfig({ model: m.id })} sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                        <Typography variant="subtitle2" sx={{ fontSize: '0.8rem' }}>{m.label}</Typography>
                        {m.badge && <Chip label={m.badge} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{m.desc}</Typography>
                    </CardActionArea>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}

          {/* 自定义模型名 */}
          {isCustom && (
            <TextField label="模型名" value={config.model} onChange={(e) => setConfig({ model: e.target.value })} placeholder="gpt-4o-mini" slotProps={{ inputLabel: { shrink: true } }} size="small" />
          )}

          {/* 参数面板 */}
          {provider.params && React.createElement(provider.params, { config, setConfig })}

          <Divider />

          {/* 密钥 */}
          <TextField label="API 密钥" value={config.apiKey} onChange={(e) => setConfig({ apiKey: e.target.value })} placeholder="sk-..." type="password" slotProps={{ inputLabel: { shrink: true } }} autoFocus />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">完成</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AIConfigDialog
